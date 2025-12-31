'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Biaya Service Bulanan</CardTitle>
                <CardDescription>
                    Total pengeluaran service tahun ini
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `Rp${(value / 1000).toLocaleString('id-ID')}k`}
                        />
                        <Tooltip
                            formatter={(value: number) => [formatCurrency(value), 'Total']}
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px' }}
                        />
                        <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.total > 0 ? '#2563eb' : '#e5e7eb'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
