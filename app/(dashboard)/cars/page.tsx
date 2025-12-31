import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Car, Plus } from 'lucide-react';
import { canAddCar } from '@/lib/subscription';

export default async function CarsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      cars: {
        include: {
          serviceRecords: {
            orderBy: { serviceDate: 'desc' },
            take: 1,
          },
          reminders: {
            where: { isCompleted: false },
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const canAdd = canAddCar(user.subscriptionTier, user.cars.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mobil Saya</h1>
          <p className="text-gray-600 mt-1">
            Kelola informasi mobil Anda
            {user.subscriptionTier === 'FREE' && (
              <span className="ml-2 text-sm text-gray-500">
                (Tier FREE: Maksimal 1 mobil)
              </span>
            )}
          </p>
        </div>
        {canAdd && (
          <Link href="/cars/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Mobil
            </Button>
          </Link>
        )}
      </div>

      {user.cars.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Belum Ada Mobil</CardTitle>
            <CardDescription>
              Tambahkan mobil pertama Anda untuk mulai melacak riwayat service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/cars/add">
              <Button>
                <Car className="mr-2 h-4 w-4" />
                Tambah Mobil Pertama
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {user.cars.map((car) => {
            const lastService = car.serviceRecords[0];
            const activeReminders = car.reminders.length;

            return (
              <Card key={car.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {car.make} {car.model}
                    </span>
                    {car.isPrimary && (
                      <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Utama
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{car.year}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Plat Nomor</p>
                    <p className="font-medium">{car.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kilometer Saat Ini</p>
                    <p className="font-medium">
                      {car.currentMileage.toLocaleString('id-ID')} km
                    </p>
                  </div>
                  {lastService && (
                    <div>
                      <p className="text-sm text-gray-600">Service Terakhir</p>
                      <p className="text-sm">
                        {lastService.serviceType.replace(/_/g, ' ')} •{' '}
                        {new Date(lastService.serviceDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  )}
                  {activeReminders > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <p className="text-sm text-amber-800">
                        {activeReminders} pengingat service aktif
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/cars/${car.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/cars/${car.id}/services`} className="flex-1">
                      <Button className="w-full">Riwayat Service</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!canAdd && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Upgrade ke Premium</CardTitle>
            <CardDescription className="text-blue-700">
              Anda sudah mencapai batas maksimal mobil untuk tier FREE (1 mobil).
              Upgrade ke PREMIUM untuk menambah lebih banyak mobil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" disabled>
              Upgrade (Segera Hadir)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
