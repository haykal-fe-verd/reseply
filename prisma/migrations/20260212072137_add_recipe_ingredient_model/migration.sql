-- CreateTable
CREATE TABLE "recipe_ingredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" TEXT,
    "unit" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "recipe_ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recipe_ingredient_recipeId_idx" ON "recipe_ingredient"("recipeId");

-- AddForeignKey
ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "recipe_ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
