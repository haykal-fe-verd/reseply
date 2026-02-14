import type { Metadata } from "next";
import { authIsRequired } from "@/config/auth/auth-utils";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Profil Saya",
    description: "Kelola profil dan pengaturan akun Reseply Anda.",
    pathname: "/profile",
    noIndex: true,
});

export default async function ProfileRoute() {
    await authIsRequired();

    return <ProfilePage />;
}
