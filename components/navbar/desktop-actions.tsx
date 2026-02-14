"use client";

import { Component } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";

interface DesktopActionsProps {
    session: {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string | null;
        };
    } | null;
    isSessionPending: boolean;
}

export function DesktopActions({ session, isSessionPending }: DesktopActionsProps) {
    if (isSessionPending) return null;

    return (
        <div className="hidden md:flex md:items-center md:gap-2">
            <ThemeToggle />
            {session ? (
                <UserNav user={session.user} role={session.user.role} />
            ) : (
                <>
                    <Button variant="outline" asChild>
                        <Link href="/sign-in">Masuk</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/sign-up">
                            Dapatkan Akses <Component />
                        </Link>
                    </Button>
                </>
            )}
        </div>
    );
}
