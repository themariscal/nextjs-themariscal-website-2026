"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/lib/types/jobs";
import { ExternalLink, Check } from "lucide-react";

interface UserProfileCardProps {
    profile: UserProfile;
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Avatar */}
                    <div className="relative">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile.avatar} alt={profile.name} />
                            <AvatarFallback className="text-lg">
                                {getInitials(profile.name)}
                            </AvatarFallback>
                        </Avatar>
                        {profile.isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                                <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Name and Title */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{profile.name}</h3>
                            {profile.isVerified && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {profile.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{profile.location}</p>
                    </div>

                    {/* Website Link */}
                    {profile.website && (
                        <div className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                            <ExternalLink className="h-3 w-3" />
                            <span>{profile.website}</span>
                        </div>
                    )}

                    {/* Premium Badge */}
                    {profile.isPremium && (
                        <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                            Premium
                        </Badge>
                    )}

                    {/* Action Button */}
                    <Button className="w-full bg-primary hover:bg-primary/90">
                        Post a free job
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
