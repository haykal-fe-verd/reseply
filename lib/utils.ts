/**
 * Utils
 * @date February 12, 2026 3:29 PM
 * @author Muhammad Haykal
 */

import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

/**
 * Class Names Merge
 * @date February 12, 2026 4:11 PM
 * @author Muhammad Haykal
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Get Initials from Name
 * @date February 12, 2026 4:09 PM
 * @author Muhammad Haykal
 *
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

/**
 * Format Date
 * @date February 12, 2026 4:21 PM
 * @author Muhammad Haykal
 *
 * @param {?(Date | string | null)} [date]
 * @returns {string}
 */
export function formatDate(date?: Date | string | null): string {
    if (!date) return "-";
    return format(new Date(typeof date === "string" ? date : date), "d MMMM yyyy", {
        locale: id,
    });
}

/**
 * Parse User Agent
 * @date February 12, 2026 4:24 PM
 * @author Muhammad Haykal
 *
 * @param {?(string | null)} [userAgent]
 * @returns {string}
 */
export function parseUserAgent(userAgent?: string | null): string {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown Browser";
}

/**
 * Format Session Date
 * @date February 12, 2026 4:24 PM
 * @author Muhammad Haykal
 *
 * @param {(Date | string)} date
 * @returns {string}
 */
export function formatSessionDate(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "d MMM yyyy, HH:mm", { locale: id });
}

/**
 * Format Session Relative Date
 * @date February 12, 2026 4:24 PM
 * @author Muhammad Haykal
 *
 * @param {(Date | string)} date
 * @returns {string}
 */
export function formatSessionRelativeDate(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: id });
}

/**
 * Slugify String
 * @date February 14, 2026 12:38 PM
 * @author Muhammad Haykal
 *
 * @param {string} input
 * @returns {string}
 */
export function slugify(input: string): string {
    return input
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

/**
 * Generate Unique Slug
 * @date February 14, 2026 12:39 PM
 * @author Muhammad Haykal
 *
 * @param {string} baseTitle
 * @param {Set<string>} used
 * @returns {string}
 */
export function uniqueSlug(baseTitle: string, used: Set<string>) {
    const base = slugify(baseTitle);
    if (!used.has(base)) {
        used.add(base);
        return base;
    }
    let i = 2;
    while (used.has(`${base}-${i}`)) i++;
    const finalSlug = `${base}-${i}`;
    used.add(finalSlug);
    return finalSlug;
}

/**
 * Mulberry32 PRNG
 * @date February 14, 2026 12:40 PM
 * @author Muhammad Haykal
 *
 * @param {number} seed
 * @returns {() => number}
 */
export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a += 0x6d2b79f5;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Random Integer
 * @date February 14, 2026 12:41 PM
 * @author Muhammad Haykal
 *
 * @param {() => number} rnd
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randInt(rnd: () => number, min: number, max: number): number {
    return Math.floor(rnd() * (max - min + 1)) + min; // inclusive
}

/**
 * Pick Random Element from Array
 * @date February 14, 2026 12:41 PM
 * @author Muhammad Haykal
 *
 * @param {() => number} rnd
 * @param {T[]} arr
 * @returns {T}
 */
export function pick<T>(rnd: () => number, arr: T[]): T {
    return arr[Math.floor(rnd() * arr.length)];
}

/**
 * Pick Weighted Random Element from Array
 * @date February 14, 2026 12:41 PM
 * @author Muhammad Haykal
 *
 * @param {() => number} rnd
 * @param {{ item: T; w: number }[]} items
 * @returns {T}
 */
export function pickWeighted<T>(rnd: () => number, items: { item: T; w: number }[]): T {
    const total = items.reduce((s, x) => s + x.w, 0);
    let r = rnd() * total;
    for (const x of items) {
        r -= x.w;
        if (r <= 0) return x.item;
    }
    return items[items.length - 1].item;
}
