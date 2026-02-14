import { FavoriteGridSkeleton } from "@/features/favorites";

export function FavoritePageSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <section className="bg-linear-to-br from-red-500/10 via-background to-background py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="mx-auto mb-4 size-16 animate-pulse rounded-full bg-muted" />
                        <div className="mx-auto h-10 w-64 animate-pulse rounded bg-muted" />
                        <div className="mx-auto mt-4 h-6 w-96 animate-pulse rounded bg-muted" />
                    </div>
                </div>
            </section>
            <section className="py-8 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FavoriteGridSkeleton count={12} />
                </div>
            </section>
        </div>
    );
}
