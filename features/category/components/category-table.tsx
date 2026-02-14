/**
 * Category Table Component
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
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    type Category,
    CategoryDeleteDialog,
    CategoryFormDialog,
    type CategoryType,
    useCategories,
} from "@/features/category";

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
    DISH: "Jenis Hidangan",
    CUISINE: "Masakan",
    DIET: "Diet",
};

const CATEGORY_TYPE_VARIANTS: Record<CategoryType, "default" | "secondary" | "outline"> = {
    DISH: "default",
    CUISINE: "secondary",
    DIET: "outline",
};

// Default values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_TYPE = "ALL";
const DEFAULT_SORT_BY = "";
const DEFAULT_SORT_ORDER = "asc";

export function CategoryTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State for dialogs
    const [formDialogOpen, setFormDialogOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

    // State for table
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    // Initialize state from URL params
    const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
    const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;
    const typeFilter = (searchParams.get("type") as CategoryType | "ALL") || DEFAULT_TYPE;
    const sortBy = searchParams.get("sortBy") || DEFAULT_SORT_BY;
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || DEFAULT_SORT_ORDER;
    const searchParam = searchParams.get("search") || "";

    // Local search state for input (to enable debounce)
    const [search, setSearch] = React.useState(searchParam);
    const [debouncedSearch, setDebouncedSearch] = React.useState(searchParam);

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
                    (key === "type" && value === DEFAULT_TYPE) ||
                    (key === "sortBy" && value === DEFAULT_SORT_BY) ||
                    (key === "sortOrder" && value === DEFAULT_SORT_ORDER) ||
                    (key === "search" && value === "") ||
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
    const { data, isLoading, isFetching } = useCategories({
        page,
        limit,
        search: debouncedSearch || undefined,
        type: typeFilter === "ALL" ? undefined : typeFilter,
        sortBy: sorting[0]?.id as "name" | "slug" | "type" | "id" | undefined,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
    });

    // Handlers
    const handleEdit = React.useCallback((category: Category) => {
        setSelectedCategory(category);
        setFormDialogOpen(true);
    }, []);

    const handleDelete = React.useCallback((category: Category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    }, []);

    const handleCreate = React.useCallback(() => {
        setSelectedCategory(null);
        setFormDialogOpen(true);
    }, []);

    // Columns definition
    const columns: ColumnDef<Category>[] = React.useMemo(
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
                accessorKey: "name",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isDesc = column.getIsSorted() === "asc";
                            updateParams({
                                sortBy: "name",
                                sortOrder: isDesc ? "desc" : "asc",
                            });
                        }}
                        className="-ml-4">
                        Nama
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
            },
            {
                accessorKey: "slug",
                header: "Slug",
                cell: ({ row }) => <code className="rounded bg-muted px-2 py-1 text-sm">{row.getValue("slug")}</code>,
            },
            {
                accessorKey: "type",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isDesc = column.getIsSorted() === "asc";
                            updateParams({
                                sortBy: "type",
                                sortOrder: isDesc ? "desc" : "asc",
                            });
                        }}
                        className="-ml-4">
                        Tipe
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const type = row.getValue("type") as CategoryType;
                    return <Badge variant={CATEGORY_TYPE_VARIANTS[type]}>{CATEGORY_TYPE_LABELS[type]}</Badge>;
                },
            },
            {
                accessorKey: "_count.recipes",
                header: "Jumlah Resep",
                cell: ({ row }) => {
                    const count = row.original._count?.recipes ?? 0;
                    return <span className="text-muted-foreground">{count} resep</span>;
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const category = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                    <span className="sr-only">Buka menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(category)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDelete(category)}
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
        [handleEdit, handleDelete, page, limit, updateParams],
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
                            placeholder="Cari kategori..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={typeFilter}
                        onValueChange={(value) => {
                            updateParams({ type: value, page: DEFAULT_PAGE });
                        }}>
                        <SelectTrigger className="w-full sm:w-45">
                            <SelectValue placeholder="Filter tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Tipe</SelectItem>
                            <SelectItem value="DISH">Jenis Hidangan</SelectItem>
                            <SelectItem value="CUISINE">Masakan</SelectItem>
                            <SelectItem value="DIET">Diet</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleCreate} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Kategori
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-md border">
                <Table className="min-w-150">
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
                                        <Skeleton className="h-5 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-20" />
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
                                    Tidak ada data kategori.
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
                            {data.pagination.total} kategori
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
            <CategoryFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} category={selectedCategory} />
            <CategoryDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                category={selectedCategory}
            />
        </div>
    );
}
