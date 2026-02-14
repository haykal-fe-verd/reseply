"use client";

import { Component, MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, isActivePath, NAV_ITEMS, USER_NAV_ITEMS } from "./nav-config";

interface MobileNavProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    session: { user: { role?: string | null } } | null;
}

function NavLink({
    href,
    label,
    active,
    onNavigate,
    icon: Icon,
}: {
    href: string;
    label: string;
    active: boolean;
    onNavigate: () => void;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent hover:text-accent-foreground",
            )}>
            {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            {label}
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />}
        </Link>
    );
}

export function MobileNav({ open, onOpenChange, session }: MobileNavProps) {
    const pathname = usePathname();
    const onLinkClick = () => onOpenChange(false);
    const isAdmin = session?.user?.role === "admin";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu navigasi">
                    <MenuIcon className="size-5" aria-hidden />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-xs">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-left">
                        <Logo size="sm" />
                        <span>{APP_NAME}</span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-1 flex-col gap-1 px-1">
                    {NAV_ITEMS.map(({ label, href }) => (
                        <NavLink
                            key={href}
                            href={href}
                            label={label}
                            active={isActivePath(pathname, href)}
                            onNavigate={onLinkClick}
                        />
                    ))}
                    {session &&
                        USER_NAV_ITEMS.map(({ label, href, icon }) => (
                            <NavLink
                                key={href}
                                href={href}
                                label={label}
                                active={isActivePath(pathname, href)}
                                onNavigate={onLinkClick}
                                icon={icon}
                            />
                        ))}
                    {isAdmin && (
                        <>
                            <Separator className="my-2" />
                            <span className="px-3 py-1 text-xs font-medium text-muted-foreground">Admin</span>
                            {ADMIN_NAV_ITEMS.map(({ label, href, icon }) => (
                                <NavLink
                                    key={href}
                                    href={href}
                                    label={label}
                                    active={isActivePath(pathname, href)}
                                    onNavigate={onLinkClick}
                                    icon={icon}
                                />
                            ))}
                        </>
                    )}
                </div>

                <Separator />

                <div className="flex flex-col gap-2 px-4 py-4">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-sm text-muted-foreground">Tema</span>
                        <ThemeToggle />
                    </div>
                    {!session && (
                        <>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/sign-in">Masuk</Link>
                            </Button>
                            <Button className="w-full" asChild>
                                <Link href="/sign-up">
                                    Dapatkan Akses <Component className="size-4" />
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
