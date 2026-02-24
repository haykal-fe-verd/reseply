/**
 * Calorie Checker Dialog Component
 * Dialog untuk menampilkan estimasi kalori dari bahan-bahan resep
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

"use client";

import { AlertCircle, Flame, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCalories } from "../hooks/use-calories";

interface Ingredient {
    id: string;
    name: string;
    amount?: string | number | null;
    unit?: string | null;
}

interface CalorieCheckerDialogProps {
    ingredients: Ingredient[];
    servings?: number | null;
    recipeTitle: string;
}

export function CalorieCheckerDialog({
    ingredients,
    servings,
    recipeTitle,
}: CalorieCheckerDialogProps) {
    const [open, setOpen] = useState(false);
    const { data, isLoading, error, fetchCalories, reset } = useCalories();

    const handleCheckCalories = () => {
        fetchCalories(ingredients, servings ?? undefined);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setTimeout(reset, 200);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Flame className="size-4 text-orange-500" />
                    Cek Kalori
                </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[85dvh] flex-col overflow-hidden sm:max-h-[90vh] sm:max-w-md">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="size-5 text-yellow-500" />
                        Estimasi Kalori
                    </DialogTitle>
                    <DialogDescription>
                        Estimasi kalori untuk <strong>{recipeTitle}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                <div className="space-y-4">
                    {!data && !isLoading && (
                        <div className="py-4 text-center">
                            <p className="mb-4 text-sm text-muted-foreground">
                                Klik tombol di bawah untuk menghitung estimasi kalori menggunakan AI
                            </p>
                            <Button onClick={handleCheckCalories} className="gap-2">
                                <Flame className="size-4" />
                                Hitung Kalori
                            </Button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="size-8 animate-spin text-primary" />
                            <p className="mt-2 text-sm text-muted-foreground">Menghitung kalori...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
                            <AlertCircle className="size-5 shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {data && !isLoading && (
                        <div className="space-y-4">
                            {/* Total Calories */}
                            <div className="rounded-lg bg-linear-to-r from-orange-500/10 to-red-500/10 p-4 text-center">
                                <p className="text-sm text-muted-foreground">Total Kalori</p>
                                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                                    {data.totalCalories.toLocaleString()}
                                    <span className="text-lg font-normal"> kkal</span>
                                </p>
                                {servings && data.caloriesPerServing > 0 && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        ~{data.caloriesPerServing} kkal per porsi
                                    </p>
                                )}
                            </div>

                            {/* Ingredients Breakdown */}
                            {data.ingredients && data.ingredients.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Rincian per Bahan:</h4>
                                    <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
                                        {data.ingredients.map((ing, index) => (
                                            <li
                                                key={index}
                                                className="flex justify-between gap-2 border-b border-border/50 pb-1"
                                            >
                                                <span className="truncate">{ing.name}</span>
                                                <span className="shrink-0 text-muted-foreground">
                                                    ~{ing.estimatedCalories} kkal
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="rounded-lg bg-muted p-3">
                                <p className="text-sm">{data.summary}</p>
                            </div>

                            {/* Health Tip */}
                            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    <strong>Tips:</strong> {data.healthTip}
                                </p>
                            </div>

                            {/* Recheck Button */}
                            <Button variant="outline" className="w-full gap-2" onClick={handleCheckCalories}>
                                <Flame className="size-4" />
                                Hitung Ulang
                            </Button>
                        </div>
                    )}
                </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
