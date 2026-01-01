import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getServiceTypeLabel } from '@/lib/service-labels';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { ServiceType, Prisma } from '@prisma/client';
import Link from 'next/link';
import { Wrench, Calendar, Gauge, MapPin, Receipt, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface ServiceRecordCardProps {
    record: {
        id: string;
        carId: string;
        serviceDate: Date;
        mileageAtService: number;
        serviceType: ServiceType;
        customServiceType: string | null;
        description: string;
        serviceLocation: string;
        isSelfService: boolean;
        serviceCost: number | string | Prisma.Decimal | null;
        invoicePhotoUrl: string | null;
        createdAt: Date;
        entryCreatedAt: Date;
    };
    showActions?: boolean;
}

export function ServiceRecordCard({ record, showActions = true }: ServiceRecordCardProps) {
    const serviceLabel = record.serviceType === 'CUSTOM' && record.customServiceType
        ? record.customServiceType
        : getServiceTypeLabel(record.serviceType);

    // Check if this was backdated (entry created significantly after service date)
    const serviceDate = new Date(record.serviceDate);
    const entryDate = new Date(record.entryCreatedAt);
    const daysDiff = Math.floor((entryDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
    const isBackdated = daysDiff > 7; // Show warning if entered more than 7 days after service

    // Convert cost to number for formatting
    const costValue = record.serviceCost !== null
        ? (typeof record.serviceCost === 'string' ? parseFloat(record.serviceCost) : Number(record.serviceCost))
        : null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-slate-600" />
                        <span>{serviceLabel}</span>
                    </div>
                    {record.isSelfService && (
                        <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                            Self Service
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Date and Mileage */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>{formatDate(record.serviceDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Gauge className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>{record.mileageAtService.toLocaleString('id-ID')} km</span>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">{record.description}</p>

                {/* Location */}
                {!record.isSelfService && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>{record.serviceLocation}</span>
                    </div>
                )}

                {/* Cost */}
                {costValue !== null && costValue > 0 && (
                    <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(costValue)}</span>
                    </div>
                )}

                {/* Invoice Photo Thumbnail */}
                {record.invoicePhotoUrl && (
                    <div className="mt-2 text-slate-500 dark:text-slate-400">
                        <a
                            href={record.invoicePhotoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block relative w-20 h-20"
                        >
                            <Image
                                src={record.invoicePhotoUrl}
                                alt="Nota service"
                                fill
                                className="object-cover rounded border dark:border-slate-800 hover:opacity-80 transition-opacity"
                            />
                        </a>
                    </div>
                )}

                {/* Backdating Warning */}
                {isBackdated && (
                    <div className="flex items-start gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 p-2 rounded border border-orange-100 dark:border-orange-900/30">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                            Data dimasukkan pada: {formatDateTime(record.createdAt)}
                        </span>
                    </div>
                )}

                {/* Actions */}
                {showActions && (
                    <div className="flex gap-2 pt-2">
                        <Link href={`/cars/${record.carId}/services/${record.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                                Detail
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
