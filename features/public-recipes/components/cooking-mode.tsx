/**
 * Cooking Mode – Fullscreen step-by-step dengan centang per langkah
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChefHat, ChevronLeft, ChevronRight, List, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const STORAGE_KEY_PREFIX = "cooking-mode-";

interface Instruction {
    id: string;
    stepNumber: number;
    content: string;
}

interface Ingredient {
    id: string;
    name: string;
    amount: string | null;
    unit: string | null;
}

interface CookingModeProps {
    recipeId: string;
    title: string;
    imageUrl: string | null;
    instructions: Instruction[];
    ingredients: Ingredient[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function getStoredCompleted(recipeId: string): number[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${recipeId}`);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as { completedSteps?: number[] };
        return Array.isArray(parsed?.completedSteps) ? parsed.completedSteps : [];
    } catch {
        return [];
    }
}

function setStoredCompleted(recipeId: string, completedSteps: number[]) {
    try {
        sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${recipeId}`, JSON.stringify({ completedSteps }));
    } catch {
        // ignore
    }
}

export function CookingMode({
    recipeId,
    title,
    imageUrl,
    instructions,
    ingredients,
    open,
    onOpenChange,
}: CookingModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>(() => getStoredCompleted(recipeId));
    const [ingredientsOpen, setIngredientsOpen] = useState(false);
    const [completionVisible, setCompletionVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const steps = instructions;
    const totalSteps = steps.length;
    const currentStep = steps[currentIndex];
    const isCompleted = currentStep ? completedSteps.includes(currentStep.stepNumber) : false;

    const persistCompleted = useCallback(
        (next: number[]) => {
            setCompletedSteps(next);
            setStoredCompleted(recipeId, next);
        },
        [recipeId],
    );

    const toggleStepCompleted = useCallback(() => {
        if (!currentStep) return;
        const next = isCompleted
            ? completedSteps.filter((n) => n !== currentStep.stepNumber)
            : [...completedSteps, currentStep.stepNumber].sort((a, b) => a - b);
        persistCompleted(next);
    }, [currentStep, isCompleted, completedSteps, persistCompleted]);

    const goPrev = useCallback(() => {
        setCurrentIndex((i) => Math.max(0, i - 1));
    }, []);

    const goNext = useCallback(() => {
        if (currentIndex === totalSteps - 1) {
            setCompletionVisible(true);
            return;
        }
        setCurrentIndex((i) => Math.min(totalSteps - 1, i + 1));
    }, [currentIndex, totalSteps]);

    useEffect(() => {
        if (!open) return;
        setCurrentIndex(0);
        setCompletionVisible(false);
        setCompletedSteps(getStoredCompleted(recipeId));
    }, [open, recipeId]);

    // Fullscreen API: masuk fullscreen saat buka, keluar saat tutup
    useEffect(() => {
        if (!open || !containerRef.current) return;
        const el = containerRef.current;
        if (typeof el.requestFullscreen === "function") {
            el.requestFullscreen().catch(() => {});
        }
        return () => {
            if (typeof document.exitFullscreen === "function" && document.fullscreenElement === el) {
                document.exitFullscreen().catch(() => {});
            }
        };
    }, [open]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return;
            if (e.key === "Escape") {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                }
                onOpenChange(false);
                return;
            }
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onOpenChange, goPrev, goNext]);

    const handleClose = useCallback(() => {
        if (typeof document.exitFullscreen === "function" && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        onOpenChange(false);
    }, [onOpenChange]);

    if (!open) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-100 flex flex-col bg-background"
            role="dialog"
            aria-modal="true"
            aria-label="Mode masak">
            {/* Header */}
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/50 bg-card/50 px-4 py-3 backdrop-blur-sm sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="min-w-0">
                        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>
                        <p className="text-xs text-muted-foreground">
                            Langkah {currentIndex + 1} dari {totalSteps}
                        </p>
                    </div>
                </div>

                {/* Progress dots */}
                <div className="hidden flex-1 justify-center gap-1 sm:flex">
                    {steps.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setCurrentIndex(i)}
                            className={cn(
                                "size-2 rounded-full transition-colors",
                                i === currentIndex
                                    ? "bg-primary"
                                    : completedSteps.includes(steps[i].stepNumber)
                                      ? "bg-primary/50"
                                      : "bg-muted",
                            )}
                            aria-label={`Langkah ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Tombol Bahan – klik untuk tampilkan list */}
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0"
                    onClick={() => setIngredientsOpen(true)}
                    aria-expanded={ingredientsOpen}
                    aria-controls="cooking-mode-ingredients-panel">
                    <List className="size-4" />
                    <span className="hidden sm:inline">Bahan</span>
                </Button>
            </header>

            {/* Panel list bahan – di dalam container agar tetap terlihat di fullscreen */}
            <AnimatePresence>
                {ingredientsOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-10 bg-black/50"
                            onClick={() => setIngredientsOpen(false)}
                            aria-hidden="true"
                        />
                        <motion.div
                            id="cooking-mode-ingredients-panel"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Daftar bahan"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.25 }}
                            className="fixed top-0 right-0 bottom-0 z-20 flex w-full max-w-sm flex-col border-l border-border bg-background shadow-xl">
                            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                <h2 className="text-lg font-semibold text-foreground">Bahan-bahan</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIngredientsOpen(false)}
                                    aria-label="Tutup daftar bahan">
                                    <X className="size-5" />
                                </Button>
                            </div>
                            <ul className="flex-1 overflow-y-auto p-4 space-y-3">
                                {ingredients.map((ing, index) => (
                                    <li
                                        key={ing.id}
                                        className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                                            {index + 1}
                                        </span>
                                        <span className="flex-1">
                                            <span className="font-medium text-foreground">{ing.name}</span>
                                            {(ing.amount || ing.unit) && (
                                                <span className="text-muted-foreground">
                                                    {" "}
                                                    – {ing.amount} {ing.unit}
                                                </span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    {completionVisible ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
                            <div className="flex size-20 items-center justify-center rounded-full bg-green-500/20">
                                <CheckCircle2 className="size-12 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">Selamat! Resep selesai</h2>
                                <p className="mt-2 text-muted-foreground">
                                    {title} sudah siap disajikan. Selamat menikmati!
                                </p>
                            </div>
                            <Button size="lg" onClick={handleClose}>
                                Tutup Mode Masak
                            </Button>
                        </motion.div>
                    ) : currentStep ? (
                        <motion.div
                            key={currentStep.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex min-h-0 flex-1 flex-col">
                            {/* Step image – tinggi tetap, tidak perlu scroll */}
                            <div className="relative h-[28vh] w-full shrink-0 bg-muted">
                                {imageUrl ? (
                                    <Image src={imageUrl} alt="" fill className="object-cover" sizes="100vw" priority />
                                ) : (
                                    <div className="flex size-full items-center justify-center">
                                        <ChefHat className="size-16 text-muted-foreground/30" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
                                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                        {currentStep.stepNumber}
                                    </span>
                                    Langkah {currentStep.stepNumber}
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col justify-center overflow-y-auto p-6 sm:p-8">
                                <p className="text-lg leading-relaxed text-foreground sm:text-xl">
                                    {currentStep.content}
                                </p>

                                <div className="mt-6 flex items-center gap-3">
                                    <Checkbox
                                        id="step-done"
                                        checked={isCompleted}
                                        onCheckedChange={toggleStepCompleted}
                                        aria-label="Tandai langkah ini selesai"
                                    />
                                    <label
                                        htmlFor="step-done"
                                        className="cursor-pointer text-sm font-medium text-foreground">
                                        Tandai selesai
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </main>

            {/* Footer navigation – compact di mobile agar tidak terpotong */}
            {totalSteps > 0 && !completionVisible && (
                <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-card/50 px-3 py-3 backdrop-blur-sm safe-area-pb sm:gap-4 sm:px-6 sm:py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5 sm:gap-2"
                        onClick={handleClose}>
                        Keluar
                    </Button>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="min-w-0 shrink-0 gap-1.5 sm:gap-2"
                            onClick={goPrev}
                            disabled={currentIndex === 0}>
                            <ChevronLeft className="size-4 sm:size-5" />
                            <span className="hidden sm:inline">Sebelumnya</span>
                        </Button>
                        <span className="min-w-10 shrink-0 text-center text-xs text-muted-foreground sm:min-w-12 sm:text-sm">
                            {currentIndex + 1}/{totalSteps}
                        </span>
                        <Button
                            size="sm"
                            className="min-w-0 shrink-0 gap-1.5 sm:gap-2"
                            onClick={goNext}>
                            <span className="hidden sm:inline">
                                {currentIndex === totalSteps - 1 ? "Selesai" : "Lanjut"}
                            </span>
                            <ChevronRight className="size-4 sm:size-5" />
                        </Button>
                    </div>
                </footer>
            )}
        </div>
    );
}

interface CookingModeTriggerProps {
    recipe: {
        id: string;
        title: string;
        imageUrl: string | null;
        instructions: { id: string; stepNumber: number; content: string }[];
        ingredients: {
            id: string;
            name: string;
            amount: string | null;
            unit: string | null;
        }[];
    };
    children: React.ReactNode;
}

export function CookingModeTrigger({ recipe, children }: CookingModeTriggerProps) {
    const [open, setOpen] = useState(false);
    const handleOpen = useCallback(() => setOpen(true), []);

    const hasSteps = recipe.instructions.length > 0;

    if (!hasSteps) return null;

    return (
        <>
            {React.isValidElement(children) ? (
                React.cloneElement(
                    children as React.ReactElement<{
                        onClick?: (e: React.MouseEvent) => void;
                    }>,
                    {
                        onClick: (e: React.MouseEvent) => {
                            (
                                children as React.ReactElement<{
                                    onClick?: (e: React.MouseEvent) => void;
                                }>
                            ).props.onClick?.(e);
                            handleOpen();
                        },
                    },
                )
            ) : (
                <button type="button" onClick={handleOpen}>
                    {children}
                </button>
            )}
            <CookingMode
                recipeId={recipe.id}
                title={recipe.title}
                imageUrl={recipe.imageUrl}
                instructions={recipe.instructions}
                ingredients={recipe.ingredients}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}
