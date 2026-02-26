"use client";

import { Check, FolderPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    CreateCollectionDialog,
    useAddRecipeToCollection,
    useCollectionsContainingRecipe,
    useMyCollections,
} from "@/features/favorites";
import { cn } from "@/lib/utils";

interface AddToCollectionDropdownProps {
    recipeId: string;
    className?: string;
    triggerClassName?: string;
    align?: "start" | "center" | "end";
    /** Show label next to icon (e.g. for recipe detail page) */
    showLabel?: boolean;
    variant?: "default" | "outline" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
}

export function AddToCollectionDropdown({
    recipeId,
    className: _className,
    triggerClassName,
    align = "end",
    showLabel = false,
    variant = "secondary",
    size = "icon",
}: AddToCollectionDropdownProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { data: myCollections } = useMyCollections();
    const { data: containingData } = useCollectionsContainingRecipe(recipeId);
    const { mutate: addToCollection, isPending } = useAddRecipeToCollection();

    const collections = myCollections?.data ?? [];
    const containingIds = new Set((containingData?.data ?? []).map((c) => c.collectionId));

    const triggerSize = showLabel ? size : "icon";
    const triggerVariant = showLabel ? variant : "secondary";

    const openCreateDialog = () => setCreateDialogOpen(true);

    if (collections.length === 0) {
        return (
            <>
                <Button
                    variant={triggerVariant}
                    size={triggerSize}
                    className={cn(
                        !showLabel && "size-8 rounded-full bg-background/80 backdrop-blur-sm",
                        triggerClassName,
                    )}
                    aria-label="Tambah ke koleksi atau buat koleksi baru"
                    onClick={(e) => {
                        e.preventDefault();
                        openCreateDialog();
                    }}
                >
                    <FolderPlus className="size-4" />
                    {showLabel && <span>Tambah ke Koleksi</span>}
                </Button>
                <CreateCollectionDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    recipeIdToAdd={recipeId}
                    onSuccess={() => setCreateDialogOpen(false)}
                />
            </>
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={triggerVariant}
                        size={triggerSize}
                        className={cn(
                            !showLabel &&
                                "size-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
                            triggerClassName,
                        )}
                        aria-label="Tambah ke koleksi"
                        onClick={(e) => e.preventDefault()}
                    >
                        <FolderPlus className="size-4" />
                        {showLabel && <span>Tambah ke Koleksi</span>}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={align} className="w-56">
                    <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Tambah ke koleksi
                    </span>
                    <DropdownMenuSeparator />
                    {collections.map((col) => {
                        const alreadyIn = containingIds.has(col.id);
                        return (
                            <DropdownMenuItem
                                key={col.id}
                                onSelect={(e) => {
                                    e.preventDefault();
                                    if (alreadyIn) return;
                                    addToCollection({ collectionId: col.id, recipeId });
                                }}
                                disabled={alreadyIn || isPending}
                                className="flex items-center justify-between gap-2"
                            >
                                <span className="truncate">{col.name}</span>
                                {alreadyIn ? (
                                    <Check className="size-4 shrink-0 text-primary" aria-hidden />
                                ) : isPending ? (
                                    <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                                ) : null}
                            </DropdownMenuItem>
                        );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            openCreateDialog();
                        }}
                        className="flex items-center gap-2"
                    >
                        <FolderPlus className="size-4" />
                        Buat koleksi baru &amp; simpan resep
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <CreateCollectionDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                recipeIdToAdd={recipeId}
                onSuccess={() => setCreateDialogOpen(false)}
            />
        </>
    );
}
