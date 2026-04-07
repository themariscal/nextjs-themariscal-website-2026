import React from 'react';
import { MusicLayout } from '@/components/elements/music/music-layout';
import MainLayout from '@/components/elements/layouts/main-layout';

const Page = () => {
    return (
        <MainLayout hideSidebar>
            <div className="h-full">
                <MusicLayout />
            </div>
        </MainLayout>
    );
};

export default Page;
