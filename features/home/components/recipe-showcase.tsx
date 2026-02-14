/**
 * Recipe Showcase Section Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Flame, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedRecipes } from "@/features/home";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
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
        },
    },
};

function RecipeCardSkeleton() {
    return (
        <Card className="gap-0 overflow-hidden shadow-none border-border/50 bg-card p-0">
            <Skeleton className="aspect-4/3 w-full rounded-none" />
            <CardContent className="p-5">
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-4 h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>
    );
}

export function RecipeShowcase() {
    const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
    const { data, isLoading } = useFeaturedRecipes(6);

    const recipes = data?.data ?? [];

    return (
        <section className="relative bg-linear-to-b from-background via-muted/30 to-background py-16 sm:py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}>
                    <div>
                        <motion.div
                            className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}>
                            <Flame className="size-4" />
                            <span>Resep Populer</span>
                        </motion.div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Resep Pilihan untuk Anda
                        </h2>
                        <p className="mt-2 max-w-lg text-muted-foreground">
                            Temukan resep-resep terbaik yang telah disukai oleh ribuan pengguna
                        </p>
                    </div>
                    <Button asChild variant="outline" className="group gap-2 rounded-full">
                        <Link href="/resep">
                            Lihat Semua
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </motion.div>

                {/* Recipe Carousel */}
                <motion.div
                    className="mt-12"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}>
                    {isLoading ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <RecipeCardSkeleton key={`skeleton-${i}`} />
                            ))}
                        </div>
                    ) : recipes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Flame className="mb-4 size-12 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold text-foreground">Belum ada resep</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Resep akan ditampilkan di sini setelah ditambahkan
                            </p>
                        </div>
                    ) : (
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            plugins={[plugin.current]}
                            className="w-full">
                            <CarouselContent className="-ml-4">
                                {recipes.map((recipe) => (
                                    <CarouselItem key={recipe.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                        <motion.div variants={itemVariants} className="h-full">
                                            <Link href={`/resep/${recipe.slug}`} className="block h-full">
                                                <Card className="group h-full gap-0 overflow-hidden border-border/50 bg-card p-0 transition-all duration-300 hover:border-primary/30 shadow-none">
                                                    {/* Image */}
                                                    <div className="relative aspect-4/3 overflow-hidden bg-muted">
                                                        {recipe.imageUrl ? (
                                                            <Image
                                                                src={recipe.imageUrl}
                                                                alt={recipe.title}
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            />
                                                        ) : (
                                                            <div className="flex size-full items-center justify-center">
                                                                <Flame className="size-12 text-muted-foreground/30" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                                                        {recipe.category && (
                                                            <Badge className="absolute left-4 top-4 bg-background/90 text-foreground backdrop-blur-sm">
                                                                {recipe.category}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <CardContent className="flex flex-1 flex-col p-5">
                                                        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                                                            {recipe.title}
                                                        </h3>
                                                        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
                                                            {recipe.description || "Tidak ada deskripsi"}
                                                        </p>

                                                        {/* Meta Info */}
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="size-3.5" />
                                                                <span>
                                                                    {(recipe.prepMinutes || 0) +
                                                                        (recipe.cookMinutes || 0)}{" "}
                                                                    menit
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Users className="size-3.5" />
                                                                <span>{recipe.servings || 0} porsi</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <CarouselPrevious className="static translate-y-0" />
                                <CarouselNext className="static translate-y-0" />
                            </div>
                        </Carousel>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
