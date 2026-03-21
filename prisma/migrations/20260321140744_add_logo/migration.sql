/*
  Warnings:

  - The primary key for the `Logo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `url` on the `Logo` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Logo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Logo" DROP CONSTRAINT "Logo_pkey",
DROP COLUMN "url",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Logo_pkey" PRIMARY KEY ("id");
