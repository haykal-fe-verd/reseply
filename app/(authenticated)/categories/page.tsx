import type { Metadata } from "next";
import { requireAdmin } from "@/config/auth/auth-utils";
import { CategoryPage } from "@/features/category";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Kelola Kategori",
    description: "Halaman admin untuk mengelola kategori resep di Reseply.",
    pathname: "/categories",
    noIndex: true,
});

export default async function CategoriesPage() {
    await requireAdmin();

    return <CategoryPage />;
}
