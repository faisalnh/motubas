import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, AlertCircle, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
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
            take: 5,
          },
          reminders: {
            where: { isCompleted: false },
            orderBy: { dueDate: 'asc' },
            take: 3,
          },
        },
      },
    },
  });

  const car = user?.cars[0];
  const hasNoCar = !car;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Beranda</h1>
        <p className="text-gray-600 mt-1">Selamat datang kembali, {user?.name}!</p>
      </div>

      {hasNoCar ? (
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
                Tambah Mobil
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Car Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Mobil Anda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {car.make} {car.model} {car.year}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {car.licensePlate} • {car.currentMileage.toLocaleString('id-ID')} km
                  </p>
                </div>
                <Link href={`/cars/${car.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Service
                </CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{car.serviceRecords.length}</div>
                <p className="text-xs text-muted-foreground">
                  Riwayat service tercatat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pengingat Aktif
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{car.reminders.length}</div>
                <p className="text-xs text-muted-foreground">
                  Service yang perlu dilakukan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Kredit AI Om Motu
                </CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.aiCreditsRemaining}</div>
                <p className="text-xs text-muted-foreground">
                  {user.subscriptionTier === 'FREE' ? 'Pertanyaan tersisa bulan ini' : 'Unlimited'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Service Records */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Service Terbaru</CardTitle>
              <CardDescription>5 service terakhir Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {car.serviceRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada riwayat service</p>
                  <Link href={`/cars/${car.id}/services/add`}>
                    <Button className="mt-4" size="sm">
                      Tambah Service Pertama
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {car.serviceRecords.map((record) => (
                    <div key={record.id} className="flex justify-between items-start border-b pb-4">
                      <div>
                        <p className="font-medium">{record.serviceType.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(record.serviceDate).toLocaleDateString('id-ID')} • {record.mileageAtService.toLocaleString('id-ID')} km
                        </p>
                      </div>
                      <Link href={`/cars/${car.id}/services/${record.id}`}>
                        <Button variant="ghost" size="sm">Lihat</Button>
                      </Link>
                    </div>
                  ))}
                  <Link href={`/cars/${car.id}/services`}>
                    <Button variant="outline" className="w-full">
                      Lihat Semua Riwayat
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/cars/${car.id}/services/add`}>
                <Button className="w-full" variant="default">
                  <Wrench className="mr-2 h-4 w-4" />
                  Tambah Riwayat Service
                </Button>
              </Link>
              <Link href="/om-motu">
                <Button className="w-full" variant="outline">
                  Konsultasi dengan Om Motu
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
