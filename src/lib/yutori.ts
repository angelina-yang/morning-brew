import type { YutoriScout, YutoriScoutCreate, YutoriUpdate } from "@/types";

const BASE_URL = "https://api.yutori.com/v1/scouting";

class YutoriError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = "YutoriError";
  }
}

/**
 * Yutori returns errors in several shapes:
 *   { "error": "..." }
 *   { "message": "..." }
 *   { "detail": "..." }                                  // string
 *   { "detail": { "error_code": "...", "message": "..."} } // object (observed for insufficient_funds)
 * Normalize all of them into a flat { message, errorCode? }.
 */
function extractErrorInfo(
  body: unknown,
  fallback: string
): { message: string; errorCode?: string } {
  if (!body || typeof body !== "object") return { message: fallback };
  const b = body as Record<string, unknown>;

  if (typeof b.error === "string") return { message: b.error };
  if (typeof b.message === "string") return { message: b.message };

  if (typeof b.detail === "string") return { message: b.detail };
  if (b.detail && typeof b.detail === "object") {
    const d = b.detail as Record<string, unknown>;
    const msg =
      (typeof d.message === "string" && d.message) ||
      (typeof d.error === "string" && d.error) ||
      fallback;
    const code = typeof d.error_code === "string" ? d.error_code : undefined;
    return { message: msg, errorCode: code };
  }

  return { message: fallback };
}

async function yutoriFetch<T>(
  endpoint: string,
  apiKey: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const fallback = `Yutori API error: ${res.status} ${res.statusText}`;
    let info: { message: string; errorCode?: string } = { message: fallback };
    try {
      const body = await res.json();
      info = extractErrorInfo(body, fallback);
    } catch {
      // Use fallback message
    }
    throw new YutoriError(info.message, res.status, info.errorCode);
  }

  // DELETE returns no content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── Scouts ───

export async function listScouts(apiKey: string): Promise<YutoriScout[]> {
  const data = await yutoriFetch<YutoriScout[] | { scouts: YutoriScout[] }>(
    "/tasks",
    apiKey
  );
  // Handle both array and wrapped response
  return Array.isArray(data) ? data : data.scouts ?? [];
}

export async function createScout(
  apiKey: string,
  params: YutoriScoutCreate
): Promise<YutoriScout> {
  return yutoriFetch<YutoriScout>("/tasks", apiKey, {
    method: "POST",
    body: JSON.stringify({
      query: params.query,
      output_interval: params.output_interval ?? 86400, // Default: daily
      user_timezone: params.user_timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      skip_email: params.skip_email ?? true,
    }),
  });
}

export async function getScout(
  apiKey: string,
  scoutId: string
): Promise<YutoriScout> {
  return yutoriFetch<YutoriScout>(`/tasks/${scoutId}`, apiKey);
}

export async function updateScout(
  apiKey: string,
  scoutId: string,
  updates: Partial<Pick<YutoriScout, "status" | "query" | "output_interval">>
): Promise<YutoriScout> {
  return yutoriFetch<YutoriScout>(`/tasks/${scoutId}`, apiKey, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deleteScout(
  apiKey: string,
  scoutId: string
): Promise<void> {
  await yutoriFetch<void>(`/tasks/${scoutId}`, apiKey, {
    method: "DELETE",
  });
}

// ─── Updates ───

export async function getScoutUpdates(
  apiKey: string,
  scoutId: string,
  limit: number = 20
): Promise<YutoriUpdate[]> {
  const data = await yutoriFetch<YutoriUpdate[] | { updates: YutoriUpdate[] }>(
    `/tasks/${scoutId}/updates?page_size=${limit}`,
    apiKey
  );
  return Array.isArray(data) ? data : data.updates ?? [];
}

// ─── Validation ───

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    await listScouts(apiKey);
    return true;
  } catch {
    return false;
  }
}
