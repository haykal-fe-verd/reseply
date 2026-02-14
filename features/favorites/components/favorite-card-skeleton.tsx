/**
 * Favorite Card Skeleton Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FavoriteCardSkeleton() {
    return (
        <Card className="h-full overflow-hidden border-border/50 p-0">
            {/* Image Skeleton */}
            <Skeleton className="aspect-4/3 w-full rounded-none" />

            {/* Content */}
            <CardContent className="space-y-3 p-4">
                {/* Categories Skeleton */}
                <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                </div>

                {/* Title Skeleton */}
                <Skeleton className="h-6 w-3/4" />

                {/* Description Skeleton */}
                <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="border-t border-border/50 px-4 py-3">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-14" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                </div>
            </CardFooter>
        </Card>
    );
}

export function FavoriteGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <FavoriteCardSkeleton key={i} />
            ))}
        </div>
    );
}
