import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CarCardProps {
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    currentMileage: number;
    isPrimary: boolean;
    serviceRecords?: Array<{
      id: string;
      serviceType: string;
      serviceDate: Date;
    }>;
    reminders?: Array<{
      id: string;
    }>;
  };
}

export function CarCard({ car }: CarCardProps) {
  const lastService = car.serviceRecords?.[0];
  const activeReminders = car.reminders?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {car.make} {car.model}
          </span>
          {car.isPrimary && (
            <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Utama
            </span>
          )}
        </CardTitle>
        <CardDescription>{car.year}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Plat Nomor</p>
          <p className="font-medium">{car.licensePlate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Kilometer Saat Ini</p>
          <p className="font-medium">
            {car.currentMileage.toLocaleString('id-ID')} km
          </p>
        </div>
        {lastService && (
          <div>
            <p className="text-sm text-gray-600">Service Terakhir</p>
            <p className="text-sm">
              {lastService.serviceType.replace(/_/g, ' ')} •{' '}
              {new Date(lastService.serviceDate).toLocaleDateString('id-ID')}
            </p>
          </div>
        )}
        {activeReminders > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-sm text-amber-800">
              {activeReminders} pengingat service aktif
            </p>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Link href={`/cars/${car.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full">
              Edit
            </Button>
          </Link>
          <Link href={`/cars/${car.id}/services`} className="flex-1">
            <Button className="w-full">Riwayat Service</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
