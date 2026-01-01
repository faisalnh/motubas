import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { ReminderCard } from '@/components/reminder-card';
import { isReminderOverdue, isReminderDueSoon } from '@/lib/reminder-calculator';
import { CheckCircle, CalendarDays } from 'lucide-react';
import { Metadata } from 'next';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = {
    title: 'Pengingat Service | Motubas',
    description: 'Lihat jadwal perawatan mobil Anda dan jangan sampai terlewat.',
};

export default async function RemindersPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get all active reminders for user's cars
    const reminders = await db.maintenanceReminder.findMany({
        where: {
            isCompleted: false,
            car: {
                userId: session.user.id,
            },
        },
        include: {
            car: true,
        },
        orderBy: [
            { dueDate: 'asc' },
            { dueMileage: 'asc' },
        ],
    });

    // Sort by urgency (overdue first, then due soon, then normal)
    const sortedReminders = [...reminders].sort((a, b) => {
        const aOverdue = isReminderOverdue(a.dueDate, a.dueMileage, a.car.currentMileage);
        const bOverdue = isReminderOverdue(b.dueDate, b.dueMileage, b.car.currentMileage);
        const aDueSoon = isReminderDueSoon(a.dueDate, a.dueMileage, a.car.currentMileage);
        const bDueSoon = isReminderDueSoon(b.dueDate, b.dueMileage, b.car.currentMileage);

        // Overdue first
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        // Then due soon
        if (aDueSoon && !bDueSoon) return -1;
        if (!aDueSoon && bDueSoon) return 1;

        return 0;
    });

    const overdueCount = reminders.filter(r =>
        isReminderOverdue(r.dueDate, r.dueMileage, r.car.currentMileage)
    ).length;

    const dueSoonCount = reminders.filter(r =>
        !isReminderOverdue(r.dueDate, r.dueMileage, r.car.currentMileage) &&
        isReminderDueSoon(r.dueDate, r.dueMileage, r.car.currentMileage)
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Pengingat Service</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Jadwal perawatan mobil Anda
                </p>
            </div>

            {/* Summary Stats */}
            {reminders.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">{overdueCount}</p>
                        <p className="text-sm text-red-600 dark:text-red-500/80">Terlambat</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{dueSoonCount}</p>
                        <p className="text-sm text-orange-600 dark:text-orange-500/80">Segera</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{reminders.length - overdueCount - dueSoonCount}</p>
                        <p className="text-sm text-green-600 dark:text-green-500/80">Terjadwal</p>
                    </div>
                </div>
            )}

            {/* Reminders List */}
            {sortedReminders.length === 0 ? (
                <EmptyState
                    title="Semua Aman!"
                    description="Tidak ada pengingat service yang perlu ditindaklanjuti saat ini. Kendaraan Anda terpantau sehat."
                    icon={CheckCircle}
                    className="border-green-200/50 dark:border-green-900/30 bg-green-50/30 dark:bg-green-950/10"
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedReminders.map((reminder) => (
                        <ReminderCard key={reminder.id} reminder={reminder} />
                    ))}
                </div>
            )}
        </div>
    );
}
