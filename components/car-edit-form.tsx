'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCar, deleteCar } from '@/app/actions/cars';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  currentMileage: number;
}

export function CarEditForm({ car }: { car: Car }) {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');

    const result = await updateCar(car.id, formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      router.push('/cars');
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    setError('');

    const result = await deleteCar(car.id);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
      setShowDeleteConfirm(false);
    } else if (result?.success) {
      router.push('/cars');
    }
  }

  return (
    <div className="space-y-6">
      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="make">Merek Mobil</Label>
            <Input
              id="make"
              name="make"
              type="text"
              defaultValue={car.make}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              type="text"
              defaultValue={car.model}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Tahun</Label>
            <Input
              id="year"
              name="year"
              type="number"
              defaultValue={car.year}
              min="1900"
              max={new Date().getFullYear() + 1}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="licensePlate">Plat Nomor</Label>
            <Input
              id="licensePlate"
              name="licensePlate"
              type="text"
              defaultValue={car.licensePlate}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentMileage">Kilometer Saat Ini</Label>
          <Input
            id="currentMileage"
            name="currentMileage"
            type="number"
            defaultValue={car.currentMileage}
            min="0"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Update kilometer terakhir yang tercatat di odometer
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Link href="/cars" className="flex-1">
            <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
              Batal
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>

      {/* Delete Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Zona Bahaya</h3>
        <p className="text-sm text-gray-600 mb-4">
          Menghapus mobil akan menghapus semua riwayat service dan pengingat yang terkait.
          Tindakan ini tidak dapat dibatalkan.
        </p>

        {!showDeleteConfirm ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Mobil
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-600">
              Apakah Anda yakin ingin menghapus mobil ini?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Menghapus...' : 'Ya, Hapus Mobil'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
