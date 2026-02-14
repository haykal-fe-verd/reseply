/**
 * SEO Metadata Helper
 * Utility functions for generating page-specific metadata
 * @date February 15, 2026
 * @author Muhammad Haykal
 */

import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageMetadataOptions {
    title: string;
    description?: string;
    keywords?: string[];
    image?: string;
    noIndex?: boolean;
    pathname?: string;
}

/**
 * Generate page-specific metadata
 * @param options - Page metadata options
 * @returns Metadata object for the page
 */
export function constructMetadata({
    title,
    description = siteConfig.description,
    keywords = [],
    image = siteConfig.ogImage,
    noIndex = false,
    pathname = "",
}: PageMetadataOptions): Metadata {
    const url = `${siteConfig.url}${pathname}`;
    const fullTitle = `${title} | ${siteConfig.name}`;

    return {
        title,
        description,
        keywords: [...siteConfig.keywords, ...keywords],
        openGraph: {
            type: "website",
            locale: siteConfig.locale,
            url,
            title: fullTitle,
            description,
            siteName: siteConfig.name,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: fullTitle,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images: [image],
            creator: siteConfig.creator,
        },
        alternates: {
            canonical: url,
        },
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}

/**
 * Convert minutes to ISO 8601 duration format
 */
function minutesToISO8601(minutes: number): string {
    if (minutes <= 0) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `PT${hours}H${mins}M`;
    if (hours > 0) return `PT${hours}H`;
    return `PT${mins}M`;
}

/**
 * Generate JSON-LD structured data for recipes
 * @param recipe - Recipe data
 * @returns JSON-LD script content
 */
export function generateRecipeJsonLd(recipe: {
    name: string;
    description: string;
    image: string;
    author?: string;
    datePublished?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    ingredients: string[];
    instructions: string[];
    category?: string;
    cuisine?: string;
    url?: string;
}) {
    const prepTimeISO = recipe.prepTime ? minutesToISO8601(recipe.prepTime) : undefined;
    const cookTimeISO = recipe.cookTime ? minutesToISO8601(recipe.cookTime) : undefined;
    const totalTime =
        recipe.prepTime || recipe.cookTime
            ? minutesToISO8601((recipe.prepTime || 0) + (recipe.cookTime || 0))
            : undefined;

    return {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        author: {
            "@type": "Organization",
            name: recipe.author || siteConfig.name,
        },
        datePublished: recipe.datePublished || new Date().toISOString().split("T")[0],
        prepTime: prepTimeISO,
        cookTime: cookTimeISO,
        totalTime,
        recipeYield: recipe.servings ? `${recipe.servings} porsi` : undefined,
        recipeIngredient: recipe.ingredients,
        recipeInstructions: recipe.instructions.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            text: step,
        })),
        recipeCategory: recipe.category,
        recipeCuisine: recipe.cuisine || "Indonesian",
        url: recipe.url,
    };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        sameAs: [siteConfig.links.github],
    };
}

/**
 * Generate JSON-LD structured data for website
 */
export function generateWebsiteJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteConfig.url}/resep?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}
