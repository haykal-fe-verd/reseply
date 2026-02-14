/**
 * Category Delete Dialog Component
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
import { type Category, useDeleteCategory } from "@/features/category";

interface CategoryDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
}

export function CategoryDeleteDialog({ open, onOpenChange, category }: CategoryDeleteDialogProps) {
    const deleteMutation = useDeleteCategory();

    const handleDelete = async () => {
        if (!category) return;

        try {
            await deleteMutation.mutateAsync(category.id);
            onOpenChange(false);
        } catch {
            // Error handled by mutation
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus kategori{" "}
                        <span className="font-semibold">{category?.name}</span>? Tindakan ini tidak dapat dibatalkan.
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
