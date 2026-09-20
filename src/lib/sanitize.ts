const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "span",
]);

const ALLOWED_ATTRS = new Set(["href", "target", "rel"]);

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeAttributes(tag: string, raw: string) {
  if (tag !== "a") return "";
  const hrefMatch = raw.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i);
  const href = (hrefMatch?.[2] || hrefMatch?.[3] || "").trim();
  if (!href || /^(javascript|data):/i.test(href)) return "";
  const safeHref = escapeText(href);
  return ` href="${safeHref}" target="_blank" rel="noopener noreferrer"`;
}

export function sanitizeHtml(input: string) {
  if (!input) return "";

  return input
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (full, rawTag: string, attrs: string) => {
      const closing = full.startsWith("</");
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (closing) return `</${tag}>`;
      if (full.endsWith("/>") && tag === "br") return "<br />";
      const safeAttrs = ALLOWED_ATTRS.size ? sanitizeAttributes(tag, attrs) : "";
      return `<${tag}${safeAttrs}>`;
    })
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

export function plainText(html: string, max = 180) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}
