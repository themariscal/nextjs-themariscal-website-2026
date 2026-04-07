"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Job } from "@/lib/types/jobs";
import {
    MapPin,
    Clock,
    Users,
    Star,
    MoreHorizontal,
    X,
    ExternalLink,
    CheckCircle
} from "lucide-react";

interface JobCardProps {
    job: Job;
    onDismiss?: (jobId: string) => void;
    onApply?: (jobId: string) => void;
}

export function JobCard({ job, onDismiss, onApply }: JobCardProps) {
    const formatSalary = (salary: Job['salary']) => {
        if (!salary) return null;

        const { min, max, currency, period } = salary;
        const periodText = period === 'yearly' ? 'yr' : period === 'monthly' ? 'mo' : 'hr';
        return `${currency}${min.toLocaleString()}/${periodText} - ${currency}${max.toLocaleString()}/${periodText}`;
    };

    const getJobTypeColor = (type: Job['type']) => {
        switch (type) {
            case 'full-time':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'part-time':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'contract':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'remote':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <Card className="w-full hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        {/* Job Title and Company */}
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-muted-foreground">
                                    {job.company}
                                </span>
                                {job.isPromoted && (
                                    <Badge variant="secondary" className="text-xs">
                                        Promoted
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Location and Type */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{job.postedAt}</span>
                            </div>
                        </div>

                        {/* Job Type Badge */}
                        <Badge
                            variant="outline"
                            className={`text-xs ${getJobTypeColor(job.type)}`}
                        >
                            {job.type.replace('-', ' ').toUpperCase()}
                        </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {onDismiss && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onDismiss(job.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-4">
                    {/* Status Indicators */}
                    <div className="flex items-center gap-4 text-sm">
                        {job.isActivelyReviewing && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                <span>Actively reviewing applicants</span>
                            </div>
                        )}
                        {job.connectionsCount && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{job.connectionsCount} connections work here</span>
                            </div>
                        )}
                    </div>

                    {/* Salary */}
                    {job.salary && (
                        <div className="text-sm">
                            <span className="font-medium text-foreground">
                                {formatSalary(job.salary)}
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                        {job.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{job.skills.length - 3} more
                            </Badge>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                        {job.isEasyApply ? (
                            <Button
                                className="flex-1 bg-primary hover:bg-primary/90"
                                onClick={() => onApply?.(job.id)}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Easy Apply
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => onApply?.(job.id)}
                            >
                                Apply
                            </Button>
                        )}
                        <Button variant="outline" size="icon">
                            <Star className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
