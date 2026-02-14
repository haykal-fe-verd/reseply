-- CreateTable
CREATE TABLE "recipe_category" (
    "recipeId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "recipe_category_pkey" PRIMARY KEY ("recipeId","categoryId")
);

-- CreateIndex
CREATE INDEX "recipe_category_categoryId_idx" ON "recipe_category"("categoryId");

-- AddForeignKey
ALTER TABLE "recipe_category" ADD CONSTRAINT "recipe_category_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_category" ADD CONSTRAINT "recipe_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
