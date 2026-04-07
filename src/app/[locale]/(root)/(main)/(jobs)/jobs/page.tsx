"use client";

import MainLayout from '@/components/elements/layouts/main-layout'
import React, { useState } from 'react'
import { UserProfileCard } from '@/components/elements/jobs/user-profile-card'
import { JobSection } from '@/components/elements/jobs/job-section'
import { JobSearchTags } from '@/components/elements/jobs/job-search-tags'
import { SidebarNavigation } from '@/components/elements/jobs/sidebar-navigation'
import { PremiumCoursesSection } from '@/components/elements/jobs/premium-courses-section'
import { MobileBottomBar } from '@/components/elements/jobs/mobile-bottom-bar'
import { dummyUserProfile, dummyJobSearches, dummyJobs } from '@/data/dummy/dummy-jobs-data'
import { Job } from '@/lib/types/jobs'
import { useSidebarStore } from '@/lib/stores/sidebar-store';
import { cn } from '@/lib/utils';

const Page = () => {
    const [dismissedJobs, setDismissedJobs] = useState<Set<string>>(new Set())
    const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
    const [showNotification, setShowNotification] = useState(true)

    // Filter jobs based on different criteria
    const topJobPicks = dummyJobs.slice(0, 3).filter(job => !dismissedJobs.has(job.id))
    const softwareEngineerJobs = dummyJobs.slice(3, 6).filter(job => !dismissedJobs.has(job.id))

    const handleDismissJob = (jobId: string) => {
        setDismissedJobs(prev => new Set([...prev, jobId]))
    }

    const handleApplyJob = (jobId: string) => {
        setAppliedJobs(prev => new Set([...prev, jobId]))
        // Here you would typically show an application modal or redirect
        console.log('Applied to job:', jobId)
    }

    const handleSearchClick = (search: any) => {
        console.log('Search clicked:', search)
        // Here you would typically filter jobs or navigate to search results
    }

    const handleShowAll = (section: string) => {
        console.log('Show all clicked for:', section)
        // Here you would typically show more jobs or navigate to a full listing
    }

    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    const { isCollapsed } = useSidebarStore();

    return (
        <MainLayout >
            <div className={cn("w-full transition-normal duration-300", isCollapsed ? 'md:pl-24' : 'md:pl-64')}>

                <div className="min-h-screen bg-background">
                    <div className="container mx-auto px-4 py-6 max-w-7xl">
                        {/* Mobile Layout */}
                        <div className="block lg:hidden space-y-6 pb-24">
                            {/* User Profile Card - Mobile */}
                            <UserProfileCard profile={dummyUserProfile} />

                            {/* Main Content - Mobile */}
                            <div className="space-y-6">
                                <JobSection
                                    title="Top job picks for you"
                                    subtitle="Based on your profile, preferences, and activity like applies, searches, and saves"
                                    jobs={topJobPicks}
                                    onDismiss={handleDismissJob}
                                    onApply={handleApplyJob}
                                    onShowAll={() => handleShowAll('top-picks')}
                                />

                                <JobSearchTags
                                    searches={dummyJobSearches}
                                    onSearchClick={handleSearchClick}
                                />

                                <JobSection
                                    title="Software engineer"
                                    subtitle="United States"
                                    jobs={softwareEngineerJobs}
                                    onDismiss={handleDismissJob}
                                    onApply={handleApplyJob}
                                    onEdit={() => console.log('Edit search')}
                                    onShowAll={() => handleShowAll('software-engineer')}
                                    showEditButton={true}
                                    showDismissButton={true}
                                />
                            </div>

                            {/* Premium Courses - Mobile */}
                            <PremiumCoursesSection />
                        </div>

                        {/* Mobile Bottom Bar */}
                        <MobileBottomBar
                            notification={showNotification ? {
                                message: "Invitation ignored.",
                                onDismiss: () => setShowNotification(false)
                            } : undefined}
                            onScrollTop={handleScrollTop}
                            onMessage={() => console.log('Message clicked')}
                            onMore={() => console.log('More clicked')}
                            onExpand={() => console.log('Expand clicked')}
                        />

                        {/* Desktop Layout */}
                        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                            {/* Left Sidebar */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* User Profile Card */}
                                <UserProfileCard profile={dummyUserProfile} />

                                {/* Sidebar Navigation */}
                                <SidebarNavigation />
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Top Job Picks Section */}
                                <JobSection
                                    title="Top job picks for you"
                                    subtitle="Based on your profile, preferences, and activity like applies, searches, and saves"
                                    jobs={topJobPicks}
                                    onDismiss={handleDismissJob}
                                    onApply={handleApplyJob}
                                    onShowAll={() => handleShowAll('top-picks')}
                                />

                                {/* Suggested Job Searches */}
                                <JobSearchTags
                                    searches={dummyJobSearches}
                                    onSearchClick={handleSearchClick}
                                />

                                {/* Software Engineer Section */}
                                <JobSection
                                    title="Software engineer"
                                    subtitle="United States"
                                    jobs={softwareEngineerJobs}
                                    onDismiss={handleDismissJob}
                                    onApply={handleApplyJob}
                                    onEdit={() => console.log('Edit search')}
                                    onShowAll={() => handleShowAll('software-engineer')}
                                    showEditButton={true}
                                    showDismissButton={true}
                                />
                            </div>

                            {/* Right Sidebar */}
                            <div className="lg:col-span-1">
                                <PremiumCoursesSection />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}

export default Page
