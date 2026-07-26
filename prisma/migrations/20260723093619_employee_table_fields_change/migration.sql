/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `employee` table. All the data in the column will be lost.
  - Added the required column `dateOfJoining` to the `employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employee" DROP COLUMN "dateOfBirth",
ADD COLUMN     "dateOfJoining" TEXT NOT NULL,
ALTER COLUMN "experience" DROP NOT NULL;
