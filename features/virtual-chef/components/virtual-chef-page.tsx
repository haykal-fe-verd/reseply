/**
 * Virtual Chef Page Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { TextStreamChatTransport } from "ai";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Bot,
    Check,
    ChefHat,
    Clock,
    Copy,
    History,
    Lightbulb,
    MessageSquare,
    Plus,
    Save,
    Send,
    Sparkles,
    Square,
    UtensilsCrossed,
    Wand2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/config/auth/auth-client";
import { type ChatMessage, useConversation, useConversationsCount } from "@/features/virtual-chef";
import { APP_NAME } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

import { ChatHistorySidebar } from "./chat-history-sidebar";
import { SaveChatDialog } from "./save-chat-dialog";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

const floatingVariants = {
    animate: {
        y: [-8, 8, -8],
        transition: {
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut" as const,
        },
    },
};

// Sample prompts for users to try
const samplePrompts = [
    {
        icon: UtensilsCrossed,
        title: "Resep dengan Bahan",
        prompt: "Saya punya ayam, bawang, dan tomat. Apa yang bisa saya masak?",
        color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    {
        icon: Clock,
        title: "Masak Cepat",
        prompt: "Resep masakan Indonesia yang bisa selesai dalam 15 menit",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
        icon: Lightbulb,
        title: "Inspirasi Menu",
        prompt: "Sarankan menu makan malam spesial untuk keluarga",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
        icon: ChefHat,
        title: "Tips Memasak",
        prompt: "Bagaimana cara membuat rendang yang empuk dan bumbu meresap?",
        color: "bg-green-500/10 text-green-500 border-green-500/20",
    },
];

// Initial welcome message
const WELCOME_MESSAGE = `Halo! Saya adalah Virtual Chef AI dari ${APP_NAME}. Saya siap membantu Anda menemukan resep, memberikan tips memasak, atau menjawab pertanyaan seputar kuliner Indonesia. Ada yang bisa saya bantu hari ini? 👨‍🍳`;

// Features list
const features = [
    {
        icon: Wand2,
        title: "AI Cerdas",
        description: "Ditenagai oleh AI canggih untuk rekomendasi personal",
    },
    {
        icon: MessageSquare,
        title: "Percakapan Natural",
        description: "Berkomunikasi seperti dengan chef sungguhan",
    },
    {
        icon: UtensilsCrossed,
        title: "1000+ Resep",
        description: "Akses ke database resep nusantara lengkap",
    },
];

// Helper to extract text content from message parts
function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text || "")
        .join("");
}

export function VirtualChefPage() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [input, setInput] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showHistorySidebar, setShowHistorySidebar] = useState(false);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    // Get user session
    const { data: session } = authClient.useSession();
    const isLoggedIn = !!session?.user;

    // Get conversations count for badge
    const { data: countData } = useConversationsCount();
    const conversationsCount = countData?.count ?? 0;

    // Get selected conversation data
    const { data: conversationData } = useConversation(selectedConversationId);

    // Create transport for connecting to API
    const transport = useMemo(
        () =>
            new TextStreamChatTransport({
                api: "/api/virtual-chef",
            }),
        [],
    );

    // Initial welcome message
    const initialMessages: UIMessage[] = useMemo(
        () => [
            {
                id: "welcome",
                role: "assistant",
                parts: [{ type: "text", text: WELCOME_MESSAGE }],
            },
        ],
        [],
    );

    const { messages, sendMessage, status, stop, error, clearError, setMessages } = useChat({
        transport,
        messages: initialMessages,
    });

    const isLoading = status === "streaming" || status === "submitted";

    // Load conversation from history
    useEffect(() => {
        if (conversationData?.success && conversationData.data) {
            const { messages: savedMessages } = conversationData.data;

            // Convert saved messages to UIMessage format
            const uiMessages: UIMessage[] = savedMessages.map((msg: ChatMessage) => ({
                id: msg.id,
                role: msg.role as "user" | "assistant",
                parts: [{ type: "text", text: msg.content }],
            }));

            setMessages(uiMessages);
        }
    }, [conversationData, setMessages]);

    // Auto-scroll to bottom when new messages arrive
    // biome-ignore lint/correctness/useExhaustiveDependencies: messages content changes trigger scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, status]);

    const handlePromptClick = (prompt: string) => {
        setInput(prompt);
        textareaRef.current?.focus();
    };

    const handleCopy = async (messageId: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(messageId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            clearError?.();
            sendMessage({ text: input });
            setInput("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Handle new chat
    const handleNewChat = useCallback(() => {
        setSelectedConversationId(null);
        setMessages(initialMessages);
        toast.success("Percakapan baru dimulai");
    }, [setMessages, initialMessages]);

    // Handle select conversation
    const handleSelectConversation = useCallback((conversationId: string) => {
        setSelectedConversationId(conversationId);
        // Messages will be loaded via useEffect when conversationData changes
    }, []);

    // Handle save success
    const handleSaveSuccess = useCallback(() => {
        setShowSaveDialog(false);
    }, []);

    // Get messages for saving (excluding welcome message)
    const messagesToSave = useMemo(() => {
        return messages
            .filter((msg) => msg.id !== "welcome")
            .map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: getMessageText(msg),
            }));
    }, [messages]);

    // Check if can save (must have at least 2 messages: 1 user + 1 assistant)
    const canSave = messagesToSave.length >= 2 && !isLoading;

    // Get first user message for default title
    const defaultTitle = useMemo(() => {
        const firstUserMsg = messagesToSave.find((m) => m.role === "user");
        return firstUserMsg?.content.slice(0, 50) ?? "Percakapan Baru";
    }, [messagesToSave]);

    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-background pb-8 pt-16 sm:pb-12 sm:pt-20 lg:pt-24">
                {/* Background Decorations */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -right-20 -top-20 size-96 rounded-full bg-primary/5 blur-3xl"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
                    />
                    <motion.div
                        className="absolute -bottom-20 -left-20 size-96 rounded-full bg-secondary/10 blur-3xl"
                        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{
                            duration: 8,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: 2,
                        }}
                    />
                    <motion.div
                        className="absolute right-1/4 top-1/2 size-64 rounded-full bg-purple-500/5 blur-3xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{
                            duration: 6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: 1,
                        }}
                    />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="mx-auto max-w-3xl text-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible">
                        {/* Badge */}
                        <motion.div variants={itemVariants}>
                            <Badge variant="secondary" className="mb-6 gap-2 px-4 py-2">
                                <Sparkles className="size-4 text-primary" />
                                <span>Powered by AI</span>
                            </Badge>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            Virtual Chef{" "}
                            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                AI Assistant
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            variants={itemVariants}
                            className="mt-6 text-lg leading-relaxed text-muted-foreground">
                            Asisten kuliner pintar yang siap membantu Anda menemukan resep sempurna, memberikan tips
                            memasak, dan menjawab pertanyaan seputar masakan Indonesia.
                        </motion.p>

                        {/* Features Pills */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 backdrop-blur-sm">
                                    <feature.icon className="size-4 text-primary" />
                                    <span className="text-sm font-medium">{feature.title}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Chat Interface Section */}
            <section className="relative flex-1 px-4 pb-8 sm:px-6 lg:px-8 bg-background">
                <div className="mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}>
                        <Card className="relative overflow-hidden border-2 shadow-xl mt-0 pt-0 pb-0">
                            {/* Gradient Border Effect */}
                            <div className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-r from-primary/20 via-transparent to-primary/20 opacity-50" />

                            {/* Chat Header */}
                            <div className="relative border-b bg-muted/30 px-4 sm:px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <motion.div className="relative" variants={floatingVariants} animate="animate">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                                <Bot className="size-6 text-primary" />
                                            </div>
                                            <span className="absolute -bottom-0.5 -right-0.5 flex size-3">
                                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                                                <span className="relative inline-flex size-3 rounded-full bg-green-500" />
                                            </span>
                                        </motion.div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">Virtual Chef AI</h3>
                                            <p className="text-sm text-muted-foreground">Selalu siap membantu</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        {/* Save Button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => setShowSaveDialog(true)}
                                            disabled={!canSave}
                                            title={isLoggedIn ? "Simpan percakapan" : "Masuk untuk menyimpan"}>
                                            <Save className="size-4" />
                                            <span className="hidden sm:inline">Simpan</span>
                                        </Button>

                                        {/* History Button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="relative gap-2"
                                            onClick={() => setShowHistorySidebar(true)}>
                                            <History className="size-4" />
                                            <span className="hidden sm:inline">Riwayat</span>
                                            {conversationsCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                                    {conversationsCount > 99 ? "99+" : conversationsCount}
                                                </span>
                                            )}
                                        </Button>

                                        {/* New Chat Button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2"
                                            onClick={handleNewChat}
                                            title="Mulai percakapan baru">
                                            <Plus className="size-4" />
                                            <span className="hidden sm:inline">Baru</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages Area */}
                            <div className="relative h-80 sm:h-96">
                                <div
                                    ref={scrollRef}
                                    className="absolute inset-0 overflow-y-auto scrollbar-on-hover"
                                    role="log"
                                    aria-label="Percakapan Virtual Chef">
                                    <div className="flex flex-col gap-4 p-6">
                                        {error && (
                                            <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                                <p className="font-medium">Gagal mengirim pesan</p>
                                                <p className="mt-1 opacity-90">{error.message}</p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => clearError?.()}>
                                                    Tutup
                                                </Button>
                                            </div>
                                        )}
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex gap-3 ${
                                                    message.role === "user" ? "flex-row-reverse" : ""
                                                }`}>
                                                {/* Avatar */}
                                                <Avatar className="size-8 shrink-0">
                                                    {message.role === "assistant" ? (
                                                        <AvatarFallback className="bg-primary/10">
                                                            <ChefHat className="size-4 text-primary" />
                                                        </AvatarFallback>
                                                    ) : (
                                                        <>
                                                            {session?.user?.image && (
                                                                <AvatarImage
                                                                    src={session.user.image}
                                                                    alt={session.user.name ?? "User"}
                                                                />
                                                            )}
                                                            <AvatarFallback className="bg-secondary">
                                                                {session?.user?.name
                                                                    ? getInitials(session.user.name)
                                                                    : "R"}
                                                            </AvatarFallback>
                                                        </>
                                                    )}
                                                </Avatar>

                                                {/* Message Bubble */}
                                                <div className="group flex max-w-[80%] flex-col">
                                                    <div
                                                        className={`rounded-2xl px-4 py-3 ${
                                                            message.role === "assistant"
                                                                ? "bg-muted/50"
                                                                : "bg-primary text-primary-foreground"
                                                        }`}>
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                            {getMessageText(message)}
                                                            {/* Typewriter cursor animation */}
                                                            {message.role === "assistant" &&
                                                                status === "streaming" &&
                                                                message.id === messages[messages.length - 1]?.id && (
                                                                    <motion.span
                                                                        className="ml-0.5 inline-block h-5 w-0.5 translate-y-0.5 bg-primary"
                                                                        animate={{
                                                                            opacity: [1, 0],
                                                                        }}
                                                                        transition={{
                                                                            duration: 0.5,
                                                                            repeat: Number.POSITIVE_INFINITY,
                                                                            repeatType: "reverse",
                                                                        }}
                                                                    />
                                                                )}
                                                        </p>
                                                    </div>

                                                    {/* Copy Button - only for assistant messages */}
                                                    {message.role === "assistant" && message.id !== "welcome" && (
                                                        <div className="mt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleCopy(message.id, getMessageText(message))
                                                                }
                                                                className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                                title="Salin pesan">
                                                                {copiedId === message.id ? (
                                                                    <>
                                                                        <Check className="size-3 text-green-500" />
                                                                        <span className="text-green-500">Tersalin</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="size-3" />
                                                                        <span>Salin</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Loading Indicator */}
                                        {isLoading && messages[messages.length - 1]?.role === "user" && (
                                            <div className="flex gap-3">
                                                <Avatar className="size-8 shrink-0">
                                                    <AvatarFallback className="bg-primary/10">
                                                        <ChefHat className="size-4 text-primary" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="rounded-2xl bg-muted/50 px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {[0, 1, 2].map((i) => (
                                                            <motion.span
                                                                key={i}
                                                                className="size-2 rounded-full bg-muted-foreground/50"
                                                                animate={{ y: [-2, 2, -2] }}
                                                                transition={{
                                                                    duration: 0.6,
                                                                    repeat: Number.POSITIVE_INFINITY,
                                                                    delay: i * 0.1,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sample Prompts */}
                            <div className="relative z-10 border-t bg-muted/20 px-6 py-4">
                                <p className="mb-3 text-xs font-medium text-muted-foreground">Coba tanyakan:</p>
                                <div className="flex flex-wrap gap-2">
                                    {samplePrompts.map((item) => (
                                        <motion.button
                                            key={item.title}
                                            type="button"
                                            onClick={() => handlePromptClick(item.prompt)}
                                            className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 ${item.color}`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}>
                                            <item.icon className="size-3" />
                                            {item.title}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Area */}
                            <CardContent className="relative z-10 border-t bg-background p-4">
                                <form onSubmit={handleSubmit} className="flex items-end gap-3">
                                    <div className="relative flex-1">
                                        <Textarea
                                            ref={textareaRef}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Tanyakan sesuatu tentang masakan..."
                                            className="min-h-13 max-h-32 resize-none rounded-xl pr-4"
                                            rows={1}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {isLoading ? (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="size-13 shrink-0 rounded-xl"
                                            onClick={stop}>
                                            <Square className="size-5" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className="size-13 shrink-0 rounded-xl"
                                            disabled={!input.trim()}>
                                            <Send className="size-5" />
                                        </Button>
                                    )}
                                </form>
                                <p className="mt-2 text-center text-xs text-muted-foreground">
                                    Virtual Chef AI dapat memberikan saran berdasarkan preferensi Anda
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Capabilities Section */}
            <section className="relative overflow-hidden bg-muted/30 py-16 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="mx-auto max-w-2xl text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}>
                        <Badge variant="secondary" className="mb-4 gap-2 px-4 py-2">
                            <Sparkles className="size-4" />
                            Kemampuan AI
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Apa yang Bisa Dilakukan Virtual Chef?
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            Fitur-fitur canggih yang membantu pengalaman memasak Anda
                        </p>
                    </motion.div>

                    <motion.div
                        className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}>
                        {[
                            {
                                icon: UtensilsCrossed,
                                title: "Rekomendasi Resep",
                                description:
                                    "Dapatkan saran resep berdasarkan bahan yang Anda miliki atau preferensi diet",
                                color: "bg-orange-500/10 text-orange-500",
                            },
                            {
                                icon: ChefHat,
                                title: "Tips & Trik Memasak",
                                description:
                                    "Pelajari teknik memasak profesional dan rahasia dapur dari chef berpengalaman",
                                color: "bg-purple-500/10 text-purple-500",
                            },
                            {
                                icon: Clock,
                                title: "Perencanaan Menu",
                                description: "Bantu perencanaan menu mingguan yang sehat dan seimbang untuk keluarga",
                                color: "bg-blue-500/10 text-blue-500",
                            },
                            {
                                icon: Lightbulb,
                                title: "Substitusi Bahan",
                                description:
                                    "Temukan pengganti bahan yang tidak tersedia dengan alternatif yang sesuai",
                                color: "bg-amber-500/10 text-amber-500",
                            },
                            {
                                icon: Bot,
                                title: "Panduan Langkah",
                                description: "Ikuti instruksi memasak langkah demi langkah dengan penjelasan detail",
                                color: "bg-green-500/10 text-green-500",
                            },
                            {
                                icon: MessageSquare,
                                title: "Tanya Jawab Kuliner",
                                description: "Jawaban cepat untuk pertanyaan seputar masakan, nutrisi, dan kuliner",
                                color: "bg-red-500/10 text-red-500",
                            },
                        ].map((capability) => (
                            <motion.div key={capability.title} variants={itemVariants}>
                                <Card className="group relative h-full overflow-hidden transition-all hover:shadow-lg">
                                    <CardContent className="pt-6">
                                        <div className={`mb-4 inline-flex rounded-xl p-3 ${capability.color}`}>
                                            <capability.icon className="size-6" />
                                        </div>
                                        <h3 className="mb-2 font-semibold text-foreground">{capability.title}</h3>
                                        <p className="text-sm text-muted-foreground">{capability.description}</p>
                                    </CardContent>
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden py-16 sm:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary to-primary/80 px-6 py-16 text-center sm:px-12 sm:py-20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}>
                        {/* Background Pattern */}
                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -left-10 -top-10 size-40 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute -bottom-10 -right-10 size-40 rounded-full bg-white/10 blur-3xl" />
                        </div>

                        <div className="relative">
                            <motion.div
                                className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-white/10"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}>
                                <ChefHat className="size-8 text-white" />
                            </motion.div>
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Siap Mulai Memasak?
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-white/80">
                                Bergabunglah dengan ribuan pecinta kuliner yang sudah menggunakan Virtual Chef AI untuk
                                menemukan inspirasi memasak setiap hari.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Button size="lg" variant="secondary" className="group gap-2 rounded-full">
                                    Mulai Percakapan
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="gap-2 rounded-full text-white hover:bg-white/10 hover:text-white">
                                    Pelajari Lebih Lanjut
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Chat History Sidebar */}
            <ChatHistorySidebar
                open={showHistorySidebar}
                onOpenChange={setShowHistorySidebar}
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversationId}
            />

            {/* Save Chat Dialog */}
            <SaveChatDialog
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
                messages={messagesToSave}
                defaultTitle={defaultTitle}
                onSuccess={handleSaveSuccess}
            />
        </div>
    );
}
