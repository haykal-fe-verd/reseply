/**
 * Share Recipe Dialog Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Facebook, Link2, Mail, MessageCircle, Send } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Custom icons for social media
function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function TelegramIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
    );
}

function TwitterXIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    );
}

function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
    );
}

interface ShareRecipeDialogProps {
    recipeTitle: string;
    recipeSlug: string;
    recipeDescription?: string | null;
    children: React.ReactNode;
}

interface ShareOption {
    name: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
}

export function ShareRecipeDialog({ recipeTitle, recipeSlug, recipeDescription, children }: ShareRecipeDialogProps) {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/resep/${recipeSlug}` : "";
    const shareText = `Cek resep ${recipeTitle} yang lezat ini! 🍳`;
    const shareTextWithDesc = recipeDescription
        ? `${shareText}\n\n${recipeDescription.slice(0, 100)}${recipeDescription.length > 100 ? "..." : ""}`
        : shareText;

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link berhasil disalin!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Gagal menyalin link");
        }
    }, [shareUrl]);

    const shareOptions: ShareOption[] = [
        {
            name: "WhatsApp",
            icon: <WhatsAppIcon className="size-5" />,
            color: "bg-[#25D366] hover:bg-[#22c55e]",
            onClick: () => {
                const url = `https://wa.me/?text=${encodeURIComponent(`${shareTextWithDesc}\n\n${shareUrl}`)}`;
                window.open(url, "_blank", "noopener,noreferrer");
            },
        },
        {
            name: "Telegram",
            icon: <TelegramIcon className="size-5" />,
            color: "bg-[#0088cc] hover:bg-[#0077b5]",
            onClick: () => {
                const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                window.open(url, "_blank", "noopener,noreferrer");
            },
        },
        {
            name: "X (Twitter)",
            icon: <TwitterXIcon className="size-5" />,
            color: "bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
            onClick: () => {
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                window.open(url, "_blank", "noopener,noreferrer");
            },
        },
        {
            name: "Facebook",
            icon: <Facebook className="size-5" />,
            color: "bg-[#1877F2] hover:bg-[#166fe5]",
            onClick: () => {
                const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                window.open(url, "_blank", "noopener,noreferrer");
            },
        },
        {
            name: "Instagram",
            icon: <InstagramIcon className="size-5" />,
            color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90",
            onClick: () => {
                copyToClipboard();
                toast.info("Link disalin! Paste di Instagram Story atau DM Anda", {
                    duration: 4000,
                });
            },
        },
        {
            name: "TikTok",
            icon: <TikTokIcon className="size-5" />,
            color: "bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
            onClick: () => {
                copyToClipboard();
                toast.info("Link disalin! Paste di TikTok video atau bio Anda", {
                    duration: 4000,
                });
            },
        },
        {
            name: "Email",
            icon: <Mail className="size-5" />,
            color: "bg-neutral-600 hover:bg-neutral-700",
            onClick: () => {
                const subject = encodeURIComponent(`Resep: ${recipeTitle}`);
                const body = encodeURIComponent(`${shareTextWithDesc}\n\nLihat resep selengkapnya di:\n${shareUrl}`);
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
            },
        },
        {
            name: "Pesan",
            icon: <MessageCircle className="size-5" />,
            color: "bg-blue-500 hover:bg-blue-600",
            onClick: () => {
                if (navigator.share) {
                    navigator.share({
                        title: recipeTitle,
                        text: shareText,
                        url: shareUrl,
                    });
                } else {
                    copyToClipboard();
                }
            },
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="size-5 text-primary" />
                        Bagikan Resep
                    </DialogTitle>
                    <DialogDescription>
                        Bagikan resep &quot;{recipeTitle}&quot; ke media sosial favorit Anda
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Social Media Grid */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.05,
                                },
                            },
                        }}
                        className="grid grid-cols-4 gap-3">
                        {shareOptions.map((option) => (
                            <motion.button
                                key={option.name}
                                variants={{
                                    hidden: { opacity: 0, scale: 0.8 },
                                    visible: { opacity: 1, scale: 1 },
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={option.onClick}
                                className={`flex flex-col items-center gap-2 rounded-xl p-3 text-white transition-all ${option.color}`}>
                                {option.icon}
                                <span className="text-[10px] font-medium">{option.name}</span>
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Copy Link Section */}
                    <div className="space-y-2">
                        <label htmlFor="share-link" className="text-sm font-medium text-muted-foreground">
                            Atau salin link
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="share-link"
                                    value={shareUrl}
                                    readOnly
                                    className="pl-9 pr-4 text-sm"
                                    onClick={(e) => e.currentTarget.select()}
                                />
                            </div>
                            <Button variant="secondary" size="icon" onClick={copyToClipboard} className="shrink-0">
                                <AnimatePresence mode="wait">
                                    {copied ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}>
                                            <Check className="size-4 text-green-500" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="copy"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}>
                                            <Copy className="size-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
