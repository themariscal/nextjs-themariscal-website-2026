import { ArtistPageLayout } from '@/components/elements/music/artist-page-layout';
import { lisandroSkar, andresCalamaro, kapanga, grse } from '@/data/dummy/artist-data';
import { notFound } from 'next/navigation';
import MainLayout from '@/components/elements/layouts/main-layout';

interface ArtistPageProps {
    params: {
        id: string;
        locale: string;
    };
}

const artists = {
    'lisandro-skar': lisandroSkar,
    'andres-calamaro': andresCalamaro,
    'kapanga': kapanga,
    'grse': grse,
};

export default function ArtistPageRoute({ params }: ArtistPageProps) {
    const artist = artists[params.id as keyof typeof artists];

    if (!artist) {
        notFound();
    }

    return (
        <MainLayout hideSidebar>
            <div className="h-full">
                <ArtistPageLayout artist={artist} />
            </div>
        </MainLayout>
    );
}

export async function generateStaticParams() {
    return Object.keys(artists).map((id) => ({
        id,
    }));
}
