export interface BlogElement {
    id: number
    type: 'text' | 'image' | 'video'
    content?: string
    src?: string
    alt?: string
    caption?: string
    youtubeId?: string
    title?: string
}

export interface RelatedPost {
    id: number
    title: string
    url: string
    featuredImage?: string
}

export interface BlogData {
    id: number
    slug: string
    title: string
    subtitle: string
    excerpt: string
    author: {
        name: string
        role: string
        avatar: string
    }
    publishDate: string
    readTime: string
    tags: string[]
    featuredImage: string
    elements: BlogElement[]
    highlights: string[]
    social: {
        likes: number
        shares: number
        comments: number
    }
    relatedPosts?: RelatedPost[]
    nextPost?: RelatedPost[]
}

export interface TableOfContentsItem {
    id: string
    title: string
    level: number
    progress: number
    isActive: boolean
    isCompleted: boolean
}