/**
 * Custom hook untuk fetch estimasi kalori dari API
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

"use client";

import { useState, useCallback } from "react";

interface Ingredient {
    id: string;
    name: string;
    amount?: string | number | null;
    unit?: string | null;
}

interface CalorieIngredient {
    name: string;
    estimatedCalories: number;
    notes?: string;
}

interface CalorieData {
    totalCalories: number;
    caloriesPerServing: number;
    ingredients: CalorieIngredient[];
    summary: string;
    healthTip: string;
}

interface UseCaloriesReturn {
    data: CalorieData | null;
    isLoading: boolean;
    error: string | null;
    fetchCalories: (ingredients: Ingredient[], servings?: number) => Promise<void>;
    reset: () => void;
}

export function useCalories(): UseCaloriesReturn {
    const [data, setData] = useState<CalorieData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCalories = useCallback(async (ingredients: Ingredient[], servings?: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/calories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ingredients: ingredients.map((ing) => ({
                        name: ing.name,
                        amount: ing.amount,
                        unit: ing.unit,
                    })),
                    servings,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Gagal menghitung kalori");
            }

            setData(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return { data, isLoading, error, fetchCalories, reset };
}
