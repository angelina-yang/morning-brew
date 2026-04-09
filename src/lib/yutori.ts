import type { YutoriScout, YutoriScoutCreate, YutoriUpdate } from "@/types";

const BASE_URL = "https://api.yutori.com/v1/scouting";

class YutoriError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "YutoriError";
  }
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
    let message = `Yutori API error: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.error || body.message || body.detail) {
        message = body.error || body.message || body.detail;
      }
    } catch {
      // Use default message
    }
    throw new YutoriError(message, res.status);
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
