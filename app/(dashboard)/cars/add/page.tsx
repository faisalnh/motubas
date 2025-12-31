'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addCar } from '@/app/actions/cars';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddCarPage() {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError('');

    const result = await addCar(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      router.push('/cars');
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/cars">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Mobil Baru</CardTitle>
          <CardDescription>
            Masukkan informasi mobil Anda untuk mulai melacak riwayat service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Merek Mobil</Label>
                <Input
                  id="make"
                  name="make"
                  type="text"
                  placeholder="Toyota, Honda, dll"
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
                  placeholder="Avanza, Jazz, dll"
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
                  placeholder="2015"
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
                  placeholder="B 1234 ABC"
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
                placeholder="50000"
                min="0"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Masukkan kilometer terakhir yang tercatat di odometer
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
                {isLoading ? 'Menyimpan...' : 'Simpan Mobil'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
