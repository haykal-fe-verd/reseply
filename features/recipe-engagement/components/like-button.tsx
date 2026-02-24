/**
 * Like Button Component
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ThumbsUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/config/auth/auth-client";
import { useRecipeLikes, useToggleLike } from "@/features/recipe-engagement";
import { cn } from "@/lib/utils";

interface LikeButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
    recipeId: string;
    showCount?: boolean;
    tooltipSide?: "top" | "bottom" | "left" | "right";
}

export function LikeButton({
    recipeId,
    showCount = true,
    tooltipSide = "top",
    className,
    variant = "ghost",
    size = "sm",
    ...props
}: LikeButtonProps) {
    const router = useRouter();
    const { data: session, isPending: isSessionLoading } = authClient.useSession();
    const { data: likesData, isLoading: isLikesLoading } = useRecipeLikes(recipeId);
    const { mutate: toggleLike, isPending: isToggling } = useToggleLike(recipeId);

    const isAuthenticated = !!session?.user;
    const likeCount = likesData?.data?.likeCount ?? 0;
    const userLiked = likesData?.data?.userLiked ?? false;
    const isLoading = isSessionLoading || (isAuthenticated && isLikesLoading) || isToggling;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            router.push("/sign-in?callbackUrl=" + encodeURIComponent(window.location.pathname));
            return;
        }

        toggleLike();
    };

    const buttonContent = (
        <Button
            variant={variant}
            size={size}
            className={cn(
                "gap-2 transition-all duration-200",
                userLiked && "text-rose-500 hover:text-rose-600",
                !userLiked && "hover:text-rose-500",
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
                        <Loader2 className="size-4 animate-spin" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="heart"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}>
                        <motion.div
                            animate={userLiked ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3 }}>
                            <ThumbsUp
                                className={cn("size-4 transition-all duration-200", userLiked && "fill-current")}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {showCount && (
                <span className="tabular-nums text-muted-foreground">
                    {likeCount > 0 ? likeCount.toLocaleString() : "0"} Suka
                </span>
            )}
            <span className="sr-only">
                {!isAuthenticated ? "Masuk untuk memberi like" : userLiked ? "Batalkan like" : "Suka resep ini"}
            </span>
        </Button>
    );

    if (!showCount) {
        return (
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                    <TooltipContent side={tooltipSide} className="text-xs">
                        {!isAuthenticated ? "Masuk untuk memberi like" : userLiked ? "Batalkan like" : "Suka resep ini"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return buttonContent;
}
