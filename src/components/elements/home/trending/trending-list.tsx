"use client";

import React from "react";
import { TrendingCard } from "./trending-card";


interface TrendingListProps {
    posts: TrendingPost[];
}

export const TrendingList: React.FC<TrendingListProps> = ({ posts }) => {
    return (
        <>
            <div className="w-full">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
                    <div className="flex-shrink-0 w-0"></div>
                    {posts.map((post) => (
                        <TrendingCard
                            key={post.id}
                            id={post.id}
                            title={post.title}
                            subtitle={post.subtitle}
                            subreddit={post.subreddit}
                            imageUrl={post.imageUrl}
                            upvotes={post.upvotes}
                            comments={post.comments}
                            timeAgo={post.timeAgo}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};
