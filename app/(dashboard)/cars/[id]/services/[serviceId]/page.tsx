import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getServiceTypeLabel } from '@/lib/service-labels';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Calendar, Gauge, MapPin, Receipt, AlertTriangle } from 'lucide-react';
import { deleteServiceRecord } from '@/app/actions/services';

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ id: string; serviceId: string }>;
}) {
    const { id: carId, serviceId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get service record with car
    const serviceRecord = await db.serviceRecord.findFirst({
        where: {
            id: serviceId,
            car: {
                id: carId,
                userId: session.user.id,
            },
        },
        include: {
            car: true,
        },
    });

    if (!serviceRecord) {
        redirect(`/cars/${carId}/services`);
    }

    const serviceLabel = serviceRecord.serviceType === 'CUSTOM' && serviceRecord.customServiceType
        ? serviceRecord.customServiceType
        : getServiceTypeLabel(serviceRecord.serviceType);

    // Check if backdated
    const serviceDate = new Date(serviceRecord.serviceDate);
    const entryDate = new Date(serviceRecord.entryCreatedAt);
    const daysDiff = Math.floor((entryDate.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
    const isBackdated = daysDiff > 7;

    // Convert cost to number
    const costValue = serviceRecord.serviceCost !== null
        ? (typeof serviceRecord.serviceCost === 'string' ? parseFloat(serviceRecord.serviceCost) : Number(serviceRecord.serviceCost))
        : null;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Link href={`/cars/${carId}/services`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Link href={`/cars/${carId}/services/${serviceId}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <form
                        action={async () => {
                            'use server';
                            await deleteServiceRecord(serviceId);
                            redirect(`/cars/${carId}/services`);
                        }}
                    >
                        <Button variant="destructive" size="sm" type="submit">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </form>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>{serviceLabel}</span>
                        {serviceRecord.isSelfService && (
                            <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                Self Service
                            </span>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {serviceRecord.car.make} {serviceRecord.car.model} ({serviceRecord.car.year})
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Date and Mileage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>Tanggal Service</span>
                            </div>
                            <p className="font-medium">{formatDate(serviceRecord.serviceDate)}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Gauge className="h-4 w-4" />
                                <span>Kilometer</span>
                            </div>
                            <p className="font-medium">{serviceRecord.mileageAtService.toLocaleString('id-ID')} km</p>
                        </div>
                    </div>

                    {/* Location */}
                    {!serviceRecord.isSelfService && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin className="h-4 w-4" />
                                <span>Lokasi / Bengkel</span>
                            </div>
                            <p className="font-medium">{serviceRecord.serviceLocation}</p>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-1">
                        <p className="text-sm text-gray-500">Deskripsi</p>
                        <p className="whitespace-pre-wrap">{serviceRecord.description}</p>
                    </div>

                    {/* Parts Replaced */}
                    {serviceRecord.partsReplaced && (
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Suku Cadang Diganti</p>
                            <p className="whitespace-pre-wrap">{serviceRecord.partsReplaced}</p>
                        </div>
                    )}

                    {/* Cost */}
                    {costValue !== null && costValue > 0 && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Receipt className="h-4 w-4" />
                                <span>Biaya Service</span>
                            </div>
                            <p className="text-xl font-bold text-green-700">{formatCurrency(costValue)}</p>
                        </div>
                    )}

                    {/* Invoice Photo */}
                    {serviceRecord.invoicePhotoUrl && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Foto Nota</p>
                            <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={serviceRecord.invoicePhotoUrl}
                                    alt="Nota service"
                                    className="max-w-full rounded-lg border"
                                />
                            </div>
                            <a
                                href={serviceRecord.invoicePhotoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-orange-600 hover:underline"
                            >
                                Lihat ukuran penuh →
                            </a>
                        </div>
                    )}

                    {/* Notes */}
                    {serviceRecord.notes && (
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Catatan</p>
                            <p className="whitespace-pre-wrap">{serviceRecord.notes}</p>
                        </div>
                    )}

                    {/* Backdating Warning */}
                    {isBackdated && (
                        <div className="flex items-start gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded">
                            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Data dimasukkan setelah tanggal service</p>
                                <p className="text-xs">
                                    Dicatat pada: {formatDateTime(serviceRecord.createdAt)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="border-t pt-4 text-xs text-gray-400">
                        <p>Dibuat: {formatDateTime(serviceRecord.createdAt)}</p>
                        {serviceRecord.updatedAt.getTime() !== serviceRecord.createdAt.getTime() && (
                            <p>Diperbarui: {formatDateTime(serviceRecord.updatedAt)}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
