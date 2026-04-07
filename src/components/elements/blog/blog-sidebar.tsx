'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BlogData, BlogElement, TableOfContentsItem } from '@/lib/types/blog'


export const BlogSidebar = ({ data, articleId }: { data: BlogData, articleId: string }) => {
    const [scrollProgress, setScrollProgress] = useState<TableOfContentsItem[]>([])

    // Function to extract headings from markdown content
    const extractTableOfContents = (elements: BlogElement[]): TableOfContentsItem[] => {
        const toc: TableOfContentsItem[] = []

        elements.forEach((element) => {
            if (element.type === 'text' && element.content) {
                const lines = element.content.split('\n')
                lines.forEach((line: string) => {
                    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
                    if (headingMatch) {
                        const level = headingMatch[1].length
                        const title = headingMatch[2].trim()
                        const id = `${articleId}-${title
                            .toLowerCase()
                            .replace(/[^a-z0-9\s]/g, '')
                            .replace(/\s+/g, '-')}`

                        toc.push({
                            id,
                            title,
                            level,
                            progress: 0,
                            isActive: false,
                            isCompleted: false
                        })
                    }
                })
            }
        })

        return toc
    }

    const tableOfContents = extractTableOfContents(data.elements)

    // Calculate scroll progress for each section
    const calculateScrollProgress = () => {
        const windowHeight = window.innerHeight
        const scrollTop = window.scrollY

        const updatedProgress = tableOfContents.map((item, index) => {
            const element = document.getElementById(item.id)
            if (!element) return { ...item, progress: 0, isActive: false, isCompleted: false }

            const rect = element.getBoundingClientRect()
            const elementTop = rect.top + scrollTop
            const elementHeight = rect.height
            const elementBottom = elementTop + elementHeight

            // Calculate progress based on element visibility
            let progress = 0
            let isActive = false
            let isCompleted = false

            // Check if element has been completed (scrolled past)
            if (scrollTop > elementBottom - windowHeight * 0.1) {
                // Element has been completed - scrolled past it
                isCompleted = true
                progress = 100
                isActive = false
            } else if (scrollTop >= elementTop - windowHeight * 0.3) {
                // Element is in view or approaching
                const visibleTop = Math.max(elementTop, scrollTop)
                const visibleBottom = Math.min(elementBottom, scrollTop + windowHeight)
                const visibleHeight = Math.max(0, visibleBottom - visibleTop)

                progress = Math.min(100, (visibleHeight / elementHeight) * 100)
                isActive = true

                // If we've seen most of the element, mark it as completed
                if (progress >= 70) {
                    isCompleted = true
                    progress = 100
                }
            }

            return { ...item, progress, isActive, isCompleted }
        })

        setScrollProgress(updatedProgress)
    }

    useEffect(() => {
        const handleScroll = () => {
            calculateScrollProgress()
        }

        // Initial calculation
        calculateScrollProgress()

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [data.elements])

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // Circular Progress Component
    const CircularProgress = ({ progress, isActive, isCompleted, size = 24 }: {
        progress: number,
        isActive: boolean,
        isCompleted: boolean,
        size?: number
    }) => {
        const radius = (size - 4) / 2
        const circumference = 2 * Math.PI * radius
        const strokeDasharray = circumference
        const strokeDashoffset = circumference - (progress / 100) * circumference

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    className="transform -rotate-90"
                    width={size}
                    height={size}
                >
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-muted-foreground/20"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className={`transition-all duration-300 ${isCompleted
                            ? 'text-primary'
                            : isActive
                                ? 'text-primary'
                                : 'text-muted-foreground/40'
                            }`}
                        strokeLinecap="round"
                    />
                </svg>
                {/* Center dot for completed items */}
                {isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="w-full space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">
                        Tabla de Contenido
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <nav className="space-y-1.5">
                        {scrollProgress.length > 0 ? scrollProgress.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToHeading(item.id)}
                                className={`flex items-center gap-3 w-full text-left transition-all duration-200 hover:bg-muted/50 p-1 rounded-md group ${item.level === 1
                                    ? 'text-base font-bold'
                                    : item.level === 2
                                        ? 'text-sm font-medium pl-6'
                                        : 'text-sm pl-12'
                                    } ${item.isActive
                                        ? 'text-foreground'
                                        : item.isCompleted
                                            ? 'text-foreground'
                                            : 'text-muted-foreground'
                                    }`}
                            >
                                <CircularProgress
                                    progress={item.progress}
                                    isActive={item.isActive}
                                    isCompleted={item.isCompleted}
                                    size={20}
                                />
                                <span className="flex-1 truncate">{item.title}</span>
                            </button>
                        )) : tableOfContents.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToHeading(item.id)}
                                className={`flex items-center gap-3 w-full text-left transition-all duration-200 hover:bg-muted/50 p-1 rounded-md group ${item.level === 1
                                    ? 'text-base font-bold text-foreground'
                                    : item.level === 2
                                        ? 'text-sm font-medium text-foreground pl-6'
                                        : 'text-sm text-muted-foreground pl-12'
                                    }`}
                            >
                                <CircularProgress
                                    progress={0}
                                    isActive={false}
                                    isCompleted={false}
                                    size={20}
                                />
                                <span className="flex-1 truncate">{item.title}</span>
                            </button>
                        ))}
                    </nav>
                </CardContent>
            </Card>

            <>

                <CardContent>
                    <CardTitle className="text-lg font-semibold text-foreground">
                        Puntos Destacados
                    </CardTitle>
                    <ul className="space-y-2 mt-4">
                        {data.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm text-muted-foreground">{highlight}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </>

            {data.relatedPosts && data.relatedPosts.length > 0 && (
                <>
                    <CardContent>
                        <CardTitle className="text-lg font-semibold text-foreground">
                            Artículos Relacionados
                        </CardTitle>
                        <div className="space-y-4 mt-4">
                            {data.relatedPosts.map((post) => (
                                <div key={post.id} className="group cursor-pointer">
                                    <div className="flex gap-3">
                                        <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                                            {post.featuredImage ? (
                                                <Image
                                                    src={post.featuredImage}
                                                    alt={post.title}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-primary">📄</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                {post.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Leer más →
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </>
            )
            }

        </div >
    )
}