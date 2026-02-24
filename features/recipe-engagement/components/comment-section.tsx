/**
 * Comment Section Component
 * Form + list of comments with load more
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

"use client";

import { motion } from "framer-motion";
import { MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/config/auth/auth-client";
import { CommentItem } from "./comment-item";
import { useCreateComment, useRecipeComments } from "../recipe-engagement.hook";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
    recipeId: string;
    className?: string;
}

const COMMENT_MAX_LENGTH = 1000;

function getInitials(name: string) {
    return name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function CommentSection({ recipeId, className }: CommentSectionProps) {
    const router = useRouter();
    const { data: session, isPending: isSessionLoading } = authClient.useSession();
    const isAuthenticated = !!session?.user;

    const [content, setContent] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data: commentsData, isLoading: isCommentsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecipeComments(recipeId);
    const createComment = useCreateComment(recipeId);

    const totalCount = commentsData?.pages[0]?.pagination?.total ?? 0;
    const comments = commentsData?.pages.flatMap((p) => p.data) ?? [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            router.push("/sign-in?callbackUrl=" + encodeURIComponent(window.location.pathname));
            return;
        }
        const trimmed = content.trim();
        if (!trimmed) return;
        createComment.mutate(trimmed, {
            onSuccess: () => {
                setContent("");
                textareaRef.current?.focus();
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn("", className)}>
            <Card className="border-border/50">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageCircle className="size-5 text-primary" />
                        Komentar
                        {totalCount > 0 && (
                            <span className="text-muted-foreground font-normal">({totalCount})</span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Comment form */}
                    <div className="flex gap-3">
                        {isAuthenticated && session?.user && (
                            <Avatar className="size-9 shrink-0">
                                <AvatarImage src={(session.user as { image?: string }).image ?? undefined} alt="" />
                                <AvatarFallback className="text-xs">
                                    {getInitials((session.user as { name?: string }).name ?? "U")}
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div className="min-w-0 flex-1">
                            {isSessionLoading ? (
                                <Skeleton className="h-24 w-full rounded-md" />
                            ) : isAuthenticated ? (
                                <form onSubmit={handleSubmit} className="space-y-2">
                                    <Textarea
                                        ref={textareaRef}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Tulis komentar Anda..."
                                        rows={3}
                                        className="min-h-[80px] resize-none"
                                        maxLength={COMMENT_MAX_LENGTH}
                                        disabled={createComment.isPending}
                                        aria-label="Komentar"
                                    />
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {content.length}/{COMMENT_MAX_LENGTH}
                                        </span>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="gap-2"
                                            disabled={!content.trim() || createComment.isPending}>
                                            <Send className="size-4" />
                                            Kirim
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Masuk untuk mengirim komentar dan berinteraksi dengan komunitas.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() =>
                                            router.push("/sign-in?callbackUrl=" + encodeURIComponent(window.location.pathname))
                                        }>
                                        Masuk
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comment list */}
                    <div className="space-y-4">
                        {isCommentsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton className="size-9 shrink-0 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-12 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="rounded-lg border border-border/50 bg-muted/20 py-10 text-center">
                                <MessageCircle className="mx-auto size-10 text-muted-foreground/50" />
                                <p className="mt-2 text-sm text-muted-foreground">Belum ada komentar. Jadilah yang pertama!</p>
                            </div>
                        ) : (
                            <>
                                <ul className="space-y-4">
                                    {comments.map((comment) => (
                                        <li key={comment.id}>
                                            <CommentItem comment={comment} recipeId={recipeId} />
                                        </li>
                                    ))}
                                </ul>
                                {hasNextPage && (
                                    <div className="flex justify-center pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}>
                                            {isFetchingNextPage ? "Memuat..." : "Tampilkan lebih banyak"}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
