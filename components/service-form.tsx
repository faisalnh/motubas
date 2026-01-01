'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InvoiceUpload } from '@/components/invoice-upload';
import { createServiceRecord, updateServiceRecord } from '@/app/actions/services';
import { serviceTypeOptions } from '@/lib/service-labels';
import { ServiceType } from '@prisma/client';
import Link from 'next/link';

interface ServiceFormProps {
    carId: string;
    currentMileage: number;
    existingRecord?: {
        id: string;
        serviceDate: Date;
        mileageAtService: number;
        serviceType: ServiceType;
        customServiceType: string | null;
        description: string;
        partsReplaced: string | null;
        serviceLocation: string;
        isSelfService: boolean;
        serviceCost: number | null;
        invoicePhotoUrl: string | null;
        notes: string | null;
    };
}

export function ServiceForm({ carId, currentMileage, existingRecord }: ServiceFormProps) {
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [serviceType, setServiceType] = useState<ServiceType>(existingRecord?.serviceType || 'GENERAL_SERVICE');
    const [isSelfService, setIsSelfService] = useState(existingRecord?.isSelfService || false);
    const [serviceCost, setServiceCost] = useState<string>(existingRecord?.serviceCost?.toString() || '');
    const [invoicePhotoUrl, setInvoicePhotoUrl] = useState<string>(existingRecord?.invoicePhotoUrl || '');
    const router = useRouter();

    const isEditing = !!existingRecord;
    const showInvoiceRequired = serviceCost && parseFloat(serviceCost) > 0 && !isSelfService;

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError('');

        // Add hidden fields
        formData.set('carId', carId);
        formData.set('isSelfService', isSelfService.toString());
        formData.set('invoicePhotoUrl', invoicePhotoUrl);

        const action = isEditing
            ? updateServiceRecord(existingRecord.id, formData)
            : createServiceRecord(formData);

        const result = await action;

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        } else if (result?.success) {
            router.push(`/cars/${carId}/services`);
        }
    }

    // Format date for input
    const formatDateForInput = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* Service Type */}
            <div className="space-y-2">
                <Label htmlFor="serviceType">Jenis Service</Label>
                <select
                    id="serviceType"
                    name="serviceType"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    disabled={isLoading}
                >
                    {serviceTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Custom Service Type */}
            {serviceType === 'CUSTOM' && (
                <div className="space-y-2">
                    <Label htmlFor="customServiceType">Nama Jenis Service</Label>
                    <Input
                        id="customServiceType"
                        name="customServiceType"
                        type="text"
                        placeholder="Contoh: Tune Up, Spooring, dll"
                        defaultValue={existingRecord?.customServiceType || ''}
                        required={serviceType === 'CUSTOM'}
                        disabled={isLoading}
                    />
                </div>
            )}

            {/* Date and Mileage */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="serviceDate">Tanggal Service</Label>
                    <Input
                        id="serviceDate"
                        name="serviceDate"
                        type="date"
                        defaultValue={existingRecord ? formatDateForInput(existingRecord.serviceDate) : formatDateForInput(new Date())}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mileageAtService">Kilometer Saat Service</Label>
                    <Input
                        id="mileageAtService"
                        name="mileageAtService"
                        type="number"
                        placeholder={currentMileage.toString()}
                        defaultValue={existingRecord?.mileageAtService || currentMileage}
                        min="0"
                        required
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                        Kilometer saat ini: {currentMileage.toLocaleString('id-ID')} km
                    </p>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Service</Label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Contoh: Ganti oli mesin 4 liter, ganti filter oli"
                    defaultValue={existingRecord?.description || ''}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    disabled={isLoading}
                />
                <p className="text-xs text-gray-500">Minimal 10 karakter</p>
            </div>

            {/* Parts Replaced */}
            <div className="space-y-2">
                <Label htmlFor="partsReplaced">Suku Cadang yang Diganti (opsional)</Label>
                <textarea
                    id="partsReplaced"
                    name="partsReplaced"
                    rows={2}
                    placeholder="Contoh: Filter oli, filter udara"
                    defaultValue={existingRecord?.partsReplaced || ''}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                />
            </div>

            {/* Self Service Toggle */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="isSelfServiceCheckbox"
                    checked={isSelfService}
                    onChange={(e) => setIsSelfService(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    disabled={isLoading}
                />
                <Label htmlFor="isSelfServiceCheckbox" className="text-sm font-normal cursor-pointer">
                    Service sendiri (bukan di bengkel)
                </Label>
            </div>

            {/* Service Location */}
            {!isSelfService && (
                <div className="space-y-2">
                    <Label htmlFor="serviceLocation">Lokasi / Nama Bengkel</Label>
                    <Input
                        id="serviceLocation"
                        name="serviceLocation"
                        type="text"
                        placeholder="Contoh: Bengkel Maju Jaya, Jl. Sudirman"
                        defaultValue={existingRecord?.serviceLocation !== 'Self Service' ? existingRecord?.serviceLocation : ''}
                        required={!isSelfService}
                        disabled={isLoading}
                    />
                </div>
            )}

            {/* Hidden field for service location when self service */}
            {isSelfService && (
                <input type="hidden" name="serviceLocation" value="Self Service" />
            )}

            {/* Service Cost */}
            <div className="space-y-2">
                <Label htmlFor="serviceCost">Biaya Service (opsional)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                    <Input
                        id="serviceCost"
                        name="serviceCost"
                        type="number"
                        placeholder="500000"
                        value={serviceCost}
                        onChange={(e) => setServiceCost(e.target.value)}
                        min="0"
                        className="pl-10"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Invoice Photo */}
            {(showInvoiceRequired || invoicePhotoUrl) && (
                <div className="space-y-2">
                    <Label>
                        Foto Nota / Invoice
                        {showInvoiceRequired && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </Label>
                    {showInvoiceRequired && (
                        <p className="text-xs text-amber-600">
                            Wajib upload nota jika ada biaya service (kecuali service sendiri)
                        </p>
                    )}
                    <InvoiceUpload
                        onUploadComplete={(url) => setInvoicePhotoUrl(url)}
                        initialUrl={existingRecord?.invoicePhotoUrl || undefined}
                        disabled={isLoading}
                    />
                </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Catatan Tambahan (opsional)</Label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    placeholder="Catatan lainnya..."
                    defaultValue={existingRecord?.notes || ''}
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <Link href={`/cars/${carId}/services`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                        Batal
                    </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan Service')}
                </Button>
            </div>
        </form>
    );
}
