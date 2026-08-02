/*
  Warnings:

  - The values [ACCOUNTANT,LIBRARIAN,STORE_MANAGER,OTHER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'EMPLOYEE');
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- CreateTable
CREATE TABLE "Sequence" (
    "id" TEXT NOT NULL,
    "current" INTEGER NOT NULL,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);
