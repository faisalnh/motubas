'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateProfile(data: { name: string }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Anda harus login terlebih dahulu' };
        }

        if (!data.name || data.name.trim().length < 2) {
            return { error: 'Nama harus minimal 2 karakter' };
        }

        await db.user.update({
            where: { id: session.user.id },
            data: { name: data.name },
        });

        revalidatePath('/profile');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { error: 'Gagal memperbarui profil' };
    }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Anda harus login terlebih dahulu' };
        }

        const { currentPassword, newPassword } = data;

        if (!currentPassword || !newPassword) {
            return { error: 'Password saat ini dan baru harus diisi' };
        }
        if (newPassword.length < 6) {
            return { error: 'Password baru minimal 6 karakter' };
        }

        // Get user with password
        const user = await db.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || !user.password) {
            return { error: 'User tidak ditemukan atau menggunakan login sosial (Google)' };
        }

        // Verify current password
        const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordsMatch) {
            return { error: 'Password saat ini salah' };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        return { success: true };
    } catch (error) {
        console.error('Change password error:', error);
        return { error: 'Gagal mengubah password' };
    }
}

export async function upgradeSubscription() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: 'Anda harus login terlebih dahulu' };
        }

        await db.user.update({
            where: { id: session.user.id },
            data: {
                subscriptionTier: 'PREMIUM',
                aiCreditsRemaining: 999999, // Unlimited logic usually handled by 'PREMIUM' check, but good to set high number or ignore
            },
        });

        revalidatePath('/profile');
        revalidatePath('/dashboard');
        revalidatePath('/om-motu');

        return { success: true };
    } catch (error) {
        console.error('Upgrade subscription error:', error);
        return { error: 'Gagal upgrade subscription' };
    }
}
