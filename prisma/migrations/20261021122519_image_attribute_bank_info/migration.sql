/*
  Warnings:

  - Added the required column `bankLogoName` to the `BankInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankLogoPublicId` to the `BankInfo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankLogoType` to the `BankInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankInfo" ADD COLUMN     "bankLogoName" TEXT NOT NULL,
ADD COLUMN     "bankLogoPublicId" TEXT NOT NULL,
ADD COLUMN     "bankLogoType" TEXT NOT NULL;
