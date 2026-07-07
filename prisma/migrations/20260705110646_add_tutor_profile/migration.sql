/*
  Warnings:

  - You are about to drop the column `birthRegistrationNumber` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `TutorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `fullNameBangla` on the `TutorProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[birthRegistrationNumber]` on the table `employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOfBirth` to the `employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TutorProfile_birthRegistrationNumber_key";

-- AlterTable
ALTER TABLE "TutorProfile" DROP COLUMN "birthRegistrationNumber",
DROP COLUMN "dateOfBirth",
DROP COLUMN "fullNameBangla";

-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "birthRegistrationNumber" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "employee_birthRegistrationNumber_key" ON "employee"("birthRegistrationNumber");

-- AddForeignKey
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutorProfile" ADD CONSTRAINT "TutorProfile_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
