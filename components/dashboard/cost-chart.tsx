'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface CostChartProps {
    data: {
        name: string;
        total: number;
    }[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export function CostChart({ data }: CostChartProps) {
    const totalThisYear = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <Card className="relative overflow-hidden border-0 bg-white dark:bg-slate-900">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 dark:from-slate-900 via-white dark:via-slate-900 to-orange-50/30 dark:to-orange-500/5" />

            <CardHeader className="relative">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
                                <TrendingUp className="h-4 w-4 text-white" />
                            </div>
                            Biaya Service Bulanan
                        </CardTitle>
                        <CardDescription className="mt-1.5">
                            Total pengeluaran service tahun ini
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Total Tahun Ini</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalThisYear)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="relative">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value === 0 ? '0' : `${(value / 1000000).toFixed(0)}jt`}
                        />
                        <Tooltip
                            formatter={(value: number) => [formatCurrency(value), 'Total']}
                            cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
                                padding: '12px 16px'
                            }}
                        />
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                        <Bar
                            dataKey="total"
                            fill="url(#colorTotal)"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={45}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
