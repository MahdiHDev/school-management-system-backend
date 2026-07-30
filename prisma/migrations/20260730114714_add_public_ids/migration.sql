/*
  Warnings:

  - Added the required column `EmployeeSignPublicId` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authoritySignPublicId` to the `employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "EmployeeSignPublicId" TEXT NOT NULL,
ADD COLUMN     "authoritySignPublicId" TEXT NOT NULL,
ADD COLUMN     "experiencePublicId" TEXT,
ADD COLUMN     "picturePublicId" TEXT;
