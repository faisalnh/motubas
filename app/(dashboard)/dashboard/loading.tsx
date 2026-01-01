import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-80 mt-2" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 border rounded-lg bg-white">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-32 mt-2" />
                    </div>
                ))}
            </div>

            {/* Chart & Activity Skeleton */}
            <div className="grid gap-6 md:grid-cols-7">
                <div className="col-span-4 p-6 border rounded-lg bg-white">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-[250px] w-full" />
                </div>
                <div className="col-span-3 p-6 border rounded-lg bg-white">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
