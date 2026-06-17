import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_CONTACT = Deno.env.get("VAPID_CONTACT") ?? "mailto:admin@koribridge.com";

webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const sender = authData?.user;
    if (authError || !sender) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { receiver_id, title, body, url, type, message_id } = await req.json();
    if (!receiver_id) {
      return new Response(JSON.stringify({ error: "receiver_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "message") {
      if (!message_id) {
        return new Response(JSON.stringify({ error: "message_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: message } = await supabase
        .from("messages")
        .select("id")
        .eq("id", message_id)
        .eq("sender_id", sender.id)
        .eq("receiver_id", receiver_id)
        .maybeSingle();

      if (!message) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (type === "match") {
      const [{ data: liked }, { data: likedBack }] = await Promise.all([
        supabase
          .from("favorites")
          .select("id")
          .eq("user_id", sender.id)
          .eq("partner_id", receiver_id)
          .maybeSingle(),
        supabase
          .from("favorites")
          .select("id")
          .eq("user_id", receiver_id)
          .eq("partner_id", sender.id)
          .maybeSingle(),
      ]);

      if (!liked || !likedBack) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Unsupported notification type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("subscription_data")
      .eq("user_id", receiver_id);

    if (error || !subs?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify({ title, body, url });
    const results = await Promise.allSettled(
      subs.map((row) => webpush.sendNotification(row.subscription_data, payload))
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const expired = results
      .map((r, i) => ({ r, sub: subs[i] }))
      .filter(({ r }) => r.status === "rejected" && (r.reason?.statusCode === 410 || r.reason?.statusCode === 404));

    if (expired.length) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", receiver_id)
        .in(
          "subscription_data->>'endpoint'",
          expired.map(({ sub }) => sub.subscription_data?.endpoint).filter(Boolean)
        );
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
