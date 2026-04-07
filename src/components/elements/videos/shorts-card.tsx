"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Play, Heart, MessageCircle, Share, MoreVertical } from 'lucide-react'
import { ShortsData } from '@/lib/types/videos'


interface ShortsCardProps {
    short: ShortsData
    className?: string
}

export const ShortsCard: React.FC<ShortsCardProps> = ({
    short,
    className = ''
}) => {
    const formatViews = (views: string) => {
        const num = parseInt(views.replace(/[^\d]/g, ''))
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return views
    }

    return (
        <Card className={`group cursor-pointer transition-all duration-200 hover:shadow-lg border-0 bg-transparent ${className}`}>
            <CardContent className="p-0">
                {/* Thumbnail Container - Vertical Aspect Ratio */}
                <div className="relative aspect-[9/16] w-full max-w-[200px] mx-auto overflow-hidden rounded-lg bg-muted">
                    <img
                        src={short.thumbnail}
                        alt={short.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full bg-black/70 hover:bg-black/80 text-white"
                        >
                            <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                        </Button>
                    </div>

                    {/* Action Buttons - Right Side */}
                    <div className="absolute right-2 bottom-4 flex flex-col gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                        >
                            <Heart className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                        >
                            <MessageCircle className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                        >
                            <Share className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Video Info */}
                <div className="mt-3 px-2">
                    <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">
                        {short.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={short.channelAvatar} alt={short.channel} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                {short.channel.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer truncate">
                                    {short.channel}
                                </span>
                                {short.verified && (
                                    <div className="h-3 w-3 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{formatViews(short.views)} visualizaciones</span>
                                <span>•</span>
                                <span>{short.publishedAt}</span>
                            </div>
                        </div>
                    </div>

                    {/* Engagement Stats */}
                    {(short.likes || short.comments) && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {short.likes && (
                                <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    <span>{formatViews(short.likes)}</span>
                                </div>
                            )}
                            {short.comments && (
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    <span>{formatViews(short.comments)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
