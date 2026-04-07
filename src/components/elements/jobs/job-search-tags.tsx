"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobSearch } from "@/lib/types/jobs";
import { Search, X } from "lucide-react";

interface JobSearchTagsProps {
    searches: JobSearch[];
    onSearchClick?: (search: JobSearch) => void;
    onDismiss?: () => void;
}

export function JobSearchTags({ searches, onSearchClick, onDismiss }: JobSearchTagsProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Suggested job searches</h3>
                {onDismiss && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onDismiss}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Search Tags */}
            <div className="flex flex-wrap gap-2">
                {searches.map((search) => (
                    <Button
                        key={search.id}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-sm hover:bg-accent"
                        onClick={() => onSearchClick?.(search)}
                    >
                        <Search className="h-3 w-3 mr-2" />
                        {search.title}
                    </Button>
                ))}
            </div>
        </div>
    );
}
