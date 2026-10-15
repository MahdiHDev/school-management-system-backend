/*
  Warnings:

  - You are about to drop the column `employeeRulesRegulations` on the `GeneralSettings` table. All the data in the column will be lost.
  - You are about to drop the column `instituteRulesRegulations` on the `GeneralSettings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RegulationType" AS ENUM ('STUDENT', 'EMPLOYEE', 'ATTENDANCE', 'EXAMINATION', 'LEAVE', 'CODE_OF_CONDUCT', 'UNIFORM', 'OTHER');

-- AlterTable
ALTER TABLE "GeneralSettings" DROP COLUMN "employeeRulesRegulations",
DROP COLUMN "instituteRulesRegulations";

-- CreateTable
CREATE TABLE "rules_regulations" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "RegulationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "rules_regulations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rules_regulations_type_idx" ON "rules_regulations"("type");
