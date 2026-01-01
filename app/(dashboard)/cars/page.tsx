import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Car, Plus, PackageOpen } from 'lucide-react';
import { canAddCar } from '@/lib/subscription';
import { Metadata } from 'next';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = {
  title: 'Mobil Saya | Motubas',
  description: 'Kelola daftar mobil Anda dan lihat status perawatan masing-masing.',
};

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Mobil Saya</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola informasi mobil Anda
            {user.subscriptionTier === 'FREE' && (
              <span className="ml-2 text-sm text-slate-400 dark:text-slate-500">
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
        <EmptyState
          title="Belum Ada Mobil"
          description="Tambahkan mobil pertama Anda untuk mulai melacak riwayat service dan pengingat perawatan."
          icon={PackageOpen}
          actionLabel="Tambah Mobil Pertama"
          actionHref="/cars/add"
        />
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
                      <span className="text-xs font-normal bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        Utama
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{car.year}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Plat Nomor</p>
                    <p className="font-medium dark:text-slate-200">{car.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Kilometer Saat Ini</p>
                    <p className="font-medium dark:text-slate-200">
                      {car.currentMileage.toLocaleString('id-ID')} km
                    </p>
                  </div>
                  {lastService && (
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Service Terakhir</p>
                      <p className="text-sm dark:text-slate-300">
                        {lastService.serviceType.replace(/_/g, ' ')} •{' '}
                        {new Date(lastService.serviceDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  )}
                  {activeReminders > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded p-3 text-amber-800 dark:text-amber-400">
                      <p className="text-sm">
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
        <Card className="border-amber-300/50 dark:border-amber-900/30 bg-gradient-to-r from-amber-50 dark:from-amber-950/20 to-orange-50 dark:to-orange-950/20">
          <CardHeader>
            <CardTitle className="dark:text-amber-100">Upgrade ke Premium</CardTitle>
            <CardDescription className="dark:text-amber-200/70">
              Anda sudah mencapai batas maksimal mobil untuk tier FREE (1 mobil).
              Upgrade ke PREMIUM untuk menambah lebih banyak mobil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" disabled className="bg-amber-500 opacity-50">
              Upgrade (Segera Hadir)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
