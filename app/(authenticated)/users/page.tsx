/**
 * Users Admin Page
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

import type { Metadata } from "next";
import { requireAdmin } from "@/config/auth/auth-utils";
import { UserPage } from "@/features/users";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Kelola Pengguna",
    description: "Halaman admin untuk mengelola pengguna di Reseply.",
    pathname: "/users",
    noIndex: true,
});

export default async function UsersAdminPage() {
    await requireAdmin();

    return <UserPage />;
}
