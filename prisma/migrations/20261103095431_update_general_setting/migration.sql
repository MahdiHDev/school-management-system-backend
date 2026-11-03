/*
  Warnings:

  - You are about to drop the column `country` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the column `schoolAddress` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the column `schoolEmail` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the column `schoolLogoName` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the column `schoolLogoPublicId` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the column `schoolLogoType` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the column `schoolName` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the column `schoolPhone` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the column `schoolWebsite` on the `GeneralSettings` table. All the data in the column will be lost.
  - Added the required column `instituteAddress` to the `GeneralSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instituteCountry` to the `GeneralSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instituteEmail` to the `GeneralSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instituteName` to the `GeneralSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutePhoneNumber` to the `GeneralSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeneralSettings" DROP COLUMN "country",
DROP COLUMN "schoolAddress",
DROP COLUMN "schoolEmail",
DROP COLUMN "schoolLogoName",
DROP COLUMN "schoolLogoPublicId",
DROP COLUMN "schoolLogoType",
DROP COLUMN "schoolName",
DROP COLUMN "schoolPhone",
DROP COLUMN "schoolWebsite",
ADD COLUMN     "instituteAddress" TEXT NOT NULL,
ADD COLUMN     "instituteCountry" TEXT NOT NULL,
ADD COLUMN     "instituteEmail" TEXT NOT NULL,
ADD COLUMN     "instituteLogoName" TEXT,
ADD COLUMN     "instituteLogoPublicId" TEXT,
ADD COLUMN     "instituteLogoType" TEXT,
ADD COLUMN     "instituteName" TEXT NOT NULL,
ADD COLUMN     "institutePhoneNumber" TEXT NOT NULL,
ADD COLUMN     "instituteWebsite" TEXT;
