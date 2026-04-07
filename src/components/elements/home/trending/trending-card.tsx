"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronUp, MessageCircle, Share } from "lucide-react";

interface TrendingCardProps {
    id: string;
    title: string;
    subtitle: string;
    subreddit: string;
    imageUrl?: string;
    upvotes: number;
    comments: number;
    timeAgo: string;
}

export const TrendingCard: React.FC<TrendingCardProps> = ({
    title,
    subtitle,
    subreddit,
    imageUrl,
    upvotes,
    comments,
    timeAgo,
}) => {
    return (
        <Card className="w-80 h-48 flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow min-w-80">
            <CardContent className="p-0 h-full">
                <div className="flex h-full">
                    {/* Image section */}
                    <div className="w-32 h-full relative">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover rounded-l-lg"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center rounded-l-lg">
                                <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {subreddit.charAt(1).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </div>

                    {/* Content section */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-primary">{subreddit}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{timeAgo}</span>
                            </div>

                            <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
                                {title}
                            </h3>

                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {subtitle}
                            </p>
                        </div>

                        {/* Engagement section */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{upvotes}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{comments}</span>
                                </div>
                            </div>

                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Share className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
