"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActivePath, NAV_ITEMS } from "./nav-config";

export function DesktopNav() {
    const pathname = usePathname();

    return (
        <div className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map(({ label, href }) => {
                const active = isActivePath(pathname, href);
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "relative flex flex-col items-center gap-0.5 rounded px-1 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            active ? "text-primary" : "text-foreground/90 hover:text-foreground",
                        )}>
                        <span className="relative">{label}</span>
                        {active && <span className="h-0.5 w-1.5 rounded-full bg-primary" aria-hidden />}
                    </Link>
                );
            })}
        </div>
    );
}
