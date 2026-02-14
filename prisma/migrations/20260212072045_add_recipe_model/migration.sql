-- CreateTable
CREATE TABLE "recipe" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "prepMinutes" INTEGER,
    "cookMinutes" INTEGER,
    "servings" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipe_slug_key" ON "recipe"("slug");

-- CreateIndex
CREATE INDEX "recipe_slug_idx" ON "recipe"("slug");
