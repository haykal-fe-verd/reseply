-- CreateTable
CREATE TABLE "recipe_instruction" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "recipe_instruction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recipe_instruction_recipeId_idx" ON "recipe_instruction"("recipeId");

-- AddForeignKey
ALTER TABLE "recipe_instruction" ADD CONSTRAINT "recipe_instruction_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
