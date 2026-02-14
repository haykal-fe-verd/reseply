/**
 * Print Recipe Dialog Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { ChefHat, Clock, Printer, Timer, Users } from "lucide-react";
import { useCallback, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { RecipeDetail } from "@/features/public-recipes";
import { APP_NAME } from "@/lib/constants";

interface PrintRecipeDialogProps {
    recipe: RecipeDetail;
    children: React.ReactNode;
}

export function PrintRecipeDialog({ recipe, children }: PrintRecipeDialogProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const totalTime = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

    const handlePrint = useCallback(() => {
        const printContent = printRef.current;
        if (!printContent) return;

        // Create a new window for printing
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Mohon izinkan popup untuk mencetak resep");
            return;
        }

        // Write the print content with styles
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${recipe.title} - ${APP_NAME}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #1a1a1a;
                        padding: 20mm;
                        max-width: 210mm;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 24px;
                        padding-bottom: 16px;
                        border-bottom: 2px solid #e5e5e5;
                    }
                    .logo {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 8px;
                    }
                    .title {
                        font-size: 28px;
                        font-weight: 700;
                        color: #1a1a1a;
                        margin-bottom: 8px;
                    }
                    .description {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 16px;
                    }
                    .categories {
                        display: flex;
                        gap: 8px;
                        justify-content: center;
                        flex-wrap: wrap;
                        margin-bottom: 16px;
                    }
                    .category {
                        background: #f5f5f5;
                        padding: 4px 12px;
                        border-radius: 9999px;
                        font-size: 12px;
                        color: #666;
                    }
                    .stats {
                        display: flex;
                        justify-content: center;
                        gap: 24px;
                        margin-bottom: 16px;
                    }
                    .stat {
                        text-align: center;
                    }
                    .stat-icon {
                        font-size: 20px;
                        margin-bottom: 4px;
                    }
                    .stat-label {
                        font-size: 11px;
                        color: #888;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .stat-value {
                        font-size: 14px;
                        font-weight: 600;
                        color: #333;
                    }
                    .content {
                        display: grid;
                        grid-template-columns: 1fr 1.5fr;
                        gap: 32px;
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1a1a1a;
                        margin-bottom: 16px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #e5e5e5;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .ingredients-list {
                        list-style: none;
                    }
                    .ingredients-list li {
                        padding: 8px 0;
                        border-bottom: 1px dashed #e5e5e5;
                        display: flex;
                        gap: 8px;
                        font-size: 14px;
                    }
                    .ingredients-list li:last-child {
                        border-bottom: none;
                    }
                    .ingredient-number {
                        background: #f5f5f5;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 11px;
                        font-weight: 600;
                        color: #666;
                        flex-shrink: 0;
                    }
                    .ingredient-name {
                        font-weight: 500;
                    }
                    .ingredient-amount {
                        color: #666;
                    }
                    .instructions-list {
                        list-style: none;
                        counter-reset: step-counter;
                    }
                    .instructions-list li {
                        padding: 12px 0;
                        display: flex;
                        gap: 16px;
                        font-size: 14px;
                    }
                    .step-number {
                        background: #333;
                        color: white;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        font-weight: 600;
                        flex-shrink: 0;
                    }
                    .step-content {
                        padding-top: 4px;
                    }
                    .footer {
                        margin-top: 32px;
                        padding-top: 16px;
                        border-top: 2px solid #e5e5e5;
                        text-align: center;
                        font-size: 12px;
                        color: #888;
                    }
                    .footer a {
                        color: #666;
                        text-decoration: none;
                    }
                    @media print {
                        body {
                            padding: 10mm;
                        }
                        .content {
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">${APP_NAME}</div>
                    <h1 class="title">${recipe.title}</h1>
                    ${recipe.description ? `<p class="description">${recipe.description}</p>` : ""}
                    <div class="categories">
                        ${recipe.categories.map((c) => `<span class="category">${c.name}</span>`).join("")}
                    </div>
                    <div class="stats">
                        ${recipe.prepMinutes ? `<div class="stat"><div class="stat-icon">⏱️</div><div class="stat-label">Persiapan</div><div class="stat-value">${recipe.prepMinutes} menit</div></div>` : ""}
                        ${recipe.cookMinutes ? `<div class="stat"><div class="stat-icon">🍳</div><div class="stat-label">Memasak</div><div class="stat-value">${recipe.cookMinutes} menit</div></div>` : ""}
                        ${totalTime > 0 ? `<div class="stat"><div class="stat-icon">⏰</div><div class="stat-label">Total</div><div class="stat-value">${totalTime} menit</div></div>` : ""}
                        ${recipe.servings ? `<div class="stat"><div class="stat-icon">👥</div><div class="stat-label">Porsi</div><div class="stat-value">${recipe.servings} orang</div></div>` : ""}
                    </div>
                </div>
                <div class="content">
                    <div class="ingredients">
                        <h2 class="section-title">📖 Bahan-bahan</h2>
                        <ul class="ingredients-list">
                            ${recipe.ingredients
                                .map(
                                    (ing, idx) => `
                                <li>
                                    <span class="ingredient-number">${idx + 1}</span>
                                    <span>
                                        <span class="ingredient-name">${ing.name}</span>
                                        ${ing.amount || ing.unit ? `<span class="ingredient-amount"> - ${ing.amount ?? ""} ${ing.unit ?? ""}</span>` : ""}
                                    </span>
                                </li>
                            `,
                                )
                                .join("")}
                        </ul>
                    </div>
                    <div class="instructions">
                        <h2 class="section-title">👨‍🍳 Cara Membuat</h2>
                        <ol class="instructions-list">
                            ${recipe.instructions
                                .map(
                                    (inst) => `
                                <li>
                                    <span class="step-number">${inst.stepNumber}</span>
                                    <span class="step-content">${inst.content}</span>
                                </li>
                            `,
                                )
                                .join("")}
                        </ol>
                    </div>
                </div>
                <div class="footer">
                    <p>Resep ini dicetak dari <a href="${typeof window !== "undefined" ? window.location.origin : ""}">${APP_NAME}</a></p>
                    <p>🎉 Selamat Memasak!</p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        // Print after content is loaded
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }, [recipe, totalTime]);

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Printer className="size-5 text-primary" />
                        Cetak Resep
                    </DialogTitle>
                    <DialogDescription>
                        Preview resep sebelum mencetak. Klik tombol cetak untuk melanjutkan.
                    </DialogDescription>
                </DialogHeader>

                {/* Print Preview */}
                <div ref={printRef} className="rounded-lg border border-border bg-white p-6 text-black dark:bg-white">
                    {/* Header */}
                    <div className="mb-6 border-b border-neutral-200 pb-4 text-center">
                        <p className="mb-2 text-sm text-neutral-500">{APP_NAME}</p>
                        <h2 className="mb-2 text-2xl font-bold text-neutral-900">{recipe.title}</h2>
                        {recipe.description && <p className="mb-4 text-sm text-neutral-600">{recipe.description}</p>}

                        {/* Categories */}
                        <div className="mb-4 flex flex-wrap justify-center gap-2">
                            {recipe.categories.map((category) => (
                                <Badge
                                    key={category.id}
                                    variant="secondary"
                                    className="rounded-full bg-neutral-100 text-neutral-700">
                                    {category.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-6">
                            {recipe.prepMinutes && (
                                <div className="text-center">
                                    <Timer className="mx-auto mb-1 size-5 text-neutral-400" />
                                    <p className="text-[10px] uppercase tracking-wide text-neutral-500">Persiapan</p>
                                    <p className="text-sm font-semibold text-neutral-700">{recipe.prepMinutes} menit</p>
                                </div>
                            )}
                            {recipe.cookMinutes && (
                                <div className="text-center">
                                    <Clock className="mx-auto mb-1 size-5 text-neutral-400" />
                                    <p className="text-[10px] uppercase tracking-wide text-neutral-500">Memasak</p>
                                    <p className="text-sm font-semibold text-neutral-700">{recipe.cookMinutes} menit</p>
                                </div>
                            )}
                            {totalTime > 0 && (
                                <div className="text-center">
                                    <Clock className="mx-auto mb-1 size-5 text-neutral-400" />
                                    <p className="text-[10px] uppercase tracking-wide text-neutral-500">Total</p>
                                    <p className="text-sm font-semibold text-neutral-700">{totalTime} menit</p>
                                </div>
                            )}
                            {recipe.servings && (
                                <div className="text-center">
                                    <Users className="mx-auto mb-1 size-5 text-neutral-400" />
                                    <p className="text-[10px] uppercase tracking-wide text-neutral-500">Porsi</p>
                                    <p className="text-sm font-semibold text-neutral-700">{recipe.servings} orang</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Ingredients */}
                        <div>
                            <h3 className="mb-3 flex items-center gap-2 border-b border-neutral-200 pb-2 text-base font-semibold text-neutral-900">
                                <span>📖</span>
                                Bahan-bahan
                            </h3>
                            <ul className="space-y-2">
                                {recipe.ingredients.map((ingredient, index) => (
                                    <li key={ingredient.id} className="flex items-start gap-2 text-sm">
                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-600">
                                            {index + 1}
                                        </span>
                                        <span className="text-neutral-700">
                                            <span className="font-medium">{ingredient.name}</span>
                                            {(ingredient.amount || ingredient.unit) && (
                                                <span className="text-neutral-500">
                                                    {" "}
                                                    - {ingredient.amount} {ingredient.unit}
                                                </span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Instructions */}
                        <div>
                            <h3 className="mb-3 flex items-center gap-2 border-b border-neutral-200 pb-2 text-base font-semibold text-neutral-900">
                                <ChefHat className="size-4" />
                                Cara Membuat
                            </h3>
                            <ol className="space-y-3">
                                {recipe.instructions.map((instruction) => (
                                    <li key={instruction.id} className="flex gap-3 text-sm">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                                            {instruction.stepNumber}
                                        </span>
                                        <span className="pt-0.5 text-neutral-700">{instruction.content}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-500">
                        <p>
                            Resep ini dicetak dari <span className="font-medium">{APP_NAME}</span>
                        </p>
                        <p className="mt-1">🎉 Selamat Memasak!</p>
                    </div>
                </div>

                <Separator />

                {/* Print Button */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button onClick={handlePrint} className="w-full gap-2" size="lg">
                        <Printer className="size-5" />
                        Cetak Sekarang
                    </Button>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
