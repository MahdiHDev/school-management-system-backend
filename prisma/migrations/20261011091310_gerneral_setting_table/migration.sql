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
    "instituteRulesRegulations" TEXT NOT NULL,
    "employeeRulesRegulations" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GeneralSettings_pkey" PRIMARY KEY ("id")
);
