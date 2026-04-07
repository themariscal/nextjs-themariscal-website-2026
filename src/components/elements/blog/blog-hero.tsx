'use client'

import React, { forwardRef } from 'react'
import Image from 'next/image'
import { BlogData } from '@/lib/types/blog'


export const BlogHero = forwardRef<HTMLDivElement, { data: BlogData }>(({ data }, ref) => {
    return (
        <div ref={ref} className="relative w-full h-[400px] overflow-hidden">
            {/* Background Image - No Parallax */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/95 z-10" />

                <Image
                    src={data.featuredImage}
                    alt={data.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                />
            </div>
        </div>
    )
})

BlogHero.displayName = 'BlogHero'