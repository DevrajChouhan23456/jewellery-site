-- AlterTable
ALTER TABLE "CuratedItem"
ADD COLUMN "badge" TEXT,
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "section" TEXT NOT NULL DEFAULT 'gender',
ADD COLUMN "subtitle" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "CuratedItem"
SET "updatedAt" = COALESCE("createdAt", CURRENT_TIMESTAMP)
WHERE "updatedAt" IS NULL;

ALTER TABLE "CuratedItem"
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "image" DROP NOT NULL;

-- AlterTable
ALTER TABLE "HomepageSection" ADD COLUMN "backgroundImageUrl" TEXT;

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slider" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "badge" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "heroEyebrow" TEXT,
    "heroTitle" TEXT NOT NULL,
    "heroDescription" TEXT NOT NULL,
    "heroImageUrl" TEXT,
    "heroCtaLabel" TEXT NOT NULL DEFAULT 'Shop Now',
    "heroCtaHref" TEXT NOT NULL DEFAULT '/shop/jewellery',
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopPageFeature" (
    "id" TEXT NOT NULL,
    "shopPageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopPageFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopPageProduct" (
    "id" TEXT NOT NULL,
    "shopPageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "badge" TEXT,
    "lowStockText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopPageProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ShopPage_slug_key" ON "ShopPage"("slug");

-- AddForeignKey
ALTER TABLE "ShopPageFeature"
ADD CONSTRAINT "ShopPageFeature_shopPageId_fkey"
FOREIGN KEY ("shopPageId") REFERENCES "ShopPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopPageProduct"
ADD CONSTRAINT "ShopPageProduct_shopPageId_fkey"
FOREIGN KEY ("shopPageId") REFERENCES "ShopPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
