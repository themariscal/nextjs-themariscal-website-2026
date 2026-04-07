"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Community {
    id: string;
    name: string;
    members: number;
    icon?: string;
}

interface CommunitiesContentProps {
    communities: Community[];
    showCard?: boolean;
    showTitle?: boolean;
}

export const CommunitiesContent: React.FC<CommunitiesContentProps> = ({
    communities,
    showCard = true,
    showTitle = true
}) => {
    const formatMembers = (count: number): string => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M miembros`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K miembros`;
        }
        return `${count} miembros`;
    };

    const content = (
        <>
            {showTitle && (
                <div className="pb-3">
                    <h3 className="text-lg font-semibold">Comunidades Populares</h3>
                </div>
            )}
            <div className={showTitle ? "pt-0" : ""}>
                <div className="space-y-3">
                    {communities.map((community, index) => (
                        <div key={community.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-muted-foreground w-6">
                                    {index + 1}
                                </span>
                                <Avatar className="w-8 h-8">
                                    {community.icon ? (
                                        <AvatarImage src={community.icon} alt={community.name} />
                                    ) : (
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            {community.name.charAt(1).toUpperCase()}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{community.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatMembers(community.members)}
                                    </span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                                Unirse
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full">
                        Ver todas las comunidades
                    </Button>
                </div>
            </div>
        </>
    );

    if (showCard) {
        return (
            <Card className="w-full">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Comunidades Populares</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-3">
                        {communities.map((community, index) => (
                            <div key={community.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-muted-foreground w-6">
                                        {index + 1}
                                    </span>
                                    <Avatar className="w-8 h-8">
                                        {community.icon ? (
                                            <AvatarImage src={community.icon} alt={community.name} />
                                        ) : (
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                {community.name.charAt(1).toUpperCase()}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{community.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatMembers(community.members)}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="h-7 text-xs">
                                    Unirse
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <Button variant="outline" className="w-full">
                            Ver todas las comunidades
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return <div className="w-full">{content}</div>;
};
