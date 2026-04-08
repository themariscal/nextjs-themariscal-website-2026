import { Button } from '@/components/ui/button'
import { feedPosts } from '@/data/dummy/dummy-data'
import { ChevronDown } from 'lucide-react'
import React from 'react'
import { CommunitiesSheet } from './communities/communities-sheet'
import { PostCard } from './posts/post-card'
import { YouTubeShorts } from './youtube-shorts'

export const HomeContent = () => {
    return (
        <div className="flex-1 h-full">
            <YouTubeShorts page="home" />
            <div className="p-4">
            {/* Feed Navigation */}
            <div className="flex items-center gap-4 mb-6">

                <div className="flex items-center gap-2 justify-between w-full">
                    <div className="flex  gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            Mejores
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            Croacia
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex lg:hidden">
                        <CommunitiesSheet />
                    </div>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
                {feedPosts.map((post) => (
                    <PostCard
                        key={post.id}
                        id={post.id}
                        subreddit={post.subreddit}
                        author={post.author}
                        timeAgo={post.timeAgo}
                        title={post.title}
                        content={post.content}
                        imageUrl={post.imageUrl}
                        upvotes={post.upvotes}
                        comments={post.comments}
                        isSponsored={post.isSponsored}
                        isJoined={post.isJoined}
                    />
                ))}
            </div>
            </div>
        </div>
    )
}

