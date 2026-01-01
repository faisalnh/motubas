import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-64 mt-2" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    {/* Profile Card Skeleton */}
                    <div className="p-6 border rounded-lg bg-white">
                        <Skeleton className="h-6 w-40 mb-4" />
                        <Skeleton className="h-10 w-full mb-4" />
                        <Skeleton className="h-10 w-full mb-4" />
                        <Skeleton className="h-12 w-32" />
                    </div>
                    {/* Password Card Skeleton */}
                    <div className="p-6 border rounded-lg bg-white">
                        <Skeleton className="h-6 w-36 mb-4" />
                        <Skeleton className="h-10 w-full mb-4" />
                        <Skeleton className="h-10 w-full mb-4" />
                        <Skeleton className="h-12 w-40" />
                    </div>
                </div>
                {/* Subscription Card Skeleton */}
                <div className="p-6 border rounded-lg bg-white">
                    <Skeleton className="h-6 w-44 mb-4" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
        </div>
    );
}
