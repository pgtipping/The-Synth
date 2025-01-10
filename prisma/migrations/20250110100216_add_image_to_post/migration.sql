/*
  Warnings:

  - You are about to drop the `ShareCount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ShareCount" DROP CONSTRAINT "ShareCount_postId_fkey";

-- AlterTable
ALTER TABLE "_CategoryToPost" ADD CONSTRAINT "_CategoryToPost_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CategoryToPost_AB_unique";

-- AlterTable
ALTER TABLE "_PostToTag" ADD CONSTRAINT "_PostToTag_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PostToTag_AB_unique";

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "ShareCount";

-- CreateTable
CREATE TABLE "post_shares" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "twitter" INTEGER NOT NULL DEFAULT 0,
    "linkedin" INTEGER NOT NULL DEFAULT 0,
    "email" INTEGER NOT NULL DEFAULT 0,
    "copy" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_shares_postId_key" ON "post_shares"("postId");

-- AddForeignKey
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
