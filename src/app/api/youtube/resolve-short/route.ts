import { auth } from "@clerk/nextjs/server";
import { extractYouTubeVideoId } from "@/lib/youtube-shorts";

export async function GET(request: Request) {
  const { userId, has } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin =
    has?.({ permission: "org:admin" }) || has?.({ role: "org:admin" });
  if (!isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const shortUrl = searchParams.get("url")?.trim() ?? "";

  if (!shortUrl) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const videoId = extractYouTubeVideoId(shortUrl);
  if (!videoId) {
    return Response.json({ error: "Invalid YouTube short URL" }, { status: 400 });
  }

  const canonicalUrl = `https://www.youtube.com/shorts/${videoId}`;
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    canonicalUrl
  )}&format=json`;

  const response = await fetch(oEmbedUrl);
  if (!response.ok) {
    return Response.json(
      { error: "Could not resolve short metadata from YouTube" },
      { status: 400 }
    );
  }

  const data = (await response.json()) as {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
  };

  return Response.json({
    videoId,
    shortUrl: canonicalUrl,
    title: data.title ?? "",
    authorName: data.author_name ?? "",
    thumbnailUrl: data.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  });
}

