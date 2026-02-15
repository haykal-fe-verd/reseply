/**
 * User Table Component
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
import {
    ArrowUpDown,
    Ban,
    CheckCircle,
    LogOut,
    MoreHorizontal,
    Search,
    Shield,
    ShieldOff,
    Trash2,
    XCircle,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
    type User,
    UserBanDialog,
    UserDeleteDialog,
    type UserRole,
    UserSessionsDialog,
    useUnbanUser,
    useUpdateUser,
    useUsers,
} from "@/features/users";

const ROLE_LABELS: Record<string, string> = {
    user: "Pengguna",
    admin: "Admin",
};

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    user: "secondary",
    admin: "default",
};

// Default values
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_ROLE = "ALL";
const DEFAULT_BANNED = "ALL";
const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_SORT_ORDER = "desc";

export function UserTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State for dialogs
    const [banDialogOpen, setBanDialogOpen] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [sessionsDialogOpen, setSessionsDialogOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

    // State for table
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    // Mutations
    const unbanMutation = useUnbanUser();
    const updateUserMutation = useUpdateUser();

    // Initialize state from URL params
    const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
    const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;
    const roleFilter = (searchParams.get("role") as UserRole | "ALL") || DEFAULT_ROLE;
    const bannedFilter = searchParams.get("banned") || DEFAULT_BANNED;
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
        (updates: Record<string, string | number | boolean | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());

            for (const [key, value] of Object.entries(updates)) {
                // Remove param if value is default or undefined
                const isDefault =
                    (key === "page" && value === DEFAULT_PAGE) ||
                    (key === "limit" && value === DEFAULT_LIMIT) ||
                    (key === "role" && value === DEFAULT_ROLE) ||
                    (key === "banned" && value === DEFAULT_BANNED) ||
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
    const { data, isLoading, isFetching } = useUsers({
        page,
        limit,
        search: debouncedSearch || undefined,
        role: roleFilter === "ALL" ? undefined : roleFilter,
        banned: bannedFilter === "ALL" ? undefined : bannedFilter === "true",
        sortBy: sorting[0]?.id as "name" | "email" | "createdAt" | "updatedAt" | "role" | undefined,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
    });

    // Handlers
    const handleBan = React.useCallback((user: User) => {
        setSelectedUser(user);
        setBanDialogOpen(true);
    }, []);

    const handleUnban = React.useCallback(
        async (user: User) => {
            await unbanMutation.mutateAsync(user.id);
        },
        [unbanMutation],
    );

    const handleDelete = React.useCallback((user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    }, []);

    const handleSessions = React.useCallback((user: User) => {
        setSelectedUser(user);
        setSessionsDialogOpen(true);
    }, []);

    const handleToggleRole = React.useCallback(
        async (user: User) => {
            const newRole = user.role === "admin" ? "user" : "admin";
            await updateUserMutation.mutateAsync({
                id: user.id,
                values: { role: newRole },
            });
        },
        [updateUserMutation],
    );

    // Columns definition
    const columns: ColumnDef<User>[] = React.useMemo(
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
                id: "user",
                header: "Pengguna",
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                                <AvatarFallback>
                                    {user.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="truncate font-medium">{user.name}</p>
                                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "role",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isDesc = column.getIsSorted() === "asc";
                            updateParams({
                                sortBy: "role",
                                sortOrder: isDesc ? "desc" : "asc",
                            });
                        }}
                        className="-ml-4">
                        Role
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const role = row.getValue("role") as string | null;
                    const displayRole = role || "user";
                    return (
                        <Badge variant={ROLE_VARIANTS[displayRole] || "secondary"}>
                            {displayRole === "admin" && <Shield className="mr-1 h-3 w-3" />}
                            {ROLE_LABELS[displayRole] || displayRole}
                        </Badge>
                    );
                },
            },
            {
                id: "status",
                header: "Status",
                cell: ({ row }) => {
                    const user = row.original;
                    if (user.banned) {
                        return (
                            <Badge variant="destructive">
                                <Ban className="mr-1 h-3 w-3" />
                                Diblokir
                            </Badge>
                        );
                    }
                    if (user.emailVerified) {
                        return (
                            <Badge variant="outline" className="border-green-500 text-green-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Terverifikasi
                            </Badge>
                        );
                    }
                    return (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            <XCircle className="mr-1 h-3 w-3" />
                            Belum Verifikasi
                        </Badge>
                    );
                },
            },
            {
                id: "sessions",
                header: "Sesi Aktif",
                cell: ({ row }) => {
                    const count = row.original._count?.sessions ?? 0;
                    return <Badge variant="outline">{count} sesi</Badge>;
                },
            },
            {
                accessorKey: "createdAt",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            const isDesc = column.getIsSorted() === "asc";
                            updateParams({
                                sortBy: "createdAt",
                                sortOrder: isDesc ? "desc" : "asc",
                            });
                        }}
                        className="-ml-4">
                        Bergabung
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const date = new Date(row.getValue("createdAt"));
                    return (
                        <span className="text-sm text-muted-foreground">
                            {date.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => {
                    const user = row.original;
                    const isAdmin = user.role === "admin";

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Buka menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleSessions(user)}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Kelola Sesi
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {!isAdmin && (
                                    <DropdownMenuItem onClick={() => handleToggleRole(user)}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Jadikan Admin
                                    </DropdownMenuItem>
                                )}
                                {isAdmin && (
                                    <DropdownMenuItem onClick={() => handleToggleRole(user)}>
                                        <ShieldOff className="mr-2 h-4 w-4" />
                                        Hapus Admin
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {user.banned ? (
                                    <DropdownMenuItem onClick={() => handleUnban(user)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Buka Blokir
                                    </DropdownMenuItem>
                                ) : (
                                    !isAdmin && (
                                        <DropdownMenuItem onClick={() => handleBan(user)}>
                                            <Ban className="mr-2 h-4 w-4" />
                                            Blokir
                                        </DropdownMenuItem>
                                    )
                                )}
                                {!isAdmin && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(user)}
                                            className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Hapus
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [handleBan, handleUnban, handleDelete, handleSessions, handleToggleRole, page, limit, updateParams],
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
                            placeholder="Cari pengguna..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={roleFilter}
                        onValueChange={(value) => {
                            updateParams({ role: value, page: DEFAULT_PAGE });
                        }}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Semua Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Role</SelectItem>
                            <SelectItem value="user">Pengguna</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={bannedFilter}
                        onValueChange={(value) => {
                            updateParams({ banned: value, page: DEFAULT_PAGE });
                        }}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Semua Status</SelectItem>
                            <SelectItem value="false">Aktif</SelectItem>
                            <SelectItem value="true">Diblokir</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-48" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24" />
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
                                    Tidak ada data pengguna.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                        {data?.pagination
                            ? `Menampilkan ${(page - 1) * limit + 1}-${Math.min(page * limit, data.pagination.total)} dari ${data.pagination.total} pengguna`
                            : "Memuat..."}
                    </span>
                    {isFetching && !isLoading && <span className="text-xs">(Memperbarui...)</span>}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Per halaman:</span>
                        <Select
                            value={String(limit)}
                            onValueChange={(value) => {
                                updateParams({ limit: Number(value), page: DEFAULT_PAGE });
                            }}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateParams({ page: page - 1 })}
                            disabled={!data?.pagination?.hasPrevPage}>
                            Sebelumnya
                        </Button>
                        <span className="min-w-24 text-center text-sm">
                            Halaman {page} dari {data?.pagination?.totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateParams({ page: page + 1 })}
                            disabled={!data?.pagination?.hasNextPage}>
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            <UserBanDialog open={banDialogOpen} onOpenChange={setBanDialogOpen} user={selectedUser} />
            <UserDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} user={selectedUser} />
            <UserSessionsDialog open={sessionsDialogOpen} onOpenChange={setSessionsDialogOpen} user={selectedUser} />
        </div>
    );
}
