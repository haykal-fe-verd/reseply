import { prisma } from "@/config/prisma";
import { seedCategories, seedIndonesianRecipes } from "@/lib/seeder";

const TARGET_INDONESIAN_RECIPES = Number(process.env.SEED_TARGET ?? "20");
const RANDOM_SEED = Number(process.env.SEED_RANDOM ?? "1337");
const SEED_RESET = process.env.SEED_RESET === "true";

async function deleteAllData() {
    console.log("🗑️  Menghapus semua data...");

    // Delete in correct order (child tables first)
    await prisma.recipeIngredient.deleteMany();
    console.log("   ✓ RecipeIngredient deleted");

    await prisma.recipeInstruction.deleteMany();
    console.log("   ✓ RecipeInstruction deleted");

    await prisma.recipeCategory.deleteMany();
    console.log("   ✓ RecipeCategory deleted");

    await prisma.recipe.deleteMany();
    console.log("   ✓ Recipe deleted");

    await prisma.category.deleteMany();
    console.log("   ✓ Category deleted");

    console.log("✅ Semua data berhasil dihapus.");
}

async function main() {
    // Delete all data before seeding
    await deleteAllData();

    console.log("🌱 Seeding categories...");
    await seedCategories(prisma);

    console.log("🌱 Seeding Indonesian recipes...");
    const res = await seedIndonesianRecipes(prisma, {
        targetCount: TARGET_INDONESIAN_RECIPES,
        randomSeed: RANDOM_SEED,
        resetRecipes: SEED_RESET,
    });
    console.log(`✅ Done. Existing Indo: ${res.existingIndoCount}, Created: ${res.created}`);
    console.log("✅ Seed selesai.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
