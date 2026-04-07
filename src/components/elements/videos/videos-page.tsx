"use client"

import React from 'react'
import { VideoCard } from './video-card'
import { ShortsCard } from './shorts-card'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { mockVideos, mockShorts } from '@/data/dummy/dummy-videos-data'


export const VideosPage: React.FC = () => {

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-0 max-w-7xl">

                <section className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {mockVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                </section>

                {/* Shorts Section */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">S</span>
                            </div>
                            <h2 className="text-xl font-semibold text-foreground">Shorts</h2>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            {mockShorts.length} videos
                        </Badge>
                    </div>

                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                        {mockShorts.map((short) => (
                            <ShortsCard key={short.id} short={short} />
                        ))}
                    </div>
                </section>

                {/* Separator */}
                <Separator className="my-8" />

                {/* More Videos Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-foreground">Más videos</h2>
                        <Button variant="outline" size="sm">
                            Ver más
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {mockVideos.slice(0, 4).map((video) => (
                            <VideoCard key={`more-${video.id}`} video={video} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
