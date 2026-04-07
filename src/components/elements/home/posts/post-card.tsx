"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, MessageCircle, Share, Bookmark } from "lucide-react";

interface PostCardProps {
    id: string;
    subreddit: string;
    author: string;
    timeAgo: string;
    title: string;
    content?: string;
    imageUrl?: string;
    upvotes: number;
    comments: number;
    isSponsored?: boolean;
    isJoined?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
    subreddit,
    author,
    timeAgo,
    title,
    content,
    imageUrl,
    upvotes,
    comments,
    isSponsored = false,
    isJoined = false,
}) => {
    return (
        <Card className="w-full mb-4">
            <CardContent className="p-0">
                <div className="flex">
                    {/* Vote section */}
                    <div className="w-12 flex flex-col items-center py-2 bg-muted/30">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/10">
                            <ChevronUp className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-medium py-1">{upvotes}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/10">
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-4">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Avatar className="w-5 h-5">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {subreddit.charAt(1).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-primary">{subreddit}</span>
                                <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                                <span className="text-xs text-muted-foreground">u/{author}</span>
                                <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                                <span className="text-xs text-muted-foreground">{timeAgo}</span>
                                {isSponsored && (
                                    <>
                                        <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            Patrocinado
                                        </span>
                                    </>
                                )}
                            </div>
                            {!isJoined && !isSponsored && (
                                <Button variant="outline" size="sm" className="self-start sm:ml-auto h-6 text-xs">
                                    Unirse
                                </Button>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="text-lg font-semibold mb-2 leading-tight">{title}</h2>

                        {/* Content */}
                        {content && (
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                {content}
                            </p>
                        )}

                        {/* Image */}
                        {imageUrl && (
                            <div className="mb-3">
                                <img
                                    src={imageUrl}
                                    alt={title}
                                    className="w-full max-h-96 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                            <Button variant="ghost" size="sm" className="h-8 gap-1 sm:gap-2">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm hidden sm:inline">{comments} comentarios</span>
                                <span className="text-sm sm:hidden">{comments}</span>
                            </Button>

                            <Button variant="ghost" size="sm" className="h-8 gap-1 sm:gap-2">
                                <Share className="w-4 h-4" />
                                <span className="text-sm hidden sm:inline">Compartir</span>
                            </Button>

                            <Button variant="ghost" size="sm" className="h-8 gap-1 sm:gap-2">
                                <Bookmark className="w-4 h-4" />
                                <span className="text-sm hidden sm:inline">Guardar</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
