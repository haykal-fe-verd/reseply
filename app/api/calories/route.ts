/**
 * Calories Checker API Route
 * Generate estimasi kalori dari bahan-bahan resep via OpenRouter (Gemini).
 * @date February 24, 2026
 * @author Muhammad Haykal
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { OPEN_ROUTER_MODEL } from "@/lib/constants";

function getOpenRouter() {
    const apiKey = process.env.OPEN_ROUTER_API_KEY;
    if (!apiKey?.trim()) {
        return null;
    }
    return createOpenRouter({ apiKey });
}

const SYSTEM_PROMPT = `Kamu adalah asisten nutrisi dari Reseply. Tugasmu menghitung estimasi kalori dari daftar bahan makanan.

## ATURAN
- Berikan respons DALAM FORMAT JSON YANG VALID saja, tanpa markdown code blocks
- Hitung total kalori berdasarkan bahan dan jumlahnya
- Jika bahan tidak memiliki jumlah spesifik, estimasi dengan porsi standar untuk 1 porsi
- Gunakan bahasa Indonesia

## FORMAT RESPONS (WAJIB JSON MURNI)
{
  "totalCalories": number,
  "caloriesPerServing": number,
  "ingredients": [
    {
      "name": string,
      "estimatedCalories": number,
      "notes": string
    }
  ],
  "summary": string,
  "healthTip": string
}

PENTING: Jangan gunakan markdown code blocks. Langsung berikan JSON murni.`;

interface IngredientInput {
    name: string;
    amount?: string | number | null;
    unit?: string | null;
}

interface CalorieResponse {
    totalCalories: number;
    caloriesPerServing?: number;
    ingredients?: Array<{
        name: string;
        estimatedCalories: number;
        notes?: string;
    }>;
    summary?: string;
    healthTip?: string;
}

export async function POST(request: Request) {
    const openrouter = getOpenRouter();
    if (!openrouter) {
        return Response.json({ success: false, message: "Layanan cek kalori belum dikonfigurasi" }, { status: 503 });
    }

    try {
        const body = await request.json();
        const { ingredients, servings }: { ingredients: IngredientInput[]; servings?: number } = body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return Response.json({ success: false, message: "Daftar bahan diperlukan" }, { status: 400 });
        }

        // Format bahan untuk prompt
        const ingredientsText = ingredients
            .map((ing) => {
                const parts = [ing.name];
                if (ing.amount && ing.unit) {
                    parts.push(`(${ing.amount} ${ing.unit})`);
                } else if (ing.amount) {
                    parts.push(`(${ing.amount})`);
                }
                return parts.join(" ");
            })
            .join("\n- ");

        const result = await generateText({
            model: openrouter.chat(OPEN_ROUTER_MODEL),
            system: SYSTEM_PROMPT,
            prompt: `Hitung estimasi kalori untuk bahan-bahan berikut${servings ? ` (untuk ${servings} porsi)` : ""}:

- ${ingredientsText}

Berikan respons dalam format JSON murni tanpa code blocks.`,
            temperature: 0.3,
            maxOutputTokens: 1024,
        });

        // Parse JSON dari response AI
        const responseText = result.text.trim();

        // Coba parse langsung
        let calorieData: CalorieResponse;
        try {
            calorieData = JSON.parse(responseText);
        } catch {
            // Jika gagal, coba cari JSON dalam text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error("Failed to parse AI response:", responseText);
                return Response.json({ success: false, message: "Gagal memproses respons AI" }, { status: 500 });
            }
            calorieData = JSON.parse(jsonMatch[0]);
        }

        // Validasi struktur data
        if (typeof calorieData.totalCalories !== "number") {
            return Response.json({ success: false, message: "Format respons AI tidak valid" }, { status: 500 });
        }

        return Response.json({
            success: true,
            data: {
                totalCalories: Math.round(calorieData.totalCalories),
                caloriesPerServing: Math.round(
                    calorieData.caloriesPerServing ?? calorieData.totalCalories / (servings ?? 1),
                ),
                ingredients: calorieData.ingredients ?? [],
                summary: calorieData.summary ?? "Estimasi kalori berhasil dihitung",
                healthTip: calorieData.healthTip ?? "Konsumsi secukupnya dengan pola makan seimbang",
            },
        });
    } catch (error) {
        console.error("Calories API Error:", error);
        return Response.json({ success: false, message: "Terjadi kesalahan saat menghitung kalori" }, { status: 500 });
    }
}
