'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function GoBackButton() {
    return (
        <Button
            variant="outline"
            size="lg"
            className="min-w-[160px]"
            onClick={() => window.history.back()}
        >
            <ArrowLeft className="w-4 h-4" />
            Go Back
        </Button>
    );
}
