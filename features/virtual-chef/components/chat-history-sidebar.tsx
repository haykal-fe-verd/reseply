/**
 * Chat History Sidebar Component
 * @date February 16, 2026
 * @author Muhammad Haykal
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    ChefHat,
    ChevronRight,
    Clock,
    Loader2,
    MessageSquare,
    MoreVertical,
    Pencil,
    Search,
    Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { authClient } from "@/config/auth/auth-client";
import { useConversations, useDeleteConversation, useUpdateConversationTitle } from "@/features/virtual-chef";
import type { ConversationListItem } from "@/features/virtual-chef/virtual-chef.action";
import { cn } from "@/lib/utils";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

interface ChatHistorySidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectConversation: (conversationId: string) => void;
    selectedConversationId?: string | null;
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// Edit Title Dialog Component
function EditTitleDialog({
    conversation,
    open,
    onOpenChange,
}: {
    conversation: ConversationListItem;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [title, setTitle] = useState(conversation.title);
    const updateTitle = useUpdateConversationTitle();

    useEffect(() => {
        setTitle(conversation.title);
    }, [conversation.title]);

    const handleSave = () => {
        if (title.trim() && title !== conversation.title) {
            updateTitle.mutate(
                { conversationId: conversation.id, title: title.trim() },
                {
                    onSuccess: (data) => {
                        if (data.success) {
                            onOpenChange(false);
                        }
                    },
                },
            );
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit Judul Percakapan</AlertDialogTitle>
                    <AlertDialogDescription>Ubah judul percakapan sesuai keinginan Anda.</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Judul percakapan"
                        className="w-full"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSave();
                            }
                        }}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSave}
                        disabled={!title.trim() || title === conversation.title || updateTitle.isPending}>
                        {updateTitle.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        Simpan
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Conversation Item Component
function ConversationItem({
    conversation,
    isSelected,
    onSelect,
}: {
    conversation: ConversationListItem;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const deleteConversation = useDeleteConversation();

    const handleDelete = () => {
        deleteConversation.mutate(conversation.id, {
            onSuccess: (data) => {
                if (data.success) {
                    setShowDeleteDialog(false);
                }
            },
        });
    };

    return (
        <>
            <motion.div variants={itemVariants} className="group relative w-full min-w-0">
                <div
                    className={cn(
                        "grid grid-cols-[auto_1fr_auto] gap-2 rounded-xl border p-3 transition-colors items-start",
                        isSelected ? "border-primary/30 bg-primary/5" : "border-transparent hover:bg-muted/40",
                    )}>
                    {/* Kolom 1: Icon */}
                    <div
                        className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isSelected ? "bg-primary/20" : "bg-muted",
                        )}>
                        <ChefHat className={cn("size-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                    </div>

                    {/* Kolom 2: Judul + meta + preview (1fr = sisa ruang, teks truncate) */}
                    <button
                        type="button"
                        onClick={onSelect}
                        className={cn(
                            "min-w-0 overflow-hidden rounded-lg p-0 text-left transition-colors",
                            isSelected ? "bg-transparent" : "hover:bg-transparent",
                        )}>
                        <div className="min-w-0 overflow-hidden">
                            <div className="flex min-w-0 items-center gap-1.5">
                                <h4 className="truncate text-sm font-medium leading-tight">{conversation.title}</h4>
                                {isSelected && <ChevronRight className="size-3.5 shrink-0 text-primary" />}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="size-3 shrink-0" />
                                <span className="shrink-0">{formatRelativeTime(conversation.updatedAt)}</span>
                                <span className="shrink-0 opacity-60">·</span>
                                <span className="shrink-0">{conversation.messageCount} pesan</span>
                            </div>
                            {conversation.preview && (
                                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground/80 wrap-break-word">
                                    {conversation.preview}
                                </p>
                            )}
                        </div>
                    </button>

                    {/* Kolom 3: Tombol aksi - lebar tetap, selalu terlihat */}
                    <div className="flex items-center justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                                    <MoreVertical className="size-4" aria-hidden />
                                    <span className="sr-only">Opsi percakapan</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                                    <Pencil className="mr-2 size-4" />
                                    Edit Judul
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setShowDeleteDialog(true)}>
                                    <Trash2 className="mr-2 size-4" />
                                    Hapus Percakapan
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </motion.div>

            {/* Edit Dialog */}
            <EditTitleDialog conversation={conversation} open={showEditDialog} onOpenChange={setShowEditDialog} />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Percakapan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Percakapan "{conversation.title}" akan dihapus secara permanen. Tindakan ini tidak dapat
                            dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
                            disabled={deleteConversation.isPending}>
                            {deleteConversation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// Empty State Component
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Belum Ada Percakapan</h3>
            <p className="mt-2 max-w-[200px] text-sm text-muted-foreground">
                {hasSearch
                    ? "Tidak ada percakapan yang cocok dengan pencarian Anda."
                    : "Mulai percakapan baru dengan Virtual Chef dan simpan untuk mengaksesnya nanti."}
            </p>
        </motion.div>
    );
}

// Loading Skeleton Component
function LoadingSkeleton() {
    return (
        <div className="space-y-1.5 pt-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-transparent p-3">
                    <div className="size-9 shrink-0 animate-pulse rounded-lg bg-muted" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Login Prompt Component
function LoginPrompt() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <ChefHat className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Masuk untuk Melihat Riwayat</h3>
            <p className="mt-2 max-w-[220px] text-sm text-muted-foreground">
                Simpan dan akses percakapan Virtual Chef Anda dengan masuk ke akun.
            </p>
            <Button className="mt-4" onClick={() => authClient.signIn.social({ provider: "google" })}>
                Masuk Sekarang
            </Button>
        </motion.div>
    );
}

export function ChatHistorySidebar({
    open,
    onOpenChange,
    onSelectConversation,
    selectedConversationId,
}: ChatHistorySidebarProps) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const { data: session } = authClient.useSession();
    const isLoggedIn = !!session?.user;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching } = useConversations({
        page: 1,
        limit: 20,
        search: debouncedSearch || undefined,
    });

    const conversations = data?.data ?? [];

    const handleSelectConversation = useCallback(
        (conversationId: string) => {
            onSelectConversation(conversationId);
            onOpenChange(false);
        },
        [onSelectConversation, onOpenChange],
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex w-full max-w-[100vw] flex-col p-4 sm:max-w-lg">
                <SheetHeader className="shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <ChefHat className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <SheetTitle className="text-left">Riwayat Chat</SheetTitle>
                            <SheetDescription className="text-left text-muted-foreground">
                                Akses percakapan Virtual Chef Anda
                            </SheetDescription>
                        </div>
                    </div>

                    {/* Search Input */}
                    {isLoggedIn && (
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari percakapan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 pl-9 pr-3"
                            />
                        </div>
                    )}
                </SheetHeader>

                {/* Conversations List */}
                <ScrollArea className="min-h-0 w-full">
                    <div className="w-full min-w-0 px-1">
                    {!isLoggedIn ? (
                        <LoginPrompt />
                    ) : isLoading || isFetching ? (
                        <LoadingSkeleton />
                    ) : conversations.length === 0 ? (
                        <EmptyState hasSearch={!!search} />
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="w-full min-w-0 space-y-1.5 pt-2 pb-4">
                                {/* Stats Badge */}
                                <div className="mb-2.5 flex items-center">
                                    <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs">
                                        <MessageSquare className="size-3" />
                                        {data?.pagination?.total ?? 0} percakapan
                                    </Badge>
                                </div>

                                {/* Conversations */}
                                {conversations.map((conversation) => (
                                    <ConversationItem
                                        key={conversation.id}
                                        conversation={conversation}
                                        isSelected={selectedConversationId === conversation.id}
                                        onSelect={() => handleSelectConversation(conversation.id)}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
