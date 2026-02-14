"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { authClient } from "@/config/auth/auth-client";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { DesktopActions } from "./desktop-actions";
import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { SCROLL_THRESHOLD } from "./nav-config";

export function Navbar() {
    const [isAtTop, setIsAtTop] = useState(true);
    const [sheetOpen, setSheetOpen] = useState(false);
    const { data: session, isPending: isSessionPending } = authClient.useSession();

    useEffect(() => {
        const handleScroll = () => {
            setIsAtTop(window.scrollY < SCROLL_THRESHOLD);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed left-0 right-0 top-0 z-50 transition-all duration-300 ease-out",
                isAtTop
                    ? "bg-background"
                    : "border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/70",
            )}>
            <nav
                className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
                aria-label="Main navigation">
                <Link href="/" className="flex items-center gap-2">
                    <Logo />
                    <h1 className="text-2xl font-bold text-primary capitalize">{APP_NAME}</h1>
                </Link>

                <DesktopNav />

                <div className="flex items-center gap-2">
                    <DesktopActions session={session} isSessionPending={isSessionPending} />
                    <MobileNav open={sheetOpen} onOpenChange={setSheetOpen} session={session} />
                </div>
            </nav>
        </header>
    );
}

export type { UserNavProps } from "./user-nav";
export { UserNav } from "./user-nav";
