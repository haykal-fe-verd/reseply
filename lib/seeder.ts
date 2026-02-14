import { CategoryType, type PrismaClient } from "@/lib/generated/prisma/client";
import { mulberry32, pick, pickWeighted, randInt, uniqueSlug } from "@/lib/utils";

export const CATEGORY_SEED: {
    name: string;
    slug: string;
    type: CategoryType;
}[] = [
    // DISH (23)
    { name: "Hidangan Utama", slug: "hidangan-utama", type: CategoryType.DISH },
    {
        name: "Hidangan Pendamping",
        slug: "hidangan-pendamping",
        type: CategoryType.DISH,
    },
    { name: "Sarapan", slug: "sarapan", type: CategoryType.DISH },
    { name: "Makanan Penutup", slug: "makanan-penutup", type: CategoryType.DISH },
    { name: "Sup", slug: "sup", type: CategoryType.DISH },
    { name: "Cemilan", slug: "cemilan", type: CategoryType.DISH },
    { name: "Minuman", slug: "minuman", type: CategoryType.DISH },
    { name: "Sambal", slug: "sambal", type: CategoryType.DISH },
    { name: "Kue Tradisional", slug: "kue-tradisional", type: CategoryType.DISH },
    { name: "Lauk Pauk", slug: "lauk-pauk", type: CategoryType.DISH },
    { name: "Sayur", slug: "sayur", type: CategoryType.DISH },
    { name: "Olahan Ayam", slug: "olahan-ayam", type: CategoryType.DISH },
    { name: "Olahan Sapi", slug: "olahan-sapi", type: CategoryType.DISH },
    { name: "Olahan Ikan", slug: "olahan-ikan", type: CategoryType.DISH },
    { name: "Olahan Seafood", slug: "olahan-seafood", type: CategoryType.DISH },
    { name: "Tahu & Tempe", slug: "tahu-tempe", type: CategoryType.DISH },
    { name: "Mie & Bihun", slug: "mie-dan-bihun", type: CategoryType.DISH },
    { name: "Nasi & Beras", slug: "nasi-dan-beras", type: CategoryType.DISH },
    { name: "Bubur", slug: "bubur", type: CategoryType.DISH },
    { name: "Sate & Bakar", slug: "sate-dan-bakar", type: CategoryType.DISH },
    { name: "Gorengan", slug: "gorengan", type: CategoryType.DISH },
    { name: "Tumisan", slug: "tumisan", type: CategoryType.DISH },
    { name: "Kukus", slug: "kukus", type: CategoryType.DISH },

    // CUISINE (22)
    { name: "Indonesia", slug: "indonesia", type: CategoryType.CUISINE },
    { name: "Jawa", slug: "jawa", type: CategoryType.CUISINE },
    { name: "Sunda", slug: "sunda", type: CategoryType.CUISINE },
    { name: "Betawi", slug: "betawi", type: CategoryType.CUISINE },
    { name: "Padang", slug: "padang", type: CategoryType.CUISINE },
    { name: "Manado", slug: "manado", type: CategoryType.CUISINE },
    { name: "Bali", slug: "bali", type: CategoryType.CUISINE },
    { name: "Madura", slug: "madura", type: CategoryType.CUISINE },
    { name: "Banjar", slug: "banjar", type: CategoryType.CUISINE },
    { name: "Palembang", slug: "palembang", type: CategoryType.CUISINE },
    { name: "Aceh", slug: "aceh", type: CategoryType.CUISINE },
    { name: "Makassar", slug: "makassar", type: CategoryType.CUISINE },
    { name: "Cirebon", slug: "cirebon", type: CategoryType.CUISINE },
    { name: "Lombok", slug: "lombok", type: CategoryType.CUISINE },
    { name: "Maluku", slug: "maluku", type: CategoryType.CUISINE },
    { name: "Papua", slug: "papua", type: CategoryType.CUISINE },
    { name: "Minang", slug: "minang", type: CategoryType.CUISINE },
    { name: "Melayu", slug: "melayu", type: CategoryType.CUISINE },
    { name: "Peranakan", slug: "peranakan", type: CategoryType.CUISINE },
    { name: "Nusantara", slug: "nusantara", type: CategoryType.CUISINE },
    { name: "Jepang", slug: "jepang", type: CategoryType.CUISINE },
    { name: "Italia", slug: "italia", type: CategoryType.CUISINE },

    // DIET (5)
    { name: "Vegetarian", slug: "vegetarian", type: CategoryType.DIET },
    { name: "Vegan", slug: "vegan", type: CategoryType.DIET },
    { name: "Rendah Kalori", slug: "rendah-kalori", type: CategoryType.DIET },
    { name: "Tinggi Protein", slug: "tinggi-protein", type: CategoryType.DIET },
    { name: "Bebas Gluten", slug: "bebas-gluten", type: CategoryType.DIET },
];

export async function seedCategories(prisma: PrismaClient) {
    await prisma.category.createMany({
        data: CATEGORY_SEED,
        skipDuplicates: true,
    });

    const categories = await prisma.category.findMany();
    const categoriesBySlug = Object.fromEntries(categories.map((c) => [c.slug, c])) as Record<
        string,
        { id: string; slug: string; name: string; type: string }
    >;

    // biome-ignore lint/complexity/useLiteralKeys: <- Justification: This is a sanity check to ensure the seed data is correct and the "indonesia" category exists, which is crucial for other seeds that depend on it.>
    if (!categoriesBySlug["indonesia"]) {
        throw new Error('Category slug "indonesia" tidak ditemukan setelah seeding.');
    }

    return { categoriesBySlug };
}

const UNSPLASH_IMAGES = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
];

type IngredientSeed = {
    name: string;
    amount?: string | null;
    unit?: string | null;
};

const DISH_SLUGS_WEIGHTED = [
    { item: "hidangan-utama", w: 28 },
    { item: "lauk-pauk", w: 18 },
    { item: "sayur", w: 10 },
    { item: "sup", w: 10 },
    { item: "sarapan", w: 8 },
    { item: "nasi-dan-beras", w: 8 },
    { item: "mie-dan-bihun", w: 8 },
    { item: "sate-dan-bakar", w: 7 },
    { item: "tumisan", w: 8 },
    { item: "gorengan", w: 7 },
    { item: "cemilan", w: 7 },
    { item: "kue-tradisional", w: 6 },
    { item: "makanan-penutup", w: 6 },
    { item: "minuman", w: 4 },
    { item: "sambal", w: 4 },
    { item: "bubur", w: 5 },
    { item: "kukus", w: 5 },
    { item: "olahan-ayam", w: 10 },
    { item: "olahan-sapi", w: 6 },
    { item: "olahan-ikan", w: 8 },
    { item: "olahan-seafood", w: 6 },
    { item: "tahu-tempe", w: 6 },
    { item: "hidangan-pendamping", w: 5 },
];

const INDO_REGION_SLUGS = [
    "jawa",
    "sunda",
    "betawi",
    "padang",
    "manado",
    "bali",
    "madura",
    "banjar",
    "palembang",
    "aceh",
    "makassar",
    "cirebon",
    "lombok",
    "maluku",
    "papua",
    "minang",
    "melayu",
    "peranakan",
    "nusantara",
] as const;

const FLAVOR_TAGS = [
    "Balado",
    "Bumbu Kuning",
    "Bumbu Merah",
    "Rica-rica",
    "Woku",
    "Kecap",
    "Kemangi",
    "Sambal Matah",
    "Asam Manis",
    "Pedas Manis",
    "Gulai",
    "Rendang",
    "Semur",
    "Santan",
    "Serundeng",
    "Lada Hitam",
    "Terasi",
    "Tauco",
] as const;

const PROTEIN_SAVORY = [
    "Ayam",
    "Daging Sapi",
    "Ikan Kembung",
    "Ikan Tongkol",
    "Ikan Nila",
    "Udang",
    "Cumi",
    "Telur",
    "Tahu",
    "Tempe",
    "Jamur",
    "Ati Ampela",
] as const;

const VEGGIES = ["Wortel", "Buncis", "Kol", "Sawi", "Kangkung", "Terong", "Tauge", "Bayam"] as const;
const AROMATICS = ["Bawang Merah", "Bawang Putih", "Cabai Merah", "Cabai Rawit", "Jahe", "Kunyit", "Lengkuas"] as const;
const HERBS = ["Daun Salam", "Serai", "Daun Jeruk", "Kemangi", "Daun Bawang", "Seledri"] as const;

const DESSERT_BASE = ["Tepung Beras", "Tepung Terigu", "Santan", "Gula Merah", "Gula Pasir", "Kelapa Parut"] as const;
const DRINK_BASE = ["Air", "Gula Merah", "Jahe", "Serai", "Kayu Manis", "Jeruk Nipis"] as const;

function kindFromDishSlug(slug: string) {
    if (slug === "minuman") return "DRINK";
    if (slug === "sambal") return "SAMBAL";
    if (slug === "makanan-penutup" || slug === "kue-tradisional") return "DESSERT";
    if (slug === "sup") return "SOUP";
    if (slug === "gorengan" || slug === "cemilan") return "SNACK";
    if (slug === "bubur" || slug === "sarapan") return "BREAKFAST";
    return "SAVORY";
}

function guessDiet(rnd: () => number, main: string) {
    const plantBased = ["Tahu", "Tempe", "Jamur"].some((x) => main.includes(x));
    if (plantBased) return rnd() < 0.45 ? "vegan" : "vegetarian";

    const roll = rnd();
    if (roll < 0.08) return "rendah-kalori";
    if (roll < 0.16) return "tinggi-protein";
    if (roll < 0.22) return "bebas-gluten";
    return null;
}

function buildIngredients(rnd: () => number, kind: string, main: string, vegan: boolean): IngredientSeed[] {
    if (kind === "DRINK") {
        // Ensure we have at least 4 unique items by picking until we have enough
        const picked: string[] = [];
        const drinkItems = [...DRINK_BASE];
        while (picked.length < 4 && drinkItems.length > 0) {
            const item = pick(rnd, drinkItems);
            if (!picked.includes(item)) {
                picked.push(item);
            }
        }
        // Fallback if not enough
        while (picked.length < 4) {
            picked.push(DRINK_BASE[picked.length % DRINK_BASE.length]);
        }
        return [
            { name: picked[0], amount: "500", unit: "ml" },
            { name: picked[1], amount: "2", unit: "sdm" },
            { name: picked[2], amount: "1", unit: "ruas" },
            { name: picked[3], amount: "1", unit: "batang" },
            { name: "Es Batu", amount: null, unit: "secukupnya" },
        ];
    }

    if (kind === "DESSERT") {
        // Ensure we have at least 4 unique items
        const picked: string[] = [];
        const dessertItems = [...DESSERT_BASE];
        while (picked.length < 4 && dessertItems.length > 0) {
            const item = pick(rnd, dessertItems);
            if (!picked.includes(item)) {
                picked.push(item);
            }
        }
        // Fallback if not enough
        while (picked.length < 4) {
            picked.push(DESSERT_BASE[picked.length % DESSERT_BASE.length]);
        }
        return [
            { name: picked[0], amount: "200", unit: "gram" },
            { name: picked[1], amount: "150", unit: "ml" },
            { name: picked[2], amount: "80", unit: "gram" },
            { name: picked[3], amount: "1/4", unit: "sdt" },
            { name: "Garam", amount: null, unit: "sejumput" },
            { name: "Vanili", amount: null, unit: "secukupnya" },
        ];
    }

    if (kind === "SAMBAL") {
        const terasi = !vegan && rnd() < 0.6;
        return [
            { name: "Cabai Merah", amount: "10", unit: "buah" },
            { name: "Cabai Rawit", amount: rnd() < 0.5 ? "5" : "10", unit: "buah" },
            { name: "Bawang Merah", amount: "6", unit: "butir" },
            { name: "Bawang Putih", amount: "3", unit: "siung" },
            ...(terasi ? [{ name: "Terasi", amount: "1", unit: "sdt" } as IngredientSeed] : []),
            { name: "Garam", amount: null, unit: "secukupnya" },
            { name: "Gula", amount: null, unit: "secukupnya" },
            { name: "Minyak Goreng", amount: "2", unit: "sdm" },
            {
                name: "Jeruk Limau",
                amount: rnd() < 0.5 ? "1" : null,
                unit: rnd() < 0.5 ? "buah" : "secukupnya",
            },
        ];
    }

    if (kind === "SOUP") {
        return [
            { name: main, amount: "300", unit: "gram" },
            { name: "Air / Kaldu", amount: "1", unit: "liter" },
            { name: pick(rnd, [...AROMATICS]), amount: null, unit: "secukupnya" },
            { name: pick(rnd, [...AROMATICS]), amount: null, unit: "secukupnya" },
            { name: pick(rnd, [...VEGGIES]), amount: "1", unit: "buah" },
            { name: pick(rnd, [...VEGGIES]), amount: "1", unit: "buah" },
            { name: "Daun Bawang", amount: "2", unit: "batang" },
            { name: "Garam", amount: null, unit: "secukupnya" },
            { name: "Merica", amount: null, unit: "secukupnya" },
        ];
    }

    if (kind === "SNACK") {
        const withEgg = !vegan && rnd() < 0.5;
        return [
            { name: "Tepung Terigu", amount: "200", unit: "gram" },
            ...(withEgg ? [{ name: "Telur", amount: "1", unit: "butir" } as IngredientSeed] : []),
            { name: "Air", amount: "200", unit: "ml" },
            { name: pick(rnd, [...VEGGIES]), amount: "1", unit: "buah" },
            { name: "Bawang Putih", amount: "2", unit: "siung" },
            { name: "Garam", amount: null, unit: "secukupnya" },
            { name: "Minyak Goreng", amount: null, unit: "secukupnya" },
        ];
    }

    if (kind === "BREAKFAST") {
        const carb = rnd() < 0.5 ? "Beras" : "Nasi Putih";
        const withChicken = !vegan && rnd() < 0.6;
        return [
            {
                name: carb,
                amount: carb === "Beras" ? "150" : "2",
                unit: carb === "Beras" ? "gram" : "piring",
            },
            ...(withChicken
                ? [
                      {
                          name: "Ayam Suwir",
                          amount: "150",
                          unit: "gram",
                      } as IngredientSeed,
                  ]
                : []),
            { name: "Air / Kaldu", amount: "1", unit: "liter" },
            { name: "Bawang Putih", amount: "3", unit: "siung" },
            { name: "Jahe", amount: "1", unit: "ruas" },
            { name: "Garam", amount: null, unit: "secukupnya" },
            { name: "Daun Bawang", amount: "2", unit: "batang" },
        ];
    }

    // SAVORY
    const withEgg = !vegan && rnd() < 0.35;
    return [
        { name: main, amount: "300", unit: "gram" },
        { name: "Bawang Merah", amount: "6", unit: "butir" },
        { name: "Bawang Putih", amount: "4", unit: "siung" },
        { name: "Cabai Merah", amount: "5", unit: "buah" },
        { name: pick(rnd, [...HERBS]), amount: null, unit: "secukupnya" },
        {
            name: pick(rnd, [...VEGGIES]),
            amount: rnd() < 0.5 ? "1" : "150",
            unit: rnd() < 0.5 ? "ikat" : "gram",
        },
        ...(withEgg ? [{ name: "Telur", amount: "1", unit: "butir" } as IngredientSeed] : []),
        { name: "Garam", amount: null, unit: "secukupnya" },
        { name: "Gula", amount: null, unit: "secukupnya" },
        { name: "Minyak Goreng", amount: "3", unit: "sdm" },
    ];
}

function buildSteps(kind: string, title: string) {
    if (kind === "DRINK")
        return [
            `Siapkan bahan-bahan untuk ${title}.`,
            "Rebus air bersama rempah hingga wangi.",
            "Masukkan gula, aduk sampai larut. Matikan api dan dinginkan.",
            "Saring lalu sajikan hangat atau dengan es batu.",
        ];
    if (kind === "DESSERT")
        return [
            `Campur bahan utama untuk ${title} hingga rata.`,
            "Masak/kukus adonan sampai matang.",
            "Angkat dan diamkan hingga hangat.",
            "Sajikan sesuai selera (kelapa/saus gula).",
        ];
    if (kind === "SAMBAL")
        return [
            `Siapkan bahan sambal untuk ${title}.`,
            "Goreng/panggang cabai dan bawang sebentar hingga layu.",
            "Ulek/blender kasar, bumbui garam dan gula.",
            "Tambahkan minyak panas dan jeruk limau bila suka. Sajikan.",
        ];
    if (kind === "SOUP")
        return [
            `Rebus air/kaldu untuk ${title} hingga mendidih.`,
            "Masukkan bumbu, masak sampai harum.",
            "Masukkan bahan utama dan sayuran, masak hingga empuk.",
            "Bumbui, lalu sajikan hangat.",
        ];
    if (kind === "SNACK")
        return [
            `Campur adonan ${title} sampai rata.`,
            "Masukkan isian, aduk kembali.",
            "Panaskan minyak, goreng hingga keemasan.",
            "Angkat dan sajikan.",
        ];
    if (kind === "BREAKFAST")
        return [
            `Masak ${title} dengan air/kaldu.`,
            "Aduk sesekali agar halus.",
            "Masukkan bumbu, koreksi rasa.",
            "Sajikan dengan topping favorit.",
        ];
    return [
        `Siapkan bahan dan bumbu untuk ${title}.`,
        "Tumis bumbu hingga harum.",
        "Masukkan bahan utama, aduk hingga merata.",
        "Masak sampai matang, koreksi rasa.",
        "Sajikan hangat.",
    ];
}

function buildIndonesianRecipe(
    rnd: () => number,
    usedSlugs: Set<string>,
    categoriesBySlug: Record<string, { id: string; name: string }>,
    idx: number,
) {
    const dishSlug = pickWeighted(rnd, DISH_SLUGS_WEIGHTED);
    const kind = kindFromDishSlug(dishSlug);

    const regionSlug = pick(rnd, [...INDO_REGION_SLUGS]) as string;
    const regionName = categoriesBySlug[regionSlug]?.name ?? "Nusantara";

    let main = pick(rnd, [...PROTEIN_SAVORY]) as string;

    if (dishSlug === "nasi-dan-beras") main = rnd() < 0.5 ? "Nasi Putih" : "Beras";
    if (dishSlug === "mie-dan-bihun") main = rnd() < 0.5 ? "Mie Telur" : "Bihun";
    if (dishSlug === "sayur") main = pick(rnd, [...VEGGIES]) as string;
    if (dishSlug === "tahu-tempe") main = rnd() < 0.5 ? "Tahu" : "Tempe";
    if (dishSlug === "minuman") main = "Minuman Rempah";
    if (dishSlug === "makanan-penutup" || dishSlug === "kue-tradisional") main = "Kue Tradisional";
    if (dishSlug === "sambal") main = "Sambal";

    const flavor = pick(rnd, [...FLAVOR_TAGS]) as string;

    let title = "";
    if (kind === "DRINK") {
        const drinkNames = ["Wedang Jahe", "Es Teh Manis", "Es Campur", "Es Cendol", "Bandrek", "Sekoteng", "Es Jeruk"];
        title = `${pick(rnd, drinkNames)} ${regionName}`;
    } else if (kind === "DESSERT") {
        const dessertNames = ["Klepon", "Kolak Pisang", "Bubur Sumsum", "Dadar Gulung", "Serabi", "Kue Lapis", "Getuk"];
        title = `${pick(rnd, dessertNames)} ${regionName}`;
    } else if (kind === "SAMBAL") {
        const sambalNames = ["Sambal Terasi", "Sambal Matah", "Sambal Bajak", "Sambal Ijo", "Sambal Dabu-dabu"];
        title = `${pick(rnd, sambalNames)} ${regionName}`;
    } else if (dishSlug === "nasi-dan-beras") {
        const riceNames = ["Nasi Goreng", "Nasi Uduk", "Nasi Kuning", "Nasi Liwet", "Nasi Bakar", "Nasi Lemak"];
        title = `${pick(rnd, riceNames)} ${flavor}`;
    } else if (dishSlug === "mie-dan-bihun") {
        const noodleNames = ["Mie Goreng", "Mie Kuah", "Bihun Goreng", "Bihun Kuah", "Kwetiau Goreng"];
        title = `${pick(rnd, noodleNames)} ${regionName}`;
    } else if (kind === "SOUP") {
        const soupNames = ["Soto", "Sup", "Pindang", "Gulai", "Sayur Asem", "Sop", "Rawon"];
        title = `${pick(rnd, soupNames)} ${main} ${regionName}`;
    } else if (kind === "BREAKFAST") {
        const breakfastNames = ["Bubur Ayam", "Bubur Kacang Hijau", "Nasi Kuning", "Lontong Sayur", "Ketupat Sayur"];
        title = `${pick(rnd, breakfastNames)} ${regionName}`;
    } else if (kind === "SNACK") {
        const snackNames = ["Bakwan", "Tempe Mendoan", "Pisang Goreng", "Cireng", "Tahu Isi", "Perkedel", "Risoles"];
        title = `${pick(rnd, snackNames)} ${flavor}`;
    } else {
        const savoryTemplates = [
            `${main} ${flavor}`,
            `${main} Bumbu ${regionName}`,
            `Tumis ${main} ${flavor}`,
            `${main} ${regionName} Pedas`,
        ];
        title = pick(rnd, savoryTemplates);
    }

    if (rnd() < 0.12) title = `${title} Spesial`;
    if (rnd() < 0.04) title = `${title} ${idx + 1}`;

    const slug = uniqueSlug(title, usedSlugs);
    const dietSlug = guessDiet(rnd, main);
    const vegan = dietSlug === "vegan";

    const ingredients = buildIngredients(rnd, kind, main, vegan);
    const steps = buildSteps(kind, title);

    const categorySlugs = ["indonesia", dishSlug, regionSlug] as string[];
    if (dietSlug) categorySlugs.push(dietSlug);

    const categoryIds = categorySlugs.map((s) => categoriesBySlug[s]?.id).filter(Boolean) as string[];

    const prepMinutes = randInt(rnd, 10, 30);
    const cookMinutes =
        kind === "DRINK" ? randInt(rnd, 5, 15) : kind === "DESSERT" ? randInt(rnd, 20, 60) : randInt(rnd, 15, 50);
    const servings = kind === "SNACK" || kind === "DESSERT" ? randInt(rnd, 4, 10) : randInt(rnd, 2, 6);

    const description = `Resep ${title} khas ${regionName} dengan cita rasa ${flavor.toLowerCase()}. Praktis dan mudah diikuti.`;

    return {
        title,
        slug,
        description,
        imageUrl: pick(rnd, UNSPLASH_IMAGES),
        prepMinutes,
        cookMinutes,
        servings,
        ingredients,
        steps,
        categoryIds,
    };
}

export async function seedIndonesianRecipes(
    prisma: PrismaClient,
    opts: { targetCount: number; randomSeed: number; resetRecipes?: boolean },
) {
    const { targetCount, randomSeed, resetRecipes } = opts;

    if (resetRecipes) {
        await prisma.recipe.deleteMany({});
    }

    const categories = await prisma.category.findMany({
        select: { id: true, slug: true, name: true },
    });
    const categoriesBySlug = Object.fromEntries(categories.map((c) => [c.slug, c])) as Record<
        string,
        { id: string; slug: string; name: string }
    >;

    // biome-ignore lint/complexity/useLiteralKeys: <- Justification: This is a sanity check to ensure the seed data is correct and the "indonesia" category exists, which is crucial for this seeding function.>
    if (!categoriesBySlug["indonesia"]) {
        throw new Error('Category slug "indonesia" tidak ditemukan. Panggil seedCategories dulu.');
    }

    const existingIndoCount = await prisma.recipe.count({
        where: { categories: { some: { category: { slug: "indonesia" } } } },
    });

    const need = Math.max(0, targetCount - existingIndoCount);
    if (need === 0) return { existingIndoCount, created: 0 };

    const existingSlugs = await prisma.recipe.findMany({
        select: { slug: true },
    });
    const usedSlugs = new Set(existingSlugs.map((r) => r.slug));

    const rnd = mulberry32(randomSeed);
    const CHUNK = 10; // Reduced from 25 to avoid transaction timeout

    let createdCount = 0;
    for (let i = 0; i < need; i += CHUNK) {
        const recipesToCreate: ReturnType<typeof buildIndonesianRecipe>[] = [];

        for (let j = 0; j < CHUNK && i + j < need; j++) {
            const gen = buildIndonesianRecipe(rnd, usedSlugs, categoriesBySlug, i + j);
            recipesToCreate.push(gen);
        }

        // Use interactive transaction with timeout
        await prisma.$transaction(
            async (tx) => {
                for (const gen of recipesToCreate) {
                    await tx.recipe.create({
                        data: {
                            title: gen.title,
                            slug: gen.slug,
                            description: gen.description,
                            imageUrl: gen.imageUrl,
                            prepMinutes: gen.prepMinutes,
                            cookMinutes: gen.cookMinutes,
                            servings: gen.servings,
                            ingredients: {
                                create: gen.ingredients.map((ing, idx) => ({
                                    name: ing.name,
                                    amount: ing.amount ?? null,
                                    unit: ing.unit ?? null,
                                    order: idx,
                                })),
                            },
                            instructions: {
                                create: gen.steps.map((content, idx) => ({
                                    stepNumber: idx + 1,
                                    content,
                                })),
                            },
                            categories: {
                                create: gen.categoryIds.map((categoryId) => ({ categoryId })),
                            },
                        },
                    });
                }
            },
            { timeout: 60000 }, // 60 seconds timeout for interactive transaction
        );

        createdCount += recipesToCreate.length;

        // Log progress
        if ((i + CHUNK) % 100 === 0 || i + CHUNK >= need) {
            console.log(`   📝 Progress: ${Math.min(i + CHUNK, need)}/${need} recipes`);
        }
    }

    return { existingIndoCount, created: createdCount };
}
