import type { Metadata } from "next";
import ShortsPlayerClient from "./shorts-player-client";

type PageParams = {
  locale: string;
  page: string;
  videoId: string;
};

async function getYouTubeTitle(videoId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/shorts/${videoId}&format=json`,
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) return null;
    const data = (await response.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { videoId } = await params;
  const videoTitle = await getYouTubeTitle(videoId);

  return {
    title: videoTitle ?? "Shorts",
  };
}

export default function ShortsPlayerPage() {
  return <ShortsPlayerClient />;
}
