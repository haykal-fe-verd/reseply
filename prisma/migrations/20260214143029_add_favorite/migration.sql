-- CreateTable
CREATE TABLE "favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_userId_idx" ON "favorite"("userId");

-- CreateIndex
CREATE INDEX "favorite_recipeId_idx" ON "favorite"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_userId_recipeId_key" ON "favorite"("userId", "recipeId");

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
