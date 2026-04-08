import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { GoBackButton } from '../../../components/buttons/go-back-button';
import MainLayout from '@/components/elements/layouts/main-layout';

export default async function CatchAllPage() {
    const t = await getTranslations('notFound');

    return (
        <MainLayout>
            <div className="relative min-h-[calc(100vh-14rem)] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-8">
                    <div className="relative">
                        <h1 className="text-9xl font-bold text-primary/20 select-none">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Search className="w-8 h-8 text-primary/60" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {t('heading')}
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="min-w-[160px]">
                            <Link href="/" className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                {t('backToHome')}
                            </Link>
                        </Button>
                        <GoBackButton />
                    </div>
                </div>

                <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/5 blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-secondary/5 blur-3xl"></div>
            </div>
        </MainLayout>
    );
}
