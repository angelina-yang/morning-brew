/**
 * URL normalization for cross-scout deduplication.
 *
 * Two scouts can surface the same article — e.g. "Latest AI news" and
 * "New blog posts from Anthropic/DeepMind/OpenAI" both catch the same
 * Anthropic release. We dedupe on a normalized URL key so the digest
 * doesn't show the same story twice.
 *
 * Normalization rules (conservative — only strip things that never change
 * article identity):
 *   - lowercase the host
 *   - strip common tracking/query params (utm_*, ref, source, fbclid, gclid)
 *   - strip the URL fragment
 *   - remove trailing slash from the path
 *   - drop default ports
 */

const TRACKING_PARAM_PREFIXES = ["utm_"];
const TRACKING_PARAM_EXACT = new Set([
  "ref",
  "ref_src",
  "ref_url",
  "source",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "igshid",
  "_hsenc",
  "_hsmi",
]);

export function normalizeUrl(raw: string): string {
  if (!raw) return "";
  try {
    const u = new URL(raw.trim());

    // Lowercase host
    u.hostname = u.hostname.toLowerCase();

    // Strip tracking params
    const keep = new URLSearchParams();
    for (const [k, v] of u.searchParams.entries()) {
      const key = k.toLowerCase();
      if (TRACKING_PARAM_EXACT.has(key)) continue;
      if (TRACKING_PARAM_PREFIXES.some((p) => key.startsWith(p))) continue;
      keep.append(k, v);
    }
    u.search = keep.toString() ? `?${keep.toString()}` : "";

    // Drop fragment
    u.hash = "";

    // Trim trailing slash from path (but keep the root "/")
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }

    return u.toString();
  } catch {
    // Not a valid URL — fall back to raw trimmed string for dedup purposes
    return raw.trim().toLowerCase();
  }
}

/**
 * Deduplicate an array of items by their normalized URL.
 * Keeps the first occurrence (preserves order).
 */
export function dedupeByUrl<T extends { sourceUrl?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = normalizeUrl(item.sourceUrl || "");
    if (!key) {
      // No URL — keep it (nothing to dedupe against)
      out.push(item);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
