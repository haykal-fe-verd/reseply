"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/logo";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
            {/* Logo with pulse animation */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative">
                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-xl bg-primary/20 blur-xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />

                {/* Logo */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}>
                    <Logo size="xl" className="relative" />
                </motion.div>
            </motion.div>

            {/* Loading dots */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="size-2 rounded-full bg-primary"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.15,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </motion.div>

            {/* Loading text */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-sm text-muted-foreground">
                Memuat...
            </motion.p>
        </div>
    );
}
