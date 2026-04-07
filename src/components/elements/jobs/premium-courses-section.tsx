"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Play } from "lucide-react";

interface PremiumCoursesSectionProps {
    onDismiss?: () => void;
}

export function PremiumCoursesSection({ onDismiss }: PremiumCoursesSectionProps) {
    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg">Check out these popular courses with LinkedIn Premium</h3>
                    {onDismiss && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onDismiss}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Course Card */}
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                            <Play className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium">Advanced React Development</h4>
                            <p className="text-sm text-muted-foreground">
                                Master modern React patterns and best practices
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                    Premium
                                </Badge>
                                <span className="text-xs text-muted-foreground">4.8 ⭐ (2.3k reviews)</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full bg-primary hover:bg-primary/90">
                        Start learning
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
