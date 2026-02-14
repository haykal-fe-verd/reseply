"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { HELP_LINKS, NAVIGATION_LINKS, SOCIAL_LINKS } from "@/lib/navigations";

export function Footer() {
    return (
        <footer className="border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Column 1: Brand + description + social */}
                    <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo size="sm" />
                            <span className="text-lg font-bold text-foreground capitalize">{APP_NAME}</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">{APP_DESCRIPTION}</p>
                        <div className="flex items-center gap-3">
                            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                    aria-label={label}>
                                    <Icon className="size-5" aria-hidden />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Navigasi */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">Navigasi</h3>
                        <ul className="space-y-2">
                            {NAVIGATION_LINKS.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Help */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">Bantuan</h3>
                        <ul className="space-y-2">
                            {HELP_LINKS.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                        <h3 className="text-sm font-semibold text-foreground">Langganan newsletter</h3>
                        <form
                            className="flex gap-2"
                            onSubmit={(e) => e.preventDefault()}
                            aria-label="Langganan newsletter">
                            <Input
                                type="email"
                                placeholder="Email Anda..."
                                className="min-w-0 flex-1"
                                aria-label="Email untuk newsletter"
                            />
                            <Button type="submit" size="icon" className="shrink-0" aria-label="Berlangganan">
                                <ArrowRightIcon className="size-4" aria-hidden />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Bottom: copyright */}
                <div className="mt-12 border-t border-border pt-8">
                    <p className="text-center text-sm text-muted-foreground">
                        ©{new Date().getFullYear()} {APP_NAME.charAt(0).toUpperCase() + APP_NAME.slice(1)}, Made with{" "}
                        <span className="text-destructive" aria-hidden>
                            ❤️
                        </span>{" "}
                        for better web.
                    </p>
                </div>
            </div>
        </footer>
    );
}
