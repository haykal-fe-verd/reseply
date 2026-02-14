/**
 * Features Section Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { BookOpen, ChefHat, Clock, Heart, Search, Sparkles, UtensilsCrossed, Zap } from "lucide-react";

const features = [
    {
        icon: Search,
        title: "Pencarian Cerdas",
        description: "Temukan resep berdasarkan bahan yang Anda miliki atau filter berdasarkan kategori masakan.",
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        icon: ChefHat,
        title: "Virtual Chef AI",
        description: "Asisten pintar yang membantu Anda memasak dengan panduan langkah demi langkah.",
        color: "bg-purple-500/10 text-purple-500",
    },
    {
        icon: Clock,
        title: "Waktu Memasak",
        description: "Informasi lengkap waktu persiapan dan memasak untuk setiap resep.",
        color: "bg-orange-500/10 text-orange-500",
    },
    {
        icon: Heart,
        title: "Simpan Favorit",
        description: "Simpan resep favorit Anda untuk akses cepat kapan saja.",
        color: "bg-red-500/10 text-red-500",
    },
    {
        icon: UtensilsCrossed,
        title: "Beragam Kategori",
        description: "Dari masakan tradisional hingga fusion modern, semua ada di sini.",
        color: "bg-green-500/10 text-green-500",
    },
    {
        icon: BookOpen,
        title: "Instruksi Detail",
        description: "Panduan memasak lengkap dengan tips dan trik dari para chef.",
        color: "bg-amber-500/10 text-amber-500",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

export function FeaturesSection() {
    return (
        <section className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute left-1/4 top-0 size-72 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 size-72 rounded-full bg-secondary/5 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="mx-auto max-w-2xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}>
                    <motion.div
                        className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}>
                        <Sparkles className="size-4" />
                        <span>Fitur Unggulan</span>
                    </motion.div>

                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Semua yang Anda Butuhkan untuk{" "}
                        <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Memasak
                        </span>
                    </h2>

                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        Platform lengkap dengan fitur-fitur canggih untuk memudahkan perjalanan kuliner Anda.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}>
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={itemVariants}
                            className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                            {/* Icon */}
                            <div
                                className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${feature.color} transition-transform duration-300 group-hover:scale-110`}>
                                <feature.icon className="size-6" />
                            </div>

                            {/* Content */}
                            <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom Banner */}
                <motion.div
                    className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl bg-linear-to-r from-primary/10 via-primary/5 to-secondary/10 p-8 sm:flex-row"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}>
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                            <Zap className="size-7 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Mulai Petualangan Kuliner Anda</h3>
                            <p className="text-sm text-muted-foreground">Daftar gratis dan akses semua fitur premium</p>
                        </div>
                    </div>
                    <motion.a
                        href="/sign-up"
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}>
                        Daftar Sekarang
                        <Sparkles className="size-4" />
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}
