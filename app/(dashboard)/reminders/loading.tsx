import { Skeleton } from "@/components/ui/skeleton";

export default function RemindersLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-72 mt-2" />
            </div>

            {/* Summary Stats Skeleton */}
            <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-white">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                ))}
            </div>

            {/* Reminder Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-white">
                        <Skeleton className="h-5 w-32 mb-3" />
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-10 w-full mt-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
