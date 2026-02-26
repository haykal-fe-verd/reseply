"use client";

import { motion } from "framer-motion";
import { Clock, Loader2, Timer, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    type CollectionRecipeItem,
    useRemoveRecipeFromCollection,
} from "@/features/favorites";

interface CollectionRecipeCardProps {
    recipe: CollectionRecipeItem;
    collectionId: string;
    collectionSlug: string;
    isOwner: boolean;
    index?: number;
}

export function CollectionRecipeCard({
    recipe,
    collectionId,
    collectionSlug,
    isOwner,
    index = 0,
}: CollectionRecipeCardProps) {
    const { mutate: removeFromCollection, isPending } = useRemoveRecipeFromCollection();
    const totalTime = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            layout
            className="h-full"
        >
            <Card className="group relative h-full overflow-hidden border-border/50 p-0 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                {isOwner && (
                    <div className="absolute top-3 right-3 z-10">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="size-8 rounded-full bg-background/90 shadow-sm backdrop-blur-sm hover:bg-destructive/20 hover:text-destructive"
                            aria-label={`Hapus ${recipe.title} dari koleksi`}
                            disabled={isPending}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeFromCollection({ collectionId, recipeId: recipe.id });
                            }}
                        >
                            {isPending ? (
                                <Loader2 className="size-4 animate-spin" aria-hidden />
                            ) : (
                                <X className="size-4" />
                            )}
                        </Button>
                    </div>
                )}

                <Link href={`/resep/${recipe.slug}`} className="flex h-full flex-col">
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                        {recipe.imageUrl ? (
                            <Image
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-all duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted/50">
                                <span className="text-4xl">🍳</span>
                            </div>
                        )}
                    </div>
                    <CardContent className="flex-1 space-y-2 p-4">
                        {recipe.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {recipe.categories.slice(0, 2).map((category) => (
                                    <Badge
                                        key={category.id}
                                        variant="secondary"
                                        className="rounded-full text-[10px] font-medium"
                                    >
                                        {category.name}
                                    </Badge>
                                ))}
                                {recipe.categories.length > 2 && (
                                    <Badge variant="outline" className="rounded-full text-[10px] font-medium">
                                        +{recipe.categories.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}
                        <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground group-hover:text-primary">
                            {recipe.title}
                        </h3>
                        {recipe.description && (
                            <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
                        )}
                    </CardContent>
                    <CardFooter className="border-t border-border/50 px-4 py-2">
                        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                                {totalTime > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="size-3.5" />
                                        {totalTime} mnt
                                    </span>
                                )}
                                {recipe.servings && (
                                    <span className="flex items-center gap-1">
                                        <Users className="size-3.5" />
                                        {recipe.servings} porsi
                                    </span>
                                )}
                            </div>
                            {recipe.prepMinutes != null && (
                                <span className="flex items-center gap-1 text-primary">
                                    <Timer className="size-3.5" />
                                    {recipe.prepMinutes}m
                                </span>
                            )}
                        </div>
                    </CardFooter>
                </Link>
            </Card>
        </motion.div>
    );
}
