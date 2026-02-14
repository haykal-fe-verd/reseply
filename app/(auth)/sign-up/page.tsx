import type { Metadata } from "next";
import { authIsNotRequired } from "@/config/auth/auth-utils";
import { FormSignUp } from "@/features/auth";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Daftar",
    description:
        "Buat akun Reseply gratis dan mulai simpan resep favorit, bagikan kreasi Anda, dan bergabung dengan komunitas.",
    keywords: ["daftar", "registrasi", "buat akun"],
    pathname: "/sign-up",
    noIndex: true,
});

export default async function SignUpRoute() {
    await authIsNotRequired();

    return <FormSignUp />;
}
