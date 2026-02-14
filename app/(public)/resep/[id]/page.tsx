import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { RecipeDetailPage } from "@/features/public-recipes";
import { getRecipeBySlug } from "@/features/public-recipes/public-recipes.action";
import { generateRecipeJsonLd } from "@/lib/seo";

interface ResepDetailRouteProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ResepDetailRouteProps): Promise<Metadata> {
    const { id } = await params;
    const result = await getRecipeBySlug(id);

    if (!result.success || !result.data) {
        return {
            title: "Resep Tidak Ditemukan",
            description: "Resep yang Anda cari tidak ditemukan.",
        };
    }

    const recipe = result.data;
    const title = recipe.title;
    const description = recipe.description || `Pelajari cara membuat ${recipe.title} dengan resep lengkap di Reseply.`;
    const url = `${siteConfig.url}/resep/${recipe.slug}`;
    const image = recipe.imageUrl || siteConfig.ogImage;

    // Get category names for keywords
    const categoryNames = recipe.categories.map((c) => c.name.toLowerCase());

    return {
        title,
        description,
        keywords: [recipe.title.toLowerCase(), "resep", "masakan", ...categoryNames],
        openGraph: {
            type: "article",
            locale: siteConfig.locale,
            url,
            title: `${title} | ${siteConfig.name}`,
            description,
            siteName: siteConfig.name,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ${siteConfig.name}`,
            description,
            images: [image],
        },
        alternates: {
            canonical: url,
        },
    };
}

export default async function ResepDetailRoute({ params }: ResepDetailRouteProps) {
    const { id } = await params;
    if (!id) notFound();

    // Fetch recipe for JSON-LD
    const result = await getRecipeBySlug(id);

    // Generate JSON-LD for recipe
    const jsonLd =
        result.success && result.data
            ? generateRecipeJsonLd({
                  name: result.data.title,
                  description: result.data.description || "",
                  image: result.data.imageUrl || siteConfig.ogImage,
                  prepTime: result.data.prepMinutes || undefined,
                  cookTime: result.data.cookMinutes || undefined,
                  servings: result.data.servings || undefined,
                  ingredients: result.data.ingredients.map((i) => `${i.amount || ""} ${i.unit || ""} ${i.name}`.trim()),
                  instructions: result.data.instructions.map((i) => i.content),
                  url: `${siteConfig.url}/resep/${result.data.slug}`,
              })
            : null;

    return (
        <>
            {jsonLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            )}
            <RecipeDetailPage slug={id} />
        </>
    );
}
