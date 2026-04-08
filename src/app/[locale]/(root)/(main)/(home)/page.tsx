"use client";

import { PopularCommunities } from "@/components/elements/home/communities/popular-communities";
import { HomeContent } from "@/components/elements/home/home-content";
import { YouTubeShorts } from "@/components/elements/home/youtube-shorts";
import MainLayout from "@/components/elements/layouts/main-layout";
import { PrincipalLayout } from "@/components/elements/layouts/principal-layout";
import { popularCommunities } from "@/data/dummy/dummy-data";
import React from "react";


const Page = () => {
  return (<MainLayout>
    <PrincipalLayout
      hero={<YouTubeShorts page="home" />}
      content={<HomeContent />}
      rightSidebar={<PopularCommunities communities={popularCommunities} />}
    />
  </MainLayout>)
};

export default Page;
