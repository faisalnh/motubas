import { Skeleton } from "@/components/ui/skeleton";

export default function CarsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-5 w-64 mt-2" />
                </div>
                <Skeleton className="h-12 w-36" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg bg-white">
                        <Skeleton className="h-6 w-48 mb-3" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-40" />
                        <div className="flex gap-2 mt-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
