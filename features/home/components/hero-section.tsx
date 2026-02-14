/**
 * Hero Section Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, rotate: -5 },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

const floatingVariants = {
    animate: {
        y: [-10, 10, -10],
        transition: {
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut" as const,
        },
    },
};

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-background">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-20 -right-20 size-96 rounded-full bg-primary/5 blur-3xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                    className="absolute -bottom-20 -left-20 size-96 rounded-full bg-secondary/10 blur-3xl"
                    animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    {/* Content */}
                    <motion.div
                        className="flex flex-col items-start"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible">
                        {/* Badge */}
                        <motion.div
                            variants={itemVariants}
                            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                            <Sparkles className="size-4" />
                            <span>Platform Resep Terlengkap</span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            Jelajahi{" "}
                            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Cita Rasa
                            </span>{" "}
                            Kuliner Indonesia
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            variants={itemVariants}
                            className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                            Temukan ribuan resep masakan nusantara yang autentik. Dari hidangan tradisional hingga
                            kreasi modern, setiap resep dirancang untuk memanjakan lidah Anda.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-4">
                            <Button asChild size="lg" className="group gap-2 rounded-full px-6">
                                <Link href="/resep">
                                    Jelajahi Resep
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="gap-2 rounded-full px-6">
                                <Link href="/virtual-chef">
                                    <ChefHat className="size-4" />
                                    Virtual Chef AI
                                </Link>
                            </Button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
                            {[
                                { value: "1000+", label: "Resep" },
                                { value: "50+", label: "Kategori" },
                                { value: "10K+", label: "Pengguna" },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center sm:text-left">
                                    <div className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        className="relative flex items-center justify-center lg:justify-end"
                        variants={imageVariants}
                        initial="hidden"
                        animate="visible">
                        {/* Main Image */}
                        <motion.div
                            className="relative aspect-square w-full max-w-md overflow-hidden rounded-full bg-linear-to-br from-primary/20 to-secondary/20 p-4 lg:max-w-lg"
                            variants={floatingVariants}
                            animate="animate">
                            <div className="relative size-full overflow-hidden rounded-full bg-muted/50">
                                <Image
                                    src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1771&auto=format&fit=crop"
                                    alt="Hidangan nusantara yang lezat"
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </motion.div>

                        {/* Floating Cards */}
                        <motion.div
                            className="absolute -left-4 top-1/4 rounded-xl bg-card p-3 shadow-lg sm:p-4"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}>
                            <div className="flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                    <ChefHat className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Resep Baru</p>
                                    <p className="font-semibold text-foreground">Rendang Padang</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="absolute -right-4 bottom-1/4 rounded-xl bg-card p-3 shadow-lg sm:p-4"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, duration: 0.6 }}>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="size-8 rounded-full border-2 border-card bg-linear-to-br from-primary/60 to-secondary/60"
                                        />
                                    ))}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">10K+</p>
                                    <p className="text-xs text-muted-foreground">Pengguna Aktif</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
