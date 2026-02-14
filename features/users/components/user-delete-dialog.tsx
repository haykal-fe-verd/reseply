/**
 * User Delete Dialog Component
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
import { useDeleteUser } from "../users.hook";
import type { User } from "../users.service";

interface UserDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export function UserDeleteDialog({ open, onOpenChange, user }: UserDeleteDialogProps) {
    const deleteMutation = useDeleteUser();

    const handleDelete = async () => {
        if (!user) return;

        try {
            await deleteMutation.mutateAsync(user.id);
            onOpenChange(false);
        } catch {
            // Error handled by mutation
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold">{user?.name}</span> (
                        {user?.email})?
                        <br />
                        <br />
                        Tindakan ini akan menghapus:
                        <ul className="mt-2 ml-4 list-disc text-left">
                            <li>Semua data pengguna</li>
                            <li>Semua sesi aktif</li>
                            <li>Foto profil (jika ada)</li>
                        </ul>
                        <br />
                        Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive text-white hover:bg-destructive/90">
                        {deleteMutation.isPending && <Spinner className="mr-2" />}
                        Hapus Pengguna
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
