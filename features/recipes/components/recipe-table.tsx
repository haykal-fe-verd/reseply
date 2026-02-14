/**
 * Recipe Table Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Clock, Eye, ImageIcon, MoreHorizontal, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCategories } from "@/features/category";
import { type Recipe, RecipeDeleteDialog, RecipeFormDialog, RecipePreviewDialog, useRecipes } from "@/features/recipes";

// Default values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

export function RecipeTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State for dialogs
    const [formDialogOpen, setFormDialogOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
    const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null);

    // State for table
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    // Initialize state from URL params
    const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
    const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;
    const sortBy = searchParams.get("sortBy") || DEFAULT_SORT_BY;
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || DEFAULT_SORT_ORDER;
    const searchParam = searchParams.get("search") || "";
    const categoryIdParam = searchParams.get("categoryId") || "";

    // Local search state for input (to enable debounce)
    const [search, setSearch] = React.useState(searchParam);
    const [debouncedSearch, setDebouncedSearch] = React.useState(searchParam);
    const [categoryId, setCategoryId] = React.useState(categoryIdParam);

    // Fetch categories for filter
    const { data: categoriesData } = useCategories({ limit: 100 });

    // Sorting state derived from URL
    const sorting: SortingState = sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [];

    // Update URL params helper
    const updateParams = React.useCallback(
        (updates: Record<string, string | number | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());

            for (const [key, value] of Object.entries(updates)) {
                // Remove param if value is default or undefined
                const isDefault =
                    (key === "page" && value === DEFAULT_PAGE) ||
                    (key === "limit" && value === DEFAULT_LIMIT) ||
                    (key === "sortBy" && value === DEFAULT_SORT_BY) ||
                    (key === "sortOrder" && value === DEFAULT_SORT_ORDER) ||
                    (key === "search" && value === "") ||
                    (key === "categoryId" && value === "") ||
                    value === undefined;

                if (isDefault) {
                    params.delete(key);
                } else {
                    params.set(key, String(value));
                }
            }

            const queryString = params.toString();
            router.push(queryString ? `${pathname}?${queryString}` : pathname, {
                scroll: false,
            });
        },
        [searchParams, pathname, router],
    );

    // Sync search input with URL when URL changes externally
    React.useEffect(() => {
        setSearch(searchParam);
        setDebouncedSearch(searchParam);
    }, [searchParam]);

    // Sync category filter with URL
    React.useEffect(() => {
        setCategoryId(categoryIdParam);
    }, [categoryIdParam]);

    // Debounce search and update URL
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== debouncedSearch) {
                setDebouncedSearch(search);
                updateParams({ search: search || undefined, page: DEFAULT_PAGE });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search, debouncedSearch, updateParams]);

    // Query
    const { data, isLoading, isFetching } = useRecipes({
        page,
        limit,
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        sortBy: sorting[0]?.id as
            | "title"
            | "slug"
            | "createdAt"
            | "updatedAt"
            | "prepMinutes"
            | "cookMinutes"
            | "servings"
            | undefined,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
    });

    // Handlers
    const handlePreview = React.useCallback((recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setPreviewDialogOpen(true);
    }, []);

    const handleEdit = React.useCallback((recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setFormDialogOpen(true);
    }, []);

    const handleDelete = React.useCallback((recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setDeleteDialogOpen(true);
    }, []);

    const handleCreate = React.useCallback(() => {
        setSelectedRecipe(null);
        setFormDialogOpen(true);
    }, []);

    // Columns definition
    const columns: ColumnDef<Recipe>[] = React.useMemo(
        () => [
            {
                id: "no",
                header: "No",
                cell: ({ row }) => {
                    const rowNumber = (page - 1) * limit + row.index + 1;
                    return <span className="text-muted-foreground">{rowNumber}</span>;
                },
            },
            {
                id: "image",
                header: "Gambar",
                cell: ({ row }) => {
                    const recipe = row.original;
                    return recipe.imageUrl ? (
                        <div className="relative h-12 w-16 overflow-hidden rounded-md">
                            <Image
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </div>
                    ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-md bg-muted">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                    );
                },
            },
            {
                accessorKey: "title",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isDesc = column.getIsSorted() === "asc";
                            updateParams({
                                sortBy: "title",
                                sortOrder: isDesc ? "desc" : "asc",
                            });
                        }}
                        className="-ml-4">
                        Judul
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="max-w-48">
                        <p className="truncate font-medium">{row.getValue("title")}</p>
                        {row.original.description && (
                            <p className="truncate text-sm text-muted-foreground">{row.original.description}</p>
                        )}
                    </div>
                ),
            },
            {
                id: "time",
                header: "Waktu",
                cell: ({ row }) => {
                    const recipe = row.original;
                    const totalTime = (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
                    return (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{totalTime > 0 ? `${totalTime} menit` : "-"}</span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "servings",
                header: "Porsi",
                cell: ({ row }) => {
                    const servings = row.getValue("servings") as number | null;
                    return (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{servings ?? "-"}</span>
                        </div>
                    );
                },
            },
            {
                id: "categories",
                header: "Kategori",
                cell: ({ row }) => {
                    const categories = row.original.categories;
                    if (!categories || categories.length === 0) {
                        return <span className="text-sm text-muted-foreground">-</span>;
                    }
                    return (
                        <div className="flex flex-wrap gap-1">
                            {categories.slice(0, 2).map((rc) => (
                                <Badge key={rc.categoryId} variant="secondary" className="text-xs">
                                    {rc.category.name}
                                </Badge>
                            ))}
                            {categories.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{categories.length - 2}
                                </Badge>
                            )}
                        </div>
                    );
                },
            },
            {
                id: "stats",
                header: "Bahan/Langkah",
                cell: ({ row }) => {
                    const recipe = row.original;
                    return (
                        <span className="text-sm text-muted-foreground">
                            {recipe._count?.ingredients ?? 0} / {recipe._count?.instructions ?? 0}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const recipe = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                    <span className="sr-only">Buka menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePreview(recipe)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEdit(recipe)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDelete(recipe)}
                                    className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [handlePreview, handleEdit, handleDelete, page, limit, updateParams],
    );

    const table = useReactTable({
        data: data?.data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari resep..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={categoryId}
                        onValueChange={(value) => {
                            setCategoryId(value === "all" ? "" : value);
                            updateParams({
                                categoryId: value === "all" ? "" : value,
                                page: DEFAULT_PAGE,
                            });
                        }}>
                        <SelectTrigger className="w-full sm:w-50">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categoriesData?.data?.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleCreate} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Resep
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-md border">
                <Table className="min-w-200">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Loading skeleton
                            ["s1", "s2", "s3", "s4", "s5"].map((id) => (
                                <TableRow key={id}>
                                    <TableCell>
                                        <Skeleton className="h-5 w-8" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-12 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-48" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-12" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-8" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Tidak ada data resep.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {data?.pagination && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Tampilkan</span>
                            <Select
                                value={String(limit)}
                                onValueChange={(value) => {
                                    updateParams({ limit: Number(value), page: DEFAULT_PAGE });
                                }}>
                                <SelectTrigger className="w-18">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">data</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, data.pagination.total)} dari{" "}
                            {data.pagination.total} resep
                            {isFetching && " (memuat...)"}
                        </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateParams({ page: Math.max(1, page - 1) })}
                            disabled={!data.pagination.hasPrevPage || isFetching}>
                            Sebelumnya
                        </Button>
                        <span className="text-sm">
                            Halaman {page} dari {data.pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateParams({ page: page + 1 })}
                            disabled={!data.pagination.hasNextPage || isFetching}>
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialogs */}
            <RecipeFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} recipe={selectedRecipe} />
            <RecipeDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} recipe={selectedRecipe} />
            <RecipePreviewDialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen} recipe={selectedRecipe} />
        </div>
    );
}
