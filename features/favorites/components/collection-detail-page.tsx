"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Pencil, Plus, RotateCw, Share2, Trash2, User } from "lucide-react";
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
    AddRecipesToCollectionDialog,
    CollectionRecipeCard,
    useCollectionBySlug,
    useDeleteCollection,
    useUpdateCollection,
} from "@/features/favorites";
import { toast } from "sonner";

interface CollectionDetailPageProps {
    slug: string;
}

export function CollectionDetailPage({ slug }: CollectionDetailPageProps) {
    const [addRecipesOpen, setAddRecipesOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data, isLoading, isError, refetch } = useCollectionBySlug(slug);
    const { mutate: updateCollection, isPending: isUpdating } = useUpdateCollection();
    const { mutate: deleteCollection, isPending: isDeleting } = useDeleteCollection();

    const collection = data?.data;
    const isOwner = collection?.isOwner ?? false;

    const copyLink = useCallback(() => {
        const url = `${typeof window !== "undefined" ? window.location.origin : ""}/koleksi/${slug}`;
        navigator.clipboard.writeText(url).then(
            () => {
                toast.success("Link disalin ke clipboard");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            },
            () => toast.error("Gagal menyalin link"),
        );
    }, [slug]);

    const openEdit = useCallback(() => {
        if (collection) {
            setEditName(collection.name);
            setIsEditOpen(true);
        }
    }, [collection]);

    const handleSaveEdit = useCallback(() => {
        if (!collection || !editName.trim() || editName.trim() === collection.name) {
            setIsEditOpen(false);
            return;
        }
        updateCollection(
            { collectionId: collection.id, name: editName.trim() },
            { onSuccess: (d) => d.success && setIsEditOpen(false) },
        );
    }, [collection, editName, updateCollection]);

    const handleDelete = useCallback(() => {
        if (!collection) return;
        deleteCollection(collection.id, {
            onSuccess: (d) => {
                if (d.success) {
                    setIsDeleteOpen(false);
                    window.location.href = "/favorites";
                }
            },
        });
    }, [collection, deleteCollection]);

    if (isLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="size-10 animate-spin text-muted-foreground" aria-hidden />
                <span className="sr-only">Memuat koleksi...</span>
            </div>
        );
    }

    if (isError || !collection) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
            >
                <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8">
                    <p className="text-muted-foreground">
                        Koleksi tidak ditemukan atau link tidak valid.
                    </p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={() => refetch()}>
                        <RotateCw className="size-4" />
                        Coba Lagi
                    </Button>
                    <Button variant="link" className="mt-2" asChild>
                        <Link href="/resep">Jelajahi Resep</Link>
                    </Button>
                </div>
            </motion.div>
        );
    }

    const recipes = collection.recipes ?? [];

    return (
        <div className="min-h-screen bg-background">
            <section className="border-b border-border/60 bg-muted/20 py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {collection.name}
                            </h1>
                            {collection.ownerName && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <User className="size-4" />
                                    Koleksi oleh {collection.ownerName}
                                </p>
                            )}
                            <p className="mt-1 text-sm text-muted-foreground">
                                {collection.recipeCount}{" "}
                                {collection.recipeCount === 1 ? "resep" : "resep"}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={copyLink}
                                aria-label="Salin link koleksi"
                            >
                                {copied ? (
                                    <Check className="size-4 text-green-600" />
                                ) : (
                                    <Share2 className="size-4" />
                                )}
                                {copied ? "Tersalin!" : "Bagikan link"}
                            </Button>
                            {isOwner && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => setAddRecipesOpen(true)}
                                        aria-label="Tambah resep dari favorit"
                                    >
                                        <Plus className="size-4" />
                                        Tambah Resep
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2"
                                        onClick={openEdit}
                                        aria-label="Ubah nama koleksi"
                                    >
                                        <Pencil className="size-4" />
                                        Ubah nama
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => setIsDeleteOpen(true)}
                                        aria-label="Hapus koleksi"
                                    >
                                        <Trash2 className="size-4" />
                                        Hapus
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {recipes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center"
                        >
                            <p className="text-muted-foreground">
                                Belum ada resep di koleksi ini.
                                {isOwner &&
                                    " Klik \"Tambah Resep\" untuk menambah dari favorit Anda."}
                            </p>
                            {isOwner && (
                                <Button
                                    className="mt-4 gap-2"
                                    onClick={() => setAddRecipesOpen(true)}
                                >
                                    <Plus className="size-4" />
                                    Tambah Resep
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <AnimatePresence mode="popLayout">
                                {recipes.map((recipe, index) => (
                                    <CollectionRecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        collectionId={collection.id}
                                        collectionSlug={collection.slug}
                                        isOwner={isOwner}
                                        index={index}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>

            <AddRecipesToCollectionDialog
                open={addRecipesOpen}
                onOpenChange={setAddRecipesOpen}
                collectionSlug={slug}
                collectionId={collection.id}
            />

            <AlertDialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <AlertDialogContent aria-describedby="edit-collection-desc">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ubah nama koleksi</AlertDialogTitle>
                        <AlertDialogDescription id="edit-collection-desc">
                            Nama baru untuk koleksi ini.
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
                            {isUpdating ? <Loader2 className="size-4 animate-spin" /> : "Simpan"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus koleksi?</AlertDialogTitle>
                        <AlertDialogDescription>
                            &quot;{collection.name}&quot; akan dihapus. Resep di dalamnya tidak ikut
                            terhapus. Tindakan ini tidak dapat dibatalkan.
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
        </div>
    );
}
