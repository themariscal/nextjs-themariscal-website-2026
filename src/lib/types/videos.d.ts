export interface VideoData {
  id: string
  title: string
  channel: string
  channelAvatar?: string
  thumbnail: string
  duration: string
  views: string
  publishedAt: string
  verified?: boolean
  isLive?: boolean
  category?: string
  description?: string
  tags?: string[]
  likes?: string
  dislikes?: string
  comments?: string
}

export interface ShortsData {
  id: string
  title: string
  channel: string
  channelAvatar?: string
  thumbnail: string
  views: string
  publishedAt: string
  verified?: boolean
  likes?: string
  comments?: string
  shares?: string
  duration?: string
}

export interface Category {
  id: string
  name: string
  isActive?: boolean
  isLive?: boolean
  badge?: string
  icon?: string
  color?: string
}

export interface VideoCardProps {
  video: VideoData
  variant?: 'default' | 'compact'
  className?: string
  onClick?: (video: VideoData) => void
}

export interface ShortsCardProps {
  short: ShortsData
  className?: string
  onClick?: (short: ShortsData) => void
}

export interface CategoryNavigationProps {
  categories: Category[]
  onCategoryChange?: (categoryId: string) => void
  className?: string
}

export interface VideosPageProps {
  initialVideos?: VideoData[]
  initialShorts?: ShortsData[]
  initialCategories?: Category[]
  onVideoClick?: (video: VideoData) => void
  onShortClick?: (short: ShortsData) => void
  onCategoryChange?: (categoryId: string) => void
}

export interface VideoData {
  id: string
  title: string
  channel: string
  channelAvatar?: string
  thumbnail: string
  duration: string
  views: string
  publishedAt: string
  verified?: boolean
  isLive?: boolean
  category?: string
}