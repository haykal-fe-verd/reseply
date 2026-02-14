/**
 * Recipe Delete Dialog Component
 * @date February 13, 2026
 * @author Muhammad Haykal
 */

"use client";

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
import { Spinner } from "@/components/ui/spinner";
import { type Recipe, useDeleteRecipe } from "@/features/recipes";

interface RecipeDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipe: Recipe | null;
}

export function RecipeDeleteDialog({ open, onOpenChange, recipe }: RecipeDeleteDialogProps) {
    const deleteMutation = useDeleteRecipe();

    const handleDelete = async () => {
        if (!recipe) return;

        try {
            await deleteMutation.mutateAsync(recipe.id);
            onOpenChange(false);
        } catch {
            // Error handled by mutation
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Resep</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus resep <span className="font-semibold">{recipe?.title}</span>?
                        Semua bahan dan langkah-langkah akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive text-white hover:bg-destructive/90">
                        {deleteMutation.isPending && <Spinner className="mr-2" />}
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
