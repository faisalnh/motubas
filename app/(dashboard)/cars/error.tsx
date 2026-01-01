'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function CarsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Cars page error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Gagal Memuat Data Mobil
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
                Ada masalah saat mengambil data mobil Anda. Coba muat ulang halaman.
            </p>
            <Button onClick={() => reset()} size="lg">
                Coba Lagi
            </Button>
        </div>
    );
}
