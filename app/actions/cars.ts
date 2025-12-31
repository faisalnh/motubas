'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { canAddCar } from '@/lib/subscription';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const carSchema = z.object({
  make: z.string().min(1, 'Merek mobil harus diisi'),
  model: z.string().min(1, 'Model mobil harus diisi'),
  year: z.number().min(1900, 'Tahun tidak valid').max(new Date().getFullYear() + 1, 'Tahun tidak valid'),
  licensePlate: z.string().min(1, 'Plat nomor harus diisi'),
  currentMileage: z.number().min(0, 'Kilometer tidak valid'),
});

export async function addCar(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: 'Anda harus login terlebih dahulu' };
    }

    // Get user with subscription tier and car count
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { cars: true },
    });

    if (!user) {
      return { error: 'User tidak ditemukan' };
    }

    // Check if user can add car based on subscription tier
    if (!canAddCar(user.subscriptionTier, user.cars.length)) {
      return {
        error: 'Anda sudah mencapai batas maksimal mobil untuk tier FREE. Upgrade ke PREMIUM untuk menambah lebih banyak mobil.',
      };
    }

    // Validate input
    const validatedFields = carSchema.safeParse({
      make: formData.get('make'),
      model: formData.get('model'),
      year: parseInt(formData.get('year') as string),
      licensePlate: formData.get('licensePlate'),
      currentMileage: parseInt(formData.get('currentMileage') as string),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0].message,
      };
    }

    const { make, model, year, licensePlate, currentMileage } = validatedFields.data;

    // Create car (isPrimary is true for first car, false otherwise)
    const car = await db.car.create({
      data: {
        userId: user.id,
        make,
        model,
        year,
        licensePlate,
        currentMileage,
        isPrimary: user.cars.length === 0,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/cars');

    return {
      success: true,
      carId: car.id,
    };
  } catch (error) {
    console.error('Add car error:', error);
    return {
      error: 'Terjadi kesalahan saat menambah mobil',
    };
  }
}

export async function updateCar(carId: string, formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: 'Anda harus login terlebih dahulu' };
    }

    // Verify car belongs to user
    const car = await db.car.findFirst({
      where: {
        id: carId,
        userId: session.user.id,
      },
    });

    if (!car) {
      return { error: 'Mobil tidak ditemukan' };
    }

    // Validate input
    const validatedFields = carSchema.safeParse({
      make: formData.get('make'),
      model: formData.get('model'),
      year: parseInt(formData.get('year') as string),
      licensePlate: formData.get('licensePlate'),
      currentMileage: parseInt(formData.get('currentMileage') as string),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0].message,
      };
    }

    const { make, model, year, licensePlate, currentMileage } = validatedFields.data;

    // Update car
    await db.car.update({
      where: { id: carId },
      data: {
        make,
        model,
        year,
        licensePlate,
        currentMileage,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/cars');
    revalidatePath(`/cars/${carId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update car error:', error);
    return {
      error: 'Terjadi kesalahan saat mengupdate mobil',
    };
  }
}

export async function deleteCar(carId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: 'Anda harus login terlebih dahulu' };
    }

    // Verify car belongs to user
    const car = await db.car.findFirst({
      where: {
        id: carId,
        userId: session.user.id,
      },
    });

    if (!car) {
      return { error: 'Mobil tidak ditemukan' };
    }

    // Delete car (cascade will delete related service records and reminders)
    await db.car.delete({
      where: { id: carId },
    });

    revalidatePath('/dashboard');
    revalidatePath('/cars');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete car error:', error);
    return {
      error: 'Terjadi kesalahan saat menghapus mobil',
    };
  }
}

export async function updateMileage(carId: string, newMileage: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: 'Anda harus login terlebih dahulu' };
    }

    // Verify car belongs to user
    const car = await db.car.findFirst({
      where: {
        id: carId,
        userId: session.user.id,
      },
    });

    if (!car) {
      return { error: 'Mobil tidak ditemukan' };
    }

    if (newMileage < 0) {
      return { error: 'Kilometer tidak valid' };
    }

    // Update mileage
    await db.car.update({
      where: { id: carId },
      data: {
        currentMileage: newMileage,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/cars');
    revalidatePath(`/cars/${carId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update mileage error:', error);
    return {
      error: 'Terjadi kesalahan saat mengupdate kilometer',
    };
  }
}
