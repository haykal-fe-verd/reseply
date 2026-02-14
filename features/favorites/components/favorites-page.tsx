/**
 * Favorites Page Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Filter, Heart, HeartOff, Loader2, RotateCw, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    FavoriteCard,
    FavoriteGridSkeleton,
    useFavoriteCategories,
    useFavorites,
    useFavoritesCount,
    useRemoveAllFavorites,
} from "@/features/favorites";

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

const categoryTypeLabels: Record<CategoryType, string> = {
    DISH: "Jenis Hidangan",
    CUISINE: "Masakan",
    DIET: "Diet",
};

const sortOptions = [
    { value: "favoritedAt-desc", label: "Terbaru Disimpan" },
    { value: "favoritedAt-asc", label: "Terlama Disimpan" },
    { value: "title-asc", label: "Nama A-Z" },
    { value: "title-desc", label: "Nama Z-A" },
    { value: "prepMinutes-asc", label: "Waktu Tercepat" },
    { value: "prepMinutes-desc", label: "Waktu Terlama" },
];

export function FavoritesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get search params
    const search = searchParams.get("search") ?? "";
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const categoryType = (searchParams.get("categoryType") as CategoryType) ?? undefined;
    const sortParam = searchParams.get("sort") ?? "favoritedAt-desc";
    const pageParam = searchParams.get("page") ?? "1";

    // Parse sort param
    const [sortBy, sortOrder] = sortParam.split("-") as [
        "title" | "favoritedAt" | "prepMinutes" | "cookMinutes",
        "asc" | "desc",
    ];

    const page = Number.parseInt(pageParam, 10);

    // Local state
    const [searchInput, setSearchInput] = useState(search);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch data
    const { data: categoriesData } = useFavoriteCategories();
    const { data: countData } = useFavoritesCount();
    const {
        data: favoritesData,
        isLoading,
        isError,
        refetch,
    } = useFavorites({
        page,
        limit: 12,
        search: search || undefined,
        categoryId,
        categoryType,
        sortBy,
        sortOrder,
    });

    const { mutate: removeAllFavorites, isPending: isRemovingAll } = useRemoveAllFavorites();

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

            // Reset page when changing filters
            if (!updates.page) {
                params.delete("page");
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

    // Handle filter changes
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

    const handlePageChange = useCallback(
        (newPage: number) => {
            updateParams({ page: newPage.toString() });
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

    // Check if any filter is active
    const hasActiveFilters = search || categoryId || categoryType || sortParam !== "favoritedAt-desc";

    const favorites = favoritesData?.data ?? [];
    const pagination = favoritesData?.pagination;
    const totalFavorites = countData?.count ?? 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-linear-to-br from-red-500/10 via-background to-background py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-500/10">
                            <Heart className="size-8 text-red-500" />
                        </motion.div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Resep Favorit Saya
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                            Koleksi resep yang telah Anda simpan. Temukan kembali resep favorit Anda dengan mudah.
                        </p>
                        {totalFavorites > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mt-4">
                                <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm">
                                    <Heart className="size-4 fill-red-500 text-red-500" />
                                    {totalFavorites} resep tersimpan
                                </Badge>
                            </motion.div>
                        )}
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
                                    placeholder="Cari di favorit..."
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
                                            Filter Favorit
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

                            {/* Clear Filters (Desktop) */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden gap-2 lg:inline-flex"
                                    onClick={clearFilters}>
                                    <X className="size-4" />
                                    Hapus Filter
                                </Button>
                            )}
                        </div>

                        {/* Sort & Actions */}
                        <div className="flex items-center gap-3">
                            <Select value={sortParam} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-44">
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

                            {/* Remove All Button */}
                            {totalFavorites > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                            disabled={isRemovingAll}>
                                            {isRemovingAll ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="size-4" />
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Hapus Semua Favorit?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini akan menghapus semua {totalFavorites} resep dari koleksi
                                                favorit Anda. Tindakan ini tidak dapat dibatalkan.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => removeAllFavorites()}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Hapus Semua
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">Filter aktif:</span>
                            {search && (
                                <Badge variant="secondary" className="gap-1">
                                    Pencarian: {search}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchInput("");
                                            updateParams({ search: undefined });
                                        }}
                                        className="ml-1 hover:text-destructive">
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            )}
                            {categoryType && (
                                <Badge variant="secondary" className="gap-1">
                                    {categoryTypeLabels[categoryType]}
                                    <button
                                        type="button"
                                        onClick={() => updateParams({ categoryType: undefined })}
                                        className="ml-1 hover:text-destructive">
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            )}
                            {categoryId && categoriesData?.data && (
                                <Badge variant="secondary" className="gap-1">
                                    {categoriesData.data.find((c) => c.id === categoryId)?.name}
                                    <button
                                        type="button"
                                        onClick={() => updateParams({ categoryId: undefined })}
                                        className="ml-1 hover:text-destructive">
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            )}
                        </motion.div>
                    )}

                    {/* Content */}
                    {isLoading ? (
                        <FavoriteGridSkeleton count={12} />
                    ) : isError ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-20 text-center">
                            <Card className="mx-auto max-w-md border-destructive/50">
                                <CardContent className="pt-6">
                                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                                        <X className="size-8 text-destructive" />
                                    </div>
                                    <h3 className="text-lg font-semibold">Terjadi Kesalahan</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Gagal memuat data favorit. Silakan coba lagi.
                                    </p>
                                    <Button variant="outline" className="mt-4 gap-2" onClick={() => refetch()}>
                                        <RotateCw className="size-4" />
                                        Coba Lagi
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : favorites.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-20 text-center">
                            <Card className="mx-auto max-w-md border-border/50">
                                <CardContent className="pt-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 15,
                                        }}
                                        className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                                        <HeartOff className="size-8 text-muted-foreground" />
                                    </motion.div>
                                    <h3 className="text-lg font-semibold">
                                        {hasActiveFilters ? "Tidak ada hasil" : "Belum ada favorit"}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {hasActiveFilters
                                            ? "Tidak ada resep favorit yang sesuai dengan filter Anda."
                                            : "Mulai simpan resep favorit Anda dengan menekan tombol hati pada resep yang Anda sukai."}
                                    </p>
                                    {hasActiveFilters ? (
                                        <Button variant="outline" className="mt-4 gap-2" onClick={clearFilters}>
                                            <X className="size-4" />
                                            Hapus Filter
                                        </Button>
                                    ) : (
                                        <Button className="mt-4" asChild>
                                            <a href="/resep">Jelajahi Resep</a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <>
                            {/* Recipe Grid */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                <AnimatePresence mode="popLayout">
                                    {favorites.map((recipe, index) => (
                                        <FavoriteCard key={recipe.id} recipe={recipe} index={index} />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-12 flex justify-center">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (pagination.hasPrevPage) {
                                                            handlePageChange(page - 1);
                                                        }
                                                    }}
                                                    className={
                                                        !pagination.hasPrevPage ? "pointer-events-none opacity-50" : ""
                                                    }
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                                .filter((p) => {
                                                    // Show first, last, current and adjacent pages
                                                    if (p === 1 || p === pagination.totalPages) return true;
                                                    if (Math.abs(p - page) <= 1) return true;
                                                    return false;
                                                })
                                                .map((p, idx, arr) => (
                                                    <PaginationItem key={p}>
                                                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                            <span className="px-2 text-muted-foreground">...</span>
                                                        )}
                                                        <PaginationLink
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePageChange(p);
                                                            }}
                                                            isActive={page === p}>
                                                            {p}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}

                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (pagination.hasNextPage) {
                                                            handlePageChange(page + 1);
                                                        }
                                                    }}
                                                    className={
                                                        !pagination.hasNextPage ? "pointer-events-none opacity-50" : ""
                                                    }
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
