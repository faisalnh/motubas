import { Skeleton } from "@/components/ui/skeleton";

export default function OmMotuLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-40 mt-1" />
                    </div>
                </div>
                <Skeleton className="h-8 w-24" />
            </div>

            {/* Chat Messages Skeleton */}
            <div className="border rounded-lg p-4 min-h-[400px] bg-white space-y-4">
                <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-24 w-3/4 rounded-lg" />
                </div>
                <div className="flex gap-3 justify-end">
                    <Skeleton className="h-12 w-1/2 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-32 w-3/4 rounded-lg" />
                </div>
            </div>

            {/* Input Skeleton */}
            <div className="flex gap-2">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-12" />
            </div>
        </div>
    );
}
