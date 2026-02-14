import type { Metadata } from "next";
import { authIsNotRequired } from "@/config/auth/auth-utils";
import { FormSignIn } from "@/features/auth";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
    title: "Masuk",
    description: "Masuk ke akun Reseply Anda untuk mengakses resep favorit dan fitur eksklusif lainnya.",
    keywords: ["masuk", "login", "akun reseply"],
    pathname: "/sign-in",
    noIndex: true,
});

export default async function SignInRoute() {
    await authIsNotRequired();

    return <FormSignIn />;
}
