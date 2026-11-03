-- CreateEnum
CREATE TYPE "EmployeeAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE');

-- CreateTable
CREATE TABLE "employee_attendance_sessions" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_attendance_records" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" "EmployeeAttendanceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_attendance_sessions_date_idx" ON "employee_attendance_sessions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "employee_attendance_sessions_date_key" ON "employee_attendance_sessions"("date");

-- CreateIndex
CREATE INDEX "employee_attendance_records_sessionId_idx" ON "employee_attendance_records"("sessionId");

-- CreateIndex
CREATE INDEX "employee_attendance_records_employeeId_idx" ON "employee_attendance_records"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_attendance_records_sessionId_employeeId_key" ON "employee_attendance_records"("sessionId", "employeeId");

-- AddForeignKey
ALTER TABLE "employee_attendance_records" ADD CONSTRAINT "employee_attendance_records_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "employee_attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_attendance_records" ADD CONSTRAINT "employee_attendance_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
