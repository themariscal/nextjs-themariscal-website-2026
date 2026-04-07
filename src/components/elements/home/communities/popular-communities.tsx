"use client";

import React from "react";
import { CommunitiesContent } from "./communities-content";
import { CommunitiesFooter } from "./communities-footer";

interface Community {
    id: string;
    name: string;
    members: number;
    icon?: string;
}

interface PopularCommunitiesProps {
    communities: Community[];
}

export const PopularCommunities: React.FC<PopularCommunitiesProps> = ({ communities }) => {
    return (
        <div>
            <CommunitiesContent communities={communities} showCard={true} showTitle={true} />
            <CommunitiesFooter />
        </div>
    );
};
