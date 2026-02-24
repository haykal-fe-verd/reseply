/**
 * Comment Item Component
 * Single comment with edit/delete (author or admin)
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

"use client";

import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/config/auth/auth-client";
import type { RecipeCommentItem } from "@/features/recipe-engagement";
import { useDeleteComment, useUpdateComment } from "@/features/recipe-engagement";
import { cn } from "@/lib/utils";

interface CommentItemProps {
    comment: RecipeCommentItem;
    recipeId: string;
    className?: string;
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function CommentItem({ comment, recipeId, className }: CommentItemProps) {
    const { data: session } = authClient.useSession();
    const userId = session?.user?.id;
    const role = (session?.user as { role?: string })?.role;
    const isAuthor = userId === comment.user.id;
    const isAdmin = role === "admin";
    const canModify = isAuthor || isAdmin;

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const deleteComment = useDeleteComment(recipeId);
    const updateComment = useUpdateComment(recipeId);

    const handleSaveEdit = () => {
        const trimmed = editContent.trim();
        if (trimmed && trimmed !== comment.content) {
            updateComment.mutate(
                { commentId: comment.id, content: trimmed },
                {
                    onSuccess: () => {
                        setIsEditing(false);
                        setEditContent(trimmed);
                    },
                },
            );
        } else {
            setIsEditing(false);
            setEditContent(comment.content);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(false);
        deleteComment.mutate(comment.id);
    };

    const createdAtLabel = formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: id,
    });

    return (
        <article
            className={cn("group flex gap-3 rounded-lg border border-border/50 bg-card/50 p-4 transition-colors", className)}
            data-comment-id={comment.id}>
            <Avatar className="size-9 shrink-0">
                <AvatarImage src={comment.user.image ?? undefined} alt="" />
                <AvatarFallback className="text-xs">{getInitials(comment.user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-medium text-foreground">{comment.user.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{createdAtLabel}</span>
                        {comment.updatedAt !== comment.createdAt && (
                            <span className="shrink-0 text-xs text-muted-foreground">(diedit)</span>
                        )}
                    </div>
                    {canModify && !isEditing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 shrink-0 opacity-70 transition-opacity hover:opacity-100"
                                    aria-label="Opsi komentar">
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Pencil className="size-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setShowDeleteConfirm(true)}>
                                    <Trash2 className="size-4" />
                                    Hapus
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                {isEditing ? (
                    <div className="mt-2 space-y-2">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="min-h-[80px] resize-none"
                            maxLength={1000}
                            aria-label="Edit komentar"
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit} disabled={updateComment.isPending}>
                                Simpan
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={updateComment.isPending}>
                                Batal
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-foreground wrap-break-word">{comment.content}</p>
                )}
            </div>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus komentar?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Komentar akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </article>
    );
}
