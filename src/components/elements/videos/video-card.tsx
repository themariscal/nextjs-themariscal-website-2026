"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, MoreHorizontal } from 'lucide-react'
import { VideoData } from '@/lib/types/videos'


interface VideoCardProps {
    video: VideoData
    variant?: 'default' | 'compact'
    className?: string
}

export const VideoCard: React.FC<VideoCardProps> = ({
    video,
    variant = 'default',
    className = ''
}) => {
    const formatViews = (views: string) => {
        const num = parseInt(views.replace(/[^\d]/g, ''))
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return views
    }

    const formatTimeAgo = (timeAgo: string) => {
        return timeAgo
    }

    return (
        <Card className={`group cursor-pointer transition-all duration-200 hover:shadow-lg border-0 bg-transparent ${className}`}>
            <CardContent className="p-0">
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2">
                        <Badge
                            variant="secondary"
                            className="bg-black/80 text-white border-0 text-xs font-medium px-1.5 py-0.5"
                        >
                            {video.duration}
                        </Badge>
                    </div>

                    {/* Live Badge */}
                    {video.isLive && (
                        <div className="absolute top-2 left-2">
                            <Badge
                                variant="destructive"
                                className="bg-red-600 text-white border-0 text-xs font-medium px-2 py-1 animate-pulse"
                            >
                                EN VIVO
                            </Badge>
                        </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full bg-black/70 hover:bg-black/80 text-white hover:scale-110 transition-transform"
                        >
                            <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                        </Button>
                    </div>
                </div>

                {/* Video Info */}
                <div className={`mt-3 flex gap-3 ${variant === 'compact' ? 'gap-2' : ''}`}>
                    {/* Channel Avatar */}
                    <Avatar className={`shrink-0 ${variant === 'compact' ? 'h-8 w-8' : 'h-9 w-9'}`}>
                        <AvatarImage src={video.channelAvatar} alt={video.channel} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {video.channel.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Video Details */}
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-foreground group-hover:text-primary transition-colors overflow-hidden ${variant === 'compact' ? 'text-sm' : 'text-sm'} line-clamp-2`}>
                            {video.title}
                        </h3>

                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                                {video.channel}
                            </span>
                            {video.verified && (
                                <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{formatViews(video.views)} visualizaciones</span>
                            <span>•</span>
                            <span>{formatTimeAgo(video.publishedAt)}</span>
                        </div>

                        {/* Category Badge */}
                        {video.category && (
                            <Badge
                                variant="outline"
                                className="mt-2 text-xs px-2 py-0.5 border-primary/20 text-primary hover:bg-primary/5"
                            >
                                {video.category}
                            </Badge>
                        )}
                    </div>

                    {/* More Options */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
