"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddRecipeToCollection, useCreateCollection } from "@/features/favorites";

interface CreateCollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: (slug: string) => void;
    /** Jika diisi, resep ini akan otomatis ditambahkan ke koleksi baru setelah dibuat */
    recipeIdToAdd?: string;
}

export function CreateCollectionDialog({
    open,
    onOpenChange,
    onSuccess,
    recipeIdToAdd,
}: CreateCollectionDialogProps) {
    const [name, setName] = useState("");
    const { mutate: createCollection, isPending: isCreating } = useCreateCollection();
    const { mutate: addToCollection, isPending: isAdding } = useAddRecipeToCollection();

    const isPending = isCreating || isAdding;

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (!trimmed || isPending) return;
            createCollection(trimmed, {
                onSuccess: (data) => {
                    if (!data.success || !data.data) return;
                    const { id: collectionId, slug } = data.data;
                    if (recipeIdToAdd) {
                        addToCollection(
                            { collectionId, recipeId: recipeIdToAdd },
                            {
                                onSuccess: () => {
                                    setName("");
                                    onOpenChange(false);
                                    onSuccess?.(slug);
                                },
                            },
                        );
                    } else {
                        setName("");
                        onOpenChange(false);
                        onSuccess?.(slug);
                    }
                },
            });
        },
        [name, isPending, createCollection, addToCollection, recipeIdToAdd, onOpenChange, onSuccess],
    );

    const handleOpenChange = useCallback(
        (next: boolean) => {
            if (!next) setName("");
            onOpenChange(next);
        },
        [onOpenChange],
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogTitle>Buat Koleksi Baru</DialogTitle>
                <DialogDescription>
                    {recipeIdToAdd
                        ? "Buat koleksi baru dan resep ini akan otomatis disimpan ke dalamnya. Anda bisa menambah resep lain nanti."
                        : "Buat daftar resep kustom (mis. &quot;Sarapan sehat&quot;, &quot;Untuk arisan&quot;). Isi dengan resep dari favorit Anda dan bagikan link koleksi ke siapa saja."}
                </DialogDescription>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="collection-name">Nama koleksi</Label>
                            <Input
                                id="collection-name"
                                type="text"
                                placeholder="Contoh: Sarapan sehat"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                autoFocus
                                disabled={isPending}
                                aria-required
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => handleOpenChange(false)}
                            disabled={isPending}>
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            disabled={!name.trim() || isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" aria-hidden />
                                    {isAdding ? "Menambahkan resep..." : "Membuat..."}
                                </>
                            ) : (
                                "Buat Koleksi"
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
