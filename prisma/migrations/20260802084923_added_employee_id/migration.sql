/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employeeId` to the `employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "employeeId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "employee_employeeId_key" ON "employee"("employeeId");
