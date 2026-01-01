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
import { Metadata } from 'next';
import { EmptyState } from '@/components/ui/empty-state';
import { PackageOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Beranda | Motubas',
  description: 'Lihat ringkasan biaya service dan status perawatan armada mobil Anda.',
};

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="relative">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Beranda</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Analisa biaya dan status perawatan armada Anda
        </p>
      </div>

      {hasNoCar ? (
        <EmptyState
          title="Belum Ada Mobil"
          description="Tambahkan mobil pertama Anda untuk mulai melacak riwayat service dan melihat analisa pengeluaran."
          icon={PackageOpen}
          actionLabel="Tambah Mobil"
          actionHref="/cars/add"
        />
      ) : (
        <>
          <DashboardStats
            totalCars={totalCars}
            totalServiceCount={totalServiceCount}
            activeReminders={activeRemindersCount}
            totalSpent={totalSpent}
          />

          {/* Chart - Full Width */}
          <CostChart data={chartData} />

          {/* Recent Activity - Full Width below chart */}
          <Card>
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
                    <div key={record.id} className="flex items-start justify-between border-b dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none dark:text-slate-200">
                          {record.serviceType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-slate-500">
                          {record.carName} • {new Date(record.serviceDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      {record.serviceCost && (
                        <div className="font-medium text-sm dark:text-slate-300">
                          Rp{(Number(record.serviceCost) / 1000).toLocaleString('id-ID')}k
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t dark:border-slate-800">
                <Link href="/cars" className="flex items-center text-sm text-primary dark:text-orange-500 hover:underline">
                  Lihat semua mobil <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

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
