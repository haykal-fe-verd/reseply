import type { Metadata } from "next";
import { authIsNotRequired } from "@/config/auth/auth-utils";
import { FormTwoFactor } from "@/features/auth";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Verifikasi Dua Faktor",
    description: "Masukkan kode verifikasi untuk melanjutkan proses masuk ke akun Reseply Anda.",
    keywords: ["verifikasi", "two factor", "2fa", "kode otp"],
    pathname: "/two-factor",
    noIndex: true,
});

export default async function TwoFactorPage() {
    await authIsNotRequired();

    return <FormTwoFactor />;
}
