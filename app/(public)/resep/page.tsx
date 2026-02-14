/**
 * Public Recipes Page Route
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicRecipesPage, RecipeGridSkeleton } from "@/features/public-recipes";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Koleksi Resep",
    description:
        "Jelajahi koleksi resep masakan Indonesia terlengkap. Filter berdasarkan kategori, bahan, atau tingkat kesulitan.",
    keywords: ["resep masakan", "koleksi resep", "resep indonesia", "masakan nusantara"],
    pathname: "/resep",
});

export default function ResepRoute() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <RecipeGridSkeleton count={12} />
                </div>
            }>
            <PublicRecipesPage />
        </Suspense>
    );
}
