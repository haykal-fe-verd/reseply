/**
 * Recipe Card Skeleton Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeCardSkeleton() {
    return (
        <Card className="h-full overflow-hidden border-border/50 mt-0 pt-0">
            {/* Image Skeleton */}
            <Skeleton className="aspect-4/3 w-full rounded-none" />

            {/* Content */}
            <CardContent className="space-y-3 p-4">
                {/* Categories */}
                <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>

                {/* Title */}
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />

                {/* Description */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>

            {/* Footer */}
            <CardFooter className="border-t border-border/50 px-4 py-3">
                <div className="flex w-full items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </CardFooter>
        </Card>
    );
}

export function RecipeGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
            ))}
        </div>
    );
}
