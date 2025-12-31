import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceForm } from '@/components/service-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditServicePage({
    params,
}: {
    params: Promise<{ id: string; serviceId: string }>;
}) {
    const { id: carId, serviceId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get service record with car
    const serviceRecord = await db.serviceRecord.findFirst({
        where: {
            id: serviceId,
            car: {
                id: carId,
                userId: session.user.id,
            },
        },
        include: {
            car: true,
        },
    });

    if (!serviceRecord) {
        redirect(`/cars/${carId}/services`);
    }

    // Convert Decimal to number for the form
    const formattedRecord = {
        ...serviceRecord,
        serviceCost: serviceRecord.serviceCost
            ? Number(serviceRecord.serviceCost)
            : null,
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link href={`/cars/${carId}/services/${serviceId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Riwayat Service</CardTitle>
                    <CardDescription>
                        {serviceRecord.car.make} {serviceRecord.car.model} ({serviceRecord.car.year}) • {serviceRecord.car.licensePlate}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ServiceForm
                        carId={carId}
                        currentMileage={serviceRecord.car.currentMileage}
                        existingRecord={formattedRecord}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
