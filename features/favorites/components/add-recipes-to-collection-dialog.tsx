"use client";

import { Loader2, Plus } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    useAddRecipeToCollection,
    useCollectionBySlug,
    useFavorites,
} from "@/features/favorites";

interface AddRecipesToCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionSlug: string;
    collectionId: string;
}

export function AddRecipesToCollectionDialog({
    open,
    onOpenChange,
    collectionSlug,
    collectionId,
}: AddRecipesToCollectionDialogProps) {
    const { data: favoritesData } = useFavorites({ limit: 100, page: 1 });
    const { data: collectionData } = useCollectionBySlug(collectionSlug);
    const { mutate: addToCollection, isPending: isAdding } = useAddRecipeToCollection();

    const collectionRecipeIds = useMemo(
        () => new Set(collectionData?.data?.recipes?.map((r) => r.id) ?? []),
        [collectionData?.data?.recipes],
    );

    const favoritesNotInCollection = useMemo(
        () => (favoritesData?.data ?? []).filter((r) => !collectionRecipeIds.has(r.id)),
        [favoritesData?.data, collectionRecipeIds],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] sm:max-w-lg">
                <DialogTitle>Tambah Resep dari Favorit</DialogTitle>
                <DialogDescription>
                    Pilih resep dari daftar favorit Anda untuk ditambahkan ke koleksi ini.
                </DialogDescription>
                <ScrollArea className="max-h-[50vh] pr-2">
                    {favoritesNotInCollection.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Semua favorit sudah ada di koleksi ini, atau Anda belum punya resep favorit.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {favoritesNotInCollection.map((recipe) => (
                                <li
                                    key={recipe.id}
                                    className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
                                >
                                    <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                                        {recipe.imageUrl ? (
                                            <Image
                                                src={recipe.imageUrl}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                sizes="56px"
                                            />
                                        ) : (
                                            <span className="flex size-full items-center justify-center text-2xl">
                                                🍳
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-foreground">
                                            {recipe.title}
                                        </p>
                                        {recipe.description && (
                                            <p className="line-clamp-1 text-xs text-muted-foreground">
                                                {recipe.description}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0 gap-1"
                                        disabled={isAdding}
                                        onClick={() =>
                                            addToCollection(
                                                { collectionId, recipeId: recipe.id },
                                                {
                                                    onSuccess: (d) => {
                                                        if (d.success) {
                                                            // Optimistic: could remove from list
                                                        }
                                                    },
                                                },
                                            )
                                        }
                                    >
                                        {isAdding ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="size-4" />
                                                Tambah
                                            </>
                                        )}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
