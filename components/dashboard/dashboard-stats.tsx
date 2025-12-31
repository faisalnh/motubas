import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Wrench, AlertCircle, TrendingUp } from 'lucide-react';

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

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Armada</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalCars}</div>
                    <p className="text-xs text-muted-foreground">Mobil terdaftar</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Service</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalServiceCount}</div>
                    <p className="text-xs text-muted-foreground">Riwayat dicatat</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pengingat Aktif</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeReminders}</div>
                    <p className="text-xs text-muted-foreground">Perlu perhatian</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                    <p className="text-xs text-muted-foreground">Sepanjang waktu</p>
                </CardContent>
            </Card>
        </div>
    );
}
