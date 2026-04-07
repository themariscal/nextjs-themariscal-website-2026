'use client'

import React from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Share2, MessageCircle, Calendar, Clock } from 'lucide-react'
import 'highlight.js/styles/github.css'
import 'highlight.js/styles/github-dark.css'
import { getInitials, formatDate } from '@/lib/utils'
import { markdownComponents } from '../markdown-content'
import { BlogData } from '@/lib/types/blog'


export const BlogContent = ({ data }: { data: BlogData }) => {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 z-10">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                    {data.title}
                </h1>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                    {data.subtitle}
                </p>

                {/* Author and Meta Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={data.author.avatar} alt={data.author.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(data.author.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-foreground">{data.author.name}</p>
                            <p className="text-sm text-muted-foreground">{data.author.role}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(data.publishDate)}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {data.readTime}
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {data.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* Excerpt */}
                <div className="bg-muted/50 p-6 rounded-lg border-l-4 border-primary">
                    <p className="text-foreground italic">{data.excerpt}</p>
                </div>
            </div>

            {/* Featured Image */}
            <div className="mb-8">
                <Image
                    src={data.featuredImage}
                    alt={data.title}
                    width={800}
                    height={400}
                    className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                    priority
                />
            </div>


            {/* Highlights Section */}
            <div className="border-t py-6 border-b mb-6">
                <div className="flex items-center justify-center gap-8 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        <span>{data.social.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        <span>{data.social.shares}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        <span>{data.social.comments}</span>
                    </div>
                </div>
            </div>

            {/* Dynamic Content Elements */}
            <div className="mb-8">
                <div className="space-y-8">
                    {data.elements.map((element) => {
                        switch (element.type) {
                            case 'text':
                                return (
                                    <div key={element.id} className="prose prose-lg max-w-none">
                                        <ReactMarkdown
                                            components={markdownComponents}
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight]}
                                        >
                                            {element.content || ''}
                                        </ReactMarkdown>
                                    </div>
                                )
                            case 'image':
                                return (
                                    <div key={element.id} className="my-8">
                                        <Card className="overflow-hidden">
                                            <CardContent className="p-0">
                                                <Image
                                                    src={element.src || ''}
                                                    alt={element.alt || ''}
                                                    width={800}
                                                    height={400}
                                                    className="w-full h-64 md:h-96 object-cover"
                                                />
                                                {element.caption && (
                                                    <div className="p-4">
                                                        <p className="text-sm text-muted-foreground text-center italic">
                                                            {element.caption}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )
                            case 'video':
                                return (
                                    <div key={element.id} className="my-8">
                                        <Card className="overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="aspect-video">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${element.youtubeId}`}
                                                        title={element.title || ''}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                                {element.caption && (
                                                    <div className="p-4">
                                                        <h3 className="font-semibold text-foreground mb-2">
                                                            {element.title}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {element.caption}
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                )
                            default:
                                return null
                        }
                    })}
                </div>
            </div>
        </div>
    )
}