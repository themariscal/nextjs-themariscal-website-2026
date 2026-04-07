import React from 'react'
import { VideosPage } from '@/components/elements/videos/videos-page'
import { PrincipalLayout } from '@/components/elements/layouts/principal-layout'
import { TagList } from '@/components/elements/videos/tag-list'
import MainLayout from '@/components/elements/layouts/main-layout'

const Page = () => {
    return (
        <MainLayout>
            <PrincipalLayout hero={<TagList />} content={<VideosPage />} />
        </MainLayout>
    )
}

export default Page
