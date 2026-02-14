import { cva, type VariantProps } from "class-variance-authority";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const logoVariants = cva("flex items-center justify-center rounded-lg font-bold transition-colors", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground",
            secondary: "bg-secondary text-secondary-foreground",
        },
        size: {
            default: "size-8",
            sm: "size-6",
            md: "size-10",
            lg: "size-12",
            xl: "size-16",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});

const logoTextVariants = cva("font-bold", {
    variants: {
        size: {
            default: "text-lg",
            sm: "text-sm",
            md: "text-xl",
            lg: "text-2xl",
            xl: "text-4xl",
        },
    },
    defaultVariants: {
        size: "default",
    },
});

interface LogoProps extends VariantProps<typeof logoVariants> {
    className?: string;
    showText?: boolean;
}

export function Logo({ className, variant = "default", size = "default", showText = false }: LogoProps) {
    return (
        <div className={cn(logoVariants({ variant, size }), className)}>
            <span className={cn(logoTextVariants({ size }))}>
                {showText ? APP_NAME : APP_NAME.charAt(0).toUpperCase()}
            </span>
        </div>
    );
}
