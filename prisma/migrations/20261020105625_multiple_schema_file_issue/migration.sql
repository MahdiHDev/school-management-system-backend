-- CreateEnum
CREATE TYPE "RegulationType" AS ENUM ('STUDENT', 'EMPLOYEE', 'ATTENDANCE', 'EXAMINATION', 'LEAVE', 'CODE_OF_CONDUCT', 'UNIFORM', 'OTHER');

-- CreateEnum
CREATE TYPE "GradeStatus" AS ENUM ('PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "FeeParticularScope" AS ENUM ('ALL_STUDENTS', 'SPECIFIC_CLASS');

-- CreateTable
CREATE TABLE "GeneralSettings" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolPhone" TEXT NOT NULL,
    "schoolEmail" TEXT NOT NULL,
    "schoolWebsite" TEXT,
    "schoolAddress" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "instituteLogo" TEXT,
    "schoolLogoPublicId" TEXT,
    "schoolLogoName" TEXT,
    "schoolLogoType" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GeneralSettings_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "GradingConfiguration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Grading',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradingConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeScale" (
    "id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "minMarks" INTEGER NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "status" "GradeStatus" NOT NULL DEFAULT 'PASS',
    "configurationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FailCriteria" (
    "id" TEXT NOT NULL,
    "overallPercentage" DOUBLE PRECISION NOT NULL,
    "subjectPercentage" DOUBLE PRECISION NOT NULL,
    "minFailedSubjects" INTEGER NOT NULL,
    "configurationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FailCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankInfo" (
    "id" TEXT NOT NULL,
    "bankLogo" TEXT NOT NULL,
    "nameOfBank" TEXT NOT NULL,
    "branchAddress" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rules_regulations_type_idx" ON "rules_regulations"("type");

-- CreateIndex
CREATE INDEX "GradeScale_configurationId_idx" ON "GradeScale"("configurationId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeScale_configurationId_grade_key" ON "GradeScale"("configurationId", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "FailCriteria_configurationId_key" ON "FailCriteria"("configurationId");

-- AddForeignKey
ALTER TABLE "GradeScale" ADD CONSTRAINT "GradeScale_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "GradingConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FailCriteria" ADD CONSTRAINT "FailCriteria_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "GradingConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
