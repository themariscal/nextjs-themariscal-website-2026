export function extractYouTubeVideoId(urlOrId: string): string | null {
  const value = urlOrId.trim();
  if (!value) return null;

  if (/^[A-Za-z0-9_-]{6,}$/.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (url.hostname.includes("youtube.com")) {
      const shortsMatch = url.pathname.match(/\/shorts\/([A-Za-z0-9_-]{6,})/);
      if (shortsMatch?.[1]) return shortsMatch[1];

      const watchId = url.searchParams.get("v");
      if (watchId) return watchId;
    }
  } catch {
    return null;
  }

  return null;
}

