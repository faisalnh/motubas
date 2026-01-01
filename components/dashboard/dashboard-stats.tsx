import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Wrench, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';

interface DashboardStatsProps {
    totalCars: number;
    totalServiceCount: number;
    activeReminders: number;
    totalSpent: number;
}

export function DashboardStats({
    totalCars,
    totalServiceCount,
    activeReminders,
    totalSpent,
}: DashboardStatsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const stats = [
        {
            title: 'Total Armada',
            value: totalCars,
            subtitle: 'Mobil terdaftar',
            icon: Car,
            gradient: 'from-orange-500 to-amber-500',
            shadowColor: 'shadow-orange-500/20',
            href: '/cars',
        },
        {
            title: 'Total Service',
            value: totalServiceCount,
            subtitle: 'Riwayat dicatat',
            icon: Wrench,
            gradient: 'from-slate-600 to-slate-700',
            shadowColor: 'shadow-slate-500/20',
            href: '/cars',
        },
        {
            title: 'Pengingat Aktif',
            value: activeReminders,
            subtitle: 'Perlu perhatian',
            icon: AlertCircle,
            gradient: activeReminders > 0 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-green-500',
            shadowColor: activeReminders > 0 ? 'shadow-amber-500/20' : 'shadow-emerald-500/20',
            href: '/reminders',
        },
        {
            title: 'Total Pengeluaran',
            value: formatCurrency(totalSpent),
            subtitle: 'Sepanjang waktu',
            icon: TrendingUp,
            gradient: 'from-emerald-500 to-teal-500',
            shadowColor: 'shadow-emerald-500/20',
            href: '/cars',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Link key={index} href={stat.href} className="block group">
                        <Card className={`relative overflow-hidden cursor-pointer hover:shadow-lg ${stat.shadowColor} transition-all duration-300 h-full border-0 bg-white dark:bg-slate-900`}>
                            {/* Gradient accent bar at top */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />

                            <CardContent className="pt-6 pb-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor}`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{stat.subtitle}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
    );
}
