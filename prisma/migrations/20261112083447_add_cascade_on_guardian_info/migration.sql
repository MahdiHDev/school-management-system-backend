-- DropForeignKey
ALTER TABLE "GuardianInfo" DROP CONSTRAINT "GuardianInfo_studentId_fkey";

-- AddForeignKey
ALTER TABLE "GuardianInfo" ADD CONSTRAINT "GuardianInfo_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
