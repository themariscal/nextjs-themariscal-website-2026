"use client";


import { BlogPage } from "@/components/elements/blog/blog-page";
import { BlogLoading, BlogError, BlogNoData } from "@/components/elements/blog/blog-states";
import { useBlogData } from "@/lib/services/blog-service";
import { useParams } from "next/navigation";
import React from "react";


const Page = () => {
    const { slug: url } = useParams();
    const slug = 'blog/' + url;
    const { data, loading, error } = useBlogData(slug as string);

    if (loading) {
        return <BlogLoading />
    }

    if (error) {
        return <BlogError error={error} />
    }

    if (!data) {
        return <BlogNoData />
    }
    return <>
        <BlogPage data={data} url={slug as string} />
        {
            data.nextPost?.map((post) => (
                <BlogPage key={post.id} url={post.url} />
            ))
        }
    </>
};

export default Page;
