-- CreateEnum
CREATE TYPE "VirtualChefMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "virtual_chef_conversation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_chef_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_chef_message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "VirtualChefMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "virtual_chef_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "virtual_chef_conversation_userId_idx" ON "virtual_chef_conversation"("userId");

-- CreateIndex
CREATE INDEX "virtual_chef_message_conversationId_idx" ON "virtual_chef_message"("conversationId");

-- AddForeignKey
ALTER TABLE "virtual_chef_conversation" ADD CONSTRAINT "virtual_chef_conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_chef_message" ADD CONSTRAINT "virtual_chef_message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "virtual_chef_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
