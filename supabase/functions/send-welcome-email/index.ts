import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const fromEmail = Deno.env.get("WELCOME_EMAIL_FROM") ?? "KoriBridge <onboarding@resend.dev>";
const appUrl = Deno.env.get("APP_URL") ?? "https://koribridge.com";
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmail(email: string, locale?: string) {
  const safeEmail = escapeHtml(email);
  const profileUrl = `${appUrl.replace(/\/$/, "")}/setup`;
  const isKorean = !locale || locale === "ko";

  const subject = isKorean
    ? "KoriBridge에 오신 것을 환영합니다"
    : "Welcome to KoriBridge";

  const preview = isKorean
    ? "프로필을 완성하고 첫 언어 교환 파트너를 만나보세요."
    : "Complete your profile and meet your first language exchange partner.";

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;">${preview}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#dc2626;padding:28px 32px;color:#ffffff;">
                <div style="font-size:22px;font-weight:800;">KoriBridge</div>
                <div style="font-size:14px;margin-top:8px;opacity:.9;">${subject}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">${isKorean ? `${safeEmail}님, 가입해 주셔서 감사합니다.` : `Thanks for joining, ${safeEmail}.`}</p>
                <p style="font-size:15px;line-height:1.7;margin:0 0 24px;color:#4b5563;">
                  ${isKorean
                    ? "KoriBridge에서는 한국어와 문화를 함께 배우고 나눌 언어 교환 파트너를 만날 수 있습니다. 이메일 확인을 마친 뒤 프로필을 완성하면 추천 파트너를 바로 확인할 수 있어요."
                    : "KoriBridge helps you meet language exchange partners to learn and share Korean language and culture. After verifying your email, complete your profile to start seeing recommended partners."}
                </p>
                <a href="${profileUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 18px;border-radius:10px;">
                  ${isKorean ? "프로필 완성하기" : "Complete profile"}
                </a>
                <p style="font-size:13px;line-height:1.6;margin:24px 0 0;color:#6b7280;">
                  ${isKorean
                    ? "본인이 가입한 것이 아니라면 이 메일을 무시해 주세요."
                    : "If you did not create this account, you can ignore this email."}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = isKorean
    ? `KoriBridge에 오신 것을 환영합니다.\n\n${email}님, 가입해 주셔서 감사합니다.\n이메일 확인을 마친 뒤 프로필을 완성하면 추천 파트너를 확인할 수 있습니다.\n\n프로필 완성하기: ${profileUrl}\n\n본인이 가입한 것이 아니라면 이 메일을 무시해 주세요.`
    : `Welcome to KoriBridge.\n\nThanks for joining, ${email}.\nAfter verifying your email, complete your profile to start seeing recommended partners.\n\nComplete profile: ${profileUrl}\n\nIf you did not create this account, you can ignore this email.`;

  return { subject, html, text };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id, email, locale } = await req.json();
    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: "user_id and email are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    const user = userData?.user;
    if (userError || !user || user.email?.toLowerCase() !== String(email).toLowerCase()) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
    const isRecentSignup = createdAt > Date.now() - 24 * 60 * 60 * 1000;
    if (!isRecentSignup) {
      return new Response(JSON.stringify({ error: "Signup is too old" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("email_deliveries")
      .select("id")
      .eq("user_id", user_id)
      .eq("email_type", "welcome")
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ sent: false, skipped: "already_sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailContent = buildEmail(email, locale);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Email provider failed", details: result }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("email_deliveries").insert({
      user_id,
      email,
      email_type: "welcome",
      provider: "resend",
      provider_message_id: result?.id ?? null,
    });

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
