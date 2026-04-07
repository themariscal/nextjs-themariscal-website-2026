import { useEffect, useRef } from 'react'

interface UseScrollUrlProps {
    url: string
    enabled?: boolean
}

/**
 * Hook that changes the URL when the element is more than 50% visible on screen
 * Works for both forward and backward scrolling
 * @param url - The URL to change to
 * @param enabled - Whether the hook is enabled
 */
export const useScrollUrl = ({ url, enabled = true }: UseScrollUrlProps) => {
    const elementRef = useRef<HTMLDivElement>(null)
    const lastScrollY = useRef(0)
    const hasChangedUrl = useRef(false)

    useEffect(() => {
        if (!enabled) return

        const handleScroll = () => {
            if (!elementRef.current) return

            const element = elementRef.current
            const rect = element.getBoundingClientRect()
            const windowHeight = window.innerHeight
            const currentScrollY = window.scrollY
            
            // Get the current URL to avoid changing to the same URL
            const currentUrl = window.location.pathname
            const targetUrl = url.startsWith('/') ? url : `/${url}`
            
            // Calculate element position relative to viewport
            const elementTop = rect.top
            const elementHeight = rect.height
            const elementBottom = rect.bottom
            
            // Check if element is visible and in the upper half of the screen
            const isElementVisible = elementBottom > 0 && elementTop < windowHeight
            const isInUpperHalf = elementTop < windowHeight / 2
            
            // Determine scroll direction
            const isScrollingDown = currentScrollY > lastScrollY.current
            const isScrollingUp = currentScrollY < lastScrollY.current
            
            console.log('Scroll detection:', {
                elementTop,
                elementHeight,
                elementBottom,
                windowHeight,
                isElementVisible,
                isInUpperHalf,
                currentUrl,
                targetUrl,
                isScrollingDown,
                isScrollingUp,
                currentScrollY,
                lastScrollY: lastScrollY.current
            })
            
            // Change URL when element is in upper half and visible
            if (isElementVisible && isInUpperHalf) {
                // Only change if it's different from current URL
                if (currentUrl !== targetUrl) {
                    console.log('Changing URL to:', targetUrl)
                    window.history.replaceState(null, "", targetUrl)
                    hasChangedUrl.current = true
                }
            } else {
                // Reset the flag when element is not in the trigger zone
                hasChangedUrl.current = false
            }
            
            // Update last scroll position
            lastScrollY.current = currentScrollY
        }

        // Reset the flag when URL changes
        hasChangedUrl.current = false
        lastScrollY.current = window.scrollY

        window.addEventListener('scroll', handleScroll, { passive: true })
        
        // Initial check
        handleScroll()

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [url, enabled])

    return elementRef
}
