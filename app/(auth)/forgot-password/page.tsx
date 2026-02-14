import type { Metadata } from "next";
import { authIsNotRequired } from "@/config/auth/auth-utils";
import { FormForgotPassword } from "@/features/auth";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Lupa Password",
    description: "Reset password akun Reseply Anda. Masukkan email untuk menerima tautan reset password.",
    keywords: ["lupa password", "reset password", "pemulihan akun"],
    pathname: "/forgot-password",
    noIndex: true,
});

export default async function ForgotPasswordRoute() {
    await authIsNotRequired();

    return <FormForgotPassword />;
}
