/**
 * Recipe Page Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { RecipeTable } from "@/features/recipes";

export function RecipePage() {
    return (
        <div className="mx-auto max-w-7xl overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Manajemen Resep</h1>
                <p className="text-muted-foreground">Kelola semua resep Anda di sini.</p>
            </div>
            <RecipeTable />
        </div>
    );
}
