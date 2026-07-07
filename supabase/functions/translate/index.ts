import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 번역 프록시: DEEPL_API_KEY 시크릿이 설정되어 있으면 DeepL API를 사용하고,
// 없거나 실패하면 MyMemory 무료 API로 폴백합니다.
// 배포: supabase functions deploy translate
// 시크릿: supabase secrets set DEEPL_API_KEY=... (무료 플랜 키는 api-free.deepl.com 사용)

const DEEPL_API_KEY = Deno.env.get("DEEPL_API_KEY") ?? "";
const DEEPL_ENDPOINT = DEEPL_API_KEY.endsWith(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_TEXT_LENGTH = 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function translateWithDeepL(text: string, source: string, target: string) {
  const res = await fetch(DEEPL_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      source_lang: source.toUpperCase(),
      target_lang: target.toUpperCase(),
    }),
  });
  if (!res.ok) throw new Error(`DeepL ${res.status}`);
  const data = await res.json();
  const translated = data?.translations?.[0]?.text;
  if (!translated) throw new Error("DeepL empty response");
  return { translated, provider: "deepl" };
}

async function translateWithMyMemory(text: string, source: string, target: string) {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
  );
  if (!res.ok) throw new Error(`MyMemory ${res.status}`);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || "MyMemory failed");
  return { translated: data.responseData?.translatedText ?? "", provider: "mymemory" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) return json({ error: "Unauthorized" }, 401);

    const { text, source, target } = await req.json();
    if (typeof text !== "string" || !text.trim()) return json({ error: "text required" }, 400);
    if (!/^[a-z]{2}$/i.test(source ?? "") || !/^[a-z]{2}$/i.test(target ?? "")) {
      return json({ error: "invalid language pair" }, 400);
    }

    const clipped = text.slice(0, MAX_TEXT_LENGTH);

    if (DEEPL_API_KEY) {
      try {
        return json(await translateWithDeepL(clipped, source, target));
      } catch {
        // fall through to MyMemory
      }
    }
    return json(await translateWithMyMemory(clipped, source, target));
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "translate failed" }, 500);
  }
});
