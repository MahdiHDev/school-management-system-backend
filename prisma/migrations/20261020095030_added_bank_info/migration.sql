/*
  Warnings:

  - You are about to drop the `FailCriteria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GeneralSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GradeScale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GradingConfiguration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rules_regulations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FailCriteria" DROP CONSTRAINT "FailCriteria_configurationId_fkey";

-- DropForeignKey
ALTER TABLE "GradeScale" DROP CONSTRAINT "GradeScale_configurationId_fkey";

-- DropTable
DROP TABLE "FailCriteria";

-- DropTable
DROP TABLE "GeneralSettings";

-- DropTable
DROP TABLE "GradeScale";

-- DropTable
DROP TABLE "GradingConfiguration";

-- DropTable
DROP TABLE "rules_regulations";

-- DropEnum
DROP TYPE "GradeStatus";

-- DropEnum
DROP TYPE "RegulationType";
