import { ZenRows } from "zenrows";

// ── ZenRows client (singleton) ──────────────────────────────────────────────
let _zenrows: ZenRows | null = null;

function getZenRowsClient(): ZenRows {
  if (!_zenrows) {
    if (!process.env.ZENROWS_API_KEY) {
      throw new Error("ZENROWS_API_KEY environment variable is not set");
    }
    _zenrows = new ZenRows(process.env.ZENROWS_API_KEY);
  }
  return _zenrows;
}

// ── Safely extract HTML from ZenRows response ─────────────────────────────
// ZenRows SDK v2 returns { data: string }, older versions return the string directly
// or the response body may be in different places.
async function extractHtml(response: unknown): Promise<string> {
  if (typeof response === "string") return response;
  if (response && typeof response === "object") {
    const r = response as any;
    // Native Fetch Response
    if (typeof r.text === "function") {
      try {
        return await r.text();
      } catch {
        // ignore
      }
    }
    // Try common response shapes
    if (typeof r.data === "string") return r.data;
    if (typeof r.body === "string") return r.body;
    if (typeof r.content === "string") return r.content;
    if (typeof r.html === "string") return r.html;
    if (typeof r.text === "string") return r.text;
  }
  return "";
}

// ── Extract readable text from HTML ──────────────────────────────────────
function extractTextFromHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ");

  text = text
    .replace(/<\/?(h[1-6]|p|div|li|tr|td|th|br|hr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

// ── Scrape a URL and return clean text ────────────────────────────────────
export async function scrapeUrl(url: string): Promise<string> {
  const client = getZenRowsClient();

  try {
    // First attempt: no JS rendering (faster, cheaper)
    const response = await client.get(url, {
      js_render: false,
      premium_proxy: false,
    });

    const html = await extractHtml(response);
    const text = extractTextFromHtml(html);

    if (text.length >= 100) return text;

    // Retry with JS rendering for dynamic / SPA sites
    const jsResponse = await client.get(url, {
      js_render: true,
      premium_proxy: false,
    });

    const jsHtml = await extractHtml(jsResponse);
    const jsText = extractTextFromHtml(jsHtml);

    if (jsText.length < 50) {
      throw new Error("Scraped content was empty or too short — the page may be behind a login or CAPTCHA.");
    }

    return jsText;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to scrape ${url}: ${msg}`);
  }
}

// ── Validate that a string is a valid URL ─────────────────────────────────
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
