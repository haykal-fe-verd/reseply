"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            {/* Animated 404 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative">
                {/* Background glow */}
                <motion.div
                    className="absolute inset-0 blur-3xl"
                    animate={{
                        background: [
                            "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
                            "radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)",
                            "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
                        ],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />

                {/* 404 Text */}
                <motion.h1
                    className="relative text-[10rem] font-bold leading-none tracking-tighter text-primary/10 sm:text-[14rem]"
                    animate={{
                        textShadow: [
                            "0 0 20px hsl(var(--primary) / 0.1)",
                            "0 0 40px hsl(var(--primary) / 0.2)",
                            "0 0 20px hsl(var(--primary) / 0.1)",
                        ],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}>
                    404
                </motion.h1>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 text-center sm:mt-12">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Halaman Tidak Ditemukan</h2>
                <p className="mt-3 max-w-md text-muted-foreground">
                    Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan. Silakan kembali ke beranda atau cari
                    resep lainnya.
                </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="size-4" />
                    Kembali
                </Button>
                <Button asChild className="gap-2">
                    <Link href="/">
                        <Home className="size-4" />
                        Ke Beranda
                    </Link>
                </Button>
                <Button variant="secondary" asChild className="gap-2">
                    <Link href="/resep">
                        <Search className="size-4" />
                        Cari Resep
                    </Link>
                </Button>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}>
                {/* Floating shapes */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute size-2 rounded-full bg-primary/20"
                        style={{
                            left: `${15 + i * 18}%`,
                            top: `${20 + (i % 3) * 25}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.3,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
}
