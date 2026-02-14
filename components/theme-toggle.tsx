"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const iconTransition = {
    type: "spring" as const,
    stiffness: 700,
    damping: 35,
};

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = resolvedTheme === "dark" || theme === "dark";

    const toggle = () => {
        setTheme(isDark ? "light" : "dark");
    };

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon-sm" className={cn("size-8", className)} aria-label="Ubah tema" disabled>
                <span className="size-4 rounded-full bg-muted" aria-hidden />
            </Button>
        );
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn("size-8 overflow-hidden", className)}
            onClick={toggle}
            aria-label={isDark ? "Gunakan tema terang" : "Gunakan tema gelap"}
            asChild>
            <motion.span
                className="inline-flex size-8 items-center justify-center"
                whileTap={{ scale: 0.9 }}
                transition={iconTransition}>
                <AnimatePresence mode="wait" initial={false}>
                    {isDark ? (
                        <motion.span
                            key="sun"
                            className="inline-flex size-4 items-center justify-center"
                            initial={{ rotate: -45, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 45, opacity: 0 }}
                            transition={iconTransition}>
                            <SunIcon className="size-4" aria-hidden />
                        </motion.span>
                    ) : (
                        <motion.span
                            key="moon"
                            className="inline-flex size-4 items-center justify-center"
                            initial={{ rotate: 45, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -45, opacity: 0 }}
                            transition={iconTransition}>
                            <MoonIcon className="size-4" aria-hidden />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.span>
        </Button>
    );
}
