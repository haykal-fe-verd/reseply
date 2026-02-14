import type { Metadata } from "next";
import { requireAdmin } from "@/config/auth/auth-utils";
import { RecipePage } from "@/features/recipes";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Kelola Resep",
    description: "Halaman admin untuk mengelola semua resep di Reseply.",
    pathname: "/recipes",
    noIndex: true,
});

export default async function RecipesAdminPage() {
    await requireAdmin();

    return <RecipePage />;
}
