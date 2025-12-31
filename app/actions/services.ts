'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ServiceType, ReminderType } from '@prisma/client';
import { calculateDueDate, calculateDueMileage } from '@/lib/reminder-calculator';

const serviceRecordSchema = z.object({
    carId: z.string().min(1, 'ID mobil tidak valid'),
    serviceDate: z.string().min(1, 'Tanggal service harus diisi'),
    mileageAtService: z.number().min(0, 'Kilometer tidak valid'),
    serviceType: z.nativeEnum(ServiceType),
    customServiceType: z.string().optional(),
    description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
    partsReplaced: z.string().optional(),
    serviceLocation: z.string().min(1, 'Lokasi service harus diisi'),
    isSelfService: z.boolean(),
    serviceCost: z.number().optional(),
    invoicePhotoUrl: z.string().optional(),
    notes: z.string().optional(),
}).refine(
    (data) => {
        // Custom service type required if serviceType is CUSTOM
        if (data.serviceType === 'CUSTOM' && !data.customServiceType) {
            return false;
        }
        return true;
    },
    {
        message: 'Jenis service kustom harus diisi',
        path: ['customServiceType'],
    }
).refine(
    (data) => {
        // Invoice required if cost exists AND NOT self-service
        if (data.serviceCost && data.serviceCost > 0 && !data.isSelfService) {
            return !!data.invoicePhotoUrl;
        }
        return true;
    },
    {
        message: 'Foto nota wajib diupload jika ada biaya service (kecuali service sendiri)',
        path: ['invoicePhotoUrl'],
    }
);

// Map service types to reminder types
const serviceToReminderMap: Partial<Record<ServiceType, ReminderType>> = {
    OIL_CHANGE: 'OIL_CHANGE',
    BRAKE_SERVICE: 'BRAKE_FLUID',
    TRANSMISSION: 'TRANSMISSION_FLUID',
    TIRE_ROTATION: 'TIRE_ROTATION',
};

export async function createServiceRecord(formData: FormData) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { error: 'Anda harus login terlebih dahulu' };
        }

        // Parse form data
        const rawData = {
            carId: formData.get('carId') as string,
            serviceDate: formData.get('serviceDate') as string,
            mileageAtService: parseInt(formData.get('mileageAtService') as string) || 0,
            serviceType: formData.get('serviceType') as ServiceType,
            customServiceType: formData.get('customServiceType') as string || undefined,
            description: formData.get('description') as string,
            partsReplaced: formData.get('partsReplaced') as string || undefined,
            serviceLocation: formData.get('serviceLocation') as string,
            isSelfService: formData.get('isSelfService') === 'true',
            serviceCost: formData.get('serviceCost') ? parseFloat(formData.get('serviceCost') as string) : undefined,
            invoicePhotoUrl: formData.get('invoicePhotoUrl') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        };

        // Validate input
        const validatedFields = serviceRecordSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return { error: validatedFields.error.errors[0].message };
        }

        const data = validatedFields.data;

        // Verify car belongs to user
        const car = await db.car.findFirst({
            where: {
                id: data.carId,
                userId: session.user.id,
            },
        });

        if (!car) {
            return { error: 'Mobil tidak ditemukan' };
        }

        // Create service record and update car mileage in transaction
        await db.$transaction(async (tx) => {
            // Step 1: Create service record
            const serviceRecord = await tx.serviceRecord.create({
                data: {
                    carId: data.carId,
                    serviceDate: new Date(data.serviceDate),
                    mileageAtService: data.mileageAtService,
                    serviceType: data.serviceType,
                    customServiceType: data.serviceType === 'CUSTOM' ? data.customServiceType : null,
                    description: data.description,
                    partsReplaced: data.partsReplaced || null,
                    serviceLocation: data.isSelfService ? 'Self Service' : data.serviceLocation,
                    isSelfService: data.isSelfService,
                    serviceCost: data.serviceCost || null,
                    invoicePhotoUrl: data.invoicePhotoUrl || null,
                    notes: data.notes || null,
                    entryCreatedAt: new Date(),
                },
            });

            // Step 2: Update car mileage if new mileage is higher
            if (data.mileageAtService > car.currentMileage) {
                await tx.car.update({
                    where: { id: data.carId },
                    data: { currentMileage: data.mileageAtService },
                });
            }

            // Step 3: Create maintenance reminder if applicable
            const reminderType = serviceToReminderMap[data.serviceType];
            if (reminderType) {
                // Mark old reminders as completed
                await tx.maintenanceReminder.updateMany({
                    where: {
                        carId: data.carId,
                        reminderType,
                        isCompleted: false,
                    },
                    data: { isCompleted: true },
                });

                // Create new reminder
                const serviceDate = new Date(data.serviceDate);
                await tx.maintenanceReminder.create({
                    data: {
                        carId: data.carId,
                        reminderType,
                        lastServiceDate: serviceDate,
                        lastServiceMileage: data.mileageAtService,
                        dueDate: calculateDueDate(reminderType, serviceDate),
                        dueMileage: calculateDueMileage(reminderType, data.mileageAtService),
                    },
                });
            }

            return serviceRecord;
        });

        revalidatePath('/dashboard');
        revalidatePath('/cars');
        revalidatePath(`/cars/${data.carId}`);
        revalidatePath(`/cars/${data.carId}/services`);

        return { success: true };
    } catch (error) {
        console.error('Create service record error:', error);
        return { error: 'Terjadi kesalahan saat menyimpan data service' };
    }
}

export async function updateServiceRecord(serviceId: string, formData: FormData) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { error: 'Anda harus login terlebih dahulu' };
        }

        // Parse form data
        const rawData = {
            carId: formData.get('carId') as string,
            serviceDate: formData.get('serviceDate') as string,
            mileageAtService: parseInt(formData.get('mileageAtService') as string) || 0,
            serviceType: formData.get('serviceType') as ServiceType,
            customServiceType: formData.get('customServiceType') as string || undefined,
            description: formData.get('description') as string,
            partsReplaced: formData.get('partsReplaced') as string || undefined,
            serviceLocation: formData.get('serviceLocation') as string,
            isSelfService: formData.get('isSelfService') === 'true',
            serviceCost: formData.get('serviceCost') ? parseFloat(formData.get('serviceCost') as string) : undefined,
            invoicePhotoUrl: formData.get('invoicePhotoUrl') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        };

        // Validate input
        const validatedFields = serviceRecordSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return { error: validatedFields.error.errors[0].message };
        }

        const data = validatedFields.data;

        // Verify service record exists and belongs to user's car
        const existingRecord = await db.serviceRecord.findFirst({
            where: {
                id: serviceId,
                car: {
                    userId: session.user.id,
                },
            },
            include: { car: true },
        });

        if (!existingRecord) {
            return { error: 'Data service tidak ditemukan' };
        }

        // Update service record
        await db.serviceRecord.update({
            where: { id: serviceId },
            data: {
                serviceDate: new Date(data.serviceDate),
                mileageAtService: data.mileageAtService,
                serviceType: data.serviceType,
                customServiceType: data.serviceType === 'CUSTOM' ? data.customServiceType : null,
                description: data.description,
                partsReplaced: data.partsReplaced || null,
                serviceLocation: data.isSelfService ? 'Self Service' : data.serviceLocation,
                isSelfService: data.isSelfService,
                serviceCost: data.serviceCost || null,
                invoicePhotoUrl: data.invoicePhotoUrl || null,
                notes: data.notes || null,
            },
        });

        revalidatePath('/dashboard');
        revalidatePath('/cars');
        revalidatePath(`/cars/${data.carId}`);
        revalidatePath(`/cars/${data.carId}/services`);
        revalidatePath(`/cars/${data.carId}/services/${serviceId}`);

        return { success: true };
    } catch (error) {
        console.error('Update service record error:', error);
        return { error: 'Terjadi kesalahan saat mengupdate data service' };
    }
}

export async function deleteServiceRecord(serviceId: string) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { error: 'Anda harus login terlebih dahulu' };
        }

        // Verify service record exists and belongs to user's car
        const existingRecord = await db.serviceRecord.findFirst({
            where: {
                id: serviceId,
                car: {
                    userId: session.user.id,
                },
            },
        });

        if (!existingRecord) {
            return { error: 'Data service tidak ditemukan' };
        }

        const carId = existingRecord.carId;

        // Delete service record
        await db.serviceRecord.delete({
            where: { id: serviceId },
        });

        revalidatePath('/dashboard');
        revalidatePath('/cars');
        revalidatePath(`/cars/${carId}`);
        revalidatePath(`/cars/${carId}/services`);

        return { success: true };
    } catch (error) {
        console.error('Delete service record error:', error);
        return { error: 'Terjadi kesalahan saat menghapus data service' };
    }
}
