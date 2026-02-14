/**
 * Category Page Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import { CategoryTable } from "@/features/category";

export function CategoryPage() {
    return (
        <div className="mx-auto max-w-7xl overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Manajemen Kategori</h1>
                <p className="text-muted-foreground">Kelola kategori untuk mengorganisasi resep Anda.</p>
            </div>
            <CategoryTable />
        </div>
    );
}
