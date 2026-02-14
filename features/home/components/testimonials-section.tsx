/**
 * Testimonials Section Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
    {
        id: 1,
        name: "Siti Rahayu",
        role: "Ibu Rumah Tangga",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
        content:
            "Reseply sangat membantu saya menemukan resep baru setiap hari. Instruksinya detail dan mudah diikuti. Keluarga saya selalu senang dengan masakan baru!",
        rating: 5,
    },
    {
        id: 2,
        name: "Ahmad Fauzi",
        role: "Food Blogger",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
        content:
            "Sebagai food blogger, saya membutuhkan inspirasi konstan. Reseply adalah sumber terbaik untuk resep autentik Indonesia dengan sentuhan modern.",
        rating: 5,
    },
    {
        id: 3,
        name: "Dewi Lestari",
        role: "Mahasiswa",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1770&auto=format&fit=crop",
        content:
            "Virtual Chef AI sangat membantu saya yang baru belajar masak. Bisa tanya apa saja dan dapat jawaban yang berguna. Recommended banget!",
        rating: 5,
    },
    {
        id: 4,
        name: "Budi Santoso",
        role: "Koki Profesional",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1770&auto=format&fit=crop",
        content:
            "Koleksi resep tradisional di Reseply sangat lengkap dan autentik. Bahkan sebagai chef, saya masih belajar banyak dari platform ini.",
        rating: 5,
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
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

export function TestimonialsSection() {
    return (
        <section className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -left-20 top-1/4 size-80 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -right-20 bottom-1/4 size-80 rounded-full bg-secondary/5 blur-3xl" />
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
                        <Quote className="size-4" />
                        <span>Testimoni</span>
                    </motion.div>

                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Apa Kata{" "}
                        <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Pengguna
                        </span>{" "}
                        Kami
                    </h2>

                    <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                        Bergabung dengan ribuan pengguna yang telah menemukan inspirasi kuliner mereka di Reseply
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <motion.div
                    className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}>
                    {testimonials.map((testimonial) => (
                        <motion.div key={testimonial.id} variants={itemVariants}>
                            <Card className="group relative h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                <CardContent className="flex h-full flex-col p-6">
                                    {/* Quote Icon */}
                                    <div className="mb-4">
                                        <Quote className="size-8 text-primary/20" />
                                    </div>

                                    {/* Rating */}
                                    <div className="mb-4 flex gap-1">
                                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                                            <Star
                                                key={`star-${testimonial.id}-${i}`}
                                                className="size-4 fill-amber-400 text-amber-400"
                                            />
                                        ))}
                                    </div>

                                    {/* Content */}
                                    <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                                        "{testimonial.content}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-3 border-t border-border pt-4">
                                        <Avatar className="size-10">
                                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                            <AvatarFallback>
                                                {testimonial.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-foreground">{testimonial.name}</p>
                                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </CardContent>

                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                    className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-border pt-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">4.9/5</div>
                        <div className="flex items-center justify-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={`rating-star-${i}`} className="size-4 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">Rating Pengguna</p>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">10,000+</div>
                        <p className="mt-1 text-sm text-muted-foreground">Pengguna Aktif</p>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">1,000+</div>
                        <p className="mt-1 text-sm text-muted-foreground">Resep Tersedia</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
