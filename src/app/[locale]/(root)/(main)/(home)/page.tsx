"use client";

import { PopularCommunities } from "@/components/elements/home/communities/popular-communities";
import { HomeContent } from "@/components/elements/home/home-content";
import { TrendingList } from "@/components/elements/home/trending/trending-list";
import MainLayout from "@/components/elements/layouts/main-layout";
import { PrincipalLayout } from "@/components/elements/layouts/principal-layout";
import { popularCommunities, trendingPosts } from "@/data/dummy/dummy-data";
import React from "react";


const Page = () => {
  return (<MainLayout>
    <PrincipalLayout
      hero={<TrendingList posts={trendingPosts} />}
      content={<HomeContent />}
      rightSidebar={<PopularCommunities communities={popularCommunities} />}
    />
  </MainLayout>)
};

export default Page;
