import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceForm } from '@/components/service-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AddServicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: carId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Verify car belongs to user
    const car = await db.car.findFirst({
        where: {
            id: carId,
            userId: session.user.id,
        },
    });

    if (!car) {
        redirect('/cars');
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link href={`/cars/${carId}/services`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tambah Riwayat Service</CardTitle>
                    <CardDescription>
                        {car.make} {car.model} ({car.year}) • {car.licensePlate}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ServiceForm carId={carId} currentMileage={car.currentMileage} />
                </CardContent>
            </Card>
        </div>
    );
}
