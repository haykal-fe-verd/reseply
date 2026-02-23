/**
 * Categories Bulk Import API Route
 * POST: upload Excel file, parse rows (name, type), create categories.
 * @date February 16, 2026
 */

import * as XLSX from "xlsx";
import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { createCategorySchema } from "@/features/category";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type CategoryType = "DISH" | "CUISINE" | "DIET";

function parseType(value: unknown): CategoryType | null {
    if (typeof value !== "string") return null;
    const u = value.trim().toUpperCase();
    if (u === "DISH" || u === "CUISINE" || u === "DIET") return u;
    return null;
}

/**
 * POST - Bulk import categories from Excel file
 * Body: multipart/form-data with field "file" (Excel .xlsx)
 * Expected columns: name (Nama), type (Tipe). Type values: DISH, CUISINE, DIET
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

        // Normalize header: accept "name"/"Nama", "type"/"Tipe"
        const first = rows[0] as Record<string, unknown>;
        const keys = Object.keys(first);
        const nameKey = keys.find((k) => k.toLowerCase() === "name" || k.toLowerCase() === "nama") ?? "name";
        const typeKey = keys.find((k) => k.toLowerCase() === "type" || k.toLowerCase() === "tipe") ?? "type";

        const created: string[] = [];
        const skipped: string[] = [];
        const errors: { row: number; message: string }[] = [];
        const usedSlugs = new Set<string>();

        // Load existing slugs
        const existing = await prisma.category.findMany({ select: { slug: true } });
        for (const c of existing) usedSlugs.add(c.slug);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as Record<string, unknown>;
            const rawName = row[nameKey];
            const rawType = row[typeKey];
            const name = typeof rawName === "string" ? rawName.trim() : String(rawName ?? "").trim();
            const type = parseType(rawType);

            if (!name) {
                errors.push({ row: i + 2, message: "Nama kosong" });
                continue;
            }
            if (!type) {
                errors.push({ row: i + 2, message: "Tipe tidak valid (gunakan DISH, CUISINE, atau DIET)" });
                continue;
            }

            const validation = createCategorySchema.safeParse({ name, type });
            if (!validation.success) {
                const msg = validation.error.flatten().fieldErrors.name?.[0] ?? "Data tidak valid";
                errors.push({ row: i + 2, message: msg });
                continue;
            }

            const slug = slugify(name);
            if (!slug) {
                errors.push({ row: i + 2, message: "Nama tidak menghasilkan slug valid" });
                continue;
            }
            if (usedSlugs.has(slug)) {
                skipped.push(name);
                continue;
            }

            try {
                await prisma.category.create({
                    data: { name: validation.data.name, slug, type: validation.data.type },
                });
                usedSlugs.add(slug);
                created.push(name);
            } catch (err) {
                if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
                    usedSlugs.add(slug);
                    skipped.push(name);
                } else {
                    errors.push({ row: i + 2, message: "Gagal menyimpan" });
                }
            }
        }

        return Response.json({
            success: true,
            message: `Import selesai: ${created.length} dibuat, ${skipped.length} dilewati (duplikat), ${errors.length} error.`,
            created: created.length,
            skipped: skipped.length,
            errors: errors.length,
            details: { created, skipped, errors },
        });
    } catch (error) {
        console.error("[CATEGORIES_BULK_IMPORT]", error);
        return Response.json(
            { success: false, message: "Terjadi kesalahan saat mengimpor file." },
            { status: 500 },
        );
    }
}
