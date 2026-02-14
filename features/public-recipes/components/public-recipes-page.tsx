/**
 * Public Recipes Page Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChefHat, Filter, Loader2, RotateCw, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_NAME } from "@/lib/constants";

type CategoryType = "DISH" | "CUISINE" | "DIET";

interface CategoryData {
    id: string;
    name: string;
    slug: string;
    type: CategoryType;
    _count: {
        recipes: number;
    };
}

import { usePublicCategories, usePublicRecipes } from "../public-recipes.hook";
import { RecipeCard } from "./recipe-card";
import { RecipeGridSkeleton } from "./recipe-card-skeleton";

const categoryTypeLabels: Record<CategoryType, string> = {
    DISH: "Jenis Hidangan",
    CUISINE: "Masakan",
    DIET: "Diet",
};

const sortOptions = [
    { value: "createdAt-desc", label: "Terbaru" },
    { value: "createdAt-asc", label: "Terlama" },
    { value: "title-asc", label: "Nama A-Z" },
    { value: "title-desc", label: "Nama Z-A" },
    { value: "prepMinutes-asc", label: "Waktu Tercepat" },
    { value: "prepMinutes-desc", label: "Waktu Terlama" },
];

export function PublicRecipesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get search params
    const search = searchParams.get("search") ?? "";
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const categoryType = (searchParams.get("categoryType") as CategoryType) ?? undefined;
    const sortParam = searchParams.get("sort") ?? "createdAt-desc";

    // Parse sort param
    const [sortBy, sortOrder] = sortParam.split("-") as [
        "title" | "createdAt" | "prepMinutes" | "cookMinutes",
        "asc" | "desc",
    ];

    // Local state for search input
    const [searchInput, setSearchInput] = useState(search);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch data
    const { data: categoriesData } = usePublicCategories();
    const {
        data: recipesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = usePublicRecipes({
        search: search || undefined,
        categoryId,
        categoryType,
        sortBy,
        sortOrder,
        limit: 12,
    });

    // Ref for infinite scroll
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Use refs to track latest values for intersection observer callback
    const hasNextPageRef = useRef(hasNextPage);
    const isFetchingNextPageRef = useRef(isFetchingNextPage);

    // Keep refs updated
    useEffect(() => {
        hasNextPageRef.current = hasNextPage;
        isFetchingNextPageRef.current = isFetchingNextPage;
    }, [hasNextPage, isFetchingNextPage]);

    // Intersection observer for infinite scroll
    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasNextPageRef.current && !isFetchingNextPageRef.current) {
                    fetchNextPage();
                }
            },
            {
                threshold: 0.1,
                rootMargin: "200px",
            },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [fetchNextPage]);

    // Update URL params
    const updateParams = useCallback(
        (updates: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());

            for (const [key, value] of Object.entries(updates)) {
                if (value === undefined || value === "") {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            }

            const queryString = params.toString();
            router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, {
                scroll: false,
            });
        },
        [pathname, router, searchParams],
    );

    // Handle search submit
    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            updateParams({ search: searchInput || undefined });
        },
        [searchInput, updateParams],
    );

    // Handle filter change
    const handleCategoryChange = useCallback(
        (value: string) => {
            if (value === "all") {
                updateParams({ categoryId: undefined });
            } else {
                updateParams({ categoryId: value });
            }
        },
        [updateParams],
    );

    const handleCategoryTypeChange = useCallback(
        (value: string) => {
            if (value === "all") {
                updateParams({ categoryType: undefined });
            } else {
                updateParams({ categoryType: value });
            }
        },
        [updateParams],
    );

    const handleSortChange = useCallback(
        (value: string) => {
            updateParams({ sort: value });
        },
        [updateParams],
    );

    const clearFilters = useCallback(() => {
        setSearchInput("");
        router.push(pathname, { scroll: false });
    }, [pathname, router]);

    // Group categories by type
    const categoriesByType = useMemo(() => {
        if (!categoriesData?.data) return {} as Record<CategoryType, CategoryData[]>;

        return categoriesData.data.reduce<Record<CategoryType, CategoryData[]>>(
            (acc, category) => {
                if (!acc[category.type]) {
                    acc[category.type] = [];
                }
                acc[category.type].push(category);
                return acc;
            },
            {} as Record<CategoryType, CategoryData[]>,
        );
    }, [categoriesData]);

    // Flatten recipes from infinite query
    const recipes = useMemo(() => {
        return recipesData?.pages.flatMap((page) => page.data) ?? [];
    }, [recipesData]);

    // Check if any filter is active
    const hasActiveFilters = search || categoryId || categoryType || sortParam !== "createdAt-desc";

    // Get active category name
    const activeCategoryName = useMemo(() => {
        if (!categoryId || !categoriesData?.data) return null;
        return categoriesData.data.find((c) => c.id === categoryId)?.name ?? null;
    }, [categoryId, categoriesData]);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-linear-to-br from-primary/10 via-background to-background py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center">
                        <Badge variant="outline" className="mb-4 gap-2">
                            <ChefHat className="size-4" />
                            Koleksi Resep
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Jelajahi Resep {APP_NAME}
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                            Temukan ribuan resep masakan Indonesia yang lezat dan mudah dibuat. Dari masakan tradisional
                            hingga modern.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mx-auto mt-8 max-w-2xl">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari resep..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="h-12 rounded-full pl-10 pr-4"
                                />
                            </div>
                            <Button type="submit" size="lg" className="h-12 rounded-full px-6">
                                Cari
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* Filter & Content Section */}
            <section className="py-8 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Filter Bar */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            {/* Mobile Filter Button */}
                            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="gap-2 lg:hidden">
                                        <SlidersHorizontal className="size-4" />
                                        Filter
                                        {hasActiveFilters && (
                                            <Badge variant="secondary" className="size-5 rounded-full p-0">
                                                !
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2">
                                            <Filter className="size-5" />
                                            Filter Resep
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6 space-y-6">
                                        {/* Category Type Filter */}
                                        <div>
                                            <span className="mb-2 block text-sm font-medium">Tipe Kategori</span>
                                            <Select
                                                value={categoryType ?? "all"}
                                                onValueChange={handleCategoryTypeChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Semua Tipe" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                                    {Object.entries(categoryTypeLabels).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Category Filter */}
                                        <div>
                                            <span className="mb-2 block text-sm font-medium">Kategori</span>
                                            <Select value={categoryId ?? "all"} onValueChange={handleCategoryChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Semua Kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                                    {Object.entries(categoriesByType).map(([type, categories]) => (
                                                        <div key={type}>
                                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                                {categoryTypeLabels[type as CategoryType]}
                                                            </div>
                                                            {categories.map((category) => (
                                                                <SelectItem key={category.id} value={category.id}>
                                                                    {category.name} ({category._count.recipes})
                                                                </SelectItem>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Sort Filter */}
                                        <div>
                                            <span className="mb-2 block text-sm font-medium">Urutkan</span>
                                            <Select value={sortParam} onValueChange={handleSortChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Urutkan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sortOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Clear Filters */}
                                        {hasActiveFilters && (
                                            <SheetClose asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full gap-2"
                                                    onClick={clearFilters}>
                                                    <X className="size-4" />
                                                    Hapus Filter
                                                </Button>
                                            </SheetClose>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Desktop Filters */}
                            <div className="hidden items-center gap-4 lg:flex">
                                <Select value={categoryType ?? "all"} onValueChange={handleCategoryTypeChange}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Semua Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tipe</SelectItem>
                                        {Object.entries(categoryTypeLabels).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={categoryId ?? "all"} onValueChange={handleCategoryChange}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Semua Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {Object.entries(categoriesByType).map(([type, categories]) => (
                                            <div key={type}>
                                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                    {categoryTypeLabels[type as CategoryType]}
                                                </div>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name} ({category._count.recipes})
                                                    </SelectItem>
                                                ))}
                                            </div>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Active Filters Display */}
                            <AnimatePresence>
                                {(search || activeCategoryName) && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="hidden items-center gap-2 lg:flex">
                                        {search && (
                                            <Badge variant="secondary" className="gap-1 pr-1">
                                                &quot;{search}&quot;
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-4 p-0 hover:bg-transparent"
                                                    onClick={() => {
                                                        setSearchInput("");
                                                        updateParams({ search: undefined });
                                                    }}>
                                                    <X className="size-3" />
                                                </Button>
                                            </Badge>
                                        )}
                                        {activeCategoryName && (
                                            <Badge variant="secondary" className="gap-1 pr-1">
                                                {activeCategoryName}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-4 p-0 hover:bg-transparent"
                                                    onClick={() => updateParams({ categoryId: undefined })}>
                                                    <X className="size-3" />
                                                </Button>
                                            </Badge>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-4">
                            <Select value={sortParam} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Urutkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Clear All Filters */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden gap-2 lg:flex"
                                    onClick={clearFilters}>
                                    <X className="size-4" />
                                    Hapus Filter
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <div className="text-sm text-muted-foreground">
                            {isLoading ? (
                                <Skeleton className="h-5 w-40" />
                            ) : (
                                <>
                                    Menampilkan <span className="font-medium text-foreground">{recipes.length}</span>{" "}
                                    resep
                                    {search && (
                                        <>
                                            {" "}
                                            untuk &quot;
                                            <span className="font-medium text-foreground">{search}</span>
                                            &quot;
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Recipe Grid */}
                    {isLoading ? (
                        <RecipeGridSkeleton count={12} />
                    ) : isError ? (
                        <div className="py-20 text-center">
                            <p className="text-lg text-muted-foreground">Terjadi kesalahan saat memuat resep.</p>
                            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                                Coba Lagi
                            </Button>
                        </div>
                    ) : recipes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-20 text-center">
                            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-muted">
                                <ChefHat className="size-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Tidak ada resep ditemukan</h3>
                            <p className="mt-2 text-muted-foreground">
                                {search
                                    ? `Tidak ada resep yang cocok dengan "${search}"`
                                    : "Coba ubah filter atau kata kunci pencarian Anda."}
                            </p>
                            {hasActiveFilters && (
                                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                    Hapus Semua Filter
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                <AnimatePresence mode="popLayout">
                                    {recipes.map((recipe) => (
                                        <RecipeCard key={recipe.id} recipe={recipe} />
                                    ))}
                                </AnimatePresence>
                            </motion.div>

                            {/* Load More Trigger */}
                            <div ref={loadMoreRef} className="mt-8 flex min-h-20 items-center justify-center py-4">
                                {isFetchingNextPage ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="size-5 animate-spin" />
                                        <span>Memuat lebih banyak...</span>
                                    </div>
                                ) : hasNextPage ? (
                                    <Button variant="outline" onClick={() => fetchNextPage()}>
                                        <RotateCw />
                                        Muat Lebih Banyak
                                    </Button>
                                ) : recipes.length > 0 ? (
                                    <p className="text-sm text-muted-foreground">Anda telah melihat semua resep</p>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
