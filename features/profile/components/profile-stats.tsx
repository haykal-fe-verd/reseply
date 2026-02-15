"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut" as const,
        },
    },
} as const;

export function ProfileStats({
    weight,
    height,
    dateOfBirth,
}: {
    weight?: number | null;
    height?: number | null;
    dateOfBirth?: Date | string | null;
}) {
    const hasDob = dateOfBirth != null && `${dateOfBirth}` !== "";
    const hasWeight = typeof weight === "number" && Number.isFinite(weight);
    const hasHeight = typeof height === "number" && Number.isFinite(height);

    const age = useMemo(() => {
        if (!hasDob || !dateOfBirth) return null;
        const birth = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
        if (!Number.isFinite(birth.getTime())) return null; // cegah Invalid Date
        const today = new Date();
        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            calculatedAge--;
        }
        return calculatedAge;
    }, [dateOfBirth, hasDob]);

    const bmi = useMemo(() => {
        if (!hasWeight || !hasHeight || !height || !weight) return null;
        const heightInMeters = height / 100;
        if (!Number.isFinite(heightInMeters) || heightInMeters <= 0) return null;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }, [weight, height, hasWeight, hasHeight]);

    const bmiCategory = useMemo(() => {
        if (!bmi) return null;
        const bmiValue = Number.parseFloat(bmi);
        if (bmiValue < 18.5) return { label: "Kurus", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
        if (bmiValue < 25) return { label: "Normal", color: "text-green-500 bg-green-500/10 border-green-500/20" };
        if (bmiValue < 30) return { label: "Gemuk", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
        return { label: "Obesitas", color: "text-red-500 bg-red-500/10 border-red-500/20" };
    }, [bmi]);

    const hasData = hasDob || hasWeight || hasHeight;
    if (!hasData) return null;

    return (
        <motion.div
            key={`${weight}-${height}-${dateOfBirth}`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {age !== null && (
                <div className="rounded-xl border border-border/50 bg-linear-to-br from-muted/50 to-muted/30 p-4 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{age}</p>
                    <p className="text-xs text-muted-foreground mt-1">Tahun</p>
                </div>
            )}

            {hasWeight && (
                <div className="rounded-xl border border-border/50 bg-linear-to-br from-muted/50 to-muted/30 p-4 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{weight}</p>
                    <p className="text-xs text-muted-foreground mt-1">kg</p>
                </div>
            )}

            {hasHeight && (
                <div className="rounded-xl border border-border/50 bg-linear-to-br from-muted/50 to-muted/30 p-4 text-center">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{height}</p>
                    <p className="text-xs text-muted-foreground mt-1">cm</p>
                </div>
            )}

            {bmi && bmiCategory && (
                <div className={cn("rounded-xl border p-4 text-center", bmiCategory.color)}>
                    <p className="text-2xl sm:text-3xl font-bold">{bmi}</p>
                    <p className="text-xs mt-1">{bmiCategory.label}</p>
                </div>
            )}
        </motion.div>
    );
}
