import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { ServiceRecordCard } from '@/components/service-record-card';
import Link from 'next/link';
import { ArrowLeft, Plus, Wrench } from 'lucide-react';

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
                    <h1 className="text-2xl font-bold text-gray-900">
                        Riwayat Service
                    </h1>
                    <p className="text-gray-600">
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
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Belum Ada Riwayat Service
                    </h3>
                    <p className="mt-2 text-gray-600">
                        Mulai catat riwayat service mobil Anda untuk melacak perawatan
                    </p>
                    <Link href={`/cars/${carId}/services/add`}>
                        <Button className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Service Pertama
                        </Button>
                    </Link>
                </div>
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
