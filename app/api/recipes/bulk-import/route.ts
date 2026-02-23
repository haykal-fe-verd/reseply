/**
 * Recipes Bulk Import API Route
 * POST: upload Excel file, parse rows, create recipes.
 * @date February 16, 2026
 */

import * as XLSX from "xlsx";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { createRecipeSchema } from "@/features/recipes";
import { uniqueSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

function col(row: Record<string, unknown>, ...keys: string[]): unknown {
    const k = keys.find((key) => row[key] !== undefined && row[key] !== "");
    return k ? row[k] : undefined;
}

function str(val: unknown): string {
    if (val == null) return "";
    return String(val).trim();
}

function num(val: unknown): number | null {
    if (val == null || val === "") return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
}

/** Parse ingredients cell: one per line, format "nama;jumlah;satuan" (jumlah/satuan optional) */
function parseIngredients(val: unknown): { name: string; amount: string | null; unit: string | null; order: number }[] {
    const raw = str(val);
    if (!raw) return [];
    const lines = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    return lines.map((line, i) => {
        const parts = line.split(";").map((p) => p.trim());
        const name = parts[0] ?? "";
        const amount = parts[1] ?? null;
        const unit = parts[2] ?? null;
        return { name, amount: amount || null, unit: unit || null, order: i };
    }).filter((ing) => ing.name.length > 0);
}

/** Parse instructions cell: one step per line */
function parseInstructions(val: unknown): { stepNumber: number; content: string }[] {
    const raw = str(val);
    if (!raw) return [];
    const lines = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    return lines.map((content, i) => ({ stepNumber: i + 1, content }));
}

/** Resolve category slugs to IDs */
async function resolveCategoryIds(slugsStr: unknown): Promise<string[]> {
    const raw = str(slugsStr);
    if (!raw) return [];
    const slugs = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (slugs.length === 0) return [];
    const categories = await prisma.category.findMany({
        where: { slug: { in: slugs } },
        select: { id: true },
    });
    return categories.map((c) => c.id);
}

/**
 * POST - Bulk import recipes from Excel file
 * Body: multipart/form-data with field "file" (Excel .xlsx)
 * Expected columns: title (Judul), description (Deskripsi), imageUrl, prepMinutes, cookMinutes, servings,
 * categorySlugs (Kategori - comma-separated slugs), ingredients (Bahan - per line "nama;jumlah;satuan"),
 * instructions (Langkah - one step per line)
 */
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return Response.json(
                { success: false, message: "Anda harus login untuk mengakses fitur ini." },
                { status: 401 },
            );
        }

        const role = (session.user as { role?: string }).role;
        if (role !== "admin") {
            return Response.json(
                { success: false, message: "Anda tidak memiliki izin untuk mengakses fitur ini." },
                { status: 403 },
            );
        }

        const formData = await request.formData();
        const file = formData.get("file");
        if (!file || !(file instanceof File)) {
            return Response.json(
                { success: false, message: "File Excel wajib diunggah." },
                { status: 400 },
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
            return Response.json(
                { success: false, message: "File Excel tidak memiliki sheet." },
                { status: 400 },
            );
        }

        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            raw: false,
            defval: "",
        });

        if (rows.length === 0) {
            return Response.json(
                { success: false, message: "Tidak ada baris data di sheet pertama." },
                { status: 400 },
            );
        }

        const first = rows[0] as Record<string, unknown>;
        const keys = Object.keys(first).map((k) => k.trim());
        const getKey = (candidates: string[]) =>
            keys.find((k) => candidates.some((c) => k.toLowerCase() === c.toLowerCase())) ?? candidates[0];

        const titleKey = getKey(["title", "judul"]);
        const descriptionKey = getKey(["description", "deskripsi"]);
        const imageUrlKey = getKey(["imageUrl", "image", "url gambar"]);
        const prepKey = getKey(["prepMinutes", "prep", "waktu persiapan"]);
        const cookKey = getKey(["cookMinutes", "cook", "waktu masak"]);
        const servingsKey = getKey(["servings", "porsi"]);
        const categorySlugsKey = getKey(["categorySlugs", "category", "kategori"]);
        const ingredientsKey = getKey(["ingredients", "bahan"]);
        const instructionsKey = getKey(["instructions", "langkah", "steps"]);

        const created: string[] = [];
        const errors: { row: number; message: string }[] = [];
        const usedSlugs = new Set<string>();

        const existingSlugs = await prisma.recipe.findMany({ select: { slug: true } });
        for (const r of existingSlugs) usedSlugs.add(r.slug);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as Record<string, unknown>;
            const title = str(col(row, titleKey));
            if (!title) {
                errors.push({ row: i + 2, message: "Judul kosong" });
                continue;
            }

            const description = str(col(row, descriptionKey)) || null;
            const imageUrlRaw = str(col(row, imageUrlKey));
            const imageUrl = imageUrlRaw ? imageUrlRaw : null;
            const prepMinutes = num(col(row, prepKey));
            const cookMinutes = num(col(row, cookKey));
            const servingsRaw = num(col(row, servingsKey));
            const servings = servingsRaw != null && servingsRaw >= 1 ? servingsRaw : null;

            const ingredients = parseIngredients(col(row, ingredientsKey));
            const instructions = parseInstructions(col(row, instructionsKey));
            const categoryIds = await resolveCategoryIds(col(row, categorySlugsKey));

            const payload = {
                title,
                description,
                imageUrl,
                prepMinutes,
                cookMinutes,
                servings,
                ingredients: ingredients.length > 0 ? ingredients : undefined,
                instructions: instructions.length > 0 ? instructions : undefined,
                categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
            };

            const validation = createRecipeSchema.safeParse(payload);
            if (!validation.success) {
                const msg = validation.error.flatten().fieldErrors.title?.[0]
                    ?? validation.error.flatten().fieldErrors.imageUrl?.[0]
                    ?? "Data tidak valid";
                errors.push({ row: i + 2, message: msg });
                continue;
            }

            const slug = uniqueSlug(title, usedSlugs);

            try {
                await prisma.recipe.create({
                    data: {
                        title: validation.data.title.trim(),
                        slug,
                        description: validation.data.description?.trim() || null,
                        imageUrl: validation.data.imageUrl?.trim() || null,
                        prepMinutes: validation.data.prepMinutes ?? null,
                        cookMinutes: validation.data.cookMinutes ?? null,
                        servings: validation.data.servings ?? null,
                        ingredients: validation.data.ingredients
                            ? {
                                  create: validation.data.ingredients.map((ing, idx) => ({
                                      name: ing.name.trim(),
                                      amount: ing.amount?.trim() || null,
                                      unit: ing.unit?.trim() || null,
                                      order: ing.order ?? idx,
                                  })),
                              }
                            : undefined,
                        instructions: validation.data.instructions
                            ? {
                                  create: validation.data.instructions.map((inst) => ({
                                      stepNumber: inst.stepNumber,
                                      content: inst.content.trim(),
                                  })),
                              }
                            : undefined,
                        categories: validation.data.categoryIds
                            ? {
                                  create: validation.data.categoryIds.map((catId) => ({ categoryId: catId })),
                              }
                            : undefined,
                    },
                });
                created.push(title);
            } catch (err) {
                const msg = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Gagal menyimpan";
                errors.push({ row: i + 2, message: msg });
            }
        }

        return Response.json({
            success: true,
            message: `Import selesai: ${created.length} resep dibuat, ${errors.length} error.`,
            created: created.length,
            errors: errors.length,
            details: { created, errors },
        });
    } catch (error) {
        console.error("[RECIPES_BULK_IMPORT]", error);
        return Response.json(
            { success: false, message: "Terjadi kesalahan saat mengimpor file." },
            { status: 500 },
        );
    }
}
