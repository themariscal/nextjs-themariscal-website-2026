interface TrendingPost {
    id: string;
    title: string;
    subtitle: string;
    subreddit: string;
    imageUrl?: string;
    upvotes: number;
    comments: number;
    timeAgo: string;
}
