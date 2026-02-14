/**
 * Favorites Route Page
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { authIsRequired } from "@/config/auth/auth-utils";
import { FavoritePageSkeleton, FavoritesPage } from "@/features/favorites";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Resep Favorit",
    description: "Lihat dan kelola daftar resep favorit Anda di Reseply.",
    keywords: ["resep favorit", "bookmark resep", "resep tersimpan"],
    pathname: "/favorites",
    noIndex: true,
});

export default async function FavoritesRoute() {
    await authIsRequired();

    return (
        <Suspense fallback={<FavoritePageSkeleton />}>
            <FavoritesPage />
        </Suspense>
    );
}
