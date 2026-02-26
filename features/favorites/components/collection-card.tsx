"use client";

import { motion } from "framer-motion";
import { Copy, ExternalLink, GripVertical, Loader2, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    type CollectionItem,
    useDeleteCollection,
    useUpdateCollection,
} from "@/features/favorites";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface CollectionCardDragHandleProps {
    attributes: Record<string, unknown>;
    listeners: Record<string, unknown>;
}

interface CollectionCardProps {
    collection: CollectionItem;
    index?: number;
    /** Jika diset, tombol geser untuk drag akan ditampilkan di pojok kiri atas card */
    dragHandle?: CollectionCardDragHandleProps;
}

export function CollectionCard({ collection, index = 0, dragHandle }: CollectionCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState(collection.name);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const { mutate: updateCollection, isPending: isUpdating } = useUpdateCollection();
    const { mutate: deleteCollection, isPending: isDeleting } = useDeleteCollection();

    const copyLink = useCallback(() => {
        const url = `${typeof window !== "undefined" ? window.location.origin : ""}/koleksi/${collection.slug}`;
        navigator.clipboard.writeText(url).then(
            () => toast.success("Link disalin ke clipboard"),
            () => toast.error("Gagal menyalin link"),
        );
    }, [collection.slug]);

    const handleSaveEdit = useCallback(() => {
        if (editName.trim() === collection.name || !editName.trim()) {
            setIsEditOpen(false);
            return;
        }
        updateCollection(
            { collectionId: collection.id, name: editName.trim() },
            {
                onSuccess: (data) => {
                    if (data.success) setIsEditOpen(false);
                },
            },
        );
    }, [collection.id, collection.name, editName, updateCollection]);

    const handleDelete = useCallback(() => {
        deleteCollection(collection.id, {
            onSuccess: (data) => {
                if (data.success) setIsDeleteOpen(false);
            },
        });
    }, [collection.id, deleteCollection]);

    return (
        <>
            <motion.article
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative"
            >
                <Link
                    href={`/koleksi/${collection.slug}`}
                    className={cn(
                        "relative flex flex-col rounded-xl border border-border/60 bg-card p-6 sm:p-7 shadow-sm transition-all duration-200 min-h-[8.5rem]",
                        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                >
                    {dragHandle && (
                        <motion.button
                            type="button"
                            {...dragHandle.attributes}
                            {...dragHandle.listeners}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            className={cn(
                                "absolute top-3 left-3 z-10 flex touch-none cursor-grab active:cursor-grabbing",
                                "items-center justify-center rounded-full border border-border/60 bg-background/90 p-2 shadow-sm backdrop-blur-sm",
                                "text-muted-foreground transition-colors duration-200",
                                "hover:border-primary/30 hover:bg-muted hover:text-foreground",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            )}
                            aria-label="Tahan untuk menggeser urutan koleksi"
                            title="Tahan & geser untuk mengubah urutan"
                        >
                            <GripVertical className="size-4" aria-hidden />
                        </motion.button>
                    )}
                    <div className={cn("flex items-start justify-between gap-3", dragHandle && "pl-12")}>
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-xl font-semibold text-foreground">
                                {collection.name}
                            </h3>
                            <p className="mt-1.5 text-base text-muted-foreground">
                                {collection.recipeCount}{" "}
                                {collection.recipeCount === 1 ? "resep" : "resep"}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                            <span className="sr-only">Menu koleksi</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0"
                                        aria-label="Menu koleksi"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <MoreHorizontal className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            copyLink();
                                        }}
                                    >
                                        <Copy className="size-4" />
                                        Salin link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setEditName(collection.name);
                                            setIsEditOpen(true);
                                        }}
                                    >
                                        <Pencil className="size-4" />
                                        Ubah nama
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            setIsDeleteOpen(true);
                                        }}
                                    >
                                        <Trash2 className="size-4" />
                                        Hapus koleksi
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                        <Share2 className="size-4" />
                        <span>Bagikan via link</span>
                        <ExternalLink className="size-4 ml-auto" />
                    </div>
                </Link>
            </motion.article>

            {/* Edit name dialog - simple inline or reuse a small dialog */}
            {isEditOpen && (
                <AlertDialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <AlertDialogContent aria-describedby="edit-collection-desc">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Ubah nama koleksi</AlertDialogTitle>
                            <AlertDialogDescription id="edit-collection-desc">
                                Nama baru untuk &quot;{collection.name}&quot;
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-2">
                            <input
                                type="text"
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveEdit();
                                    if (e.key === "Escape") setIsEditOpen(false);
                                }}
                                aria-label="Nama koleksi"
                                maxLength={100}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSaveEdit();
                                }}
                                disabled={!editName.trim() || isUpdating}
                            >
                                {isUpdating ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    "Simpan"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus koleksi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            &quot;{collection.name}&quot; akan dihapus. Resep di dalamnya tidak ikut terhapus.
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
