'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getReminderTypeLabel, isReminderDueSoon, isReminderOverdue } from '@/lib/reminder-calculator';
import { formatDate } from '@/lib/utils';
import { ReminderType } from '@prisma/client';
import { Check, AlertTriangle, Clock, Car, Gauge, Calendar } from 'lucide-react';
import { markReminderComplete } from '@/app/actions/reminders';

interface ReminderCardProps {
    reminder: {
        id: string;
        reminderType: ReminderType;
        dueDate: Date | null;
        dueMileage: number | null;
        lastServiceDate: Date | null;
        lastServiceMileage: number | null;
        car: {
            id: string;
            make: string;
            model: string;
            licensePlate: string;
            currentMileage: number;
        };
    };
}

type UrgencyLevel = 'overdue' | 'due-soon' | 'normal';

function getUrgencyLevel(
    dueDate: Date | null,
    dueMileage: number | null,
    currentMileage: number
): UrgencyLevel {
    if (isReminderOverdue(dueDate, dueMileage, currentMileage)) {
        return 'overdue';
    }
    if (isReminderDueSoon(dueDate, dueMileage, currentMileage)) {
        return 'due-soon';
    }
    return 'normal';
}

const urgencyStyles: Record<UrgencyLevel, { border: string; bg: string; icon: string }> = {
    overdue: {
        border: 'border-red-300',
        bg: 'bg-red-50',
        icon: 'text-red-600',
    },
    'due-soon': {
        border: 'border-orange-300',
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
    },
    normal: {
        border: 'border-green-200',
        bg: 'bg-green-50',
        icon: 'text-green-600',
    },
};

const urgencyLabels: Record<UrgencyLevel, string> = {
    overdue: 'Terlambat',
    'due-soon': 'Segera',
    normal: 'Terjadwal',
};

export function ReminderCard({ reminder }: ReminderCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const urgency = getUrgencyLevel(
        reminder.dueDate,
        reminder.dueMileage,
        reminder.car.currentMileage
    );
    const styles = urgencyStyles[urgency];
    const label = getReminderTypeLabel(reminder.reminderType);

    async function handleComplete() {
        setIsLoading(true);
        setError(null);

        const result = await markReminderComplete(reminder.id);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        }
        // If success, component will be removed by revalidation
    }

    return (
        <Card className={`${styles.border} ${styles.bg}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        {urgency === 'overdue' && <AlertTriangle className={`h-4 w-4 ${styles.icon}`} />}
                        {urgency === 'due-soon' && <Clock className={`h-4 w-4 ${styles.icon}`} />}
                        {urgency === 'normal' && <Check className={`h-4 w-4 ${styles.icon}`} />}
                        <span>{label}</span>
                    </div>
                    <span className={`text-xs font-normal px-2 py-1 rounded ${urgency === 'overdue' ? 'bg-red-100 text-red-700' :
                            urgency === 'due-soon' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                        }`}>
                        {urgencyLabels[urgency]}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Car Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Car className="h-4 w-4" />
                    <span>{reminder.car.make} {reminder.car.model} • {reminder.car.licensePlate}</span>
                </div>

                {/* Due Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {reminder.dueDate && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(reminder.dueDate)}</span>
                        </div>
                    )}
                    {reminder.dueMileage && (
                        <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-gray-400" />
                            <span>{reminder.dueMileage.toLocaleString('id-ID')} km</span>
                        </div>
                    )}
                </div>

                {/* Current Mileage */}
                <p className="text-xs text-gray-500">
                    Kilometer saat ini: {reminder.car.currentMileage.toLocaleString('id-ID')} km
                </p>

                {/* Error */}
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Action */}
                <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="w-full"
                    variant={urgency === 'overdue' ? 'destructive' : 'default'}
                >
                    <Check className="mr-2 h-4 w-4" />
                    {isLoading ? 'Menyimpan...' : 'Selesaikan'}
                </Button>
            </CardContent>
        </Card>
    );
}
