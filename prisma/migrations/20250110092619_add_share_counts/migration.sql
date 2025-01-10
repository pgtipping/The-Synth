-- CreateTable
CREATE TABLE "ShareCount" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "twitter" INTEGER NOT NULL DEFAULT 0,
    "linkedin" INTEGER NOT NULL DEFAULT 0,
    "email" INTEGER NOT NULL DEFAULT 0,
    "copy" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareCount_postId_key" ON "ShareCount"("postId");

-- AddForeignKey
ALTER TABLE "ShareCount" ADD CONSTRAINT "ShareCount_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
