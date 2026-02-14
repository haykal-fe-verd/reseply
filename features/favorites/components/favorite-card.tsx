/**
 * Favorite Recipe Card Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Timer, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FavoriteButton, type FavoriteRecipe } from "@/features/favorites";

interface FavoriteCardProps {
    recipe: FavoriteRecipe;
    index?: number;
}

export function FavoriteCard({ recipe, index = 0 }: FavoriteCardProps) {
    const totalTime = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            layout
            className="h-full">
            <Card className="group relative h-full overflow-hidden border-border/50 p-0 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                {/* Favorite Button */}
                <div className="absolute top-3 right-3 z-10">
                    <FavoriteButton
                        recipeId={recipe.id}
                        className="bg-background/80 backdrop-blur-sm hover:bg-background"
                        tooltipSide="left"
                    />
                </div>

                <Link href={`/resep/${recipe.slug}`} className="flex h-full flex-col">
                    {/* Image */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                        {recipe.imageUrl ? (
                            <Image
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-all duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted/50">
                                <span className="text-4xl">🍳</span>
                            </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        {/* Favorited Date Badge */}
                        <div className="absolute bottom-2 left-2 z-10">
                            <Badge
                                variant="secondary"
                                className="gap-1.5 bg-background/90 text-[10px] backdrop-blur-sm">
                                <Calendar className="size-3" />
                                {new Date(recipe.favoritedAt).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </Badge>
                        </div>
                    </div>

                    {/* Content */}
                    <CardContent className="flex-1 space-y-3 p-4">
                        {/* Categories */}
                        {recipe.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {recipe.categories.slice(0, 2).map((category) => (
                                    <Badge
                                        key={category.id}
                                        variant="secondary"
                                        className="rounded-full text-[10px] font-medium">
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

                        {/* Title */}
                        <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                            {recipe.title}
                        </h3>

                        {/* Description */}
                        {recipe.description && (
                            <p className="line-clamp-2 text-sm text-muted-foreground">{recipe.description}</p>
                        )}
                    </CardContent>

                    {/* Footer */}
                    <CardFooter className="mt-auto border-t border-border/50 px-4 py-3">
                        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                                {totalTime > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="size-3.5" />
                                        <span>{totalTime} menit</span>
                                    </div>
                                )}
                                {recipe.servings && (
                                    <div className="flex items-center gap-1">
                                        <Users className="size-3.5" />
                                        <span>{recipe.servings} porsi</span>
                                    </div>
                                )}
                            </div>
                            {recipe.prepMinutes && (
                                <div className="flex items-center gap-1 text-primary">
                                    <Timer className="size-3.5" />
                                    <span>{recipe.prepMinutes}m prep</span>
                                </div>
                            )}
                        </div>
                    </CardFooter>
                </Link>
            </Card>
        </motion.div>
    );
}
