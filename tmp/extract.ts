import { readFileSync } from "fs";

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

async function test() {
  const res = await fetch("https://safcoconstructions.com/");
  const html = await res.text();
  const text = extractTextFromHtml(html);
  console.log("Extracted text length:", text.length);
  console.log("Snippet:", text.slice(0, 500));
}
test();
