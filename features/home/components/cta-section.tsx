/**
 * CTA Section Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
    return (
        <section className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-primary/80 py-16 sm:py-24 lg:py-32">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -left-20 -top-20 size-96 rounded-full bg-white/5 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                    className="absolute -bottom-20 -right-20 size-96 rounded-full bg-white/5 blur-3xl"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, delay: 2 }}
                />

                {/* Decorative Icons */}
                <motion.div
                    className="absolute left-10 top-1/4 opacity-10"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}>
                    <ChefHat className="size-32 text-white" />
                </motion.div>
                <motion.div
                    className="absolute bottom-1/4 right-10 opacity-10"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}>
                    <Sparkles className="size-24 text-white" />
                </motion.div>
            </div>

            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}>
                    {/* Badge */}
                    <motion.div
                        className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}>
                        <Sparkles className="size-4" />
                        <span>Mulai Sekarang</span>
                    </motion.div>

                    {/* Heading */}
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                        Siap Memulai Petualangan Kuliner Anda?
                    </h2>

                    {/* Description */}
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                        Bergabunglah dengan ribuan pengguna lainnya dan temukan resep-resep lezat yang akan memanjakan
                        lidah keluarga Anda. Daftar gratis dan mulai memasak hari ini!
                    </p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="mt-10 flex flex-wrap items-center justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}>
                        <Button
                            asChild
                            size="lg"
                            className="group gap-2 rounded-full bg-white px-8 text-primary hover:bg-white/90">
                            <Link href="/sign-up">
                                Daftar Gratis
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="gap-2 rounded-full border-white/30 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white">
                            <Link href="/resep">
                                <ChefHat className="size-4" />
                                Jelajahi Resep
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Trust Text */}
                    <motion.p
                        className="mt-8 text-sm text-white/60"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}>
                        Gratis selamanya • Tidak perlu kartu kredit • Akses semua fitur
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
