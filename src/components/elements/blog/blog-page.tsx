"use client";

import { BlogContent } from "@/components/elements/blog/blog-content";
import { BlogHero } from "@/components/elements/blog/blog-hero";
import { BlogSidebar } from "@/components/elements/blog/blog-sidebar";
import { BlogLoading, BlogError, BlogNoData } from "@/components/elements/blog/blog-states";
import { PrincipalLayout } from "@/components/elements/layouts/principal-layout";
import { useBlogData } from "@/lib/services/blog-service";
import { useScrollUrl } from "@/lib/hooks/use-scroll-url";
import { BlogData } from "@/lib/types/blog";
import React from "react";

export const BlogPage = ({ url, data }: { url: string, data?: BlogData }) => {
    // All hooks must be called at the top level
    const { data: blogData, loading, error } = useBlogData(url);
    const heroRef = useScrollUrl({ url, enabled: true }); // Always enable scroll URL detection

    // If data is provided as prop, use it directly
    if (data) {
        return <PrincipalLayout
            hero={<BlogHero data={data} ref={heroRef} />}
            content={<BlogContent data={data} />}
            rightSidebar={<BlogSidebar data={data} articleId={url} />}
        />
    }

    // Handle loading, error, and no data states
    if (loading) {
        return <BlogLoading />
    }

    if (error) {
        return <BlogError error={error} />
    }

    if (!blogData) {
        return <BlogNoData />
    }

    return <PrincipalLayout
        hero={<BlogHero data={blogData as BlogData} ref={heroRef} />}
        content={<BlogContent data={blogData as BlogData} />}
        rightSidebar={<BlogSidebar data={blogData as BlogData} articleId={url} />}
    />
};
