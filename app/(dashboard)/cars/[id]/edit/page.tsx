import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CarEditForm } from "@/components/car-edit-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const car = await db.car.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!car) {
    redirect("/cars");
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
          <CardTitle>Edit Mobil</CardTitle>
          <CardDescription>Update informasi mobil Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <CarEditForm car={car} />
        </CardContent>
      </Card>
    </div>
  );
}
