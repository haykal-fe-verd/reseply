/**
 * About Page Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, ChefHat, Heart, Lightbulb, Mail, Sparkles, Target, Users, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
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
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

const values = [
    {
        icon: Heart,
        title: "Passion",
        description: "Kami percaya memasak adalah bentuk cinta. Setiap resep dibuat dengan penuh dedikasi.",
        color: "bg-red-500/10 text-red-500",
    },
    {
        icon: Lightbulb,
        title: "Inovasi",
        description: "Menggabungkan tradisi kuliner dengan teknologi modern untuk pengalaman yang lebih baik.",
        color: "bg-amber-500/10 text-amber-500",
    },
    {
        icon: Users,
        title: "Komunitas",
        description: "Membangun komunitas pecinta kuliner yang saling berbagi dan menginspirasi.",
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        icon: BookOpen,
        title: "Edukasi",
        description: "Melestarikan warisan kuliner nusantara melalui dokumentasi resep yang terstruktur.",
        color: "bg-green-500/10 text-green-500",
    },
];

const stats = [
    { value: "1000+", label: "Resep Tersedia" },
    { value: "10K+", label: "Pengguna Aktif" },
    { value: "50+", label: "Kategori Masakan" },
    { value: "4.9", label: "Rating Pengguna" },
];

const team = [
    {
        name: "Muhammad Haykal",
        role: "Founder & Developer",
        image: "/developer.jpg",
        description: "Passionate developer with love for Indonesian cuisine",
    },
    {
        name: "Anik Sahilah",
        role: "Chef",
        image: "/bubub.jpg",
        description: "Passionate chef with love for Indonesian cuisine",
    },
];

export function AboutPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-linear-to-b from-primary/5 via-background to-background py-20 sm:py-28 lg:py-32">
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

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="mx-auto max-w-3xl text-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible">
                        <motion.div variants={itemVariants}>
                            <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
                                <Sparkles className="size-4" />
                                Tentang Kami
                            </Badge>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            Membangun{" "}
                            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Ekosistem Kuliner
                            </span>{" "}
                            Digital Indonesia
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="mt-6 text-lg leading-relaxed text-muted-foreground">
                            {APP_NAME} hadir sebagai platform yang menghubungkan pecinta kuliner dengan kekayaan resep
                            nusantara. Kami berkomitmen untuk melestarikan dan membagikan warisan kuliner Indonesia
                            kepada dunia.
                        </motion.p>

                        <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-4">
                            <Button asChild size="lg" className="group gap-2 rounded-full">
                                <Link href="/resep">
                                    Jelajahi Resep
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="gap-2 rounded-full">
                                <Link href="/sign-up">
                                    <ChefHat className="size-4" />
                                    Bergabung Sekarang
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-y border-border bg-muted/30 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="grid grid-cols-2 gap-8 md:grid-cols-4"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}>
                        {stats.map((stat) => (
                            <motion.div key={stat.label} variants={itemVariants} className="text-center">
                                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}>
                            <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-muted">
                                <Image
                                    src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1770&auto=format&fit=crop"
                                    alt="Cooking together"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <Badge className="bg-white/90 text-foreground backdrop-blur-sm">
                                        <Utensils className="mr-1 size-3" />
                                        Sejak 2026
                                    </Badge>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>
                            <motion.div variants={itemVariants}>
                                <Badge variant="outline" className="mb-4 gap-2">
                                    <Target className="size-4" />
                                    Misi Kami
                                </Badge>
                            </motion.div>

                            <motion.h2
                                variants={itemVariants}
                                className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Melestarikan Cita Rasa Nusantara
                            </motion.h2>

                            <motion.p variants={itemVariants} className="mt-4 text-muted-foreground">
                                Indonesia memiliki kekayaan kuliner yang luar biasa dengan ribuan resep tradisional dari
                                berbagai daerah. Sayangnya, banyak resep warisan leluhur yang perlahan terlupakan
                                seiring waktu.
                            </motion.p>

                            <motion.p variants={itemVariants} className="mt-4 text-muted-foreground">
                                {APP_NAME} hadir untuk mendokumentasikan, melestarikan, dan membagikan warisan kuliner
                                ini kepada generasi muda. Dengan teknologi modern dan antarmuka yang ramah pengguna,
                                kami memudahkan siapa saja untuk menemukan dan memasak hidangan khas Indonesia.
                            </motion.p>

                            <motion.div
                                variants={itemVariants}
                                className="mt-8 flex items-center gap-4 rounded-xl border bg-card p-4">
                                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                    <ChefHat className="size-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Virtual Chef AI</p>
                                    <p className="text-sm text-muted-foreground">
                                        Asisten pintar untuk panduan memasak interaktif
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-muted/30 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="mx-auto max-w-2xl text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}>
                        <Badge variant="outline" className="mb-4 gap-2">
                            <Heart className="size-4" />
                            Nilai Kami
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Prinsip yang Kami Pegang
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            Nilai-nilai yang menjadi fondasi dalam setiap langkah pengembangan platform kami.
                        </p>
                    </motion.div>

                    <motion.div
                        className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}>
                        {values.map((value) => (
                            <motion.div key={value.title} variants={itemVariants}>
                                <Card className="group h-full border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                    <CardContent className="p-6">
                                        <div
                                            className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${value.color} transition-transform duration-300 group-hover:scale-110`}>
                                            <value.icon className="size-6" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-foreground">{value.title}</h3>
                                        <p className="text-sm text-muted-foreground">{value.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="mx-auto max-w-2xl text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}>
                        <Badge variant="outline" className="mb-4 gap-2">
                            <Users className="size-4" />
                            Tim Kami
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Orang di Balik {APP_NAME}
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            Tim yang berdedikasi untuk menghadirkan pengalaman kuliner terbaik bagi Anda.
                        </p>
                    </motion.div>

                    <motion.div
                        className="mt-16 grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 md:max-w-3xl md:mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}>
                        {team.map((member) => (
                            <motion.div key={member.name} variants={itemVariants} className="w-full">
                                <Card className="h-full w-full border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                                    <CardContent className="p-6 text-center">
                                        <Avatar className="mx-auto size-24">
                                            <AvatarImage
                                                src={member.image}
                                                alt={member.name}
                                                className="object-cover object-top"
                                            />
                                            <AvatarFallback>
                                                {member.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <h3 className="mt-4 text-lg font-semibold text-foreground">{member.name}</h3>
                                        <p className="text-sm text-primary">{member.role}</p>
                                        <p className="mt-2 text-sm text-muted-foreground">{member.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-linear-to-br from-primary via-primary/90 to-primary/80 py-20 sm:py-28">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}>
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Punya Pertanyaan atau Saran?
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
                            Kami senang mendengar dari Anda. Hubungi kami untuk pertanyaan, saran, atau kolaborasi.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="group gap-2 rounded-full bg-white text-primary hover:bg-white/90">
                                <a href="mailto:hello@reseply.com">
                                    <Mail className="size-4" />
                                    Hubungi Kami
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="gap-2 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                                <Link href="/resep">
                                    <ChefHat className="size-4" />
                                    Lihat Resep
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
