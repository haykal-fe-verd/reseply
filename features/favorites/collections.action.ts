/**
 * Collections (Koleksi) Server Actions
 * Custom lists of recipes with shareable links
 */

"use server";

import { getSession } from "@/config/auth/auth-utils";
import { prisma } from "@/config/prisma";
import { slugify } from "@/lib/utils";

export type CategoryType = "DISH" | "CUISINE" | "DIET";

export interface CollectionRecipeItem {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    prepMinutes: number | null;
    cookMinutes: number | null;
    servings: number | null;
    order: number;
    categories: { id: string; name: string; slug: string; type: CategoryType }[];
}

export interface CollectionItem {
    id: string;
    name: string;
    slug: string;
    recipeCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CollectionDetail extends CollectionItem {
    recipes: CollectionRecipeItem[];
    isOwner: boolean;
    ownerName?: string;
}

export interface GetCollectionsResponse {
    success: boolean;
    data: CollectionItem[];
}

export interface GetCollectionResponse {
    success: boolean;
    data: CollectionDetail | null;
    message?: string;
}

export interface CollectionMutationResponse {
    success: boolean;
    message: string;
    data?: { id: string; slug: string };
}

function generateUniqueSlug(name: string, existingSlugs: Set<string>): string {
    const base = slugify(name) || "koleksi";
    if (!existingSlugs.has(base)) {
        return base;
    }
    let i = 1;
    while (existingSlugs.has(`${base}-${i}`)) i++;
    return `${base}-${i}`;
}

/**
 * Create a new collection
 */
export async function createCollection(name: string): Promise<CollectionMutationResponse> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, message: "Anda harus masuk terlebih dahulu." };
        }

        const trimmed = name.trim();
        if (!trimmed) {
            return { success: false, message: "Nama koleksi tidak boleh kosong." };
        }

        const existingSlugs = new Set(
            (await prisma.collection.findMany({ select: { slug: true } })).map((c) => c.slug),
        );
        const slug = generateUniqueSlug(trimmed, existingSlugs);

        const maxOrder = await prisma.collection
            .aggregate({
                where: { userId: session.user.id },
                _max: { order: true },
            })
            .then((r) => (r._max.order ?? -1) + 1);

        const collection = await prisma.collection.create({
            data: {
                userId: session.user.id,
                name: trimmed,
                slug,
                order: maxOrder,
            },
        });

        return {
            success: true,
            message: "Koleksi berhasil dibuat.",
            data: { id: collection.id, slug: collection.slug },
        };
    } catch (error) {
        console.error("Error creating collection:", error);
        return { success: false, message: "Gagal membuat koleksi." };
    }
}

/**
 * Update collection name (and slug)
 */
export async function updateCollection(
    collectionId: string,
    name: string,
): Promise<CollectionMutationResponse> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, message: "Anda harus masuk terlebih dahulu." };
        }

        const trimmed = name.trim();
        if (!trimmed) {
            return { success: false, message: "Nama koleksi tidak boleh kosong." };
        }

        const existing = await prisma.collection.findFirst({
            where: { id: collectionId, userId: session.user.id },
        });
        if (!existing) {
            return { success: false, message: "Koleksi tidak ditemukan atau bukan milik Anda." };
        }

        const existingSlugs = new Set(
            (await prisma.collection.findMany({ where: { id: { not: collectionId } }, select: { slug: true } })).map(
                (c) => c.slug,
            ),
        );
        const slug = generateUniqueSlug(trimmed, existingSlugs);

        await prisma.collection.update({
            where: { id: collectionId },
            data: { name: trimmed, slug },
        });

        return {
            success: true,
            message: "Koleksi berhasil diperbarui.",
            data: { id: collectionId, slug },
        };
    } catch (error) {
        console.error("Error updating collection:", error);
        return { success: false, message: "Gagal memperbarui koleksi." };
    }
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string): Promise<CollectionMutationResponse> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, message: "Anda harus masuk terlebih dahulu." };
        }

        const existing = await prisma.collection.findFirst({
            where: { id: collectionId, userId: session.user.id },
        });
        if (!existing) {
            return { success: false, message: "Koleksi tidak ditemukan atau bukan milik Anda." };
        }

        await prisma.collection.delete({ where: { id: collectionId } });
        return { success: true, message: "Koleksi berhasil dihapus." };
    } catch (error) {
        console.error("Error deleting collection:", error);
        return { success: false, message: "Gagal menghapus koleksi." };
    }
}

/**
 * Get current user's collections (for list view)
 */
export async function getMyCollections(): Promise<GetCollectionsResponse> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, data: [] };
        }

        const collections = await prisma.collection.findMany({
            where: { userId: session.user.id },
            orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
            include: {
                _count: { select: { recipes: true } },
            },
        });

        return {
            success: true,
            data: collections.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                recipeCount: c._count.recipes,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            })),
        };
    } catch (error) {
        console.error("Error getting collections:", error);
        return { success: false, data: [] };
    }
}

/**
 * Update collections order (for drag-and-drop reordering).
 * Pass array of collection IDs in the new order.
 */
export async function updateCollectionsOrder(
    collectionIds: string[],
): Promise<CollectionMutationResponse> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, message: "Anda harus masuk terlebih dahulu." };
        }

        if (!collectionIds.length) {
            return { success: true, message: "Urutan diperbarui." };
        }

        await prisma.$transaction(
            collectionIds.map((id, index) =>
                prisma.collection.updateMany({
                    where: { id, userId: session.user.id },
                    data: { order: index },
                }),
            ),
        );

        return { success: true, message: "Urutan koleksi diperbarui." };
    } catch (error) {
        console.error("Error updating collections order:", error);
        return { success: false, message: "Gagal memperbarui urutan." };
    }
}

/**
 * Get collection by slug (for shared link). Public: no auth required.
 * Returns owner name for display; isOwner if current user is owner.
 */
export async function getCollectionBySlug(slug: string): Promise<GetCollectionResponse> {
    try {
        const session = await getSession();

        const collection = await prisma.collection.findUnique({
            where: { slug },
            include: {
                user: { select: { id: true, name: true } },
                recipes: {
                    orderBy: { order: "asc" },
                    include: {
                        recipe: {
                            include: {
                                categories: { include: { category: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!collection) {
            return { success: false, data: null, message: "Koleksi tidak ditemukan." };
        }

        const isOwner = session?.user?.id === collection.userId;

        const data: CollectionDetail = {
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
            recipeCount: collection.recipes.length,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
            isOwner,
            ownerName: collection.user.name,
            recipes: collection.recipes.map((cr) => ({
                id: cr.recipe.id,
                title: cr.recipe.title,
                slug: cr.recipe.slug,
                description: cr.recipe.description,
                imageUrl: cr.recipe.imageUrl,
                prepMinutes: cr.recipe.prepMinutes,
                cookMinutes: cr.recipe.cookMinutes,
                servings: cr.recipe.servings,
                order: cr.order,
                categories: cr.recipe.categories.map((rc) => ({
                    id: rc.category.id,
                    name: rc.category.name,
                    slug: rc.category.slug,
                    type: rc.category.type as CategoryType,
                })),
            })),
        };

        return { success: true, data };
    } catch (error) {
        console.error("Error getting collection by slug:", error);
        return { success: false, data: null, message: "Gagal memuat koleksi." };
    }
}

/**
 * Add recipe to collection
 */
export async function addRecipeToCollection(
    collectionId: string,
    recipeId: string,
): Promise<CollectionMutationResponse> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, message: "Anda harus masuk terlebih dahulu." };
        }

        const collection = await prisma.collection.findFirst({
            where: { id: collectionId, userId: session.user.id },
            include: { _count: { select: { recipes: true } } },
        });
        if (!collection) {
            return { success: false, message: "Koleksi tidak ditemukan atau bukan milik Anda." };
        }

        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
        if (!recipe) {
            return { success: false, message: "Resep tidak ditemukan." };
        }

        await prisma.collectionRecipe.upsert({
            where: {
                collectionId_recipeId: { collectionId, recipeId },
            },
            create: {
                collectionId,
                recipeId,
                order: collection._count.recipes,
            },
            update: {},
        });

        return { success: true, message: "Resep ditambahkan ke koleksi." };
    } catch (error) {
        console.error("Error adding recipe to collection:", error);
        return { success: false, message: "Gagal menambahkan resep ke koleksi." };
    }
}

/**
 * Remove recipe from collection
 */
export async function removeRecipeFromCollection(
    collectionId: string,
    recipeId: string,
): Promise<CollectionMutationResponse> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, message: "Anda harus masuk terlebih dahulu." };
        }

        const collection = await prisma.collection.findFirst({
            where: { id: collectionId, userId: session.user.id },
        });
        if (!collection) {
            return { success: false, message: "Koleksi tidak ditemukan atau bukan milik Anda." };
        }

        await prisma.collectionRecipe.deleteMany({
            where: { collectionId, recipeId },
        });

        return { success: true, message: "Resep dihapus dari koleksi." };
    } catch (error) {
        console.error("Error removing recipe from collection:", error);
        return { success: false, message: "Gagal menghapus resep dari koleksi." };
    }
}

/**
 * Get collections that contain a recipe (for "Add to collection" UI)
 */
export async function getCollectionsContainingRecipe(recipeId: string): Promise<{
    success: boolean;
    data: { collectionId: string; name: string; slug: string }[];
}> {
    try {
        const session = await getSession();
        if (!session?.user?.id) {
            return { success: false, data: [] };
        }

        const collections = await prisma.collection.findMany({
            where: {
                userId: session.user.id,
                recipes: { some: { recipeId } },
            },
            select: { id: true, name: true, slug: true },
        });

        return {
            success: true,
            data: collections.map((c) => ({ collectionId: c.id, name: c.name, slug: c.slug })),
        };
    } catch (error) {
        console.error("Error getting collections for recipe:", error);
        return { success: false, data: [] };
    }
}
