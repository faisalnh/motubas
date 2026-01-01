import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { ServiceRecordCard } from '@/components/service-record-card';
import Link from 'next/link';
import { ArrowLeft, Plus, Wrench, ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

export default async function ServicesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: carId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get car with service records
    const car = await db.car.findFirst({
        where: {
            id: carId,
            userId: session.user.id,
        },
        include: {
            serviceRecords: {
                orderBy: { serviceDate: 'desc' },
            },
        },
    });

    if (!car) {
        redirect('/cars');
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/cars">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Riwayat Service
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {car.make} {car.model} ({car.year}) • {car.licensePlate}
                    </p>
                </div>
                <Link href={`/cars/${carId}/services/add`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Service
                    </Button>
                </Link>
            </div>

            {/* Service Records */}
            {car.serviceRecords.length === 0 ? (
                <EmptyState
                    title="Belum Ada Riwayat"
                    description="Mulai catat riwayat service mobil Anda untuk melacak perawatan secara detail."
                    icon={ClipboardList}
                    actionLabel="Tambah Service Pertama"
                    actionHref={`/cars/${carId}/services/add`}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {car.serviceRecords.map((record) => (
                        <ServiceRecordCard key={record.id} record={record} />
                    ))}
                </div>
            )}
        </div>
    );
}
