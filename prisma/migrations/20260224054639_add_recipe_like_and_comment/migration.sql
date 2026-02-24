-- CreateTable
CREATE TABLE "recipe_like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_comment" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recipe_like_userId_idx" ON "recipe_like"("userId");

-- CreateIndex
CREATE INDEX "recipe_like_recipeId_idx" ON "recipe_like"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_like_userId_recipeId_key" ON "recipe_like"("userId", "recipeId");

-- CreateIndex
CREATE INDEX "recipe_comment_recipeId_idx" ON "recipe_comment"("recipeId");

-- CreateIndex
CREATE INDEX "recipe_comment_userId_idx" ON "recipe_comment"("userId");

-- AddForeignKey
ALTER TABLE "recipe_like" ADD CONSTRAINT "recipe_like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_like" ADD CONSTRAINT "recipe_like_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_comment" ADD CONSTRAINT "recipe_comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_comment" ADD CONSTRAINT "recipe_comment_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
