import { useState, useEffect } from 'react'
import { BlogData } from '@/lib/types/blog'

/**
 * Fetches blog data from the API based on the provided slug
 * @param slug - The blog post slug (e.g., 'blog-page-1')
 * @returns Promise<BlogData> - The blog data
 * @throws Error if the fetch fails
 */
export const fetchBlogData = async (slug: string): Promise<BlogData> => {
    try {
        const response = await fetch(`${slug}`)
        
        if (!response.ok) {
            throw new Error(`Failed to fetch blog data: ${response.status}`)
        }

        const blogData = await response.json()
        return blogData as BlogData
    } catch (error) {
        console.error('Error fetching blog data:', error)
        throw error instanceof Error ? error : new Error('Error loading blog data')
    }
}

/**
 * Fetches blog data with loading and error states
 * @param slug - The blog post slug
 * @returns Object with data, loading, and error states
 */
export const useBlogData = (slug: string) => {
    const [data, setData] = useState<BlogData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadBlogData = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const blogData = await fetchBlogData(slug)
                setData(blogData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading blog data')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            loadBlogData()
        }
    }, [slug])

    return { data, loading, error }
}
