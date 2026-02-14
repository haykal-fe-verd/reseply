/**
 * Favorite Button Component
 * @date February 14, 2026
 * @author Muhammad Haykal
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/config/auth/auth-client";
import { useFavoriteIds, useToggleFavorite } from "@/features/favorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
    recipeId: string;
    showLabel?: boolean;
    tooltipSide?: "top" | "bottom" | "left" | "right";
}

export function FavoriteButton({
    recipeId,
    showLabel = false,
    tooltipSide = "top",
    className,
    variant = "ghost",
    size = "icon",
    ...props
}: FavoriteButtonProps) {
    const router = useRouter();
    const { data: session, isPending: isSessionLoading } = authClient.useSession();
    const { data: favoriteIdsData, isLoading: isFavoritesLoading } = useFavoriteIds();
    const { mutate: toggleFavorite, isPending: isToggling } = useToggleFavorite();

    const isAuthenticated = !!session?.user;
    // Only show as favorited if user is authenticated AND recipe is in favorites
    const isFavorited = isAuthenticated && (favoriteIdsData?.favoriteIds?.includes(recipeId) ?? false);
    const isLoading = isSessionLoading || (isAuthenticated && isFavoritesLoading) || isToggling;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            // Redirect to sign in page
            router.push("/sign-in?callbackUrl=" + encodeURIComponent(window.location.pathname));
            return;
        }

        toggleFavorite(recipeId);
    };

    const buttonContent = (
        <Button
            variant={variant}
            size={showLabel ? "sm" : size}
            className={cn(
                "transition-all duration-200",
                !showLabel && "size-9 rounded-full",
                isFavorited && "text-red-500 hover:text-red-600",
                !isFavorited && "hover:text-red-500",
                className,
            )}
            onClick={handleClick}
            disabled={isLoading}
            {...props}>
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}>
                        <Loader2 className="size-5 animate-spin" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="heart"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}>
                        <motion.div
                            animate={isFavorited ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3 }}>
                            <Heart
                                className={cn("size-5 transition-all duration-200", isFavorited && "fill-current")}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {showLabel && <span className="ml-2">{isFavorited ? "Tersimpan" : "Simpan"}</span>}
            <span className="sr-only">{isFavorited ? "Hapus dari favorit" : "Tambahkan ke favorit"}</span>
        </Button>
    );

    if (showLabel) {
        return buttonContent;
    }

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                <TooltipContent side={tooltipSide} className="text-xs">
                    {!isAuthenticated
                        ? "Masuk untuk menyimpan"
                        : isFavorited
                          ? "Hapus dari favorit"
                          : "Simpan ke favorit"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
