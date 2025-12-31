import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car as CarIcon, ArrowRight } from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { CostChart } from '@/components/dashboard/cost-chart';
import { ServiceRecord } from '@prisma/client';

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
          },
          reminders: {
            where: { isCompleted: false },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Calculate Stats
  const cars = user.cars;
  const totalCars = cars.length;

  let totalServiceCount = 0;
  let activeRemindersCount = 0;
  let totalSpent = 0;

  type ActivityRecord = ServiceRecord & { carName: string; carPlate: string };
  const allServiceRecords: ActivityRecord[] = [];

  const currentYear = new Date().getFullYear();
  const monthlyCosts = Array(12).fill(0);

  cars.forEach(car => {
    totalServiceCount += car.serviceRecords.length;
    activeRemindersCount += car.reminders.length;

    car.serviceRecords.forEach(record => {
      // Total spent lifetime
      if (record.serviceCost) {
        totalSpent += Number(record.serviceCost);
      }

      // Monthly chart data (Current Year)
      if (record.serviceDate.getFullYear() === currentYear && record.serviceCost) {
        monthlyCosts[record.serviceDate.getMonth()] += Number(record.serviceCost);
      }

      // Flatten for recent activity list
      allServiceRecords.push({
        ...record,
        carName: `${car.make} ${car.model}`,
        carPlate: car.licensePlate,
      });
    });
  });

  // Sort and take latest 5
  const recentActivity = allServiceRecords
    .sort((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime())
    .slice(0, 5);

  const chartData = monthlyCosts.map((total, index) => ({
    name: new Date(0, index).toLocaleString('id-ID', { month: 'short' }),
    total
  }));

  const hasNoCar = totalCars === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Beranda</h1>
        <p className="text-gray-600 mt-1">
          Analisa biaya dan status perawatan armada Anda
        </p>
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
                <CarIcon className="mr-2 h-4 w-4" />
                Tambah Mobil
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <DashboardStats
            totalCars={totalCars}
            totalServiceCount={totalServiceCount}
            activeReminders={activeRemindersCount}
            totalSpent={totalSpent}
          />

          <div className="grid gap-6 md:grid-cols-7">
            {/* Chart occupies 4 columns */}
            <CostChart data={chartData} />

            {/* Recent Activity occupies 3 columns */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>
                  5 riwayat service terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Belum ada riwayat service.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((record) => (
                      <div key={record.id} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {record.serviceType.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.carName} • {new Date(record.serviceDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        {record.serviceCost && (
                          <div className="font-medium text-sm">
                            Rp{(Number(record.serviceCost) / 1000).toLocaleString('id-ID')}k
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t">
                  <Link href="/cars" className="flex items-center text-sm text-primary hover:underline">
                    Lihat semua mobil <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Link href="/cars/add">
              <Button>
                <CarIcon className="mr-2 h-4 w-4" />
                Tambah Mobil
              </Button>
            </Link>
            <Link href="/om-motu">
              <Button variant="outline">
                Konsultasi Om Motu
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
