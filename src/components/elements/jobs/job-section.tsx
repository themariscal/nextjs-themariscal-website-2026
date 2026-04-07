"use client";

import { Button } from "@/components/ui/button";
import { Job } from "@/lib/types/jobs";
import { JobCard } from "./job-card";
import { ArrowRight, Edit, X } from "lucide-react";

interface JobSectionProps {
    title: string;
    subtitle?: string;
    jobs: Job[];
    onDismiss?: (jobId: string) => void;
    onApply?: (jobId: string) => void;
    onEdit?: () => void;
    onShowAll?: () => void;
    showEditButton?: boolean;
    showDismissButton?: boolean;
}

export function JobSection({
    title,
    subtitle,
    jobs,
    onDismiss,
    onApply,
    onEdit,
    onShowAll,
    showEditButton = false,
    showDismissButton = false
}: JobSectionProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h2 className="font-semibold text-xl">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {showEditButton && onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onEdit}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                    {showDismissButton && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
                {jobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        onDismiss={onDismiss}
                        onApply={onApply}
                    />
                ))}
            </div>

            {/* Show All Button */}
            {onShowAll && (
                <div className="pt-2">
                    <Button
                        variant="ghost"
                        className="text-primary hover:text-primary/80 p-0 h-auto"
                        onClick={onShowAll}
                    >
                        Show all <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
