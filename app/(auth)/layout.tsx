import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense>
            <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <Link href="/" className="flex items-center gap-2 self-center font-medium">
                        <Logo />
                    </Link>

                    {children}
                </div>
            </div>
        </Suspense>
    );
}
