/*
  Warnings:

  - You are about to drop the column `quote` on the `ReviewTopic` table. All the data in the column will be lost.
  - You are about to drop the column `nights` on the `SimilarListing` table. All the data in the column will be lost.
  - You are about to drop the column `propertyType` on the `SimilarListing` table. All the data in the column will be lost.
  - Added the required column `amenitiesTotal` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guestFavouriteReviewsCopy` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disclaimer` to the `LocationInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `highlightsHeading` to the `LocationInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `count` to the `ReviewTopic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "HostFact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "HostFact_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CoHost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hostId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "CoHost_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CoHost" ("avatar", "hostId", "id", "name", "sortOrder") SELECT "avatar", "hostId", "id", "name", "sortOrder" FROM "CoHost";
DROP TABLE "CoHost";
ALTER TABLE "new_CoHost" RENAME TO "CoHost";
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "guestFavouriteCopy" TEXT NOT NULL,
    "guestFavouriteReviewsCopy" TEXT NOT NULL,
    "amenitiesTotal" INTEGER NOT NULL,
    "guests" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "beds" INTEGER NOT NULL,
    "baths" INTEGER NOT NULL,
    "nightlyPrice" INTEGER NOT NULL,
    "cleaningFee" INTEGER NOT NULL,
    "serviceFeeBps" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "reviewCount" INTEGER NOT NULL,
    "isGuestFavourite" BOOLEAN NOT NULL
);
INSERT INTO "new_Listing" ("baths", "bedrooms", "beds", "cleaningFee", "currency", "description", "guestFavouriteCopy", "guests", "id", "isGuestFavourite", "location", "nightlyPrice", "propertyType", "rating", "reviewCount", "serviceFeeBps", "slug", "title") SELECT "baths", "bedrooms", "beds", "cleaningFee", "currency", "description", "guestFavouriteCopy", "guests", "id", "isGuestFavourite", "location", "nightlyPrice", "propertyType", "rating", "reviewCount", "serviceFeeBps", "slug", "title" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");
CREATE TABLE "new_LocationInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "disclaimer" TEXT NOT NULL,
    "highlightsHeading" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    CONSTRAINT "LocationInfo_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LocationInfo" ("blurb", "heading", "id", "listingId") SELECT "blurb", "heading", "id", "listingId" FROM "LocationInfo";
DROP TABLE "LocationInfo";
ALTER TABLE "new_LocationInfo" RENAME TO "LocationInfo";
CREATE UNIQUE INDEX "LocationInfo_listingId_key" ON "LocationInfo"("listingId");
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorAvatar" TEXT,
    "body" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "authorTenure" TEXT,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("authorAvatar", "authorName", "authorTenure", "body", "date", "id", "listingId", "rating", "sortOrder") SELECT "authorAvatar", "authorName", "authorTenure", "body", "date", "id", "listingId", "rating", "sortOrder" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_listingId_sortOrder_idx" ON "Review"("listingId", "sortOrder");
CREATE TABLE "new_ReviewTopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "ReviewTopic_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReviewTopic" ("icon", "id", "label", "listingId", "sortOrder") SELECT "icon", "id", "label", "listingId", "sortOrder" FROM "ReviewTopic";
DROP TABLE "ReviewTopic";
ALTER TABLE "new_ReviewTopic" RENAME TO "ReviewTopic";
CREATE INDEX "ReviewTopic_listingId_sortOrder_idx" ON "ReviewTopic"("listingId", "sortOrder");
CREATE TABLE "new_SimilarListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "SimilarListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SimilarListing" ("id", "image", "listingId", "price", "rating", "sortOrder", "title") SELECT "id", "image", "listingId", "price", "rating", "sortOrder", "title" FROM "SimilarListing";
DROP TABLE "SimilarListing";
ALTER TABLE "new_SimilarListing" RENAME TO "SimilarListing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "HostFact_hostId_sortOrder_idx" ON "HostFact"("hostId", "sortOrder");
