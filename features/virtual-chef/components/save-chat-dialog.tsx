/**
 * Save Chat Dialog Component
 * @date February 16, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { ChefHat, Loader2, MessageSquare, Save, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/config/auth/auth-client";
import { useSaveConversation } from "@/features/virtual-chef";

// Validation schema
const saveChatSchema = z.object({
    title: z
        .string()
        .min(3, "Judul minimal 3 karakter")
        .max(100, "Judul maksimal 100 karakter")
        .refine((val) => val.trim().length > 0, "Judul tidak boleh kosong"),
});

type SaveChatFormData = z.infer<typeof saveChatSchema>;

interface SaveChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    defaultTitle?: string;
    onSuccess?: (conversationId: string) => void;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: "easeOut" as const,
        },
    },
};

// Login Prompt Component
function LoginPrompt({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                <ChefHat className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Masuk untuk Menyimpan</h3>
            <p className="mt-2 max-w-[280px] text-sm text-muted-foreground">
                Simpan percakapan Virtual Chef Anda dengan masuk ke akun. Akses kembali kapan saja dari riwayat chat.
            </p>
            <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Nanti Saja
                </Button>
                <Button onClick={() => authClient.signIn.social({ provider: "google" })}>Masuk Sekarang</Button>
            </div>
        </motion.div>
    );
}

// Message Preview Component
function MessagePreview({ messages }: { messages: Array<{ role: string; content: string }> }) {
    const previewMessages = messages.slice(0, 3);

    return (
        <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MessageSquare className="size-4" />
                Preview Percakapan
            </div>
            <div className="space-y-2">
                {previewMessages.map((msg, idx) => (
                    <div key={idx} className={`text-xs ${msg.role === "user" ? "text-right" : "text-left"}`}>
                        <span
                            className={`inline-block max-w-[85%] rounded-lg px-3 py-1.5 ${
                                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}>
                            {msg.content.slice(0, 60)}
                            {msg.content.length > 60 ? "..." : ""}
                        </span>
                    </div>
                ))}
            </div>
            {messages.length > 3 && (
                <p className="mt-2 text-xs text-muted-foreground">+{messages.length - 3} pesan lainnya</p>
            )}
        </div>
    );
}

export function SaveChatDialog({ open, onOpenChange, messages, defaultTitle, onSuccess }: SaveChatDialogProps) {
    const { data: session } = authClient.useSession();
    const isLoggedIn = !!session?.user;
    const saveConversation = useSaveConversation();

    // Generate default title from first user message
    const generatedTitle =
        defaultTitle ?? messages.find((m) => m.role === "user")?.content.slice(0, 50) ?? "Percakapan Baru";

    const form = useForm({
        defaultValues: {
            title: generatedTitle,
        } as SaveChatFormData,
        onSubmit: async ({ value }) => {
            const result = await saveConversation.mutateAsync({
                title: value.title.trim(),
                messages,
            });

            if (result.success && result.conversationId) {
                onOpenChange(false);
                onSuccess?.(result.conversationId);
            }
        },
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            form.reset();
            form.setFieldValue("title", generatedTitle);
        }
    }, [open, generatedTitle, form]);

    // Handle close
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTitle className="sr-only">Simpan Percakapan</DialogTitle>
            <DialogContent className="sm:max-w-md">
                {!isLoggedIn ? (
                    <LoginPrompt onOpenChange={onOpenChange} />
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible">
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Save className="size-5 text-primary" />
                                </div>
                                <div>
                                    <DialogTitle>Simpan Percakapan</DialogTitle>
                                    <DialogDescription>
                                        Simpan percakapan ini untuk akses di kemudian hari
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.handleSubmit();
                            }}
                            className="space-y-4 mt-3">
                            {/* Message Preview */}
                            <MessagePreview messages={messages} />

                            {/* Title Field */}
                            <form.Field name="title">
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Judul Percakapan</FieldLabel>
                                        <Input
                                            id="title"
                                            type="text"
                                            placeholder="Contoh: Resep Rendang Padang"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            className="mt-1.5"
                                            disabled={saveConversation.isPending}
                                        />
                                        <FieldDescription>
                                            Beri nama yang mudah diingat untuk percakapan ini
                                        </FieldDescription>
                                        {field.state.meta.errors.length > 0 && (
                                            <FieldError>{field.state.meta.errors[0]}</FieldError>
                                        )}
                                    </Field>
                                )}
                            </form.Field>

                            {/* Stats */}
                            <div className="flex items-center gap-4 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="size-4 text-muted-foreground" />
                                    <span>{messages.length} pesan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <span>Akses kapan saja</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                    disabled={saveConversation.isPending}>
                                    Batal
                                </Button>
                                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                                    {([canSubmit, isSubmitting]) => (
                                        <Button
                                            type="submit"
                                            disabled={!canSubmit || isSubmitting || saveConversation.isPending}>
                                            {saveConversation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 size-4" />
                                                    Simpan Percakapan
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </form.Subscribe>
                            </DialogFooter>
                        </form>
                    </motion.div>
                )}
            </DialogContent>
        </Dialog>
    );
}
