'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function markReminderComplete(reminderId: string) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { error: 'Anda harus login terlebih dahulu' };
        }

        // Verify reminder belongs to user's car
        const reminder = await db.maintenanceReminder.findFirst({
            where: {
                id: reminderId,
                car: {
                    userId: session.user.id,
                },
            },
        });

        if (!reminder) {
            return { error: 'Pengingat tidak ditemukan' };
        }

        // Mark as completed
        await db.maintenanceReminder.update({
            where: { id: reminderId },
            data: { isCompleted: true },
        });

        revalidatePath('/reminders');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error('Mark reminder complete error:', error);
        return { error: 'Terjadi kesalahan saat menyelesaikan pengingat' };
    }
}

export async function dismissReminder(reminderId: string) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { error: 'Anda harus login terlebih dahulu' };
        }

        // Verify reminder belongs to user's car
        const reminder = await db.maintenanceReminder.findFirst({
            where: {
                id: reminderId,
                car: {
                    userId: session.user.id,
                },
            },
        });

        if (!reminder) {
            return { error: 'Pengingat tidak ditemukan' };
        }

        // Delete the reminder
        await db.maintenanceReminder.delete({
            where: { id: reminderId },
        });

        revalidatePath('/reminders');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error('Dismiss reminder error:', error);
        return { error: 'Terjadi kesalahan saat menghapus pengingat' };
    }
}
