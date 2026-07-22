/*
  Warnings:

  - Added the required column `EmployeeSign` to the `employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "EmployeeSign" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "student_id" TEXT,
    "employee_id" TEXT,
    "permanentAddressVillage" TEXT,
    "permanentAddressPostOffice" TEXT,
    "permanentAddressPostCode" TEXT,
    "permanentAddressDistrict" TEXT,
    "presentAddressVillage" TEXT,
    "presentAddressPostOffice" TEXT,
    "presentAddressPostCode" TEXT,
    "presentAddressDistrict" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_student_id_key" ON "Address"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Address_employee_id_key" ON "Address"("employee_id");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
