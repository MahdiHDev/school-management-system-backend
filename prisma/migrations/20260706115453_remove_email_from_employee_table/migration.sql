/*
  Warnings:

  - You are about to drop the column `email` on the `employee` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "employee_email_key";

-- AlterTable
ALTER TABLE "employee" DROP COLUMN "email";
