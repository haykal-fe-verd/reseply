import type { Metadata } from "next";
import { Suspense } from "react";
import { authIsNotRequired } from "@/config/auth/auth-utils";
import { FormResetPassword } from "@/features/auth";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Reset Password",
    description: "Buat password baru untuk akun Reseply Anda.",
    keywords: ["reset password", "password baru"],
    pathname: "/reset-password",
    noIndex: true,
});

function ResetPasswordFormFallback() {
    return (
        <div className="animate-pulse rounded-lg border bg-muted/50 p-8">
            <div className="mb-4 h-6 w-48 rounded bg-muted" />
            <div className="mb-2 h-4 w-full rounded bg-muted" />
            <div className="mb-4 h-10 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
        </div>
    );
}

export default async function ResetPasswordPage() {
    await authIsNotRequired();

    return (
        <Suspense fallback={<ResetPasswordFormFallback />}>
            <FormResetPassword />
        </Suspense>
    );
}
