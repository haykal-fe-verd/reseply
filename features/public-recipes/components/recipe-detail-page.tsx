/**
 * Recipe Detail Page Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, CheckCircle2, ChefHat, Clock, Printer, Share2, Timer, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/features/favorites";
import {
    PrintRecipeDialog,
    RecipeCard,
    RecipeCardSkeleton,
    ShareRecipeDialog,
    useRecipeDetail,
    useRecommendedRecipes,
} from "@/features/public-recipes";

interface RecipeDetailPageProps {
    slug: string;
}

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export function RecipeDetailPage({ slug }: RecipeDetailPageProps) {
    const router = useRouter();
    const { data: recipeData, isLoading, isError } = useRecipeDetail(slug);

    const categoryIds = useMemo(() => {
        return recipeData?.data?.categories.map((c) => c.id) ?? [];
    }, [recipeData?.data?.categories]);

    const { data: recommendedData, isLoading: isLoadingRecommended } = useRecommendedRecipes(
        recipeData?.data?.id ?? "",
        categoryIds,
        8,
    );

    if (isLoading) {
        return <RecipeDetailSkeleton />;
    }

    if (isError || !recipeData?.success || !recipeData.data) {
        notFound();
    }

    const recipe = recipeData.data;
    const totalTime = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section with Image */}
            <section className="relative">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-4 left-4 z-20 sm:top-6 sm:left-6">
                    <Button variant="secondary" size="sm" className="gap-2 shadow-lg" onClick={() => router.back()}>
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Button>
                </motion.div>

                {/* Hero Image */}
                <div className="relative h-64 w-full overflow-hidden sm:h-80 md:h-96 lg:h-112.5">
                    {recipe.imageUrl ? (
                        <Image
                            src={recipe.imageUrl}
                            alt={recipe.title}
                            fill
                            priority
                            className="object-cover"
                            sizes="100vw"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                            <ChefHat className="size-24 text-muted-foreground/30" />
                        </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
                </div>

                {/* Title Card Overlay */}
                <div className="relative z-10 mx-auto -mt-24 max-w-4xl px-4 sm:-mt-32 sm:px-6 lg:px-8">
                    <motion.div {...fadeInUp}>
                        <Card className="border-border/50 shadow-xl">
                            <CardContent className="p-6 sm:p-8">
                                {/* Categories */}
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {recipe.categories.map((category) => (
                                        <Badge key={category.id} variant="secondary" className="rounded-full">
                                            {category.name}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Title */}
                                <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                                    {recipe.title}
                                </h1>

                                {/* Description */}
                                {recipe.description && (
                                    <p className="mb-6 text-muted-foreground">{recipe.description}</p>
                                )}

                                {/* Stats */}
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                    {recipe.prepMinutes && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                                                <Timer className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Persiapan</p>
                                                <p className="font-semibold">{recipe.prepMinutes} menit</p>
                                            </div>
                                        </div>
                                    )}
                                    {recipe.cookMinutes && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-orange-500/10">
                                                <Clock className="size-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Memasak</p>
                                                <p className="font-semibold">{recipe.cookMinutes} menit</p>
                                            </div>
                                        </div>
                                    )}
                                    {totalTime > 0 && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-green-500/10">
                                                <Clock className="size-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Total</p>
                                                <p className="font-semibold">{totalTime} menit</p>
                                            </div>
                                        </div>
                                    )}
                                    {recipe.servings && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10">
                                                <Users className="size-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Porsi</p>
                                                <p className="font-semibold">{recipe.servings} orang</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <Separator className="my-6" />
                                <div className="flex flex-wrap gap-3">
                                    <FavoriteButton recipeId={recipe.id} variant="outline" size="sm" showLabel />
                                    <ShareRecipeDialog
                                        recipeTitle={recipe.title}
                                        recipeSlug={recipe.slug}
                                        recipeDescription={recipe.description}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Share2 className="size-4" />
                                            Bagikan
                                        </Button>
                                    </ShareRecipeDialog>
                                    <PrintRecipeDialog recipe={recipe}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Printer className="size-4" />
                                            Cetak
                                        </Button>
                                    </PrintRecipeDialog>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-8 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-5">
                        {/* Ingredients */}
                        <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="lg:col-span-2">
                            <Card className="sticky top-24 border-border/50">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <BookOpen className="size-5 text-primary" />
                                        Bahan-bahan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <motion.ul
                                        variants={staggerContainer}
                                        initial="initial"
                                        animate="animate"
                                        className="space-y-3">
                                        {recipe.ingredients.map((ingredient, index) => (
                                            <motion.li
                                                key={ingredient.id}
                                                variants={fadeInUp}
                                                className="flex items-start gap-3 text-sm">
                                                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                                    {index + 1}
                                                </span>
                                                <span>
                                                    <span className="font-medium">{ingredient.name}</span>
                                                    {(ingredient.amount || ingredient.unit) && (
                                                        <span className="text-muted-foreground">
                                                            {" "}
                                                            - {ingredient.amount} {ingredient.unit}
                                                        </span>
                                                    )}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </motion.ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Instructions */}
                        <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="lg:col-span-3">
                            <Card className="border-border/50">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <ChefHat className="size-5 text-primary" />
                                        Cara Membuat
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <motion.ol
                                        variants={staggerContainer}
                                        initial="initial"
                                        animate="animate"
                                        className="space-y-6">
                                        {recipe.instructions.map((instruction) => (
                                            <motion.li key={instruction.id} variants={fadeInUp} className="flex gap-4">
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                                    {instruction.stepNumber}
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="text-foreground">{instruction.content}</p>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </motion.ol>

                                    {/* Completion */}
                                    <motion.div
                                        {...fadeInUp}
                                        transition={{ delay: 0.3 }}
                                        className="mt-8 flex items-center justify-center gap-3 rounded-lg bg-green-500/10 p-4">
                                        <CheckCircle2 className="size-6 text-green-500" />
                                        <p className="font-medium text-green-700 dark:text-green-400">
                                            Selamat memasak! 🎉
                                        </p>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Recommended Recipes Section */}
            <section className="border-t border-border/50 bg-muted/30 py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Resep Serupa</h2>
                        <p className="mt-2 text-muted-foreground">Temukan resep lainnya yang mungkin Anda suka</p>
                    </motion.div>

                    {isLoadingRecommended ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <RecipeCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : recommendedData?.data && recommendedData.data.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {recommendedData.data.map((recipe, index) => (
                                <motion.div
                                    key={recipe.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}>
                                    <RecipeCard recipe={recipe} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="py-12 text-center">
                            <ChefHat className="mx-auto mb-4 size-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">Belum ada resep serupa</p>
                        </div>
                    )}

                    {/* View All Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-8 text-center">
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/resep">Lihat Semua Resep</Link>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

function RecipeDetailSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Skeleton */}
            <section className="relative">
                <Skeleton className="h-64 w-full sm:h-80 md:h-96 lg:h-112.5" />

                {/* Title Card Skeleton */}
                <div className="relative z-10 mx-auto -mt-24 max-w-4xl px-4 sm:-mt-32 sm:px-6 lg:px-8">
                    <Card className="border-border/50 shadow-xl">
                        <CardContent className="p-6 sm:p-8">
                            {/* Categories */}
                            <div className="mb-4 flex gap-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>

                            {/* Title */}
                            <Skeleton className="mb-4 h-10 w-3/4" />

                            {/* Description */}
                            <Skeleton className="mb-6 h-5 w-full" />
                            <Skeleton className="mb-6 h-5 w-2/3" />

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Skeleton className="size-10 rounded-full" />
                                        <div>
                                            <Skeleton className="mb-1 h-3 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-6" />

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Content Skeleton */}
            <section className="py-8 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-5">
                        {/* Ingredients Skeleton */}
                        <div className="lg:col-span-2">
                            <Card className="border-border/50">
                                <CardHeader className="pb-4">
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Skeleton className="size-5 rounded-full" />
                                            <Skeleton className="h-4 w-full" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Instructions Skeleton */}
                        <div className="lg:col-span-3">
                            <Card className="border-border/50">
                                <CardHeader className="pb-4">
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex gap-4">
                                            <Skeleton className="size-8 shrink-0 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recommended Skeleton */}
            <section className="border-t border-border/50 bg-muted/30 py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 text-center">
                        <Skeleton className="mx-auto h-8 w-48" />
                        <Skeleton className="mx-auto mt-2 h-5 w-64" />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <RecipeCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
