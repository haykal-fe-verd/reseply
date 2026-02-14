/**
 * Recipe Preview Dialog Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { Clock, ImageIcon, Loader2, Users, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type Recipe, useRecipe } from "@/features/recipes";

interface RecipePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipe: Recipe | null;
}

export function RecipePreviewDialog({ open, onOpenChange, recipe }: RecipePreviewDialogProps) {
    // Fetch full recipe data to get ingredients and instructions
    const { data: fullRecipeData, isLoading } = useRecipe(recipe?.id ?? "");
    const fullRecipe = fullRecipeData?.data;

    if (!recipe) return null;

    // Use full recipe data if available, otherwise fall back to passed recipe
    const displayRecipe = fullRecipe ?? recipe;
    const totalTime = (displayRecipe.prepMinutes || 0) + (displayRecipe.cookMinutes || 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] md:max-w-5xl overflow-hidden p-0">
                <DialogTitle className="sr-only">Preview Resep</DialogTitle>
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center p-6">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <ScrollArea className="max-h-[90vh]">
                        <div className="p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl">{displayRecipe.title}</DialogTitle>
                                {displayRecipe.description && (
                                    <DialogDescription className="text-base">
                                        {displayRecipe.description}
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            {/* Image */}
                            {displayRecipe.imageUrl ? (
                                <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg">
                                    <Image
                                        src={displayRecipe.imageUrl}
                                        alt={displayRecipe.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 672px) 100vw, 672px"
                                    />
                                </div>
                            ) : (
                                <div className="mt-4 flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                </div>
                            )}

                            {/* Meta Info */}
                            <div className="mt-4 flex flex-wrap gap-4">
                                {displayRecipe.prepMinutes !== null && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>Persiapan: {displayRecipe.prepMinutes} menit</span>
                                    </div>
                                )}
                                {displayRecipe.cookMinutes !== null && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <UtensilsCrossed className="h-4 w-4" />
                                        <span>Masak: {displayRecipe.cookMinutes} menit</span>
                                    </div>
                                )}
                                {totalTime > 0 && (
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Clock className="h-4 w-4" />
                                        <span>Total: {totalTime} menit</span>
                                    </div>
                                )}
                                {displayRecipe.servings !== null && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{displayRecipe.servings} porsi</span>
                                    </div>
                                )}
                            </div>

                            {/* Categories */}
                            {displayRecipe.categories && displayRecipe.categories.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {displayRecipe.categories.map((rc) => (
                                        <Badge key={rc.categoryId} variant="secondary">
                                            {rc.category.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <Separator className="my-6" />

                            {/* Ingredients */}
                            {displayRecipe.ingredients && displayRecipe.ingredients.length > 0 && (
                                <div>
                                    <h3 className="mb-3 font-semibold">
                                        Bahan-bahan ({displayRecipe.ingredients.length})
                                    </h3>
                                    <ul className="space-y-2">
                                        {displayRecipe.ingredients.map((ingredient) => (
                                            <li key={ingredient.id} className="flex items-start gap-2">
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                <span>
                                                    {ingredient.amount && ingredient.unit
                                                        ? `${ingredient.amount} ${ingredient.unit} `
                                                        : ingredient.amount
                                                          ? `${ingredient.amount} `
                                                          : ""}
                                                    {ingredient.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {displayRecipe.ingredients &&
                                displayRecipe.ingredients.length > 0 &&
                                displayRecipe.instructions &&
                                displayRecipe.instructions.length > 0 && <Separator className="my-6" />}

                            {/* Instructions */}
                            {displayRecipe.instructions && displayRecipe.instructions.length > 0 && (
                                <div>
                                    <h3 className="mb-3 font-semibold">
                                        Langkah-langkah ({displayRecipe.instructions.length})
                                    </h3>
                                    <ol className="space-y-4">
                                        {displayRecipe.instructions.map((instruction) => (
                                            <li key={instruction.id} className="flex gap-3">
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                                                    {instruction.stepNumber}
                                                </span>
                                                <p className="pt-0.5">{instruction.content}</p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
