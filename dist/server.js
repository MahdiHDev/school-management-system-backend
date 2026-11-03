var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path3 from "path";
import qs from "qs";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";

// src/generated/enums.ts
var AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LEAVE: "LEAVE"
};
var EmployeeAttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  HALF_DAY: "HALF_DAY",
  LEAVE: "LEAVE"
};
var UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PRINCIPAL: "PRINCIPAL",
  MANAGEMENT_STAFF: "MANAGEMENT_STAFF",
  ACCOUNTANT: "ACCOUNTANT",
  STORE_MANAGER: "STORE_MANAGER",
  LIBRARIAN: "LIBRARIAN",
  OTHER: "OTHER"
};
var Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER"
};
var BloodGroup = {
  A_POSITIVE: "A_POSITIVE",
  A_NEGATIVE: "A_NEGATIVE",
  B_POSITIVE: "B_POSITIVE",
  B_NEGATIVE: "B_NEGATIVE",
  AB_POSITIVE: "AB_POSITIVE",
  AB_NEGATIVE: "AB_NEGATIVE",
  O_POSITIVE: "O_POSITIVE",
  O_NEGATIVE: "O_NEGATIVE"
};
var Religion = {
  ISLAM: "ISLAM",
  HINDUISM: "HINDUISM",
  CHRISTIANITY: "CHRISTIANITY",
  BUDDHISM: "BUDDHISM",
  OTHER: "OTHER"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  DELETED: "DELETED"
};

// src/app/config/env.ts
import dotenv from "dotenv";
import status from "http-status";

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  constructor(statusCode, message, stack = "") {
    super(message);
    __publicField(this, "statusCode");
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/config/env.ts
dotenv.config();
var loadEnvVariables = () => {
  const requireEnvVariable = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
    "FRONTEND_URL",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
  ];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError_default(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but not set in .env file.`
      );
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    }
  };
};
var envVars = loadEnvVariables();

// src/app/utils/email.ts
import ejs from "ejs";
import status2 from "http-status";
import nodemailer from "nodemailer";
import path from "path";
var port = Number(envVars.EMAIL_SENDER.SMTP_PORT);
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: port === 465,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments
}) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`
    );
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });
    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error) {
    console.log("Email Sending Error", error.message);
    throw new AppError_default(
      status2.INTERNAL_SERVER_ERROR,
      "Failed to send email"
    );
  }
};

// src/app/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// src/generated/client.ts
import * as path2 from "path";
import { fileURLToPath } from "url";

// src/generated/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": '// enums\nenum RegulationType {\n  STUDENT\n  EMPLOYEE\n  ATTENDANCE\n  EXAMINATION\n  LEAVE\n  CODE_OF_CONDUCT\n  UNIFORM\n  OTHER\n}\n\nenum GradeStatus {\n  PASS\n  FAIL\n}\n\nenum FeeParticularScope {\n  ALL_STUDENTS\n  SPECIFIC_CLASS\n}\n\n// tables\nmodel GeneralSettings {\n  id                   String  @id @default(uuid())\n  instituteName        String\n  institutePhoneNumber String\n  instituteEmail       String\n  instituteWebsite     String?\n  instituteAddress     String\n  instituteCountry     String\n\n  instituteLogo         String?\n  instituteLogoPublicId String?\n  instituteLogoName     String?\n  instituteLogoType     String?\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel RulesRegulations {\n  id      String         @id @default(uuid())\n  content String         @db.Text\n  type    RegulationType\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([type])\n  @@map("rules_regulations")\n}\n\nmodel GradingConfiguration {\n  id        String   @id @default(uuid())\n  name      String   @default("Default Grading")\n  isActive  Boolean  @default(true)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  grades       GradeScale[]\n  failCriteria FailCriteria?\n}\n\nmodel GradeScale {\n  id       String      @id @default(uuid())\n  grade    String\n  minMarks Int\n  maxMarks Int\n  status   GradeStatus @default(PASS)\n\n  configurationId String\n  configuration   GradingConfiguration @relation(fields: [configurationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([configurationId, grade])\n  @@index([configurationId])\n}\n\nmodel FailCriteria {\n  id                String @id @default(uuid())\n  overallPercentage Float\n  subjectPercentage Float\n  minFailedSubjects Int\n\n  configurationId String               @unique\n  configuration   GradingConfiguration @relation(fields: [configurationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\n// model FeeParticular {\n//     id     String             @id @default(uuid())\n//     label  String\n//     amount Decimal            @db.Decimal(10, 2)\n//     scope  FeeParticularScope\n\n//     classId String?\n//     class   Class?  @relation(fields: [classId], references: [id], onDelete: Cascade)\n\n//     sortOrder Int @default(0)\n\n//     createdAt DateTime @default(now())\n//     updatedAt DateTime @updatedAt\n\n//     @@index([scope])\n//     @@index([classId])\n// }\n\nmodel BankInfo {\n  id            String  @id @default(uuid())\n  nameOfBank    String\n  branchAddress String\n  accountNumber String\n  instruction   String?\n\n  bankLogo         String\n  bankLogoPublicId String\n  bankLogoName     String\n  bankLogoType     String\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nenum AttendanceStatus {\n  PRESENT\n  ABSENT\n  LEAVE\n}\n\nmodel AttendanceSession {\n  id      String   @id @default(uuid())\n  classId String\n  date    DateTime\n\n  class   Class              @relation(fields: [classId], references: [id], onDelete: Cascade)\n  records AttendanceRecord[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([classId, date])\n  @@index([classId])\n  @@index([date])\n  @@map("attendance_sessions")\n}\n\nmodel AttendanceRecord {\n  id        String           @id @default(uuid())\n  sessionId String\n  studentId String\n  status    AttendanceStatus\n\n  session AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)\n  student Student           @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([sessionId, studentId])\n  @@index([sessionId])\n  @@index([studentId])\n  @@map("attendance_records")\n}\n\nenum EmployeeAttendanceStatus {\n  PRESENT\n  ABSENT\n  LATE\n  HALF_DAY\n  LEAVE\n}\n\nmodel EmployeeAttendanceSession {\n  id   String   @id @default(uuid())\n  date DateTime @db.Date\n\n  records EmployeeAttendanceRecord[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([date])\n  @@index([date])\n  @@map("employee_attendance_sessions")\n}\n\nmodel EmployeeAttendanceRecord {\n  id         String                   @id @default(uuid())\n  sessionId  String\n  employeeId String\n  status     EmployeeAttendanceStatus\n\n  session EmployeeAttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)\n\n  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([sessionId, employeeId])\n  @@index([sessionId])\n  @@index([employeeId])\n  @@map("employee_attendance_records")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n  students           Student[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone String\n\n  fullName         String\n  nid              String\n  fatherName       String\n  motherName       String\n  emergencyContact String?\n  monthlySalary    Float\n  employeeId       String  @unique\n\n  picture         String?\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  experience         String?\n  experiencePublicId String?\n  experienceName     String?\n  experienceType     String?\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  employeeSign         String\n  employeeSignPublicId String\n  employeeSignName     String?\n  employeeSignType     String?\n\n  gender        Gender\n  bloodGroup    BloodGroup\n  religion      Religion\n  employeeRole  UserRole   @default(OTHER)\n  dateOfJoining String\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  address           Address?\n  classes           Class[]\n  attendanceRecords EmployeeAttendanceRecord[]\n\n  @@map("employee")\n}\n\n// model TutorProfile {\n//     id String @id @default(uuid())\n\n//     classId    String\n\n//     class    Class    @relation(fields: [classId], references: [id], onDelete: Cascade)\n//     employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n// }\n\nmodel Class {\n  id                String @id @default(uuid())\n  name              String\n  monthlyTuitionFee Float\n  classTeacher      String\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  employee           Employee            @relation(fields: [classTeacher], references: [id], onDelete: Cascade)\n  students           Student[]\n  subjects           Subject[]\n  // feeParticulars FeeParticular[]\n  attendanceSessions AttendanceSession[]\n\n  @@map("class")\n}\n\nmodel Address {\n  id String @id @default(uuid())\n\n  studentId  String? @unique @map("student_id")\n  employeeId String? @unique @map("employee_id")\n\n  permanentAddressVillage    String?\n  permanentAddressPostOffice String?\n  permanentAddressPostCode   String?\n  permanentAddressDistrict   String?\n\n  presentAddressVillage    String?\n  presentAddressPostOffice String?\n  presentAddressPostCode   String?\n  presentAddressDistrict   String?\n\n  isDeleted Boolean @default(false)\n\n  student  Student?  @relation(fields: [studentId], references: [id])\n  employee Employee? @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now()) @map("created_at")\n  updatedAt DateTime  @updatedAt @map("updated_at")\n  deletedAt DateTime? @map("deleted_at")\n}\n\nmodel Sequence {\n  id      String @id\n  current Int\n}\n\nmodel GuardianInfo {\n  id             String @id @default(uuid())\n  studentId      String @unique\n  whatsappNumber String\n\n  fatherName         String\n  fatherNameBangla   String\n  fatherMobileNumber String\n  fatherOccupation   String\n\n  motherName         String\n  motherNameBangla   String\n  motherMobileNumber String\n  motherOccupation   String\n\n  nameOfLocalGuardian   String\n  relationShipOfStudent String\n  GuardianMobileNumber  String\n\n  student Student @relation(fields: [studentId], references: [id])\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Student {\n  id                      String      @id @default(uuid())\n  userId                  String\n  classId                 String\n  studentId               String      @unique\n  fullName                String\n  fullNameBangla          String\n  dateOfBirth             String\n  birthRegistrationNumber String      @unique\n  religion                Religion\n  admissionTotalFees      Int\n  admissionDate           String\n  gender                  Gender\n  bloodGroup              BloodGroup?\n  previousInstituteName   String?\n  endingClass             String?\n  result                  String?\n  testimonialNumber       String?\n\n  studentSign         String\n  studentSignPublicId String\n  studentsignName     String\n  studentSignType     String\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  guardianSign         String\n  guardianSignPublicId String?\n  guardianSignName     String?\n  guardianSignType     String?\n\n  picture         String\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  address      Address?\n  guardianInfo GuardianInfo?\n  class        Class         @relation(fields: [classId], references: [id])\n  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  attendanceRecords AttendanceRecord[]\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Subject {\n  id          String @id @default(uuid())\n  subjectName String\n  maxMarks    Int\n  classId     String\n  class       Class  @relation(fields: [classId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"GeneralSettings":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"instituteName","kind":"scalar","type":"String"},{"name":"institutePhoneNumber","kind":"scalar","type":"String"},{"name":"instituteEmail","kind":"scalar","type":"String"},{"name":"instituteWebsite","kind":"scalar","type":"String"},{"name":"instituteAddress","kind":"scalar","type":"String"},{"name":"instituteCountry","kind":"scalar","type":"String"},{"name":"instituteLogo","kind":"scalar","type":"String"},{"name":"instituteLogoPublicId","kind":"scalar","type":"String"},{"name":"instituteLogoName","kind":"scalar","type":"String"},{"name":"instituteLogoType","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"RulesRegulations":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"RegulationType"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"rules_regulations"},"GradingConfiguration":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"grades","kind":"object","type":"GradeScale","relationName":"GradeScaleToGradingConfiguration"},{"name":"failCriteria","kind":"object","type":"FailCriteria","relationName":"FailCriteriaToGradingConfiguration"}],"dbName":null},"GradeScale":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"grade","kind":"scalar","type":"String"},{"name":"minMarks","kind":"scalar","type":"Int"},{"name":"maxMarks","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"GradeStatus"},{"name":"configurationId","kind":"scalar","type":"String"},{"name":"configuration","kind":"object","type":"GradingConfiguration","relationName":"GradeScaleToGradingConfiguration"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"FailCriteria":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"overallPercentage","kind":"scalar","type":"Float"},{"name":"subjectPercentage","kind":"scalar","type":"Float"},{"name":"minFailedSubjects","kind":"scalar","type":"Int"},{"name":"configurationId","kind":"scalar","type":"String"},{"name":"configuration","kind":"object","type":"GradingConfiguration","relationName":"FailCriteriaToGradingConfiguration"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"BankInfo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"nameOfBank","kind":"scalar","type":"String"},{"name":"branchAddress","kind":"scalar","type":"String"},{"name":"accountNumber","kind":"scalar","type":"String"},{"name":"instruction","kind":"scalar","type":"String"},{"name":"bankLogo","kind":"scalar","type":"String"},{"name":"bankLogoPublicId","kind":"scalar","type":"String"},{"name":"bankLogoName","kind":"scalar","type":"String"},{"name":"bankLogoType","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"AttendanceSession":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"class","kind":"object","type":"Class","relationName":"AttendanceSessionToClass"},{"name":"records","kind":"object","type":"AttendanceRecord","relationName":"AttendanceRecordToAttendanceSession"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"attendance_sessions"},"AttendanceRecord":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"AttendanceStatus"},{"name":"session","kind":"object","type":"AttendanceSession","relationName":"AttendanceRecordToAttendanceSession"},{"name":"student","kind":"object","type":"Student","relationName":"AttendanceRecordToStudent"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"attendance_records"},"EmployeeAttendanceSession":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"records","kind":"object","type":"EmployeeAttendanceRecord","relationName":"EmployeeAttendanceRecordToEmployeeAttendanceSession"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"employee_attendance_sessions"},"EmployeeAttendanceRecord":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"EmployeeAttendanceStatus"},{"name":"session","kind":"object","type":"EmployeeAttendanceSession","relationName":"EmployeeAttendanceRecordToEmployeeAttendanceSession"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToEmployeeAttendanceRecord"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"employee_attendance_records"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"},{"name":"students","kind":"object","type":"Student","relationName":"StudentToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContact","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"String"},{"name":"experiencePublicId","kind":"scalar","type":"String"},{"name":"experienceName","kind":"scalar","type":"String"},{"name":"experienceType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"employeeSign","kind":"scalar","type":"String"},{"name":"employeeSignPublicId","kind":"scalar","type":"String"},{"name":"employeeSignName","kind":"scalar","type":"String"},{"name":"employeeSignType","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"UserRole"},{"name":"dateOfJoining","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToEmployee"},{"name":"classes","kind":"object","type":"Class","relationName":"ClassToEmployee"},{"name":"attendanceRecords","kind":"object","type":"EmployeeAttendanceRecord","relationName":"EmployeeToEmployeeAttendanceRecord"}],"dbName":"employee"},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTuitionFee","kind":"scalar","type":"Float"},{"name":"classTeacher","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"employee","kind":"object","type":"Employee","relationName":"ClassToEmployee"},{"name":"students","kind":"object","type":"Student","relationName":"ClassToStudent"},{"name":"subjects","kind":"object","type":"Subject","relationName":"ClassToSubject"},{"name":"attendanceSessions","kind":"object","type":"AttendanceSession","relationName":"AttendanceSessionToClass"}],"dbName":"class"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String","dbName":"student_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"permanentAddressVillage","kind":"scalar","type":"String"},{"name":"permanentAddressPostOffice","kind":"scalar","type":"String"},{"name":"permanentAddressPostCode","kind":"scalar","type":"String"},{"name":"permanentAddressDistrict","kind":"scalar","type":"String"},{"name":"presentAddressVillage","kind":"scalar","type":"String"},{"name":"presentAddressPostOffice","kind":"scalar","type":"String"},{"name":"presentAddressPostCode","kind":"scalar","type":"String"},{"name":"presentAddressDistrict","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"student","kind":"object","type":"Student","relationName":"AddressToStudent"},{"name":"employee","kind":"object","type":"Employee","relationName":"AddressToEmployee"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"}],"dbName":null},"Sequence":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"current","kind":"scalar","type":"Int"}],"dbName":null},"GuardianInfo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"whatsappNumber","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"fatherNameBangla","kind":"scalar","type":"String"},{"name":"fatherMobileNumber","kind":"scalar","type":"String"},{"name":"fatherOccupation","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"motherNameBangla","kind":"scalar","type":"String"},{"name":"motherMobileNumber","kind":"scalar","type":"String"},{"name":"motherOccupation","kind":"scalar","type":"String"},{"name":"nameOfLocalGuardian","kind":"scalar","type":"String"},{"name":"relationShipOfStudent","kind":"scalar","type":"String"},{"name":"GuardianMobileNumber","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"GuardianInfoToStudent"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Student":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"fullNameBangla","kind":"scalar","type":"String"},{"name":"dateOfBirth","kind":"scalar","type":"String"},{"name":"birthRegistrationNumber","kind":"scalar","type":"String"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"admissionTotalFees","kind":"scalar","type":"Int"},{"name":"admissionDate","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"previousInstituteName","kind":"scalar","type":"String"},{"name":"endingClass","kind":"scalar","type":"String"},{"name":"result","kind":"scalar","type":"String"},{"name":"testimonialNumber","kind":"scalar","type":"String"},{"name":"studentSign","kind":"scalar","type":"String"},{"name":"studentSignPublicId","kind":"scalar","type":"String"},{"name":"studentsignName","kind":"scalar","type":"String"},{"name":"studentSignType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"guardianSign","kind":"scalar","type":"String"},{"name":"guardianSignPublicId","kind":"scalar","type":"String"},{"name":"guardianSignName","kind":"scalar","type":"String"},{"name":"guardianSignType","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToStudent"},{"name":"guardianInfo","kind":"object","type":"GuardianInfo","relationName":"GuardianInfoToStudent"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToStudent"},{"name":"user","kind":"object","type":"User","relationName":"StudentToUser"},{"name":"attendanceRecords","kind":"object","type":"AttendanceRecord","relationName":"AttendanceRecordToStudent"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"subjectName","kind":"scalar","type":"String"},{"name":"maxMarks","kind":"scalar","type":"Int"},{"name":"classId","kind":"scalar","type":"String"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToSubject"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","GeneralSettings.findUnique","GeneralSettings.findUniqueOrThrow","orderBy","cursor","GeneralSettings.findFirst","GeneralSettings.findFirstOrThrow","GeneralSettings.findMany","data","GeneralSettings.createOne","GeneralSettings.createMany","GeneralSettings.createManyAndReturn","GeneralSettings.updateOne","GeneralSettings.updateMany","GeneralSettings.updateManyAndReturn","create","update","GeneralSettings.upsertOne","GeneralSettings.deleteOne","GeneralSettings.deleteMany","having","_count","_min","_max","GeneralSettings.groupBy","GeneralSettings.aggregate","RulesRegulations.findUnique","RulesRegulations.findUniqueOrThrow","RulesRegulations.findFirst","RulesRegulations.findFirstOrThrow","RulesRegulations.findMany","RulesRegulations.createOne","RulesRegulations.createMany","RulesRegulations.createManyAndReturn","RulesRegulations.updateOne","RulesRegulations.updateMany","RulesRegulations.updateManyAndReturn","RulesRegulations.upsertOne","RulesRegulations.deleteOne","RulesRegulations.deleteMany","RulesRegulations.groupBy","RulesRegulations.aggregate","configuration","grades","failCriteria","GradingConfiguration.findUnique","GradingConfiguration.findUniqueOrThrow","GradingConfiguration.findFirst","GradingConfiguration.findFirstOrThrow","GradingConfiguration.findMany","GradingConfiguration.createOne","GradingConfiguration.createMany","GradingConfiguration.createManyAndReturn","GradingConfiguration.updateOne","GradingConfiguration.updateMany","GradingConfiguration.updateManyAndReturn","GradingConfiguration.upsertOne","GradingConfiguration.deleteOne","GradingConfiguration.deleteMany","GradingConfiguration.groupBy","GradingConfiguration.aggregate","GradeScale.findUnique","GradeScale.findUniqueOrThrow","GradeScale.findFirst","GradeScale.findFirstOrThrow","GradeScale.findMany","GradeScale.createOne","GradeScale.createMany","GradeScale.createManyAndReturn","GradeScale.updateOne","GradeScale.updateMany","GradeScale.updateManyAndReturn","GradeScale.upsertOne","GradeScale.deleteOne","GradeScale.deleteMany","_avg","_sum","GradeScale.groupBy","GradeScale.aggregate","FailCriteria.findUnique","FailCriteria.findUniqueOrThrow","FailCriteria.findFirst","FailCriteria.findFirstOrThrow","FailCriteria.findMany","FailCriteria.createOne","FailCriteria.createMany","FailCriteria.createManyAndReturn","FailCriteria.updateOne","FailCriteria.updateMany","FailCriteria.updateManyAndReturn","FailCriteria.upsertOne","FailCriteria.deleteOne","FailCriteria.deleteMany","FailCriteria.groupBy","FailCriteria.aggregate","BankInfo.findUnique","BankInfo.findUniqueOrThrow","BankInfo.findFirst","BankInfo.findFirstOrThrow","BankInfo.findMany","BankInfo.createOne","BankInfo.createMany","BankInfo.createManyAndReturn","BankInfo.updateOne","BankInfo.updateMany","BankInfo.updateManyAndReturn","BankInfo.upsertOne","BankInfo.deleteOne","BankInfo.deleteMany","BankInfo.groupBy","BankInfo.aggregate","user","sessions","accounts","employee","admin","student","address","guardianInfo","class","session","attendanceRecords","students","classes","records","subjects","attendanceSessions","AttendanceSession.findUnique","AttendanceSession.findUniqueOrThrow","AttendanceSession.findFirst","AttendanceSession.findFirstOrThrow","AttendanceSession.findMany","AttendanceSession.createOne","AttendanceSession.createMany","AttendanceSession.createManyAndReturn","AttendanceSession.updateOne","AttendanceSession.updateMany","AttendanceSession.updateManyAndReturn","AttendanceSession.upsertOne","AttendanceSession.deleteOne","AttendanceSession.deleteMany","AttendanceSession.groupBy","AttendanceSession.aggregate","AttendanceRecord.findUnique","AttendanceRecord.findUniqueOrThrow","AttendanceRecord.findFirst","AttendanceRecord.findFirstOrThrow","AttendanceRecord.findMany","AttendanceRecord.createOne","AttendanceRecord.createMany","AttendanceRecord.createManyAndReturn","AttendanceRecord.updateOne","AttendanceRecord.updateMany","AttendanceRecord.updateManyAndReturn","AttendanceRecord.upsertOne","AttendanceRecord.deleteOne","AttendanceRecord.deleteMany","AttendanceRecord.groupBy","AttendanceRecord.aggregate","EmployeeAttendanceSession.findUnique","EmployeeAttendanceSession.findUniqueOrThrow","EmployeeAttendanceSession.findFirst","EmployeeAttendanceSession.findFirstOrThrow","EmployeeAttendanceSession.findMany","EmployeeAttendanceSession.createOne","EmployeeAttendanceSession.createMany","EmployeeAttendanceSession.createManyAndReturn","EmployeeAttendanceSession.updateOne","EmployeeAttendanceSession.updateMany","EmployeeAttendanceSession.updateManyAndReturn","EmployeeAttendanceSession.upsertOne","EmployeeAttendanceSession.deleteOne","EmployeeAttendanceSession.deleteMany","EmployeeAttendanceSession.groupBy","EmployeeAttendanceSession.aggregate","EmployeeAttendanceRecord.findUnique","EmployeeAttendanceRecord.findUniqueOrThrow","EmployeeAttendanceRecord.findFirst","EmployeeAttendanceRecord.findFirstOrThrow","EmployeeAttendanceRecord.findMany","EmployeeAttendanceRecord.createOne","EmployeeAttendanceRecord.createMany","EmployeeAttendanceRecord.createManyAndReturn","EmployeeAttendanceRecord.updateOne","EmployeeAttendanceRecord.updateMany","EmployeeAttendanceRecord.updateManyAndReturn","EmployeeAttendanceRecord.upsertOne","EmployeeAttendanceRecord.deleteOne","EmployeeAttendanceRecord.deleteMany","EmployeeAttendanceRecord.groupBy","EmployeeAttendanceRecord.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","Employee.groupBy","Employee.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","Sequence.findUnique","Sequence.findUniqueOrThrow","Sequence.findFirst","Sequence.findFirstOrThrow","Sequence.findMany","Sequence.createOne","Sequence.createMany","Sequence.createManyAndReturn","Sequence.updateOne","Sequence.updateMany","Sequence.updateManyAndReturn","Sequence.upsertOne","Sequence.deleteOne","Sequence.deleteMany","Sequence.groupBy","Sequence.aggregate","GuardianInfo.findUnique","GuardianInfo.findUniqueOrThrow","GuardianInfo.findFirst","GuardianInfo.findFirstOrThrow","GuardianInfo.findMany","GuardianInfo.createOne","GuardianInfo.createMany","GuardianInfo.createManyAndReturn","GuardianInfo.updateOne","GuardianInfo.updateMany","GuardianInfo.updateManyAndReturn","GuardianInfo.upsertOne","GuardianInfo.deleteOne","GuardianInfo.deleteMany","GuardianInfo.groupBy","GuardianInfo.aggregate","Student.findUnique","Student.findUniqueOrThrow","Student.findFirst","Student.findFirstOrThrow","Student.findMany","Student.createOne","Student.createMany","Student.createManyAndReturn","Student.updateOne","Student.updateMany","Student.updateManyAndReturn","Student.upsertOne","Student.deleteOne","Student.deleteMany","Student.groupBy","Student.aggregate","Subject.findUnique","Subject.findUniqueOrThrow","Subject.findFirst","Subject.findFirstOrThrow","Subject.findMany","Subject.createOne","Subject.createMany","Subject.createManyAndReturn","Subject.updateOne","Subject.updateMany","Subject.updateManyAndReturn","Subject.upsertOne","Subject.deleteOne","Subject.deleteMany","Subject.groupBy","Subject.aggregate","AND","OR","NOT","id","subjectName","maxMarks","classId","isdeleted","createdAt","updatedAt","deletedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","userId","studentId","fullName","fullNameBangla","dateOfBirth","birthRegistrationNumber","Religion","religion","admissionTotalFees","admissionDate","Gender","gender","BloodGroup","bloodGroup","previousInstituteName","endingClass","result","testimonialNumber","studentSign","studentSignPublicId","studentsignName","studentSignType","authoritySign","authoritySignPublicId","authoritySignName","authoritySignType","guardianSign","guardianSignPublicId","guardianSignName","guardianSignType","picture","picturePublicId","pictureName","pictureType","whatsappNumber","fatherName","fatherNameBangla","fatherMobileNumber","fatherOccupation","motherName","motherNameBangla","motherMobileNumber","motherOccupation","nameOfLocalGuardian","relationShipOfStudent","GuardianMobileNumber","current","employeeId","permanentAddressVillage","permanentAddressPostOffice","permanentAddressPostCode","permanentAddressDistrict","presentAddressVillage","presentAddressPostOffice","presentAddressPostCode","presentAddressDistrict","isDeleted","name","monthlyTuitionFee","classTeacher","phone","nid","emergencyContact","monthlySalary","experience","experiencePublicId","experienceName","experienceType","employeeSign","employeeSignPublicId","employeeSignName","employeeSignType","UserRole","employeeRole","dateOfJoining","every","some","none","email","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","role","UserStatus","status","needPasswordChange","emailVerified","image","sessionId","EmployeeAttendanceStatus","date","AttendanceStatus","sessionId_employeeId","sessionId_studentId","classId_date","nameOfBank","branchAddress","accountNumber","instruction","bankLogo","bankLogoPublicId","bankLogoName","bankLogoType","overallPercentage","subjectPercentage","minFailedSubjects","configurationId","grade","minMarks","GradeStatus","isActive","configurationId_grade","content","RegulationType","type","instituteName","institutePhoneNumber","instituteEmail","instituteWebsite","instituteAddress","instituteCountry","instituteLogo","instituteLogoPublicId","instituteLogoName","instituteLogoType","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "ngnGAeACEv8CAADVBQAwgAMAAAQAEIEDAADVBQAwggMBAAAAAYcDQADuBAAhiANAAO4EACGJA0AA7wQAIc0DIADtBAAhlgQBAOwEACGXBAEA7AQAIZgEAQDsBAAhmQQBAPYEACGaBAEA7AQAIZsEAQDsBAAhnAQBAPYEACGdBAEA9gQAIZ4EAQD2BAAhnwQBAPYEACEBAAAAAQAgAQAAAAEAIBL_AgAA1QUAMIADAAAEABCBAwAA1QUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhzQMgAO0EACGWBAEA7AQAIZcEAQDsBAAhmAQBAOwEACGZBAEA9gQAIZoEAQDsBAAhmwQBAOwEACGcBAEA9gQAIZ0EAQD2BAAhngQBAPYEACGfBAEA9gQAIQaJAwAA1gUAIJkEAADWBQAgnAQAANYFACCdBAAA1gUAIJ4EAADWBQAgnwQAANYFACADAAAABAAgAwAABQAwBAAAAQAgAwAAAAQAIAMAAAUAMAQAAAEAIAMAAAAEACADAAAFADAEAAABACAPggMBAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAc0DIAAAAAGWBAEAAAABlwQBAAAAAZgEAQAAAAGZBAEAAAABmgQBAAAAAZsEAQAAAAGcBAEAAAABnQQBAAAAAZ4EAQAAAAGfBAEAAAABAQgAAAkAIA-CAwEAAAABhwNAAAAAAYgDQAAAAAGJA0AAAAABzQMgAAAAAZYEAQAAAAGXBAEAAAABmAQBAAAAAZkEAQAAAAGaBAEAAAABmwQBAAAAAZwEAQAAAAGdBAEAAAABngQBAAAAAZ8EAQAAAAEBCAAACwAwAQgAAAsAMA-CAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIc0DIADeBQAhlgQBANwFACGXBAEA3AUAIZgEAQDcBQAhmQQBAOsFACGaBAEA3AUAIZsEAQDcBQAhnAQBAOsFACGdBAEA6wUAIZ4EAQDrBQAhnwQBAOsFACECAAAAAQAgCAAADgAgD4IDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhzQMgAN4FACGWBAEA3AUAIZcEAQDcBQAhmAQBANwFACGZBAEA6wUAIZoEAQDcBQAhmwQBANwFACGcBAEA6wUAIZ0EAQDrBQAhngQBAOsFACGfBAEA6wUAIQIAAAAEACAIAAAQACACAAAABAAgCAAAEAAgAwAAAAEAIA8AAAkAIBAAAA4AIAEAAAABACABAAAABAAgCRUAALYIACAWAAC4CAAgFwAAtwgAIIkDAADWBQAgmQQAANYFACCcBAAA1gUAIJ0EAADWBQAgngQAANYFACCfBAAA1gUAIBL_AgAA1AUAMIADAAAXABCBAwAA1AUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIYkDQADQBAAhzQMgAM4EACGWBAEAzAQAIZcEAQDMBAAhmAQBAMwEACGZBAEA4QQAIZoEAQDMBAAhmwQBAMwEACGcBAEA4QQAIZ0EAQDhBAAhngQBAOEEACGfBAEA4QQAIQMAAAAEACADAAAWADAUAAAXACADAAAABAAgAwAABQAwBAAAAQAgCf8CAADSBQAwgAMAAB0AEIEDAADSBQAwggMBAAAAAYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZMEAQDsBAAhlQQAANMFlQQiAQAAABoAIAEAAAAaACAJ_wIAANIFADCAAwAAHQAQgQMAANIFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZMEAQDsBAAhlQQAANMFlQQiAYkDAADWBQAgAwAAAB0AIAMAAB4AMAQAABoAIAMAAAAdACADAAAeADAEAAAaACADAAAAHQAgAwAAHgAwBAAAGgAgBoIDAQAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAGTBAEAAAABlQQAAACVBAIBCAAAIgAgBoIDAQAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAGTBAEAAAABlQQAAACVBAIBCAAAJAAwAQgAACQAMAaCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIZMEAQDcBQAhlQQAALUIlQQiAgAAABoAIAgAACcAIAaCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIZMEAQDcBQAhlQQAALUIlQQiAgAAAB0AIAgAACkAIAIAAAAdACAIAAApACADAAAAGgAgDwAAIgAgEAAAJwAgAQAAABoAIAEAAAAdACAEFQAAsggAIBYAALQIACAXAACzCAAgiQMAANYFACAJ_wIAAM4FADCAAwAAMAAQgQMAAM4FADCCAwEAzAQAIYcDQADPBAAhiANAAM8EACGJA0AA0AQAIZMEAQDMBAAhlQQAAM8FlQQiAwAAAB0AIAMAAC8AMBQAADAAIAMAAAAdACADAAAeADAEAAAaACAKKwAAyQUAICwAAMoFACD_AgAAyAUAMIADAAA9ABCBAwAAyAUAMIIDAQAAAAGHA0AA7gQAIYgDQADuBAAhzgMBAOwEACGRBCAA7QQAIQEAAAAzACAMKgAAwgUAIP8CAADMBQAwgAMAADUAEIEDAADMBQAwggMBAOwEACGEAwIA8wQAIYcDQADuBAAhiANAAO4EACH3AwAAzQWRBCKNBAEA7AQAIY4EAQDsBAAhjwQCAPMEACEBKgAAjwgAIA0qAADCBQAg_wIAAMwFADCAAwAANQAQgQMAAMwFADCCAwEAAAABhAMCAPMEACGHA0AA7gQAIYgDQADuBAAh9wMAAM0FkQQijQQBAOwEACGOBAEA7AQAIY8EAgDzBAAhkgQAAMsFACADAAAANQAgAwAANgAwBAAANwAgCyoAAMIFACD_AgAAwQUAMIADAAA5ABCBAwAAwQUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIYoECACEBQAhiwQIAIQFACGMBAIA8wQAIY0EAQDsBAAhAQAAADkAIAEAAAA1ACABAAAAMwAgCisAAMkFACAsAADKBQAg_wIAAMgFADCAAwAAPQAQgQMAAMgFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACHOAwEA7AQAIZEEIADtBAAhAisAALAIACAsAACxCAAgAwAAAD0AIAMAAD4AMAQAADMAIAMAAAA9ACADAAA-ADAEAAAzACADAAAAPQAgAwAAPgAwBAAAMwAgBysAAK4IACAsAACvCAAgggMBAAAAAYcDQAAAAAGIA0AAAAABzgMBAAAAAZEEIAAAAAEBCAAAQgAgBYIDAQAAAAGHA0AAAAABiANAAAAAAc4DAQAAAAGRBCAAAAABAQgAAEQAMAEIAABEADAHKwAAmwgAICwAAJwIACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACHOAwEA3AUAIZEEIADeBQAhAgAAADMAIAgAAEcAIAWCAwEA3AUAIYcDQADfBQAhiANAAN8FACHOAwEA3AUAIZEEIADeBQAhAgAAAD0AIAgAAEkAIAIAAAA9ACAIAABJACADAAAAMwAgDwAAQgAgEAAARwAgAQAAADMAIAEAAAA9ACADFQAAmAgAIBYAAJoIACAXAACZCAAgCP8CAADHBQAwgAMAAFAAEIEDAADHBQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhzgMBAMwEACGRBCAAzgQAIQMAAAA9ACADAABPADAUAABQACADAAAAPQAgAwAAPgAwBAAAMwAgAQAAADcAIAEAAAA3ACADAAAANQAgAwAANgAwBAAANwAgAwAAADUAIAMAADYAMAQAADcAIAMAAAA1ACADAAA2ADAEAAA3ACAJKgAAlwgAIIIDAQAAAAGEAwIAAAABhwNAAAAAAYgDQAAAAAH3AwAAAJEEAo0EAQAAAAGOBAEAAAABjwQCAAAAAQEIAABYACAIggMBAAAAAYQDAgAAAAGHA0AAAAABiANAAAAAAfcDAAAAkQQCjQQBAAAAAY4EAQAAAAGPBAIAAAABAQgAAFoAMAEIAABaADAJKgAAlggAIIIDAQDcBQAhhAMCAN0FACGHA0AA3wUAIYgDQADfBQAh9wMAAJUIkQQijQQBANwFACGOBAEA3AUAIY8EAgDdBQAhAgAAADcAIAgAAF0AIAiCAwEA3AUAIYQDAgDdBQAhhwNAAN8FACGIA0AA3wUAIfcDAACVCJEEIo0EAQDcBQAhjgQBANwFACGPBAIA3QUAIQIAAAA1ACAIAABfACACAAAANQAgCAAAXwAgAwAAADcAIA8AAFgAIBAAAF0AIAEAAAA3ACABAAAANQAgBRUAAJAIACAWAACTCAAgFwAAkggAIEsAAJEIACBMAACUCAAgC_8CAADDBQAwgAMAAGYAEIEDAADDBQAwggMBAMwEACGEAwIAzQQAIYcDQADPBAAhiANAAM8EACH3AwAAxAWRBCKNBAEAzAQAIY4EAQDMBAAhjwQCAM0EACEDAAAANQAgAwAAZQAwFAAAZgAgAwAAADUAIAMAADYAMAQAADcAIAsqAADCBQAg_wIAAMEFADCAAwAAOQAQgQMAAMEFADCCAwEAAAABhwNAAO4EACGIA0AA7gQAIYoECACEBQAhiwQIAIQFACGMBAIA8wQAIY0EAQAAAAEBAAAAaQAgAQAAAGkAIAEqAACPCAAgAwAAADkAIAMAAGwAMAQAAGkAIAMAAAA5ACADAABsADAEAABpACADAAAAOQAgAwAAbAAwBAAAaQAgCCoAAI4IACCCAwEAAAABhwNAAAAAAYgDQAAAAAGKBAgAAAABiwQIAAAAAYwEAgAAAAGNBAEAAAABAQgAAHAAIAeCAwEAAAABhwNAAAAAAYgDQAAAAAGKBAgAAAABiwQIAAAAAYwEAgAAAAGNBAEAAAABAQgAAHIAMAEIAAByADAIKgAAjQgAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYoECACnBgAhiwQIAKcGACGMBAIA3QUAIY0EAQDcBQAhAgAAAGkAIAgAAHUAIAeCAwEA3AUAIYcDQADfBQAhiANAAN8FACGKBAgApwYAIYsECACnBgAhjAQCAN0FACGNBAEA3AUAIQIAAAA5ACAIAAB3ACACAAAAOQAgCAAAdwAgAwAAAGkAIA8AAHAAIBAAAHUAIAEAAABpACABAAAAOQAgBRUAAIgIACAWAACLCAAgFwAAiggAIEsAAIkIACBMAACMCAAgCv8CAADABQAwgAMAAH4AEIEDAADABQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhigQIAPoEACGLBAgA-gQAIYwEAgDNBAAhjQQBAMwEACEDAAAAOQAgAwAAfQAwFAAAfgAgAwAAADkAIAMAAGwAMAQAAGkAIBD_AgAAvwUAMIADAACEAQAQgQMAAL8FADCCAwEAAAABhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhzQMgAO0EACGCBAEA7AQAIYMEAQDsBAAhhAQBAOwEACGFBAEA9gQAIYYEAQDsBAAhhwQBAOwEACGIBAEA7AQAIYkEAQDsBAAhAQAAAIEBACABAAAAgQEAIBD_AgAAvwUAMIADAACEAQAQgQMAAL8FADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIc0DIADtBAAhggQBAOwEACGDBAEA7AQAIYQEAQDsBAAhhQQBAPYEACGGBAEA7AQAIYcEAQDsBAAhiAQBAOwEACGJBAEA7AQAIQKJAwAA1gUAIIUEAADWBQAgAwAAAIQBACADAACFAQAwBAAAgQEAIAMAAACEAQAgAwAAhQEAMAQAAIEBACADAAAAhAEAIAMAAIUBADAEAACBAQAgDYIDAQAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAHNAyAAAAABggQBAAAAAYMEAQAAAAGEBAEAAAABhQQBAAAAAYYEAQAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAEBCAAAiQEAIA2CAwEAAAABhwNAAAAAAYgDQAAAAAGJA0AAAAABzQMgAAAAAYIEAQAAAAGDBAEAAAABhAQBAAAAAYUEAQAAAAGGBAEAAAABhwQBAAAAAYgEAQAAAAGJBAEAAAABAQgAAIsBADABCAAAiwEAMA2CAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIc0DIADeBQAhggQBANwFACGDBAEA3AUAIYQEAQDcBQAhhQQBAOsFACGGBAEA3AUAIYcEAQDcBQAhiAQBANwFACGJBAEA3AUAIQIAAACBAQAgCAAAjgEAIA2CAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIc0DIADeBQAhggQBANwFACGDBAEA3AUAIYQEAQDcBQAhhQQBAOsFACGGBAEA3AUAIYcEAQDcBQAhiAQBANwFACGJBAEA3AUAIQIAAACEAQAgCAAAkAEAIAIAAACEAQAgCAAAkAEAIAMAAACBAQAgDwAAiQEAIBAAAI4BACABAAAAgQEAIAEAAACEAQAgBRUAAIUIACAWAACHCAAgFwAAhggAIIkDAADWBQAghQQAANYFACAQ_wIAAL4FADCAAwAAlwEAEIEDAAC-BQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhiQNAANAEACHNAyAAzgQAIYIEAQDMBAAhgwQBAMwEACGEBAEAzAQAIYUEAQDhBAAhhgQBAMwEACGHBAEAzAQAIYgEAQDMBAAhiQQBAMwEACEDAAAAhAEAIAMAAJYBADAUAACXAQAgAwAAAIQBACADAACFAQAwBAAAgQEAIAt3AACpBQAgfAAAqgUAIP8CAACoBQAwgAMAAMwBABCBAwAAqAUAMIIDAQAAAAGFAwEA7AQAIYcDQADuBAAhiANAAO4EACH9A0AA7gQAIYEEAAC9BQAgAQAAAJoBACAMbwAAiQUAIP8CAAC8BQAwgAMAAJwBABCBAwAAvAUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIZUDAQDsBAAh6ANAAO4EACHyAwEA7AQAIfMDAQD2BAAh9AMBAPYEACEDbwAAkAcAIPMDAADWBQAg9AMAANYFACAMbwAAiQUAIP8CAAC8BQAwgAMAAJwBABCBAwAAvAUAMIIDAQAAAAGHA0AA7gQAIYgDQADuBAAhlQMBAOwEACHoA0AA7gQAIfIDAQAAAAHzAwEA9gQAIfQDAQD2BAAhAwAAAJwBACADAACdAQAwBAAAngEAIBFvAACJBQAg_wIAALsFADCAAwAAoAEAEIEDAAC7BQAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhlQMBAOwEACHpAwEA7AQAIeoDAQDsBAAh6wMBAPYEACHsAwEA9gQAIe0DAQD2BAAh7gNAAO8EACHvA0AA7wQAIfADAQD2BAAh8QMBAPYEACEIbwAAkAcAIOsDAADWBQAg7AMAANYFACDtAwAA1gUAIO4DAADWBQAg7wMAANYFACDwAwAA1gUAIPEDAADWBQAgEW8AAIkFACD_AgAAuwUAMIADAACgAQAQgQMAALsFADCCAwEAAAABhwNAAO4EACGIA0AA7gQAIZUDAQDsBAAh6QMBAOwEACHqAwEA7AQAIesDAQD2BAAh7AMBAPYEACHtAwEA9gQAIe4DQADvBAAh7wNAAO8EACHwAwEA9gQAIfEDAQD2BAAhAwAAAKABACADAAChAQAwBAAAogEAICpvAACJBQAgdQAAigUAIHkAAIwFACB7AACLBQAg_wIAAIMFADCAAwAApAEAEIEDAACDBQAwggMBAOwEACGGAyAA7QQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZUDAQDsBAAhlwMBAOwEACGcAwAAhwWcAyKgAwAAhQWgAyKiAwAAhgWiAyKrAwEA7AQAIawDAQDsBAAhrQMBAPYEACGuAwEA9gQAIbMDAQD2BAAhtAMBAPYEACG1AwEA9gQAIbYDAQD2BAAhuAMBAOwEACG8AwEA7AQAIcQDAQDsBAAh0QMBAOwEACHSAwEA7AQAIdMDAQD2BAAh1AMIAIQFACHVAwEA9gQAIdYDAQD2BAAh1wMBAPYEACHYAwEA9gQAIdkDAQDsBAAh2gMBAOwEACHbAwEA9gQAIdwDAQD2BAAh3gMAAIgF3gMi3wMBAOwEACEBAAAApAEAIA5vAACJBQAg_wIAAI4FADCAAwAApgEAEIEDAACOBQAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACGVAwEA7AQAIc0DIADtBAAhzgMBAOwEACHjAwEA7AQAIeQDAQD2BAAh5QMBAPYEACEBAAAApgEAIC1vAACJBQAgdQAAigUAIHYAALoFACB3AACpBQAgeQAAqgUAIP8CAAC4BQAwgAMAAKgBABCBAwAAuAUAMIIDAQDsBAAhhQMBAOwEACGGAyAA7QQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZUDAQDsBAAhlgMBAOwEACGXAwEA7AQAIZgDAQDsBAAhmQMBAOwEACGaAwEA7AQAIZwDAACHBZwDIp0DAgDzBAAhngMBAOwEACGgAwAAhQWgAyKiAwAAuQWiAyOjAwEA9gQAIaQDAQD2BAAhpQMBAPYEACGmAwEA9gQAIacDAQDsBAAhqAMBAOwEACGpAwEA7AQAIaoDAQDsBAAhqwMBAOwEACGsAwEA7AQAIa0DAQD2BAAhrgMBAPYEACGvAwEA7AQAIbADAQD2BAAhsQMBAPYEACGyAwEA9gQAIbMDAQDsBAAhtAMBAPYEACG1AwEA9gQAIbYDAQD2BAAhE28AAJAHACB1AACRBwAgdgAAhAgAIHcAAP4HACB5AAD_BwAgiQMAANYFACCiAwAA1gUAIKMDAADWBQAgpAMAANYFACClAwAA1gUAIKYDAADWBQAgrQMAANYFACCuAwAA1gUAILADAADWBQAgsQMAANYFACCyAwAA1gUAILQDAADWBQAgtQMAANYFACC2AwAA1gUAIC1vAACJBQAgdQAAigUAIHYAALoFACB3AACpBQAgeQAAqgUAIP8CAAC4BQAwgAMAAKgBABCBAwAAuAUAMIIDAQAAAAGFAwEA7AQAIYYDIADtBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhlQMBAOwEACGWAwEAAAABlwMBAOwEACGYAwEA7AQAIZkDAQDsBAAhmgMBAAAAAZwDAACHBZwDIp0DAgDzBAAhngMBAOwEACGgAwAAhQWgAyKiAwAAuQWiAyOjAwEA9gQAIaQDAQD2BAAhpQMBAPYEACGmAwEA9gQAIacDAQDsBAAhqAMBAOwEACGpAwEA7AQAIaoDAQDsBAAhqwMBAOwEACGsAwEA7AQAIa0DAQD2BAAhrgMBAPYEACGvAwEA7AQAIbADAQD2BAAhsQMBAPYEACGyAwEA9gQAIbMDAQDsBAAhtAMBAPYEACG1AwEA9gQAIbYDAQD2BAAhAwAAAKgBACADAACpAQAwBAAAqgEAIBRyAAD4BAAgdAAA9wQAIP8CAAD1BAAwgAMAAKwBABCBAwAA9QQAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhlgMBAPYEACHEAwEA9gQAIcUDAQD2BAAhxgMBAPYEACHHAwEA9gQAIcgDAQD2BAAhyQMBAPYEACHKAwEA9gQAIcsDAQD2BAAhzAMBAPYEACHNAyAA7QQAIQEAAACsAQAgAQAAAKgBACABAAAApAEAIBZ0AADwBAAg_wIAAOsEADCAAwAAsAEAEIEDAADrBAAwggMBAOwEACGGAyAA7QQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZYDAQDsBAAhtwMBAOwEACG4AwEA7AQAIbkDAQDsBAAhugMBAOwEACG7AwEA7AQAIbwDAQDsBAAhvQMBAOwEACG-AwEA7AQAIb8DAQDsBAAhwAMBAOwEACHBAwEA7AQAIcIDAQDsBAAhAQAAALABACALdAAA8AQAIHgAALcFACD_AgAAtQUAMIADAACyAQAQgQMAALUFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGWAwEA7AQAIfcDAAC2Bf8DIvsDAQDsBAAhAnQAAJYGACB4AACDCAAgDHQAAPAEACB4AAC3BQAg_wIAALUFADCAAwAAsgEAEIEDAAC1BQAwggMBAAAAAYcDQADuBAAhiANAAO4EACGWAwEA7AQAIfcDAAC2Bf8DIvsDAQDsBAAhgAQAALQFACADAAAAsgEAIAMAALMBADAEAAC0AQAgAQAAALIBACABAAAAnAEAIAEAAACgAQAgAQAAAKgBACABAAAArAEAIA9yAACwBQAgegAAnAUAIH0AALIFACB-AACzBQAg_wIAALEFADCAAwAAuwEAEIEDAACxBQAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACHNAyAA7QQAIc4DAQDsBAAhzwMIAIQFACHQAwEA7AQAIQVyAAChBgAgegAA4gcAIH0AAIEIACB-AACCCAAgiQMAANYFACAPcgAAsAUAIHoAAJwFACB9AACyBQAgfgAAswUAIP8CAACxBQAwgAMAALsBABCBAwAAsQUAMIIDAQAAAAGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACHNAyAA7QQAIc4DAQDsBAAhzwMIAIQFACHQAwEA7AQAIQMAAAC7AQAgAwAAvAEAMAQAAL0BACALcgAAsAUAIHgAAK8FACD_AgAArQUAMIADAAC_AQAQgQMAAK0FADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACHEAwEA7AQAIfcDAACuBf0DIvsDAQDsBAAhAnIAAKEGACB4AACACAAgDHIAALAFACB4AACvBQAg_wIAAK0FADCAAwAAvwEAEIEDAACtBQAwggMBAAAAAYcDQADuBAAhiANAAO4EACHEAwEA7AQAIfcDAACuBf0DIvsDAQDsBAAh_wMAAKwFACADAAAAvwEAIAMAAMABADAEAADBAQAgAwAAAL8BACADAADAAQAwBAAAwQEAIAEAAAC_AQAgAQAAALsBACABAAAAvwEAIAMAAACoAQAgAwAAqQEAMAQAAKoBACAMdwAAqQUAIP8CAACrBQAwgAMAAMgBABCBAwAAqwUAMIIDAQDsBAAhgwMBAOwEACGEAwIA8wQAIYUDAQDsBAAhhgMgAO0EACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACECdwAA_gcAIIkDAADWBQAgDHcAAKkFACD_AgAAqwUAMIADAADIAQAQgQMAAKsFADCCAwEAAAABgwMBAOwEACGEAwIA8wQAIYUDAQDsBAAhhgMgAO0EACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACEDAAAAyAEAIAMAAMkBADAEAADKAQAgCncAAKkFACB8AACqBQAg_wIAAKgFADCAAwAAzAEAEIEDAACoBQAwggMBAOwEACGFAwEA7AQAIYcDQADuBAAhiANAAO4EACH9A0AA7gQAIQJ3AAD-BwAgfAAA_wcAIAMAAADMAQAgAwAAzQEAMAQAAJoBACABAAAAqAEAIAEAAADIAQAgAQAAAMwBACADAAAAsgEAIAMAALMBADAEAAC0AQAgAQAAALIBACABAAAAmgEAIAMAAADMAQAgAwAAzQEAMAQAAJoBACADAAAAzAEAIAMAAM0BADAEAACaAQAgAwAAAMwBACADAADNAQAwBAAAmgEAIAd3AAD9BwAgfAAAxAYAIIIDAQAAAAGFAwEAAAABhwNAAAAAAYgDQAAAAAH9A0AAAAABAQgAANgBACAFggMBAAAAAYUDAQAAAAGHA0AAAAABiANAAAAAAf0DQAAAAAEBCAAA2gEAMAEIAADaAQAwB3cAAPwHACB8AAC3BgAgggMBANwFACGFAwEA3AUAIYcDQADfBQAhiANAAN8FACH9A0AA3wUAIQIAAACaAQAgCAAA3QEAIAWCAwEA3AUAIYUDAQDcBQAhhwNAAN8FACGIA0AA3wUAIf0DQADfBQAhAgAAAMwBACAIAADfAQAgAgAAAMwBACAIAADfAQAgAwAAAJoBACAPAADYAQAgEAAA3QEAIAEAAACaAQAgAQAAAMwBACADFQAA-QcAIBYAAPsHACAXAAD6BwAgCP8CAACnBQAwgAMAAOYBABCBAwAApwUAMIIDAQDMBAAhhQMBAMwEACGHA0AAzwQAIYgDQADPBAAh_QNAAM8EACEDAAAAzAEAIAMAAOUBADAUAADmAQAgAwAAAMwBACADAADNAQAwBAAAmgEAIAEAAAC0AQAgAQAAALQBACADAAAAsgEAIAMAALMBADAEAAC0AQAgAwAAALIBACADAACzAQAwBAAAtAEAIAMAAACyAQAgAwAAswEAMAQAALQBACAIdAAAwgYAIHgAAP8FACCCAwEAAAABhwNAAAAAAYgDQAAAAAGWAwEAAAAB9wMAAAD_AwL7AwEAAAABAQgAAO4BACAGggMBAAAAAYcDQAAAAAGIA0AAAAABlgMBAAAAAfcDAAAA_wMC-wMBAAAAAQEIAADwAQAwAQgAAPABADAIdAAAwAYAIHgAAP0FACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACGWAwEA3AUAIfcDAAD7Bf8DIvsDAQDcBQAhAgAAALQBACAIAADzAQAgBoIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIZYDAQDcBQAh9wMAAPsF_wMi-wMBANwFACECAAAAsgEAIAgAAPUBACACAAAAsgEAIAgAAPUBACADAAAAtAEAIA8AAO4BACAQAADzAQAgAQAAALQBACABAAAAsgEAIAMVAAD2BwAgFgAA-AcAIBcAAPcHACAJ_wIAAKMFADCAAwAA_AEAEIEDAACjBQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhlgMBAMwEACH3AwAApAX_AyL7AwEAzAQAIQMAAACyAQAgAwAA-wEAMBQAAPwBACADAAAAsgEAIAMAALMBADAEAAC0AQAgCHwAAIwFACD_AgAAogUAMIADAACCAgAQgQMAAKIFADCCAwEAAAABhwNAAO4EACGIA0AA7gQAIf0DQAAAAAEBAAAA_wEAIAEAAAD_AQAgCHwAAIwFACD_AgAAogUAMIADAACCAgAQgQMAAKIFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACH9A0AA7gQAIQF8AACTBwAgAwAAAIICACADAACDAgAwBAAA_wEAIAMAAACCAgAgAwAAgwIAMAQAAP8BACADAAAAggIAIAMAAIMCADAEAAD_AQAgBXwAAPUHACCCAwEAAAABhwNAAAAAAYgDQAAAAAH9A0AAAAABAQgAAIcCACAEggMBAAAAAYcDQAAAAAGIA0AAAAAB_QNAAAAAAQEIAACJAgAwAQgAAIkCADAFfAAA6wcAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIf0DQADfBQAhAgAAAP8BACAIAACMAgAgBIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIf0DQADfBQAhAgAAAIICACAIAACOAgAgAgAAAIICACAIAACOAgAgAwAAAP8BACAPAACHAgAgEAAAjAIAIAEAAAD_AQAgAQAAAIICACADFQAA6AcAIBYAAOoHACAXAADpBwAgB_8CAAChBQAwgAMAAJUCABCBAwAAoQUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIf0DQADPBAAhAwAAAIICACADAACUAgAwFAAAlQIAIAMAAACCAgAgAwAAgwIAMAQAAP8BACABAAAAwQEAIAEAAADBAQAgAwAAAL8BACADAADAAQAwBAAAwQEAIAMAAAC_AQAgAwAAwAEAMAQAAMEBACADAAAAvwEAIAMAAMABADAEAADBAQAgCHIAAOcHACB4AAD6BgAgggMBAAAAAYcDQAAAAAGIA0AAAAABxAMBAAAAAfcDAAAA_QMC-wMBAAAAAQEIAACdAgAgBoIDAQAAAAGHA0AAAAABiANAAAAAAcQDAQAAAAH3AwAAAP0DAvsDAQAAAAEBCAAAnwIAMAEIAACfAgAwCHIAAOYHACB4AAD4BgAgggMBANwFACGHA0AA3wUAIYgDQADfBQAhxAMBANwFACH3AwAA9gb9AyL7AwEA3AUAIQIAAADBAQAgCAAAogIAIAaCAwEA3AUAIYcDQADfBQAhiANAAN8FACHEAwEA3AUAIfcDAAD2Bv0DIvsDAQDcBQAhAgAAAL8BACAIAACkAgAgAgAAAL8BACAIAACkAgAgAwAAAMEBACAPAACdAgAgEAAAogIAIAEAAADBAQAgAQAAAL8BACADFQAA4wcAIBYAAOUHACAXAADkBwAgCf8CAACdBQAwgAMAAKsCABCBAwAAnQUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIcQDAQDMBAAh9wMAAJ4F_QMi-wMBAMwEACEDAAAAvwEAIAMAAKoCADAUAACrAgAgAwAAAL8BACADAADAAQAwBAAAwQEAIBRwAACZBQAgcQAAmgUAIHIAAPgEACBzAACbBQAgegAAnAUAIP8CAACXBQAwgAMAALECABCBAwAAlwUAMIIDAQAAAAGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACHNAyAA7QQAIc4DAQDsBAAh4wMBAAAAAfUDAACIBd4DIvcDAACYBfcDIvgDIADtBAAh-QMgAO0EACH6AwEA9gQAIQEAAACuAgAgAQAAAK4CACAUcAAAmQUAIHEAAJoFACByAAD4BAAgcwAAmwUAIHoAAJwFACD_AgAAlwUAMIADAACxAgAQgQMAAJcFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIc0DIADtBAAhzgMBAOwEACHjAwEA7AQAIfUDAACIBd4DIvcDAACYBfcDIvgDIADtBAAh-QMgAO0EACH6AwEA9gQAIQdwAADfBwAgcQAA4AcAIHIAAKEGACBzAADhBwAgegAA4gcAIIkDAADWBQAg-gMAANYFACADAAAAsQIAIAMAALICADAEAACuAgAgAwAAALECACADAACyAgAwBAAArgIAIAMAAACxAgAgAwAAsgIAMAQAAK4CACARcAAA2gcAIHEAANsHACByAADcBwAgcwAA3QcAIHoAAN4HACCCAwEAAAABhwNAAAAAAYgDQAAAAAGJA0AAAAABzQMgAAAAAc4DAQAAAAHjAwEAAAAB9QMAAADeAwL3AwAAAPcDAvgDIAAAAAH5AyAAAAAB-gMBAAAAAQEIAAC2AgAgDIIDAQAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAHNAyAAAAABzgMBAAAAAeMDAQAAAAH1AwAAAN4DAvcDAAAA9wMC-AMgAAAAAfkDIAAAAAH6AwEAAAABAQgAALgCADABCAAAuAIAMBFwAACqBwAgcQAAqwcAIHIAAKwHACBzAACtBwAgegAArgcAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhzQMgAN4FACHOAwEA3AUAIeMDAQDcBQAh9QMAAOcG3gMi9wMAAKkH9wMi-AMgAN4FACH5AyAA3gUAIfoDAQDrBQAhAgAAAK4CACAIAAC7AgAgDIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhzQMgAN4FACHOAwEA3AUAIeMDAQDcBQAh9QMAAOcG3gMi9wMAAKkH9wMi-AMgAN4FACH5AyAA3gUAIfoDAQDrBQAhAgAAALECACAIAAC9AgAgAgAAALECACAIAAC9AgAgAwAAAK4CACAPAAC2AgAgEAAAuwIAIAEAAACuAgAgAQAAALECACAFFQAApgcAIBYAAKgHACAXAACnBwAgiQMAANYFACD6AwAA1gUAIA__AgAAkwUAMIADAADEAgAQgQMAAJMFADCCAwEAzAQAIYcDQADPBAAhiANAAM8EACGJA0AA0AQAIc0DIADOBAAhzgMBAMwEACHjAwEAzAQAIfUDAAD-BN4DIvcDAACUBfcDIvgDIADOBAAh-QMgAM4EACH6AwEA4QQAIQMAAACxAgAgAwAAwwIAMBQAAMQCACADAAAAsQIAIAMAALICADAEAACuAgAgAQAAAJ4BACABAAAAngEAIAMAAACcAQAgAwAAnQEAMAQAAJ4BACADAAAAnAEAIAMAAJ0BADAEAACeAQAgAwAAAJwBACADAACdAQAwBAAAngEAIAlvAAClBwAgggMBAAAAAYcDQAAAAAGIA0AAAAABlQMBAAAAAegDQAAAAAHyAwEAAAAB8wMBAAAAAfQDAQAAAAEBCAAAzAIAIAiCAwEAAAABhwNAAAAAAYgDQAAAAAGVAwEAAAAB6ANAAAAAAfIDAQAAAAHzAwEAAAAB9AMBAAAAAQEIAADOAgAwAQgAAM4CADAJbwAApAcAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIZUDAQDcBQAh6ANAAN8FACHyAwEA3AUAIfMDAQDrBQAh9AMBAOsFACECAAAAngEAIAgAANECACAIggMBANwFACGHA0AA3wUAIYgDQADfBQAhlQMBANwFACHoA0AA3wUAIfIDAQDcBQAh8wMBAOsFACH0AwEA6wUAIQIAAACcAQAgCAAA0wIAIAIAAACcAQAgCAAA0wIAIAMAAACeAQAgDwAAzAIAIBAAANECACABAAAAngEAIAEAAACcAQAgBRUAAKEHACAWAACjBwAgFwAAogcAIPMDAADWBQAg9AMAANYFACAL_wIAAJIFADCAAwAA2gIAEIEDAACSBQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhlQMBAMwEACHoA0AAzwQAIfIDAQDMBAAh8wMBAOEEACH0AwEA4QQAIQMAAACcAQAgAwAA2QIAMBQAANoCACADAAAAnAEAIAMAAJ0BADAEAACeAQAgAQAAAKIBACABAAAAogEAIAMAAACgAQAgAwAAoQEAMAQAAKIBACADAAAAoAEAIAMAAKEBADAEAACiAQAgAwAAAKABACADAAChAQAwBAAAogEAIA5vAACgBwAgggMBAAAAAYcDQAAAAAGIA0AAAAABlQMBAAAAAekDAQAAAAHqAwEAAAAB6wMBAAAAAewDAQAAAAHtAwEAAAAB7gNAAAAAAe8DQAAAAAHwAwEAAAAB8QMBAAAAAQEIAADiAgAgDYIDAQAAAAGHA0AAAAABiANAAAAAAZUDAQAAAAHpAwEAAAAB6gMBAAAAAesDAQAAAAHsAwEAAAAB7QMBAAAAAe4DQAAAAAHvA0AAAAAB8AMBAAAAAfEDAQAAAAEBCAAA5AIAMAEIAADkAgAwDm8AAJ8HACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACGVAwEA3AUAIekDAQDcBQAh6gMBANwFACHrAwEA6wUAIewDAQDrBQAh7QMBAOsFACHuA0AA4AUAIe8DQADgBQAh8AMBAOsFACHxAwEA6wUAIQIAAACiAQAgCAAA5wIAIA2CAwEA3AUAIYcDQADfBQAhiANAAN8FACGVAwEA3AUAIekDAQDcBQAh6gMBANwFACHrAwEA6wUAIewDAQDrBQAh7QMBAOsFACHuA0AA4AUAIe8DQADgBQAh8AMBAOsFACHxAwEA6wUAIQIAAACgAQAgCAAA6QIAIAIAAACgAQAgCAAA6QIAIAMAAACiAQAgDwAA4gIAIBAAAOcCACABAAAAogEAIAEAAACgAQAgChUAAJwHACAWAACeBwAgFwAAnQcAIOsDAADWBQAg7AMAANYFACDtAwAA1gUAIO4DAADWBQAg7wMAANYFACDwAwAA1gUAIPEDAADWBQAgEP8CAACRBQAwgAMAAPACABCBAwAAkQUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIZUDAQDMBAAh6QMBAMwEACHqAwEAzAQAIesDAQDhBAAh7AMBAOEEACHtAwEA4QQAIe4DQADQBAAh7wNAANAEACHwAwEA4QQAIfEDAQDhBAAhAwAAAKABACADAADvAgAwFAAA8AIAIAMAAACgAQAgAwAAoQEAMAQAAKIBACAJ_wIAAJAFADCAAwAA9gIAEIEDAACQBQAwggMBAAAAAYcDQADuBAAhiANAAO4EACHmAwEA7AQAIecDAQDsBAAh6ANAAO4EACEBAAAA8wIAIAEAAADzAgAgCf8CAACQBQAwgAMAAPYCABCBAwAAkAUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIeYDAQDsBAAh5wMBAOwEACHoA0AA7gQAIQADAAAA9gIAIAMAAPcCADAEAADzAgAgAwAAAPYCACADAAD3AgAwBAAA8wIAIAMAAAD2AgAgAwAA9wIAMAQAAPMCACAGggMBAAAAAYcDQAAAAAGIA0AAAAAB5gMBAAAAAecDAQAAAAHoA0AAAAABAQgAAPsCACAGggMBAAAAAYcDQAAAAAGIA0AAAAAB5gMBAAAAAecDAQAAAAHoA0AAAAABAQgAAP0CADABCAAA_QIAMAaCAwEA3AUAIYcDQADfBQAhiANAAN8FACHmAwEA3AUAIecDAQDcBQAh6ANAAN8FACECAAAA8wIAIAgAAIADACAGggMBANwFACGHA0AA3wUAIYgDQADfBQAh5gMBANwFACHnAwEA3AUAIegDQADfBQAhAgAAAPYCACAIAACCAwAgAgAAAPYCACAIAACCAwAgAwAAAPMCACAPAAD7AgAgEAAAgAMAIAEAAADzAgAgAQAAAPYCACADFQAAmQcAIBYAAJsHACAXAACaBwAgCf8CAACPBQAwgAMAAIkDABCBAwAAjwUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIeYDAQDMBAAh5wMBAMwEACHoA0AAzwQAIQMAAAD2AgAgAwAAiAMAMBQAAIkDACADAAAA9gIAIAMAAPcCADAEAADzAgAgDm8AAIkFACD_AgAAjgUAMIADAACmAQAQgQMAAI4FADCCAwEAAAABhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhlQMBAAAAAc0DIADtBAAhzgMBAOwEACHjAwEAAAAB5AMBAPYEACHlAwEA9gQAIQEAAACMAwAgAQAAAIwDACAEbwAAkAcAIIkDAADWBQAg5AMAANYFACDlAwAA1gUAIAMAAACmAQAgAwAAjwMAMAQAAIwDACADAAAApgEAIAMAAI8DADAEAACMAwAgAwAAAKYBACADAACPAwAwBAAAjAMAIAtvAACYBwAgggMBAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAZUDAQAAAAHNAyAAAAABzgMBAAAAAeMDAQAAAAHkAwEAAAAB5QMBAAAAAQEIAACTAwAgCoIDAQAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAGVAwEAAAABzQMgAAAAAc4DAQAAAAHjAwEAAAAB5AMBAAAAAeUDAQAAAAEBCAAAlQMAMAEIAACVAwAwC28AAJcHACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIZUDAQDcBQAhzQMgAN4FACHOAwEA3AUAIeMDAQDcBQAh5AMBAOsFACHlAwEA6wUAIQIAAACMAwAgCAAAmAMAIAqCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIZUDAQDcBQAhzQMgAN4FACHOAwEA3AUAIeMDAQDcBQAh5AMBAOsFACHlAwEA6wUAIQIAAACmAQAgCAAAmgMAIAIAAACmAQAgCAAAmgMAIAMAAACMAwAgDwAAkwMAIBAAAJgDACABAAAAjAMAIAEAAACmAQAgBhUAAJQHACAWAACWBwAgFwAAlQcAIIkDAADWBQAg5AMAANYFACDlAwAA1gUAIA3_AgAAjQUAMIADAAChAwAQgQMAAI0FADCCAwEAzAQAIYcDQADPBAAhiANAAM8EACGJA0AA0AQAIZUDAQDMBAAhzQMgAM4EACHOAwEAzAQAIeMDAQDMBAAh5AMBAOEEACHlAwEA4QQAIQMAAACmAQAgAwAAoAMAMBQAAKEDACADAAAApgEAIAMAAI8DADAEAACMAwAgKm8AAIkFACB1AACKBQAgeQAAjAUAIHsAAIsFACD_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_AQAMIIDAQDMBAAhhgMgAM4EACGHA0AAzwQAIYgDQADPBAAhiQNAANAEACGVAwEAzAQAIZcDAQDMBAAhnAMAAN4EnAMioAMAAN8EoAMiogMAAP0EogMiqwMBAMwEACGsAwEAzAQAIa0DAQDhBAAhrgMBAOEEACGzAwEA4QQAIbQDAQDhBAAhtQMBAOEEACG2AwEA4QQAIbgDAQDMBAAhvAMBAMwEACHEAwEAzAQAIdEDAQDMBAAh0gMBAMwEACHTAwEA4QQAIdQDCAD6BAAh1QMBAOEEACHWAwEA4QQAIdcDAQDhBAAh2AMBAOEEACHZAwEAzAQAIdoDAQDMBAAh2wMBAOEEACHcAwEA4QQAId4DAAD-BN4DIt8DAQDMBAAhAwAAAKQBACADAAC4AwAwFAAAuQMAIAMAAACkAQAgAwAApwMAMAQAAKQDACABAAAAvQEAIAEAAAC9AQAgAwAAALsBACADAAC8AQAwBAAAvQEAIAMAAAC7AQAgAwAAvAEAMAQAAL0BACADAAAAuwEAIAMAALwBADAEAAC9AQAgDHIAAN0GACB6AADeBgAgfQAA3wYAIH4AAOAGACCCAwEAAAABhwNAAAAAAYgDQAAAAAGJA0AAAAABzQMgAAAAAc4DAQAAAAHPAwgAAAAB0AMBAAAAAQEIAADBAwAgCIIDAQAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAHNAyAAAAABzgMBAAAAAc8DCAAAAAHQAwEAAAABAQgAAMMDADABCAAAwwMAMAxyAACoBgAgegAAqQYAIH0AAKoGACB-AACrBgAgggMBANwFACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACHNAyAA3gUAIc4DAQDcBQAhzwMIAKcGACHQAwEA3AUAIQIAAAC9AQAgCAAAxgMAIAiCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIc0DIADeBQAhzgMBANwFACHPAwgApwYAIdADAQDcBQAhAgAAALsBACAIAADIAwAgAgAAALsBACAIAADIAwAgAwAAAL0BACAPAADBAwAgEAAAxgMAIAEAAAC9AQAgAQAAALsBACAGFQAAogYAIBYAAKUGACAXAACkBgAgSwAAowYAIEwAAKYGACCJAwAA1gUAIAv_AgAA-QQAMIADAADPAwAQgQMAAPkEADCCAwEAzAQAIYcDQADPBAAhiANAAM8EACGJA0AA0AQAIc0DIADOBAAhzgMBAMwEACHPAwgA-gQAIdADAQDMBAAhAwAAALsBACADAADOAwAwFAAAzwMAIAMAAAC7AQAgAwAAvAEAMAQAAL0BACAUcgAA-AQAIHQAAPcEACD_AgAA9QQAMIADAACsAQAQgQMAAPUEADCCAwEAAAABhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhlgMBAAAAAcQDAQAAAAHFAwEA9gQAIcYDAQD2BAAhxwMBAPYEACHIAwEA9gQAIckDAQD2BAAhygMBAPYEACHLAwEA9gQAIcwDAQD2BAAhzQMgAO0EACEBAAAA0gMAIAEAAADSAwAgDXIAAKEGACB0AACWBgAgiQMAANYFACCWAwAA1gUAIMQDAADWBQAgxQMAANYFACDGAwAA1gUAIMcDAADWBQAgyAMAANYFACDJAwAA1gUAIMoDAADWBQAgywMAANYFACDMAwAA1gUAIAMAAACsAQAgAwAA1QMAMAQAANIDACADAAAArAEAIAMAANUDADAEAADSAwAgAwAAAKwBACADAADVAwAwBAAA0gMAIBFyAACLBgAgdAAAoAYAIIIDAQAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAGWAwEAAAABxAMBAAAAAcUDAQAAAAHGAwEAAAABxwMBAAAAAcgDAQAAAAHJAwEAAAABygMBAAAAAcsDAQAAAAHMAwEAAAABzQMgAAAAAQEIAADZAwAgD4IDAQAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAGWAwEAAAABxAMBAAAAAcUDAQAAAAHGAwEAAAABxwMBAAAAAcgDAQAAAAHJAwEAAAABygMBAAAAAcsDAQAAAAHMAwEAAAABzQMgAAAAAQEIAADbAwAwAQgAANsDADABAAAAqAEAIAEAAACkAQAgEXIAAIoGACB0AACfBgAgggMBANwFACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACGWAwEA6wUAIcQDAQDrBQAhxQMBAOsFACHGAwEA6wUAIccDAQDrBQAhyAMBAOsFACHJAwEA6wUAIcoDAQDrBQAhywMBAOsFACHMAwEA6wUAIc0DIADeBQAhAgAAANIDACAIAADgAwAgD4IDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhlgMBAOsFACHEAwEA6wUAIcUDAQDrBQAhxgMBAOsFACHHAwEA6wUAIcgDAQDrBQAhyQMBAOsFACHKAwEA6wUAIcsDAQDrBQAhzAMBAOsFACHNAyAA3gUAIQIAAACsAQAgCAAA4gMAIAIAAACsAQAgCAAA4gMAIAEAAACoAQAgAQAAAKQBACADAAAA0gMAIA8AANkDACAQAADgAwAgAQAAANIDACABAAAArAEAIA4VAACcBgAgFgAAngYAIBcAAJ0GACCJAwAA1gUAIJYDAADWBQAgxAMAANYFACDFAwAA1gUAIMYDAADWBQAgxwMAANYFACDIAwAA1gUAIMkDAADWBQAgygMAANYFACDLAwAA1gUAIMwDAADWBQAgEv8CAAD0BAAwgAMAAOsDABCBAwAA9AQAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIYkDQADQBAAhlgMBAOEEACHEAwEA4QQAIcUDAQDhBAAhxgMBAOEEACHHAwEA4QQAIcgDAQDhBAAhyQMBAOEEACHKAwEA4QQAIcsDAQDhBAAhzAMBAOEEACHNAyAAzgQAIQMAAACsAQAgAwAA6gMAMBQAAOsDACADAAAArAEAIAMAANUDADAEAADSAwAgBf8CAADyBAAwgAMAAPEDABCBAwAA8gQAMIIDAQAAAAHDAwIA8wQAIQEAAADuAwAgAQAAAO4DACAF_wIAAPIEADCAAwAA8QMAEIEDAADyBAAwggMBAOwEACHDAwIA8wQAIQADAAAA8QMAIAMAAPIDADAEAADuAwAgAwAAAPEDACADAADyAwAwBAAA7gMAIAMAAADxAwAgAwAA8gMAMAQAAO4DACACggMBAAAAAcMDAgAAAAEBCAAA9gMAIAKCAwEAAAABwwMCAAAAAQEIAAD4AwAwAQgAAPgDADACggMBANwFACHDAwIA3QUAIQIAAADuAwAgCAAA-wMAIAKCAwEA3AUAIcMDAgDdBQAhAgAAAPEDACAIAAD9AwAgAgAAAPEDACAIAAD9AwAgAwAAAO4DACAPAAD2AwAgEAAA-wMAIAEAAADuAwAgAQAAAPEDACAFFQAAlwYAIBYAAJoGACAXAACZBgAgSwAAmAYAIEwAAJsGACAF_wIAAPEEADCAAwAAhAQAEIEDAADxBAAwggMBAMwEACHDAwIAzQQAIQMAAADxAwAgAwAAgwQAMBQAAIQEACADAAAA8QMAIAMAAPIDADAEAADuAwAgFnQAAPAEACD_AgAA6wQAMIADAACwAQAQgQMAAOsEADCCAwEAAAABhgMgAO0EACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACGWAwEAAAABtwMBAOwEACG4AwEA7AQAIbkDAQDsBAAhugMBAOwEACG7AwEA7AQAIbwDAQDsBAAhvQMBAOwEACG-AwEA7AQAIb8DAQDsBAAhwAMBAOwEACHBAwEA7AQAIcIDAQDsBAAhAQAAAIcEACABAAAAhwQAIAJ0AACWBgAgiQMAANYFACADAAAAsAEAIAMAAIoEADAEAACHBAAgAwAAALABACADAACKBAAwBAAAhwQAIAMAAACwAQAgAwAAigQAMAQAAIcEACATdAAAlQYAIIIDAQAAAAGGAyAAAAABhwNAAAAAAYgDQAAAAAGJA0AAAAABlgMBAAAAAbcDAQAAAAG4AwEAAAABuQMBAAAAAboDAQAAAAG7AwEAAAABvAMBAAAAAb0DAQAAAAG-AwEAAAABvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAQEIAACOBAAgEoIDAQAAAAGGAyAAAAABhwNAAAAAAYgDQAAAAAGJA0AAAAABlgMBAAAAAbcDAQAAAAG4AwEAAAABuQMBAAAAAboDAQAAAAG7AwEAAAABvAMBAAAAAb0DAQAAAAG-AwEAAAABvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAQEIAACQBAAwAQgAAJAEADATdAAAlAYAIIIDAQDcBQAhhgMgAN4FACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACGWAwEA3AUAIbcDAQDcBQAhuAMBANwFACG5AwEA3AUAIboDAQDcBQAhuwMBANwFACG8AwEA3AUAIb0DAQDcBQAhvgMBANwFACG_AwEA3AUAIcADAQDcBQAhwQMBANwFACHCAwEA3AUAIQIAAACHBAAgCAAAkwQAIBKCAwEA3AUAIYYDIADeBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhlgMBANwFACG3AwEA3AUAIbgDAQDcBQAhuQMBANwFACG6AwEA3AUAIbsDAQDcBQAhvAMBANwFACG9AwEA3AUAIb4DAQDcBQAhvwMBANwFACHAAwEA3AUAIcEDAQDcBQAhwgMBANwFACECAAAAsAEAIAgAAJUEACACAAAAsAEAIAgAAJUEACADAAAAhwQAIA8AAI4EACAQAACTBAAgAQAAAIcEACABAAAAsAEAIAQVAACRBgAgFgAAkwYAIBcAAJIGACCJAwAA1gUAIBX_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_AgAA3QQAMIADAACyBAAQgQMAAN0EADCCAwEAzAQAIYUDAQDMBAAhhgMgAM4EACGHA0AAzwQAIYgDQADPBAAhiQNAANAEACGVAwEAzAQAIZYDAQDMBAAhlwMBAMwEACGYAwEAzAQAIZkDAQDMBAAhmgMBAMwEACGcAwAA3gScAyKdAwIAzQQAIZ4DAQDMBAAhoAMAAN8EoAMiogMAAOAEogMjowMBAOEEACGkAwEA4QQAIaUDAQDhBAAhpgMBAOEEACGnAwEAzAQAIagDAQDMBAAhqQMBAMwEACGqAwEAzAQAIasDAQDMBAAhrAMBAMwEACGtAwEA4QQAIa4DAQDhBAAhrwMBAMwEACGwAwEA4QQAIbEDAQDhBAAhsgMBAOEEACGzAwEAzAQAIbQDAQDhBAAhtQMBAOEEACG2AwEA4QQAIQMAAACoAQAgAwAAsQQAMBQAALIEACADAAAAqAEAIAMAAKkBADAEAACqAQAgAQAAAMoBACABAAAAygEAIAMAAADIAQAgAwAAyQEAMAQAAMoBACADAAAAyAEAIAMAAMkBADAEAADKAQAgAwAAAMgBACADAADJAQAwBAAAygEAIAl3AADiBQAgggMBAAAAAYMDAQAAAAGEAwIAAAABhQMBAAAAAYYDIAAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAEBCAAAugQAIAiCAwEAAAABgwMBAAAAAYQDAgAAAAGFAwEAAAABhgMgAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAQEIAAC8BAAwAQgAALwEADAJdwAA4QUAIIIDAQDcBQAhgwMBANwFACGEAwIA3QUAIYUDAQDcBQAhhgMgAN4FACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACECAAAAygEAIAgAAL8EACAIggMBANwFACGDAwEA3AUAIYQDAgDdBQAhhQMBANwFACGGAyAA3gUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIQIAAADIAQAgCAAAwQQAIAIAAADIAQAgCAAAwQQAIAMAAADKAQAgDwAAugQAIBAAAL8EACABAAAAygEAIAEAAADIAQAgBhUAANcFACAWAADaBQAgFwAA2QUAIEsAANgFACBMAADbBQAgiQMAANYFACAL_wIAAMsEADCAAwAAyAQAEIEDAADLBAAwggMBAMwEACGDAwEAzAQAIYQDAgDNBAAhhQMBAMwEACGGAyAAzgQAIYcDQADPBAAhiANAAM8EACGJA0AA0AQAIQMAAADIAQAgAwAAxwQAMBQAAMgEACADAAAAyAEAIAMAAMkBADAEAADKAQAgC_8CAADLBAAwgAMAAMgEABCBAwAAywQAMIIDAQDMBAAhgwMBAMwEACGEAwIAzQQAIYUDAQDMBAAhhgMgAM4EACGHA0AAzwQAIYgDQADPBAAhiQNAANAEACEOFQAA1QQAIBYAANwEACAXAADcBAAgigMBAAAAAYsDAQAAAASMAwEAAAAEjQMBAAAAAY4DAQAAAAGPAwEAAAABkAMBAAAAAZEDAQDbBAAhkgMBAAAAAZMDAQAAAAGUAwEAAAABDRUAANUEACAWAADVBAAgFwAA1QQAIEsAANoEACBMAADVBAAgigMCAAAAAYsDAgAAAASMAwIAAAAEjQMCAAAAAY4DAgAAAAGPAwIAAAABkAMCAAAAAZEDAgDZBAAhBRUAANUEACAWAADYBAAgFwAA2AQAIIoDIAAAAAGRAyAA1wQAIQsVAADVBAAgFgAA1gQAIBcAANYEACCKA0AAAAABiwNAAAAABIwDQAAAAASNA0AAAAABjgNAAAAAAY8DQAAAAAGQA0AAAAABkQNAANQEACELFQAA0gQAIBYAANMEACAXAADTBAAgigNAAAAAAYsDQAAAAAWMA0AAAAAFjQNAAAAAAY4DQAAAAAGPA0AAAAABkANAAAAAAZEDQADRBAAhCxUAANIEACAWAADTBAAgFwAA0wQAIIoDQAAAAAGLA0AAAAAFjANAAAAABY0DQAAAAAGOA0AAAAABjwNAAAAAAZADQAAAAAGRA0AA0QQAIQiKAwIAAAABiwMCAAAABYwDAgAAAAWNAwIAAAABjgMCAAAAAY8DAgAAAAGQAwIAAAABkQMCANIEACEIigNAAAAAAYsDQAAAAAWMA0AAAAAFjQNAAAAAAY4DQAAAAAGPA0AAAAABkANAAAAAAZEDQADTBAAhCxUAANUEACAWAADWBAAgFwAA1gQAIIoDQAAAAAGLA0AAAAAEjANAAAAABI0DQAAAAAGOA0AAAAABjwNAAAAAAZADQAAAAAGRA0AA1AQAIQiKAwIAAAABiwMCAAAABIwDAgAAAASNAwIAAAABjgMCAAAAAY8DAgAAAAGQAwIAAAABkQMCANUEACEIigNAAAAAAYsDQAAAAASMA0AAAAAEjQNAAAAAAY4DQAAAAAGPA0AAAAABkANAAAAAAZEDQADWBAAhBRUAANUEACAWAADYBAAgFwAA2AQAIIoDIAAAAAGRAyAA1wQAIQKKAyAAAAABkQMgANgEACENFQAA1QQAIBYAANUEACAXAADVBAAgSwAA2gQAIEwAANUEACCKAwIAAAABiwMCAAAABIwDAgAAAASNAwIAAAABjgMCAAAAAY8DAgAAAAGQAwIAAAABkQMCANkEACEIigMIAAAAAYsDCAAAAASMAwgAAAAEjQMIAAAAAY4DCAAAAAGPAwgAAAABkAMIAAAAAZEDCADaBAAhDhUAANUEACAWAADcBAAgFwAA3AQAIIoDAQAAAAGLAwEAAAAEjAMBAAAABI0DAQAAAAGOAwEAAAABjwMBAAAAAZADAQAAAAGRAwEA2wQAIZIDAQAAAAGTAwEAAAABlAMBAAAAAQuKAwEAAAABiwMBAAAABIwDAQAAAASNAwEAAAABjgMBAAAAAY8DAQAAAAGQAwEAAAABkQMBANwEACGSAwEAAAABkwMBAAAAAZQDAQAAAAEo_wIAAN0EADCAAwAAsgQAEIEDAADdBAAwggMBAMwEACGFAwEAzAQAIYYDIADOBAAhhwNAAM8EACGIA0AAzwQAIYkDQADQBAAhlQMBAMwEACGWAwEAzAQAIZcDAQDMBAAhmAMBAMwEACGZAwEAzAQAIZoDAQDMBAAhnAMAAN4EnAMinQMCAM0EACGeAwEAzAQAIaADAADfBKADIqIDAADgBKIDI6MDAQDhBAAhpAMBAOEEACGlAwEA4QQAIaYDAQDhBAAhpwMBAMwEACGoAwEAzAQAIakDAQDMBAAhqgMBAMwEACGrAwEAzAQAIawDAQDMBAAhrQMBAOEEACGuAwEA4QQAIa8DAQDMBAAhsAMBAOEEACGxAwEA4QQAIbIDAQDhBAAhswMBAMwEACG0AwEA4QQAIbUDAQDhBAAhtgMBAOEEACEHFQAA1QQAIBYAAOkEACAXAADpBAAgigMAAACcAwKLAwAAAJwDCIwDAAAAnAMIkQMAAOgEnAMiBxUAANUEACAWAADnBAAgFwAA5wQAIIoDAAAAoAMCiwMAAACgAwiMAwAAAKADCJEDAADmBKADIgcVAADSBAAgFgAA5QQAIBcAAOUEACCKAwAAAKIDA4sDAAAAogMJjAMAAACiAwmRAwAA5ASiAyMOFQAA0gQAIBYAAOMEACAXAADjBAAgigMBAAAAAYsDAQAAAAWMAwEAAAAFjQMBAAAAAY4DAQAAAAGPAwEAAAABkAMBAAAAAZEDAQDiBAAhkgMBAAAAAZMDAQAAAAGUAwEAAAABDhUAANIEACAWAADjBAAgFwAA4wQAIIoDAQAAAAGLAwEAAAAFjAMBAAAABY0DAQAAAAGOAwEAAAABjwMBAAAAAZADAQAAAAGRAwEA4gQAIZIDAQAAAAGTAwEAAAABlAMBAAAAAQuKAwEAAAABiwMBAAAABYwDAQAAAAWNAwEAAAABjgMBAAAAAY8DAQAAAAGQAwEAAAABkQMBAOMEACGSAwEAAAABkwMBAAAAAZQDAQAAAAEHFQAA0gQAIBYAAOUEACAXAADlBAAgigMAAACiAwOLAwAAAKIDCYwDAAAAogMJkQMAAOQEogMjBIoDAAAAogMDiwMAAACiAwmMAwAAAKIDCZEDAADlBKIDIwcVAADVBAAgFgAA5wQAIBcAAOcEACCKAwAAAKADAosDAAAAoAMIjAMAAACgAwiRAwAA5gSgAyIEigMAAACgAwKLAwAAAKADCIwDAAAAoAMIkQMAAOcEoAMiBxUAANUEACAWAADpBAAgFwAA6QQAIIoDAAAAnAMCiwMAAACcAwiMAwAAAJwDCJEDAADoBJwDIgSKAwAAAJwDAosDAAAAnAMIjAMAAACcAwiRAwAA6QScAyIV_wIAAOoEADCAAwAAnAQAEIEDAADqBAAwggMBAMwEACGGAyAAzgQAIYcDQADPBAAhiANAAM8EACGJA0AA0AQAIZYDAQDMBAAhtwMBAMwEACG4AwEAzAQAIbkDAQDMBAAhugMBAMwEACG7AwEAzAQAIbwDAQDMBAAhvQMBAMwEACG-AwEAzAQAIb8DAQDMBAAhwAMBAMwEACHBAwEAzAQAIcIDAQDMBAAhFnQAAPAEACD_AgAA6wQAMIADAACwAQAQgQMAAOsEADCCAwEA7AQAIYYDIADtBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhlgMBAOwEACG3AwEA7AQAIbgDAQDsBAAhuQMBAOwEACG6AwEA7AQAIbsDAQDsBAAhvAMBAOwEACG9AwEA7AQAIb4DAQDsBAAhvwMBAOwEACHAAwEA7AQAIcEDAQDsBAAhwgMBAOwEACELigMBAAAAAYsDAQAAAASMAwEAAAAEjQMBAAAAAY4DAQAAAAGPAwEAAAABkAMBAAAAAZEDAQDcBAAhkgMBAAAAAZMDAQAAAAGUAwEAAAABAooDIAAAAAGRAyAA2AQAIQiKA0AAAAABiwNAAAAABIwDQAAAAASNA0AAAAABjgNAAAAAAY8DQAAAAAGQA0AAAAABkQNAANYEACEIigNAAAAAAYsDQAAAAAWMA0AAAAAFjQNAAAAAAY4DQAAAAAGPA0AAAAABkANAAAAAAZEDQADTBAAhL28AAIkFACB1AACKBQAgdgAAugUAIHcAAKkFACB5AACqBQAg_wIAALgFADCAAwAAqAEAEIEDAAC4BQAwggMBAOwEACGFAwEA7AQAIYYDIADtBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhlQMBAOwEACGWAwEA7AQAIZcDAQDsBAAhmAMBAOwEACGZAwEA7AQAIZoDAQDsBAAhnAMAAIcFnAMinQMCAPMEACGeAwEA7AQAIaADAACFBaADIqIDAAC5BaIDI6MDAQD2BAAhpAMBAPYEACGlAwEA9gQAIaYDAQD2BAAhpwMBAOwEACGoAwEA7AQAIakDAQDsBAAhqgMBAOwEACGrAwEA7AQAIawDAQDsBAAhrQMBAPYEACGuAwEA9gQAIa8DAQDsBAAhsAMBAPYEACGxAwEA9gQAIbIDAQD2BAAhswMBAOwEACG0AwEA9gQAIbUDAQD2BAAhtgMBAPYEACGgBAAAqAEAIKEEAACoAQAgBf8CAADxBAAwgAMAAIQEABCBAwAA8QQAMIIDAQDMBAAhwwMCAM0EACEF_wIAAPIEADCAAwAA8QMAEIEDAADyBAAwggMBAOwEACHDAwIA8wQAIQiKAwIAAAABiwMCAAAABIwDAgAAAASNAwIAAAABjgMCAAAAAY8DAgAAAAGQAwIAAAABkQMCANUEACES_wIAAPQEADCAAwAA6wMAEIEDAAD0BAAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhiQNAANAEACGWAwEA4QQAIcQDAQDhBAAhxQMBAOEEACHGAwEA4QQAIccDAQDhBAAhyAMBAOEEACHJAwEA4QQAIcoDAQDhBAAhywMBAOEEACHMAwEA4QQAIc0DIADOBAAhFHIAAPgEACB0AAD3BAAg_wIAAPUEADCAAwAArAEAEIEDAAD1BAAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACGWAwEA9gQAIcQDAQD2BAAhxQMBAPYEACHGAwEA9gQAIccDAQD2BAAhyAMBAPYEACHJAwEA9gQAIcoDAQD2BAAhywMBAPYEACHMAwEA9gQAIc0DIADtBAAhC4oDAQAAAAGLAwEAAAAFjAMBAAAABY0DAQAAAAGOAwEAAAABjwMBAAAAAZADAQAAAAGRAwEA4wQAIZIDAQAAAAGTAwEAAAABlAMBAAAAAS9vAACJBQAgdQAAigUAIHYAALoFACB3AACpBQAgeQAAqgUAIP8CAAC4BQAwgAMAAKgBABCBAwAAuAUAMIIDAQDsBAAhhQMBAOwEACGGAyAA7QQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZUDAQDsBAAhlgMBAOwEACGXAwEA7AQAIZgDAQDsBAAhmQMBAOwEACGaAwEA7AQAIZwDAACHBZwDIp0DAgDzBAAhngMBAOwEACGgAwAAhQWgAyKiAwAAuQWiAyOjAwEA9gQAIaQDAQD2BAAhpQMBAPYEACGmAwEA9gQAIacDAQDsBAAhqAMBAOwEACGpAwEA7AQAIaoDAQDsBAAhqwMBAOwEACGsAwEA7AQAIa0DAQD2BAAhrgMBAPYEACGvAwEA7AQAIbADAQD2BAAhsQMBAPYEACGyAwEA9gQAIbMDAQDsBAAhtAMBAPYEACG1AwEA9gQAIbYDAQD2BAAhoAQAAKgBACChBAAAqAEAICxvAACJBQAgdQAAigUAIHkAAIwFACB7AACLBQAg_wIAAIMFADCAAwAApAEAEIEDAACDBQAwggMBAOwEACGGAyAA7QQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZUDAQDsBAAhlwMBAOwEACGcAwAAhwWcAyKgAwAAhQWgAyKiAwAAhgWiAyKrAwEA7AQAIawDAQDsBAAhrQMBAPYEACGuAwEA9gQAIbMDAQD2BAAhtAMBAPYEACG1AwEA9gQAIbYDAQD2BAAhuAMBAOwEACG8AwEA7AQAIcQDAQDsBAAh0QMBAOwEACHSAwEA7AQAIdMDAQD2BAAh1AMIAIQFACHVAwEA9gQAIdYDAQD2BAAh1wMBAPYEACHYAwEA9gQAIdkDAQDsBAAh2gMBAOwEACHbAwEA9gQAIdwDAQD2BAAh3gMAAIgF3gMi3wMBAOwEACGgBAAApAEAIKEEAACkAQAgC_8CAAD5BAAwgAMAAM8DABCBAwAA-QQAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIYkDQADQBAAhzQMgAM4EACHOAwEAzAQAIc8DCAD6BAAh0AMBAMwEACENFQAA1QQAIBYAANoEACAXAADaBAAgSwAA2gQAIEwAANoEACCKAwgAAAABiwMIAAAABIwDCAAAAASNAwgAAAABjgMIAAAAAY8DCAAAAAGQAwgAAAABkQMIAPsEACENFQAA1QQAIBYAANoEACAXAADaBAAgSwAA2gQAIEwAANoEACCKAwgAAAABiwMIAAAABIwDCAAAAASNAwgAAAABjgMIAAAAAY8DCAAAAAGQAwgAAAABkQMIAPsEACEm_wIAAPwEADCAAwAAuQMAEIEDAAD8BAAwggMBAMwEACGGAyAAzgQAIYcDQADPBAAhiANAAM8EACGJA0AA0AQAIZUDAQDMBAAhlwMBAMwEACGcAwAA3gScAyKgAwAA3wSgAyKiAwAA_QSiAyKrAwEAzAQAIawDAQDMBAAhrQMBAOEEACGuAwEA4QQAIbMDAQDhBAAhtAMBAOEEACG1AwEA4QQAIbYDAQDhBAAhuAMBAMwEACG8AwEAzAQAIcQDAQDMBAAh0QMBAMwEACHSAwEAzAQAIdMDAQDhBAAh1AMIAPoEACHVAwEA4QQAIdYDAQDhBAAh1wMBAOEEACHYAwEA4QQAIdkDAQDMBAAh2gMBAMwEACHbAwEA4QQAIdwDAQDhBAAh3gMAAP4E3gMi3wMBAMwEACEHFQAA1QQAIBYAAIIFACAXAACCBQAgigMAAACiAwKLAwAAAKIDCIwDAAAAogMIkQMAAIEFogMiBxUAANUEACAWAACABQAgFwAAgAUAIIoDAAAA3gMCiwMAAADeAwiMAwAAAN4DCJEDAAD_BN4DIgcVAADVBAAgFgAAgAUAIBcAAIAFACCKAwAAAN4DAosDAAAA3gMIjAMAAADeAwiRAwAA_wTeAyIEigMAAADeAwKLAwAAAN4DCIwDAAAA3gMIkQMAAIAF3gMiBxUAANUEACAWAACCBQAgFwAAggUAIIoDAAAAogMCiwMAAACiAwiMAwAAAKIDCJEDAACBBaIDIgSKAwAAAKIDAosDAAAAogMIjAMAAACiAwiRAwAAggWiAyIqbwAAiQUAIHUAAIoFACB5AACMBQAgewAAiwUAIP8CAACDBQAwgAMAAKQBABCBAwAAgwUAMIIDAQDsBAAhhgMgAO0EACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACGVAwEA7AQAIZcDAQDsBAAhnAMAAIcFnAMioAMAAIUFoAMiogMAAIYFogMiqwMBAOwEACGsAwEA7AQAIa0DAQD2BAAhrgMBAPYEACGzAwEA9gQAIbQDAQD2BAAhtQMBAPYEACG2AwEA9gQAIbgDAQDsBAAhvAMBAOwEACHEAwEA7AQAIdEDAQDsBAAh0gMBAOwEACHTAwEA9gQAIdQDCACEBQAh1QMBAPYEACHWAwEA9gQAIdcDAQD2BAAh2AMBAPYEACHZAwEA7AQAIdoDAQDsBAAh2wMBAPYEACHcAwEA9gQAId4DAACIBd4DIt8DAQDsBAAhCIoDCAAAAAGLAwgAAAAEjAMIAAAABI0DCAAAAAGOAwgAAAABjwMIAAAAAZADCAAAAAGRAwgA2gQAIQSKAwAAAKADAosDAAAAoAMIjAMAAACgAwiRAwAA5wSgAyIEigMAAACiAwKLAwAAAKIDCIwDAAAAogMIkQMAAIIFogMiBIoDAAAAnAMCiwMAAACcAwiMAwAAAJwDCJEDAADpBJwDIgSKAwAAAN4DAosDAAAA3gMIjAMAAADeAwiRAwAAgAXeAyIWcAAAmQUAIHEAAJoFACByAAD4BAAgcwAAmwUAIHoAAJwFACD_AgAAlwUAMIADAACxAgAQgQMAAJcFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIc0DIADtBAAhzgMBAOwEACHjAwEA7AQAIfUDAACIBd4DIvcDAACYBfcDIvgDIADtBAAh-QMgAO0EACH6AwEA9gQAIaAEAACxAgAgoQQAALECACAWcgAA-AQAIHQAAPcEACD_AgAA9QQAMIADAACsAQAQgQMAAPUEADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZYDAQD2BAAhxAMBAPYEACHFAwEA9gQAIcYDAQD2BAAhxwMBAPYEACHIAwEA9gQAIckDAQD2BAAhygMBAPYEACHLAwEA9gQAIcwDAQD2BAAhzQMgAO0EACGgBAAArAEAIKEEAACsAQAgA-ADAAC7AQAg4QMAALsBACDiAwAAuwEAIAPgAwAAvwEAIOEDAAC_AQAg4gMAAL8BACAN_wIAAI0FADCAAwAAoQMAEIEDAACNBQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhiQNAANAEACGVAwEAzAQAIc0DIADOBAAhzgMBAMwEACHjAwEAzAQAIeQDAQDhBAAh5QMBAOEEACEObwAAiQUAIP8CAACOBQAwgAMAAKYBABCBAwAAjgUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhlQMBAOwEACHNAyAA7QQAIc4DAQDsBAAh4wMBAOwEACHkAwEA9gQAIeUDAQD2BAAhCf8CAACPBQAwgAMAAIkDABCBAwAAjwUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIeYDAQDMBAAh5wMBAMwEACHoA0AAzwQAIQn_AgAAkAUAMIADAAD2AgAQgQMAAJAFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACHmAwEA7AQAIecDAQDsBAAh6ANAAO4EACEQ_wIAAJEFADCAAwAA8AIAEIEDAACRBQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhlQMBAMwEACHpAwEAzAQAIeoDAQDMBAAh6wMBAOEEACHsAwEA4QQAIe0DAQDhBAAh7gNAANAEACHvA0AA0AQAIfADAQDhBAAh8QMBAOEEACEL_wIAAJIFADCAAwAA2gIAEIEDAACSBQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhlQMBAMwEACHoA0AAzwQAIfIDAQDMBAAh8wMBAOEEACH0AwEA4QQAIQ__AgAAkwUAMIADAADEAgAQgQMAAJMFADCCAwEAzAQAIYcDQADPBAAhiANAAM8EACGJA0AA0AQAIc0DIADOBAAhzgMBAMwEACHjAwEAzAQAIfUDAAD-BN4DIvcDAACUBfcDIvgDIADOBAAh-QMgAM4EACH6AwEA4QQAIQcVAADVBAAgFgAAlgUAIBcAAJYFACCKAwAAAPcDAosDAAAA9wMIjAMAAAD3AwiRAwAAlQX3AyIHFQAA1QQAIBYAAJYFACAXAACWBQAgigMAAAD3AwKLAwAAAPcDCIwDAAAA9wMIkQMAAJUF9wMiBIoDAAAA9wMCiwMAAAD3AwiMAwAAAPcDCJEDAACWBfcDIhRwAACZBQAgcQAAmgUAIHIAAPgEACBzAACbBQAgegAAnAUAIP8CAACXBQAwgAMAALECABCBAwAAlwUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhzQMgAO0EACHOAwEA7AQAIeMDAQDsBAAh9QMAAIgF3gMi9wMAAJgF9wMi-AMgAO0EACH5AyAA7QQAIfoDAQD2BAAhBIoDAAAA9wMCiwMAAAD3AwiMAwAAAPcDCJEDAACWBfcDIgPgAwAAnAEAIOEDAACcAQAg4gMAAJwBACAD4AMAAKABACDhAwAAoAEAIOIDAACgAQAgEG8AAIkFACD_AgAAjgUAMIADAACmAQAQgQMAAI4FADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZUDAQDsBAAhzQMgAO0EACHOAwEA7AQAIeMDAQDsBAAh5AMBAPYEACHlAwEA9gQAIaAEAACmAQAgoQQAAKYBACAD4AMAAKgBACDhAwAAqAEAIOIDAACoAQAgCf8CAACdBQAwgAMAAKsCABCBAwAAnQUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIcQDAQDMBAAh9wMAAJ4F_QMi-wMBAMwEACEHFQAA1QQAIBYAAKAFACAXAACgBQAgigMAAAD9AwKLAwAAAP0DCIwDAAAA_QMIkQMAAJ8F_QMiBxUAANUEACAWAACgBQAgFwAAoAUAIIoDAAAA_QMCiwMAAAD9AwiMAwAAAP0DCJEDAACfBf0DIgSKAwAAAP0DAosDAAAA_QMIjAMAAAD9AwiRAwAAoAX9AyIH_wIAAKEFADCAAwAAlQIAEIEDAAChBQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAh_QNAAM8EACEIfAAAjAUAIP8CAACiBQAwgAMAAIICABCBAwAAogUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIf0DQADuBAAhCf8CAACjBQAwgAMAAPwBABCBAwAAowUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIZYDAQDMBAAh9wMAAKQF_wMi-wMBAMwEACEHFQAA1QQAIBYAAKYFACAXAACmBQAgigMAAAD_AwKLAwAAAP8DCIwDAAAA_wMIkQMAAKUF_wMiBxUAANUEACAWAACmBQAgFwAApgUAIIoDAAAA_wMCiwMAAAD_AwiMAwAAAP8DCJEDAAClBf8DIgSKAwAAAP8DAosDAAAA_wMIjAMAAAD_AwiRAwAApgX_AyII_wIAAKcFADCAAwAA5gEAEIEDAACnBQAwggMBAMwEACGFAwEAzAQAIYcDQADPBAAhiANAAM8EACH9A0AAzwQAIQp3AACpBQAgfAAAqgUAIP8CAACoBQAwgAMAAMwBABCBAwAAqAUAMIIDAQDsBAAhhQMBAOwEACGHA0AA7gQAIYgDQADuBAAh_QNAAO4EACERcgAAsAUAIHoAAJwFACB9AACyBQAgfgAAswUAIP8CAACxBQAwgAMAALsBABCBAwAAsQUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhzQMgAO0EACHOAwEA7AQAIc8DCACEBQAh0AMBAOwEACGgBAAAuwEAIKEEAAC7AQAgA-ADAACyAQAg4QMAALIBACDiAwAAsgEAIAx3AACpBQAg_wIAAKsFADCAAwAAyAEAEIEDAACrBQAwggMBAOwEACGDAwEA7AQAIYQDAgDzBAAhhQMBAOwEACGGAyAA7QQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIQLEAwEAAAAB-wMBAAAAAQtyAACwBQAgeAAArwUAIP8CAACtBQAwgAMAAL8BABCBAwAArQUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIcQDAQDsBAAh9wMAAK4F_QMi-wMBAOwEACEEigMAAAD9AwKLAwAAAP0DCIwDAAAA_QMIkQMAAKAF_QMiCnwAAIwFACD_AgAAogUAMIADAACCAgAQgQMAAKIFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACH9A0AA7gQAIaAEAACCAgAgoQQAAIICACAsbwAAiQUAIHUAAIoFACB5AACMBQAgewAAiwUAIP8CAACDBQAwgAMAAKQBABCBAwAAgwUAMIIDAQDsBAAhhgMgAO0EACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACGVAwEA7AQAIZcDAQDsBAAhnAMAAIcFnAMioAMAAIUFoAMiogMAAIYFogMiqwMBAOwEACGsAwEA7AQAIa0DAQD2BAAhrgMBAPYEACGzAwEA9gQAIbQDAQD2BAAhtQMBAPYEACG2AwEA9gQAIbgDAQDsBAAhvAMBAOwEACHEAwEA7AQAIdEDAQDsBAAh0gMBAOwEACHTAwEA9gQAIdQDCACEBQAh1QMBAPYEACHWAwEA9gQAIdcDAQD2BAAh2AMBAPYEACHZAwEA7AQAIdoDAQDsBAAh2wMBAPYEACHcAwEA9gQAId4DAACIBd4DIt8DAQDsBAAhoAQAAKQBACChBAAApAEAIA9yAACwBQAgegAAnAUAIH0AALIFACB-AACzBQAg_wIAALEFADCAAwAAuwEAEIEDAACxBQAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACHNAyAA7QQAIc4DAQDsBAAhzwMIAIQFACHQAwEA7AQAIQPgAwAAyAEAIOEDAADIAQAg4gMAAMgBACAD4AMAAMwBACDhAwAAzAEAIOIDAADMAQAgApYDAQAAAAH7AwEAAAABC3QAAPAEACB4AAC3BQAg_wIAALUFADCAAwAAsgEAEIEDAAC1BQAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhlgMBAOwEACH3AwAAtgX_AyL7AwEA7AQAIQSKAwAAAP8DAosDAAAA_wMIjAMAAAD_AwiRAwAApgX_AyIMdwAAqQUAIHwAAKoFACD_AgAAqAUAMIADAADMAQAQgQMAAKgFADCCAwEA7AQAIYUDAQDsBAAhhwNAAO4EACGIA0AA7gQAIf0DQADuBAAhoAQAAMwBACChBAAAzAEAIC1vAACJBQAgdQAAigUAIHYAALoFACB3AACpBQAgeQAAqgUAIP8CAAC4BQAwgAMAAKgBABCBAwAAuAUAMIIDAQDsBAAhhQMBAOwEACGGAyAA7QQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZUDAQDsBAAhlgMBAOwEACGXAwEA7AQAIZgDAQDsBAAhmQMBAOwEACGaAwEA7AQAIZwDAACHBZwDIp0DAgDzBAAhngMBAOwEACGgAwAAhQWgAyKiAwAAuQWiAyOjAwEA9gQAIaQDAQD2BAAhpQMBAPYEACGmAwEA9gQAIacDAQDsBAAhqAMBAOwEACGpAwEA7AQAIaoDAQDsBAAhqwMBAOwEACGsAwEA7AQAIa0DAQD2BAAhrgMBAPYEACGvAwEA7AQAIbADAQD2BAAhsQMBAPYEACGyAwEA9gQAIbMDAQDsBAAhtAMBAPYEACG1AwEA9gQAIbYDAQD2BAAhBIoDAAAAogMDiwMAAACiAwmMAwAAAKIDCZEDAADlBKIDIxh0AADwBAAg_wIAAOsEADCAAwAAsAEAEIEDAADrBAAwggMBAOwEACGGAyAA7QQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZYDAQDsBAAhtwMBAOwEACG4AwEA7AQAIbkDAQDsBAAhugMBAOwEACG7AwEA7AQAIbwDAQDsBAAhvQMBAOwEACG-AwEA7AQAIb8DAQDsBAAhwAMBAOwEACHBAwEA7AQAIcIDAQDsBAAhoAQAALABACChBAAAsAEAIBFvAACJBQAg_wIAALsFADCAAwAAoAEAEIEDAAC7BQAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhlQMBAOwEACHpAwEA7AQAIeoDAQDsBAAh6wMBAPYEACHsAwEA9gQAIe0DAQD2BAAh7gNAAO8EACHvA0AA7wQAIfADAQD2BAAh8QMBAPYEACEMbwAAiQUAIP8CAAC8BQAwgAMAAJwBABCBAwAAvAUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIZUDAQDsBAAh6ANAAO4EACHyAwEA7AQAIfMDAQD2BAAh9AMBAPYEACEChQMBAAAAAf0DQAAAAAEQ_wIAAL4FADCAAwAAlwEAEIEDAAC-BQAwggMBAMwEACGHA0AAzwQAIYgDQADPBAAhiQNAANAEACHNAyAAzgQAIYIEAQDMBAAhgwQBAMwEACGEBAEAzAQAIYUEAQDhBAAhhgQBAMwEACGHBAEAzAQAIYgEAQDMBAAhiQQBAMwEACEQ_wIAAL8FADCAAwAAhAEAEIEDAAC_BQAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACHNAyAA7QQAIYIEAQDsBAAhgwQBAOwEACGEBAEA7AQAIYUEAQD2BAAhhgQBAOwEACGHBAEA7AQAIYgEAQDsBAAhiQQBAOwEACEK_wIAAMAFADCAAwAAfgAQgQMAAMAFADCCAwEAzAQAIYcDQADPBAAhiANAAM8EACGKBAgA-gQAIYsECAD6BAAhjAQCAM0EACGNBAEAzAQAIQsqAADCBQAg_wIAAMEFADCAAwAAOQAQgQMAAMEFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGKBAgAhAUAIYsECACEBQAhjAQCAPMEACGNBAEA7AQAIQwrAADJBQAgLAAAygUAIP8CAADIBQAwgAMAAD0AEIEDAADIBQAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhzgMBAOwEACGRBCAA7QQAIaAEAAA9ACChBAAAPQAgC_8CAADDBQAwgAMAAGYAEIEDAADDBQAwggMBAMwEACGEAwIAzQQAIYcDQADPBAAhiANAAM8EACH3AwAAxAWRBCKNBAEAzAQAIY4EAQDMBAAhjwQCAM0EACEHFQAA1QQAIBYAAMYFACAXAADGBQAgigMAAACRBAKLAwAAAJEECIwDAAAAkQQIkQMAAMUFkQQiBxUAANUEACAWAADGBQAgFwAAxgUAIIoDAAAAkQQCiwMAAACRBAiMAwAAAJEECJEDAADFBZEEIgSKAwAAAJEEAosDAAAAkQQIjAMAAACRBAiRAwAAxgWRBCII_wIAAMcFADCAAwAAUAAQgQMAAMcFADCCAwEAzAQAIYcDQADPBAAhiANAAM8EACHOAwEAzAQAIZEEIADOBAAhCisAAMkFACAsAADKBQAg_wIAAMgFADCAAwAAPQAQgQMAAMgFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACHOAwEA7AQAIZEEIADtBAAhA-ADAAA1ACDhAwAANQAg4gMAADUAIA0qAADCBQAg_wIAAMEFADCAAwAAOQAQgQMAAMEFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGKBAgAhAUAIYsECACEBQAhjAQCAPMEACGNBAEA7AQAIaAEAAA5ACChBAAAOQAgAo0EAQAAAAGOBAEAAAABDCoAAMIFACD_AgAAzAUAMIADAAA1ABCBAwAAzAUAMIIDAQDsBAAhhAMCAPMEACGHA0AA7gQAIYgDQADuBAAh9wMAAM0FkQQijQQBAOwEACGOBAEA7AQAIY8EAgDzBAAhBIoDAAAAkQQCiwMAAACRBAiMAwAAAJEECJEDAADGBZEEIgn_AgAAzgUAMIADAAAwABCBAwAAzgUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIYkDQADQBAAhkwQBAMwEACGVBAAAzwWVBCIHFQAA1QQAIBYAANEFACAXAADRBQAgigMAAACVBAKLAwAAAJUECIwDAAAAlQQIkQMAANAFlQQiBxUAANUEACAWAADRBQAgFwAA0QUAIIoDAAAAlQQCiwMAAACVBAiMAwAAAJUECJEDAADQBZUEIgSKAwAAAJUEAosDAAAAlQQIjAMAAACVBAiRAwAA0QWVBCIJ_wIAANIFADCAAwAAHQAQgQMAANIFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIZMEAQDsBAAhlQQAANMFlQQiBIoDAAAAlQQCiwMAAACVBAiMAwAAAJUECJEDAADRBZUEIhL_AgAA1AUAMIADAAAXABCBAwAA1AUAMIIDAQDMBAAhhwNAAM8EACGIA0AAzwQAIYkDQADQBAAhzQMgAM4EACGWBAEAzAQAIZcEAQDMBAAhmAQBAMwEACGZBAEA4QQAIZoEAQDMBAAhmwQBAMwEACGcBAEA4QQAIZ0EAQDhBAAhngQBAOEEACGfBAEA4QQAIRL_AgAA1QUAMIADAAAEABCBAwAA1QUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhzQMgAO0EACGWBAEA7AQAIZcEAQDsBAAhmAQBAOwEACGZBAEA9gQAIZoEAQDsBAAhmwQBAOwEACGcBAEA9gQAIZ0EAQD2BAAhngQBAPYEACGfBAEA9gQAIQAAAAAAAAGlBAEAAAABBaUEAgAAAAGrBAIAAAABrAQCAAAAAa0EAgAAAAGuBAIAAAABAaUEIAAAAAEBpQRAAAAAAQGlBEAAAAABBQ8AAJoJACAQAACdCQAgogQAAJsJACCjBAAAnAkAIKgEAAC9AQAgAw8AAJoJACCiBAAAmwkAIKgEAAC9AQAgAAAAAAABpQQAAACcAwIBpQQAAACgAwIBpQQAAACiAwMBpQQBAAAAAQcPAACFBgAgEAAAiAYAIKIEAACGBgAgowQAAIcGACCmBAAArAEAIKcEAACsAQAgqAQAANIDACAHDwAAgAYAIBAAAIMGACCiBAAAgQYAIKMEAACCBgAgpgQAALABACCnBAAAsAEAIKgEAACHBAAgBQ8AAIcJACAQAACYCQAgogQAAIgJACCjBAAAlwkAIKgEAAC9AQAgBQ8AAIUJACAQAACVCQAgogQAAIYJACCjBAAAlAkAIKgEAACuAgAgCw8AAPEFADAQAAD2BQAwogQAAPIFADCjBAAA8wUAMKQEAAD0BQAgpQQAAPUFADCmBAAA9QUAMKcEAAD1BQAwqAQAAPUFADCpBAAA9wUAMKoEAAD4BQAwBngAAP8FACCCAwEAAAABhwNAAAAAAYgDQAAAAAH3AwAAAP8DAvsDAQAAAAECAAAAtAEAIA8AAP4FACADAAAAtAEAIA8AAP4FACAQAAD8BQAgAQgAAJMJADAMdAAA8AQAIHgAALcFACD_AgAAtQUAMIADAACyAQAQgQMAALUFADCCAwEAAAABhwNAAO4EACGIA0AA7gQAIZYDAQDsBAAh9wMAALYF_wMi-wMBAOwEACGABAAAtAUAIAIAAAC0AQAgCAAA_AUAIAIAAAD5BQAgCAAA-gUAIAn_AgAA-AUAMIADAAD5BQAQgQMAAPgFADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGWAwEA7AQAIfcDAAC2Bf8DIvsDAQDsBAAhCf8CAAD4BQAwgAMAAPkFABCBAwAA-AUAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIZYDAQDsBAAh9wMAALYF_wMi-wMBAOwEACEFggMBANwFACGHA0AA3wUAIYgDQADfBQAh9wMAAPsF_wMi-wMBANwFACEBpQQAAAD_AwIGeAAA_QUAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIfcDAAD7Bf8DIvsDAQDcBQAhBQ8AAI4JACAQAACRCQAgogQAAI8JACCjBAAAkAkAIKgEAACaAQAgBngAAP8FACCCAwEAAAABhwNAAAAAAYgDQAAAAAH3AwAAAP8DAvsDAQAAAAEDDwAAjgkAIKIEAACPCQAgqAQAAJoBACARggMBAAAAAYYDIAAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAG3AwEAAAABuAMBAAAAAbkDAQAAAAG6AwEAAAABuwMBAAAAAbwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHAAwEAAAABwQMBAAAAAcIDAQAAAAECAAAAhwQAIA8AAIAGACADAAAAsAEAIA8AAIAGACAQAACEBgAgEwAAALABACAIAACEBgAgggMBANwFACGGAyAA3gUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIbcDAQDcBQAhuAMBANwFACG5AwEA3AUAIboDAQDcBQAhuwMBANwFACG8AwEA3AUAIb0DAQDcBQAhvgMBANwFACG_AwEA3AUAIcADAQDcBQAhwQMBANwFACHCAwEA3AUAIRGCAwEA3AUAIYYDIADeBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhtwMBANwFACG4AwEA3AUAIbkDAQDcBQAhugMBANwFACG7AwEA3AUAIbwDAQDcBQAhvQMBANwFACG-AwEA3AUAIb8DAQDcBQAhwAMBANwFACHBAwEA3AUAIcIDAQDcBQAhD3IAAIsGACCCAwEAAAABhwNAAAAAAYgDQAAAAAGJA0AAAAABxAMBAAAAAcUDAQAAAAHGAwEAAAABxwMBAAAAAcgDAQAAAAHJAwEAAAABygMBAAAAAcsDAQAAAAHMAwEAAAABzQMgAAAAAQIAAADSAwAgDwAAhQYAIAMAAACsAQAgDwAAhQYAIBAAAIkGACARAAAArAEAIAgAAIkGACByAACKBgAgggMBANwFACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACHEAwEA6wUAIcUDAQDrBQAhxgMBAOsFACHHAwEA6wUAIcgDAQDrBQAhyQMBAOsFACHKAwEA6wUAIcsDAQDrBQAhzAMBAOsFACHNAyAA3gUAIQ9yAACKBgAgggMBANwFACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACHEAwEA6wUAIcUDAQDrBQAhxgMBAOsFACHHAwEA6wUAIcgDAQDrBQAhyQMBAOsFACHKAwEA6wUAIcsDAQDrBQAhzAMBAOsFACHNAyAA3gUAIQcPAACJCQAgEAAAjAkAIKIEAACKCQAgowQAAIsJACCmBAAApAEAIKcEAACkAQAgqAQAAKQDACADDwAAiQkAIKIEAACKCQAgqAQAAKQDACADDwAAhQYAIKIEAACGBgAgqAQAANIDACADDwAAgAYAIKIEAACBBgAgqAQAAIcEACADDwAAhwkAIKIEAACICQAgqAQAAL0BACADDwAAhQkAIKIEAACGCQAgqAQAAK4CACAEDwAA8QUAMKIEAADyBQAwpAQAAPQFACCoBAAA9QUAMAAAAAUPAACACQAgEAAAgwkAIKIEAACBCQAgowQAAIIJACCoBAAAqgEAIAMPAACACQAgogQAAIEJACCoBAAAqgEAIBNvAACQBwAgdQAAkQcAIHYAAIQIACB3AAD-BwAgeQAA_wcAIIkDAADWBQAgogMAANYFACCjAwAA1gUAIKQDAADWBQAgpQMAANYFACCmAwAA1gUAIK0DAADWBQAgrgMAANYFACCwAwAA1gUAILEDAADWBQAgsgMAANYFACC0AwAA1gUAILUDAADWBQAgtgMAANYFACAAAAAAAAAAAAcPAAD7CAAgEAAA_ggAIKIEAAD8CAAgowQAAP0IACCmBAAAqAEAIKcEAACoAQAgqAQAAKoBACADDwAA-wgAIKIEAAD8CAAgqAQAAKoBACASbwAAkAcAIHUAAJEHACB5AACTBwAgewAAkgcAIIkDAADWBQAgrQMAANYFACCuAwAA1gUAILMDAADWBQAgtAMAANYFACC1AwAA1gUAILYDAADWBQAg0wMAANYFACDVAwAA1gUAINYDAADWBQAg1wMAANYFACDYAwAA1gUAINsDAADWBQAg3AMAANYFACAAAAAAAAWlBAgAAAABqwQIAAAAAawECAAAAAGtBAgAAAABrgQIAAAAAQUPAADtCAAgEAAA-QgAIKIEAADuCAAgowQAAPgIACCoBAAApAMAIAsPAADRBgAwEAAA1gYAMKIEAADSBgAwowQAANMGADCkBAAA1AYAIKUEAADVBgAwpgQAANUGADCnBAAA1QYAMKgEAADVBgAwqQQAANcGADCqBAAA2AYAMAsPAADFBgAwEAAAygYAMKIEAADGBgAwowQAAMcGADCkBAAAyAYAIKUEAADJBgAwpgQAAMkGADCnBAAAyQYAMKgEAADJBgAwqQQAAMsGADCqBAAAzAYAMAsPAACsBgAwEAAAsQYAMKIEAACtBgAwowQAAK4GADCkBAAArwYAIKUEAACwBgAwpgQAALAGADCnBAAAsAYAMKgEAACwBgAwqQQAALIGADCqBAAAswYAMAV8AADEBgAgggMBAAAAAYcDQAAAAAGIA0AAAAAB_QNAAAAAAQIAAACaAQAgDwAAwwYAIAMAAACaAQAgDwAAwwYAIBAAALYGACABCAAA9wgAMAt3AACpBQAgfAAAqgUAIP8CAACoBQAwgAMAAMwBABCBAwAAqAUAMIIDAQAAAAGFAwEA7AQAIYcDQADuBAAhiANAAO4EACH9A0AA7gQAIYEEAAC9BQAgAgAAAJoBACAIAAC2BgAgAgAAALQGACAIAAC1BgAgCP8CAACzBgAwgAMAALQGABCBAwAAswYAMIIDAQDsBAAhhQMBAOwEACGHA0AA7gQAIYgDQADuBAAh_QNAAO4EACEI_wIAALMGADCAAwAAtAYAEIEDAACzBgAwggMBAOwEACGFAwEA7AQAIYcDQADuBAAhiANAAO4EACH9A0AA7gQAIQSCAwEA3AUAIYcDQADfBQAhiANAAN8FACH9A0AA3wUAIQV8AAC3BgAgggMBANwFACGHA0AA3wUAIYgDQADfBQAh_QNAAN8FACELDwAAuAYAMBAAALwGADCiBAAAuQYAMKMEAAC6BgAwpAQAALsGACClBAAA9QUAMKYEAAD1BQAwpwQAAPUFADCoBAAA9QUAMKkEAAC9BgAwqgQAAPgFADAGdAAAwgYAIIIDAQAAAAGHA0AAAAABiANAAAAAAZYDAQAAAAH3AwAAAP8DAgIAAAC0AQAgDwAAwQYAIAMAAAC0AQAgDwAAwQYAIBAAAL8GACABCAAA9ggAMAIAAAC0AQAgCAAAvwYAIAIAAAD5BQAgCAAAvgYAIAWCAwEA3AUAIYcDQADfBQAhiANAAN8FACGWAwEA3AUAIfcDAAD7Bf8DIgZ0AADABgAgggMBANwFACGHA0AA3wUAIYgDQADfBQAhlgMBANwFACH3AwAA-wX_AyIFDwAA8QgAIBAAAPQIACCiBAAA8ggAIKMEAADzCAAgqAQAAKoBACAGdAAAwgYAIIIDAQAAAAGHA0AAAAABiANAAAAAAZYDAQAAAAH3AwAAAP8DAgMPAADxCAAgogQAAPIIACCoBAAAqgEAIAV8AADEBgAgggMBAAAAAYcDQAAAAAGIA0AAAAAB_QNAAAAAAQQPAAC4BgAwogQAALkGADCkBAAAuwYAIKgEAAD1BQAwB4IDAQAAAAGDAwEAAAABhAMCAAAAAYYDIAAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAECAAAAygEAIA8AANAGACADAAAAygEAIA8AANAGACAQAADPBgAgAQgAAPAIADAMdwAAqQUAIP8CAACrBQAwgAMAAMgBABCBAwAAqwUAMIIDAQAAAAGDAwEA7AQAIYQDAgDzBAAhhQMBAOwEACGGAyAA7QQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIQIAAADKAQAgCAAAzwYAIAIAAADNBgAgCAAAzgYAIAv_AgAAzAYAMIADAADNBgAQgQMAAMwGADCCAwEA7AQAIYMDAQDsBAAhhAMCAPMEACGFAwEA7AQAIYYDIADtBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhC_8CAADMBgAwgAMAAM0GABCBAwAAzAYAMIIDAQDsBAAhgwMBAOwEACGEAwIA8wQAIYUDAQDsBAAhhgMgAO0EACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACEHggMBANwFACGDAwEA3AUAIYQDAgDdBQAhhgMgAN4FACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACEHggMBANwFACGDAwEA3AUAIYQDAgDdBQAhhgMgAN4FACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACEHggMBAAAAAYMDAQAAAAGEAwIAAAABhgMgAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAShvAACPBgAgdQAAjAYAIHYAAI0GACB5AACQBgAgggMBAAAAAYYDIAAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAGVAwEAAAABlgMBAAAAAZcDAQAAAAGYAwEAAAABmQMBAAAAAZoDAQAAAAGcAwAAAJwDAp0DAgAAAAGeAwEAAAABoAMAAACgAwKiAwAAAKIDA6MDAQAAAAGkAwEAAAABpQMBAAAAAaYDAQAAAAGnAwEAAAABqAMBAAAAAakDAQAAAAGqAwEAAAABqwMBAAAAAawDAQAAAAGtAwEAAAABrgMBAAAAAa8DAQAAAAGwAwEAAAABsQMBAAAAAbIDAQAAAAGzAwEAAAABtAMBAAAAAbUDAQAAAAG2AwEAAAABAgAAAKoBACAPAADcBgAgAwAAAKoBACAPAADcBgAgEAAA2wYAIAEIAADvCAAwLW8AAIkFACB1AACKBQAgdgAAugUAIHcAAKkFACB5AACqBQAg_wIAALgFADCAAwAAqAEAEIEDAAC4BQAwggMBAAAAAYUDAQDsBAAhhgMgAO0EACGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACGVAwEA7AQAIZYDAQAAAAGXAwEA7AQAIZgDAQDsBAAhmQMBAOwEACGaAwEAAAABnAMAAIcFnAMinQMCAPMEACGeAwEA7AQAIaADAACFBaADIqIDAAC5BaIDI6MDAQD2BAAhpAMBAPYEACGlAwEA9gQAIaYDAQD2BAAhpwMBAOwEACGoAwEA7AQAIakDAQDsBAAhqgMBAOwEACGrAwEA7AQAIawDAQDsBAAhrQMBAPYEACGuAwEA9gQAIa8DAQDsBAAhsAMBAPYEACGxAwEA9gQAIbIDAQD2BAAhswMBAOwEACG0AwEA9gQAIbUDAQD2BAAhtgMBAPYEACECAAAAqgEAIAgAANsGACACAAAA2QYAIAgAANoGACAo_wIAANgGADCAAwAA2QYAEIEDAADYBgAwggMBAOwEACGFAwEA7AQAIYYDIADtBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhlQMBAOwEACGWAwEA7AQAIZcDAQDsBAAhmAMBAOwEACGZAwEA7AQAIZoDAQDsBAAhnAMAAIcFnAMinQMCAPMEACGeAwEA7AQAIaADAACFBaADIqIDAAC5BaIDI6MDAQD2BAAhpAMBAPYEACGlAwEA9gQAIaYDAQD2BAAhpwMBAOwEACGoAwEA7AQAIakDAQDsBAAhqgMBAOwEACGrAwEA7AQAIawDAQDsBAAhrQMBAPYEACGuAwEA9gQAIa8DAQDsBAAhsAMBAPYEACGxAwEA9gQAIbIDAQD2BAAhswMBAOwEACG0AwEA9gQAIbUDAQD2BAAhtgMBAPYEACEo_wIAANgGADCAAwAA2QYAEIEDAADYBgAwggMBAOwEACGFAwEA7AQAIYYDIADtBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhlQMBAOwEACGWAwEA7AQAIZcDAQDsBAAhmAMBAOwEACGZAwEA7AQAIZoDAQDsBAAhnAMAAIcFnAMinQMCAPMEACGeAwEA7AQAIaADAACFBaADIqIDAAC5BaIDI6MDAQD2BAAhpAMBAPYEACGlAwEA9gQAIaYDAQD2BAAhpwMBAOwEACGoAwEA7AQAIakDAQDsBAAhqgMBAOwEACGrAwEA7AQAIawDAQDsBAAhrQMBAPYEACGuAwEA9gQAIa8DAQDsBAAhsAMBAPYEACGxAwEA9gQAIbIDAQD2BAAhswMBAOwEACG0AwEA9gQAIbUDAQD2BAAhtgMBAPYEACEkggMBANwFACGGAyAA3gUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIZUDAQDcBQAhlgMBANwFACGXAwEA3AUAIZgDAQDcBQAhmQMBANwFACGaAwEA3AUAIZwDAADoBZwDIp0DAgDdBQAhngMBANwFACGgAwAA6QWgAyKiAwAA6gWiAyOjAwEA6wUAIaQDAQDrBQAhpQMBAOsFACGmAwEA6wUAIacDAQDcBQAhqAMBANwFACGpAwEA3AUAIaoDAQDcBQAhqwMBANwFACGsAwEA3AUAIa0DAQDrBQAhrgMBAOsFACGvAwEA3AUAIbADAQDrBQAhsQMBAOsFACGyAwEA6wUAIbMDAQDcBQAhtAMBAOsFACG1AwEA6wUAIbYDAQDrBQAhKG8AAO8FACB1AADsBQAgdgAA7QUAIHkAAPAFACCCAwEA3AUAIYYDIADeBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhlQMBANwFACGWAwEA3AUAIZcDAQDcBQAhmAMBANwFACGZAwEA3AUAIZoDAQDcBQAhnAMAAOgFnAMinQMCAN0FACGeAwEA3AUAIaADAADpBaADIqIDAADqBaIDI6MDAQDrBQAhpAMBAOsFACGlAwEA6wUAIaYDAQDrBQAhpwMBANwFACGoAwEA3AUAIakDAQDcBQAhqgMBANwFACGrAwEA3AUAIawDAQDcBQAhrQMBAOsFACGuAwEA6wUAIa8DAQDcBQAhsAMBAOsFACGxAwEA6wUAIbIDAQDrBQAhswMBANwFACG0AwEA6wUAIbUDAQDrBQAhtgMBAOsFACEobwAAjwYAIHUAAIwGACB2AACNBgAgeQAAkAYAIIIDAQAAAAGGAyAAAAABhwNAAAAAAYgDQAAAAAGJA0AAAAABlQMBAAAAAZYDAQAAAAGXAwEAAAABmAMBAAAAAZkDAQAAAAGaAwEAAAABnAMAAACcAwKdAwIAAAABngMBAAAAAaADAAAAoAMCogMAAACiAwOjAwEAAAABpAMBAAAAAaUDAQAAAAGmAwEAAAABpwMBAAAAAagDAQAAAAGpAwEAAAABqgMBAAAAAasDAQAAAAGsAwEAAAABrQMBAAAAAa4DAQAAAAGvAwEAAAABsAMBAAAAAbEDAQAAAAGyAwEAAAABswMBAAAAAbQDAQAAAAG1AwEAAAABtgMBAAAAAQMPAADtCAAgogQAAO4IACCoBAAApAMAIAQPAADRBgAwogQAANIGADCkBAAA1AYAIKgEAADVBgAwBA8AAMUGADCiBAAAxgYAMKQEAADIBgAgqAQAAMkGADAEDwAArAYAMKIEAACtBgAwpAQAAK8GACCoBAAAsAYAMAAAAAAAAaUEAAAAogMCAaUEAAAA3gMCBQ8AAOEIACAQAADrCAAgogQAAOIIACCjBAAA6ggAIKgEAACuAgAgBw8AAIcHACAQAACKBwAgogQAAIgHACCjBAAAiQcAIKYEAACsAQAgpwQAAKwBACCoBAAA0gMAIAsPAAD7BgAwEAAAgAcAMKIEAAD8BgAwowQAAP0GADCkBAAA_gYAIKUEAAD_BgAwpgQAAP8GADCnBAAA_wYAMKgEAAD_BgAwqQQAAIEHADCqBAAAggcAMAsPAADsBgAwEAAA8QYAMKIEAADtBgAwowQAAO4GADCkBAAA7wYAIKUEAADwBgAwpgQAAPAGADCnBAAA8AYAMKgEAADwBgAwqQQAAPIGADCqBAAA8wYAMAZ4AAD6BgAgggMBAAAAAYcDQAAAAAGIA0AAAAAB9wMAAAD9AwL7AwEAAAABAgAAAMEBACAPAAD5BgAgAwAAAMEBACAPAAD5BgAgEAAA9wYAIAEIAADpCAAwDHIAALAFACB4AACvBQAg_wIAAK0FADCAAwAAvwEAEIEDAACtBQAwggMBAAAAAYcDQADuBAAhiANAAO4EACHEAwEA7AQAIfcDAACuBf0DIvsDAQDsBAAh_wMAAKwFACACAAAAwQEAIAgAAPcGACACAAAA9AYAIAgAAPUGACAJ_wIAAPMGADCAAwAA9AYAEIEDAADzBgAwggMBAOwEACGHA0AA7gQAIYgDQADuBAAhxAMBAOwEACH3AwAArgX9AyL7AwEA7AQAIQn_AgAA8wYAMIADAAD0BgAQgQMAAPMGADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACHEAwEA7AQAIfcDAACuBf0DIvsDAQDsBAAhBYIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIfcDAAD2Bv0DIvsDAQDcBQAhAaUEAAAA_QMCBngAAPgGACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACH3AwAA9gb9AyL7AwEA3AUAIQUPAADkCAAgEAAA5wgAIKIEAADlCAAgowQAAOYIACCoBAAA_wEAIAZ4AAD6BgAgggMBAAAAAYcDQAAAAAGIA0AAAAAB9wMAAAD9AwL7AwEAAAABAw8AAOQIACCiBAAA5QgAIKgEAAD_AQAgCnoAAN4GACB9AADfBgAgfgAA4AYAIIIDAQAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAHNAyAAAAABzgMBAAAAAc8DCAAAAAECAAAAvQEAIA8AAIYHACADAAAAvQEAIA8AAIYHACAQAACFBwAgAQgAAOMIADAPcgAAsAUAIHoAAJwFACB9AACyBQAgfgAAswUAIP8CAACxBQAwgAMAALsBABCBAwAAsQUAMIIDAQAAAAGHA0AA7gQAIYgDQADuBAAhiQNAAO8EACHNAyAA7QQAIc4DAQDsBAAhzwMIAIQFACHQAwEA7AQAIQIAAAC9AQAgCAAAhQcAIAIAAACDBwAgCAAAhAcAIAv_AgAAggcAMIADAACDBwAQgQMAAIIHADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGJA0AA7wQAIc0DIADtBAAhzgMBAOwEACHPAwgAhAUAIdADAQDsBAAhC_8CAACCBwAwgAMAAIMHABCBAwAAggcAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIYkDQADvBAAhzQMgAO0EACHOAwEA7AQAIc8DCACEBQAh0AMBAOwEACEHggMBANwFACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACHNAyAA3gUAIc4DAQDcBQAhzwMIAKcGACEKegAAqQYAIH0AAKoGACB-AACrBgAgggMBANwFACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACHNAyAA3gUAIc4DAQDcBQAhzwMIAKcGACEKegAA3gYAIH0AAN8GACB-AADgBgAgggMBAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAc0DIAAAAAHOAwEAAAABzwMIAAAAAQ90AACgBgAgggMBAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAZYDAQAAAAHFAwEAAAABxgMBAAAAAccDAQAAAAHIAwEAAAAByQMBAAAAAcoDAQAAAAHLAwEAAAABzAMBAAAAAc0DIAAAAAECAAAA0gMAIA8AAIcHACADAAAArAEAIA8AAIcHACAQAACLBwAgEQAAAKwBACAIAACLBwAgdAAAnwYAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhlgMBAOsFACHFAwEA6wUAIcYDAQDrBQAhxwMBAOsFACHIAwEA6wUAIckDAQDrBQAhygMBAOsFACHLAwEA6wUAIcwDAQDrBQAhzQMgAN4FACEPdAAAnwYAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhlgMBAOsFACHFAwEA6wUAIcYDAQDrBQAhxwMBAOsFACHIAwEA6wUAIckDAQDrBQAhygMBAOsFACHLAwEA6wUAIcwDAQDrBQAhzQMgAN4FACEDDwAA4QgAIKIEAADiCAAgqAQAAK4CACADDwAAhwcAIKIEAACIBwAgqAQAANIDACAEDwAA-wYAMKIEAAD8BgAwpAQAAP4GACCoBAAA_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_wIAALsFADCAAwAAoAEAEIEDAAC7BQAwggMBAAAAAYcDQADuBAAhiANAAO4EACGVAwEA7AQAIekDAQDsBAAh6gMBAOwEACHrAwEA9gQAIewDAQD2BAAh7QMBAPYEACHuA0AA7wQAIe8DQADvBAAh8AMBAPYEACHxAwEA9gQAIQIAAACiAQAgCAAAzAcAIAIAAADKBwAgCAAAywcAIBD_AgAAyQcAMIADAADKBwAQgQMAAMkHADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGVAwEA7AQAIekDAQDsBAAh6gMBAOwEACHrAwEA9gQAIewDAQD2BAAh7QMBAPYEACHuA0AA7wQAIe8DQADvBAAh8AMBAPYEACHxAwEA9gQAIRD_AgAAyQcAMIADAADKBwAQgQMAAMkHADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGVAwEA7AQAIekDAQDsBAAh6gMBAOwEACHrAwEA9gQAIewDAQD2BAAh7QMBAPYEACHuA0AA7wQAIe8DQADvBAAh8AMBAPYEACHxAwEA9gQAIQyCAwEA3AUAIYcDQADfBQAhiANAAN8FACHpAwEA3AUAIeoDAQDcBQAh6wMBAOsFACHsAwEA6wUAIe0DAQDrBQAh7gNAAOAFACHvA0AA4AUAIfADAQDrBQAh8QMBAOsFACEMggMBANwFACGHA0AA3wUAIYgDQADfBQAh6QMBANwFACHqAwEA3AUAIesDAQDrBQAh7AMBAOsFACHtAwEA6wUAIe4DQADgBQAh7wNAAOAFACHwAwEA6wUAIfEDAQDrBQAhDIIDAQAAAAGHA0AAAAABiANAAAAAAekDAQAAAAHqAwEAAAAB6wMBAAAAAewDAQAAAAHtAwEAAAAB7gNAAAAAAe8DQAAAAAHwAwEAAAAB8QMBAAAAAQeCAwEAAAABhwNAAAAAAYgDQAAAAAHoA0AAAAAB8gMBAAAAAfMDAQAAAAH0AwEAAAABAgAAAJ4BACAPAADZBwAgAwAAAJ4BACAPAADZBwAgEAAA2AcAIAEIAADPCAAwDG8AAIkFACD_AgAAvAUAMIADAACcAQAQgQMAALwFADCCAwEAAAABhwNAAO4EACGIA0AA7gQAIZUDAQDsBAAh6ANAAO4EACHyAwEAAAAB8wMBAPYEACH0AwEA9gQAIQIAAACeAQAgCAAA2AcAIAIAAADWBwAgCAAA1wcAIAv_AgAA1QcAMIADAADWBwAQgQMAANUHADCCAwEA7AQAIYcDQADuBAAhiANAAO4EACGVAwEA7AQAIegDQADuBAAh8gMBAOwEACHzAwEA9gQAIfQDAQD2BAAhC_8CAADVBwAwgAMAANYHABCBAwAA1QcAMIIDAQDsBAAhhwNAAO4EACGIA0AA7gQAIZUDAQDsBAAh6ANAAO4EACHyAwEA7AQAIfMDAQD2BAAh9AMBAPYEACEHggMBANwFACGHA0AA3wUAIYgDQADfBQAh6ANAAN8FACHyAwEA3AUAIfMDAQDrBQAh9AMBAOsFACEHggMBANwFACGHA0AA3wUAIYgDQADfBQAh6ANAAN8FACHyAwEA3AUAIfMDAQDrBQAh9AMBAOsFACEHggMBAAAAAYcDQAAAAAGIA0AAAAAB6ANAAAAAAfIDAQAAAAHzAwEAAAAB9AMBAAAAAQQPAADOBwAwogQAAM8HADCkBAAA0QcAIKgEAADSBwAwBA8AAMIHADCiBAAAwwcAMKQEAADFBwAgqAQAAMYHADADDwAAvQcAIKIEAAC-BwAgqAQAAKQDACADDwAAuAcAIKIEAAC5BwAgqAQAAIwDACAEDwAArwcAMKIEAACwBwAwpAQAALIHACCoBAAA1QYAMAAABG8AAJAHACCJAwAA1gUAIOQDAADWBQAg5QMAANYFACAAAAAABQ8AAMoIACAQAADNCAAgogQAAMsIACCjBAAAzAgAIKgEAACkAwAgAw8AAMoIACCiBAAAywgAIKgEAACkAwAgAAAACw8AAOwHADAQAADwBwAwogQAAO0HADCjBAAA7gcAMKQEAADvBwAgpQQAAPAGADCmBAAA8AYAMKcEAADwBgAwqAQAAPAGADCpBAAA8QcAMKoEAADzBgAwBnIAAOcHACCCAwEAAAABhwNAAAAAAYgDQAAAAAHEAwEAAAAB9wMAAAD9AwICAAAAwQEAIA8AAPQHACADAAAAwQEAIA8AAPQHACAQAADzBwAgAQgAAMkIADACAAAAwQEAIAgAAPMHACACAAAA9AYAIAgAAPIHACAFggMBANwFACGHA0AA3wUAIYgDQADfBQAhxAMBANwFACH3AwAA9gb9AyIGcgAA5gcAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIcQDAQDcBQAh9wMAAPYG_QMiBnIAAOcHACCCAwEAAAABhwNAAAAAAYgDQAAAAAHEAwEAAAAB9wMAAAD9AwIEDwAA7AcAMKIEAADtBwAwpAQAAO8HACCoBAAA8AYAMAAAAAAAAAUPAADECAAgEAAAxwgAIKIEAADFCAAgowQAAMYIACCoBAAAvQEAIAMPAADECAAgogQAAMUIACCoBAAAvQEAIAVyAAChBgAgegAA4gcAIH0AAIEIACB-AACCCAAgiQMAANYFACAAAXwAAJMHACAAAAJ3AAD-BwAgfAAA_wcAIAJ0AACWBgAgiQMAANYFACAAAAAAAAAAAAUPAAC_CAAgEAAAwggAIKIEAADACAAgowQAAMEIACCoBAAAMwAgAw8AAL8IACCiBAAAwAgAIKgEAAAzACACKwAAsAgAICwAALEIACAAAAAAAAGlBAAAAJEEAgUPAAC6CAAgEAAAvQgAIKIEAAC7CAAgowQAALwIACCoBAAAMwAgAw8AALoIACCiBAAAuwgAIKgEAAAzACAAAAALDwAAoggAMBAAAKcIADCiBAAAowgAMKMEAACkCAAwpAQAAKUIACClBAAApggAMKYEAACmCAAwpwQAAKYIADCoBAAApggAMKkEAACoCAAwqgQAAKkIADAHDwAAnQgAIBAAAKAIACCiBAAAnggAIKMEAACfCAAgpgQAADkAIKcEAAA5ACCoBAAAaQAgBoIDAQAAAAGHA0AAAAABiANAAAAAAYoECAAAAAGLBAgAAAABjAQCAAAAAQIAAABpACAPAACdCAAgAwAAADkAIA8AAJ0IACAQAAChCAAgCAAAADkAIAgAAKEIACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACGKBAgApwYAIYsECACnBgAhjAQCAN0FACEGggMBANwFACGHA0AA3wUAIYgDQADfBQAhigQIAKcGACGLBAgApwYAIYwEAgDdBQAhB4IDAQAAAAGEAwIAAAABhwNAAAAAAYgDQAAAAAH3AwAAAJEEAo4EAQAAAAGPBAIAAAABAgAAADcAIA8AAK0IACADAAAANwAgDwAArQgAIBAAAKwIACABCAAAuQgAMA0qAADCBQAg_wIAAMwFADCAAwAANQAQgQMAAMwFADCCAwEAAAABhAMCAPMEACGHA0AA7gQAIYgDQADuBAAh9wMAAM0FkQQijQQBAOwEACGOBAEA7AQAIY8EAgDzBAAhkgQAAMsFACACAAAANwAgCAAArAgAIAIAAACqCAAgCAAAqwgAIAv_AgAAqQgAMIADAACqCAAQgQMAAKkIADCCAwEA7AQAIYQDAgDzBAAhhwNAAO4EACGIA0AA7gQAIfcDAADNBZEEIo0EAQDsBAAhjgQBAOwEACGPBAIA8wQAIQv_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_cDIvgDIADeBQAh-QMgAN4FACH6AwEA6wUAIRBwAADaBwAgcgAA3AcAIHMAAN0HACB6AADeBwAgggMBAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAc0DIAAAAAHOAwEAAAAB4wMBAAAAAfUDAAAA3gMC9wMAAAD3AwL4AyAAAAAB-QMgAAAAAfoDAQAAAAECAAAArgIAIA8AANcIACADAAAAsQIAIA8AANcIACAQAADbCAAgEgAAALECACAIAADbCAAgcAAAqgcAIHIAAKwHACBzAACtBwAgegAArgcAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhzQMgAN4FACHOAwEA3AUAIeMDAQDcBQAh9QMAAOcG3gMi9wMAAKkH9wMi-AMgAN4FACH5AyAA3gUAIfoDAQDrBQAhEHAAAKoHACByAACsBwAgcwAArQcAIHoAAK4HACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIc0DIADeBQAhzgMBANwFACHjAwEA3AUAIfUDAADnBt4DIvcDAACpB_cDIvgDIADeBQAh-QMgAN4FACH6AwEA6wUAIRBwAADaBwAgcQAA2wcAIHIAANwHACB6AADeBwAgggMBAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAc0DIAAAAAHOAwEAAAAB4wMBAAAAAfUDAAAA3gMC9wMAAAD3AwL4AyAAAAAB-QMgAAAAAfoDAQAAAAECAAAArgIAIA8AANwIACADAAAAsQIAIA8AANwIACAQAADgCAAgEgAAALECACAIAADgCAAgcAAAqgcAIHEAAKsHACByAACsBwAgegAArgcAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhzQMgAN4FACHOAwEA3AUAIeMDAQDcBQAh9QMAAOcG3gMi9wMAAKkH9wMi-AMgAN4FACH5AyAA3gUAIfoDAQDrBQAhEHAAAKoHACBxAACrBwAgcgAArAcAIHoAAK4HACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIc0DIADeBQAhzgMBANwFACHjAwEA3AUAIfUDAADnBt4DIvcDAACpB_cDIvgDIADeBQAh-QMgAN4FACH6AwEA6wUAIRBwAADaBwAgcQAA2wcAIHMAAN0HACB6AADeBwAgggMBAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAc0DIAAAAAHOAwEAAAAB4wMBAAAAAfUDAAAA3gMC9wMAAAD3AwL4AyAAAAAB-QMgAAAAAfoDAQAAAAECAAAArgIAIA8AAOEIACAHggMBAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAc0DIAAAAAHOAwEAAAABzwMIAAAAAQSCAwEAAAABhwNAAAAAAYgDQAAAAAH9A0AAAAABAgAAAP8BACAPAADkCAAgAwAAAIICACAPAADkCAAgEAAA6AgAIAYAAACCAgAgCAAA6AgAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIf0DQADfBQAhBIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIf0DQADfBQAhBYIDAQAAAAGHA0AAAAABiANAAAAAAfcDAAAA_QMC-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-ggAICgAAACkAQAgCAAA-ggAIG8AAOgGACB1AADpBgAgeQAA6wYAIIIDAQDcBQAhhgMgAN4FACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACGVAwEA3AUAIZcDAQDcBQAhnAMAAOgFnAMioAMAAOkFoAMiogMAAOYGogMiqwMBANwFACGsAwEA3AUAIa0DAQDrBQAhrgMBAOsFACGzAwEA6wUAIbQDAQDrBQAhtQMBAOsFACG2AwEA6wUAIbgDAQDcBQAhvAMBANwFACHEAwEA3AUAIdEDAQDcBQAh0gMBANwFACHTAwEA6wUAIdQDCACnBgAh1QMBAOsFACHWAwEA6wUAIdcDAQDrBQAh2AMBAOsFACHZAwEA3AUAIdoDAQDcBQAh2wMBAOsFACHcAwEA6wUAId4DAADnBt4DIt8DAQDcBQAhJm8AAOgGACB1AADpBgAgeQAA6wYAIIIDAQDcBQAhhgMgAN4FACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACGVAwEA3AUAIZcDAQDcBQAhnAMAAOgFnAMioAMAAOkFoAMiogMAAOYGogMiqwMBANwFACGsAwEA3AUAIa0DAQDrBQAhrgMBAOsFACGzAwEA6wUAIbQDAQDrBQAhtQMBAOsFACG2AwEA6wUAIbgDAQDcBQAhvAMBANwFACHEAwEA3AUAIdEDAQDcBQAh0gMBANwFACHTAwEA6wUAIdQDCACnBgAh1QMBAOsFACHWAwEA6wUAIdcDAQDrBQAh2AMBAOsFACHZAwEA3AUAIdoDAQDcBQAh2wMBAOsFACHcAwEA6wUAId4DAADnBt4DIt8DAQDcBQAhKW8AAI8GACB2AACNBgAgdwAAjgYAIHkAAJAGACCCAwEAAAABhQMBAAAAAYYDIAAAAAGHA0AAAAABiANAAAAAAYkDQAAAAAGVAwEAAAABlgMBAAAAAZcDAQAAAAGYAwEAAAABmQMBAAAAAZoDAQAAAAGcAwAAAJwDAp0DAgAAAAGeAwEAAAABoAMAAACgAwKiAwAAAKIDA6MDAQAAAAGkAwEAAAABpQMBAAAAAaYDAQAAAAGnAwEAAAABqAMBAAAAAakDAQAAAAGqAwEAAAABqwMBAAAAAawDAQAAAAGtAwEAAAABrgMBAAAAAa8DAQAAAAGwAwEAAAABsQMBAAAAAbIDAQAAAAGzAwEAAAABtAMBAAAAAbUDAQAAAAG2AwEAAAABAgAAAKoBACAPAAD7CAAgAwAAAKgBACAPAAD7CAAgEAAA_wgAICsAAACoAQAgCAAA_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_QNAAAAAAQIAAACaAQAgDwAAjgkAIAMAAADMAQAgDwAAjgkAIBAAAJIJACAIAAAAzAEAIAgAAJIJACB3AAD8BwAgggMBANwFACGFAwEA3AUAIYcDQADfBQAhiANAAN8FACH9A0AA3wUAIQZ3AAD8BwAgggMBANwFACGFAwEA3AUAIYcDQADfBQAhiANAAN8FACH9A0AA3wUAIQWCAwEAAAABhwNAAAAAAYgDQAAAAAH3AwAAAP8DAvsDAQAAAAEDAAAAsQIAIA8AAIUJACAQAACWCQAgEgAAALECACAIAACWCQAgcAAAqgcAIHEAAKsHACByAACsBwAgcwAArQcAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhzQMgAN4FACHOAwEA3AUAIeMDAQDcBQAh9QMAAOcG3gMi9wMAAKkH9wMi-AMgAN4FACH5AyAA3gUAIfoDAQDrBQAhEHAAAKoHACBxAACrBwAgcgAArAcAIHMAAK0HACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIc0DIADeBQAhzgMBANwFACHjAwEA3AUAIfUDAADnBt4DIvcDAACpB_cDIvgDIADeBQAh-QMgAN4FACH6AwEA6wUAIQMAAAC7AQAgDwAAhwkAIBAAAJkJACANAAAAuwEAIAgAAJkJACByAACoBgAgfQAAqgYAIH4AAKsGACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIc0DIADeBQAhzgMBANwFACHPAwgApwYAIdADAQDcBQAhC3IAAKgGACB9AACqBgAgfgAAqwYAIIIDAQDcBQAhhwNAAN8FACGIA0AA3wUAIYkDQADgBQAhzQMgAN4FACHOAwEA3AUAIc8DCACnBgAh0AMBANwFACELcgAA3QYAIHoAAN4GACB-AADgBgAgggMBAAAAAYcDQAAAAAGIA0AAAAABiQNAAAAAAc0DIAAAAAHOAwEAAAABzwMIAAAAAdADAQAAAAECAAAAvQEAIA8AAJoJACADAAAAuwEAIA8AAJoJACAQAACeCQAgDQAAALsBACAIAACeCQAgcgAAqAYAIHoAAKkGACB-AACrBgAgggMBANwFACGHA0AA3wUAIYgDQADfBQAhiQNAAOAFACHNAyAA3gUAIc4DAQDcBQAhzwMIAKcGACHQAwEA3AUAIQtyAACoBgAgegAAqQYAIH4AAKsGACCCAwEA3AUAIYcDQADfBQAhiANAAN8FACGJA0AA4AUAIc0DIADeBQAhzgMBANwFACHPAwgApwYAIdADAQDcBQAhAAAAAAMVAAYWAAcXAAgAAAADFQAGFgAHFwAIAAAAAxUADhYADxcAEAAAAAMVAA4WAA8XABADFQAVKzgTLDoUASoAEgEqABIBKzsAAAADFQAZFgAaFwAbAAAAAxUAGRYAGhcAGwEqABIBKgASBRUAIBYAIxcAJEsAIUwAIgAAAAAABRUAIBYAIxcAJEsAIUwAIgEqABIBKgASBRUAKRYALBcALUsAKkwAKwAAAAAABRUAKRYALBcALUsAKkwAKwAAAAMVADMWADQXADUAAAADFQAzFgA0FwA1AxUASncAOHzSAUEFFQBJcgA5escBPn3LAUh-zgE3BRUAR28AOnW6AT95wgFEe74BOAYVAENwnwE7caMBPHKlATlzpwE9eqsBPgFvADoBbwA6AW8AOgYVAEJvADp1rQE_drEBQHcAOHm1AUECcq8BOXSuAT4BdAA-AnQAPngANwF5tgEAA3C3AQBxuAEAerkBAAJyADl4AEUCFQBGfMMBRAF8xAEAAnnGAQB7xQEAAXcAOAN6zwEAfdABAH7RAQABfNMBAAF3ADgBdwA4AxUAThYATxcAUAAAAAMVAE4WAE8XAFACdAA-eAA3AnQAPngANwMVAFUWAFYXAFcAAAADFQBVFgBWFwBXAAADFQBcFgBdFwBeAAAAAxUAXBYAXRcAXgJyADl4AEUCcgA5eABFAxUAYxYAZBcAZQAAAAMVAGMWAGQXAGUAAAMVAGoWAGsXAGwAAAADFQBqFgBrFwBsAW8AOgFvADoDFQBxFgByFwBzAAAAAxUAcRYAchcAcwFvADoBbwA6AxUAeBYAeRcAegAAAAMVAHgWAHkXAHoAAAADFQCAARYAgQEXAIIBAAAAAxUAgAEWAIEBFwCCAQFvADoBbwA6AxUAhwEWAIgBFwCJAQAAAAMVAIcBFgCIARcAiQEBbwA6AW8AOgUVAI4BFgCRARcAkgFLAI8BTACQAQAAAAAABRUAjgEWAJEBFwCSAUsAjwFMAJABAXIAOQFyADkFFQCXARYAmgEXAJsBSwCYAUwAmQEAAAAAAAUVAJcBFgCaARcAmwFLAJgBTACZAQJy3wM5dN4DPgJy5gM5dOUDPgMVAKABFgChARcAogEAAAADFQCgARYAoQEXAKIBAAAABRUAqAEWAKsBFwCsAUsAqQFMAKoBAAAAAAAFFQCoARYAqwEXAKwBSwCpAUwAqgEBdAA-AXQAPgMVALEBFgCyARcAswEAAAADFQCxARYAsgEXALMBAm8AOncAOAJvADp3ADgFFQC4ARYAuwEXALwBSwC5AUwAugEAAAAAAAUVALgBFgC7ARcAvAFLALkBTAC6AQF3ADgBdwA4BRUAwQEWAMQBFwDFAUsAwgFMAMMBAAAAAAAFFQDBARYAxAEXAMUBSwDCAUwAwwEBAgECAwEFBgEGBwEHCAEJCgEKDAILDQMMDwENEQIOEgQREwESFAETFQIYGAUZGQkaGwobHAocHwodIAoeIQofIwogJQIhJgsiKAojKgIkKwwlLAomLQonLgIoMQ0pMhEtNBIuPBIvPxIwQBIxQRIyQxIzRQI0RhY1SBI2SgI3Sxc4TBI5TRI6TgI7URg8Uhw9UxM-VBM_VRNAVhNBVxNCWRNDWwJEXB1FXhNGYAJHYR5IYhNJYxNKZAJNZx9OaCVPahRQaxRRbRRSbhRTbxRUcRRVcwJWdCZXdhRYeAJZeSdaehRbexRcfAJdfyhegAEuX4IBL2CDAS9hhgEvYocBL2OIAS9kigEvZYwBAmaNATBnjwEvaJEBAmmSATFqkwEva5QBL2yVAQJtmAEybpkBNn-bATeAAdQBN4EB1QE3ggHWATeDAdcBN4QB2QE3hQHbAQKGAdwBS4cB3gE3iAHgAQKJAeEBTIoB4gE3iwHjATeMAeQBAo0B5wFNjgHoAVGPAekBQZAB6gFBkQHrAUGSAewBQZMB7QFBlAHvAUGVAfEBApYB8gFSlwH0AUGYAfYBApkB9wFTmgH4AUGbAfkBQZwB-gECnQH9AVSeAf4BWJ8BgAJFoAGBAkWhAYQCRaIBhQJFowGGAkWkAYgCRaUBigICpgGLAlmnAY0CRagBjwICqQGQAlqqAZECRasBkgJFrAGTAgKtAZYCW64BlwJfrwGYAkSwAZkCRLEBmgJEsgGbAkSzAZwCRLQBngJEtQGgAgK2AaECYLcBowJEuAGlAgK5AaYCYboBpwJEuwGoAkS8AakCAr0BrAJivgGtAma_Aa8COsABsAI6wQGzAjrCAbQCOsMBtQI6xAG3AjrFAbkCAsYBugJnxwG8AjrIAb4CAskBvwJoygHAAjrLAcECOswBwgICzQHFAmnOAcYCbc8BxwI70AHIAjvRAckCO9IBygI70wHLAjvUAc0CO9UBzwIC1gHQAm7XAdICO9gB1AIC2QHVAm_aAdYCO9sB1wI73AHYAgLdAdsCcN4B3AJ03wHdAjzgAd4CPOEB3wI84gHgAjzjAeECPOQB4wI85QHlAgLmAeYCdecB6AI86AHqAgLpAesCduoB7AI86wHtAjzsAe4CAu0B8QJ37gHyAnvvAfQCfPAB9QJ88QH4AnzyAfkCfPMB-gJ89AH8Anz1Af4CAvYB_wJ99wGBA3z4AYMDAvkBhAN--gGFA3z7AYYDfPwBhwMC_QGKA3_-AYsDgwH_AY0DPYACjgM9gQKQAz2CApEDPYMCkgM9hAKUAz2FApYDAoYClwOEAYcCmQM9iAKbAwKJApwDhQGKAp0DPYsCngM9jAKfAwKNAqIDhgGOAqMDigGPAqUDOZACpgM5kQKoAzmSAqkDOZMCqgM5lAKsAzmVAq4DApYCrwOLAZcCsQM5mAKzAwKZArQDjAGaArUDOZsCtgM5nAK3AwKdAroDjQGeArsDkwGfArwDOKACvQM4oQK-AziiAr8DOKMCwAM4pALCAzilAsQDAqYCxQOUAacCxwM4qALJAwKpAsoDlQGqAssDOKsCzAM4rALNAwKtAtADlgGuAtEDnAGvAtMDP7AC1AM_sQLWAz-yAtcDP7MC2AM_tALaAz-1AtwDArYC3QOdAbcC4QM_uALjAwK5AuQDngG6AucDP7sC6AM_vALpAwK9AuwDnwG-Au0DowG_Au8DpAHAAvADpAHBAvMDpAHCAvQDpAHDAvUDpAHEAvcDpAHFAvkDAsYC-gOlAccC_AOkAcgC_gMCyQL_A6YBygKABKQBywKBBKQBzAKCBALNAoUEpwHOAoYErQHPAogEQNACiQRA0QKLBEDSAowEQNMCjQRA1AKPBEDVApEEAtYCkgSuAdcClARA2AKWBALZApcErwHaApgEQNsCmQRA3AKaBALdAp0EsAHeAp4EtAHfAp8EPuACoAQ-4QKhBD7iAqIEPuMCowQ-5AKlBD7lAqcEAuYCqAS1AecCqgQ-6AKsBALpAq0EtgHqAq4EPusCrwQ-7AKwBALtArMEtwHuArQEvQHvArUESPACtgRI8QK3BEjyArgESPMCuQRI9AK7BEj1Ar0EAvYCvgS-AfcCwARI-ALCBAL5AsMEvwH6AsQESPsCxQRI_ALGBAL9AskEwAH-AsoExgE"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AddressScalarFieldEnum: () => AddressScalarFieldEnum,
  AdminScalarFieldEnum: () => AdminScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AttendanceRecordScalarFieldEnum: () => AttendanceRecordScalarFieldEnum,
  AttendanceSessionScalarFieldEnum: () => AttendanceSessionScalarFieldEnum,
  BankInfoScalarFieldEnum: () => BankInfoScalarFieldEnum,
  ClassScalarFieldEnum: () => ClassScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  EmployeeAttendanceRecordScalarFieldEnum: () => EmployeeAttendanceRecordScalarFieldEnum,
  EmployeeAttendanceSessionScalarFieldEnum: () => EmployeeAttendanceSessionScalarFieldEnum,
  EmployeeScalarFieldEnum: () => EmployeeScalarFieldEnum,
  FailCriteriaScalarFieldEnum: () => FailCriteriaScalarFieldEnum,
  GeneralSettingsScalarFieldEnum: () => GeneralSettingsScalarFieldEnum,
  GradeScaleScalarFieldEnum: () => GradeScaleScalarFieldEnum,
  GradingConfigurationScalarFieldEnum: () => GradingConfigurationScalarFieldEnum,
  GuardianInfoScalarFieldEnum: () => GuardianInfoScalarFieldEnum,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  RulesRegulationsScalarFieldEnum: () => RulesRegulationsScalarFieldEnum,
  SequenceScalarFieldEnum: () => SequenceScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  StudentScalarFieldEnum: () => StudentScalarFieldEnum,
  SubjectScalarFieldEnum: () => SubjectScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.8.0",
  engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  GeneralSettings: "GeneralSettings",
  RulesRegulations: "RulesRegulations",
  GradingConfiguration: "GradingConfiguration",
  GradeScale: "GradeScale",
  FailCriteria: "FailCriteria",
  BankInfo: "BankInfo",
  AttendanceSession: "AttendanceSession",
  AttendanceRecord: "AttendanceRecord",
  EmployeeAttendanceSession: "EmployeeAttendanceSession",
  EmployeeAttendanceRecord: "EmployeeAttendanceRecord",
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Admin: "Admin",
  Employee: "Employee",
  Class: "Class",
  Address: "Address",
  Sequence: "Sequence",
  GuardianInfo: "GuardianInfo",
  Student: "Student",
  Subject: "Subject"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var GeneralSettingsScalarFieldEnum = {
  id: "id",
  instituteName: "instituteName",
  institutePhoneNumber: "institutePhoneNumber",
  instituteEmail: "instituteEmail",
  instituteWebsite: "instituteWebsite",
  instituteAddress: "instituteAddress",
  instituteCountry: "instituteCountry",
  instituteLogo: "instituteLogo",
  instituteLogoPublicId: "instituteLogoPublicId",
  instituteLogoName: "instituteLogoName",
  instituteLogoType: "instituteLogoType",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var RulesRegulationsScalarFieldEnum = {
  id: "id",
  content: "content",
  type: "type",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var GradingConfigurationScalarFieldEnum = {
  id: "id",
  name: "name",
  isActive: "isActive",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var GradeScaleScalarFieldEnum = {
  id: "id",
  grade: "grade",
  minMarks: "minMarks",
  maxMarks: "maxMarks",
  status: "status",
  configurationId: "configurationId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var FailCriteriaScalarFieldEnum = {
  id: "id",
  overallPercentage: "overallPercentage",
  subjectPercentage: "subjectPercentage",
  minFailedSubjects: "minFailedSubjects",
  configurationId: "configurationId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var BankInfoScalarFieldEnum = {
  id: "id",
  nameOfBank: "nameOfBank",
  branchAddress: "branchAddress",
  accountNumber: "accountNumber",
  instruction: "instruction",
  bankLogo: "bankLogo",
  bankLogoPublicId: "bankLogoPublicId",
  bankLogoName: "bankLogoName",
  bankLogoType: "bankLogoType",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var AttendanceSessionScalarFieldEnum = {
  id: "id",
  classId: "classId",
  date: "date",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AttendanceRecordScalarFieldEnum = {
  id: "id",
  sessionId: "sessionId",
  studentId: "studentId",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var EmployeeAttendanceSessionScalarFieldEnum = {
  id: "id",
  date: "date",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var EmployeeAttendanceRecordScalarFieldEnum = {
  id: "id",
  sessionId: "sessionId",
  employeeId: "employeeId",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  role: "role",
  status: "status",
  needPasswordChange: "needPasswordChange",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AdminScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  profilePhoto: "profilePhoto",
  contactNumber: "contactNumber",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt",
  userId: "userId"
};
var EmployeeScalarFieldEnum = {
  id: "id",
  userId: "userId",
  phone: "phone",
  fullName: "fullName",
  nid: "nid",
  fatherName: "fatherName",
  motherName: "motherName",
  emergencyContact: "emergencyContact",
  monthlySalary: "monthlySalary",
  employeeId: "employeeId",
  picture: "picture",
  picturePublicId: "picturePublicId",
  pictureName: "pictureName",
  pictureType: "pictureType",
  experience: "experience",
  experiencePublicId: "experiencePublicId",
  experienceName: "experienceName",
  experienceType: "experienceType",
  authoritySign: "authoritySign",
  authoritySignPublicId: "authoritySignPublicId",
  authoritySignName: "authoritySignName",
  authoritySignType: "authoritySignType",
  employeeSign: "employeeSign",
  employeeSignPublicId: "employeeSignPublicId",
  employeeSignName: "employeeSignName",
  employeeSignType: "employeeSignType",
  gender: "gender",
  bloodGroup: "bloodGroup",
  religion: "religion",
  employeeRole: "employeeRole",
  dateOfJoining: "dateOfJoining",
  isdeleted: "isdeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var ClassScalarFieldEnum = {
  id: "id",
  name: "name",
  monthlyTuitionFee: "monthlyTuitionFee",
  classTeacher: "classTeacher",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var AddressScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  employeeId: "employeeId",
  permanentAddressVillage: "permanentAddressVillage",
  permanentAddressPostOffice: "permanentAddressPostOffice",
  permanentAddressPostCode: "permanentAddressPostCode",
  permanentAddressDistrict: "permanentAddressDistrict",
  presentAddressVillage: "presentAddressVillage",
  presentAddressPostOffice: "presentAddressPostOffice",
  presentAddressPostCode: "presentAddressPostCode",
  presentAddressDistrict: "presentAddressDistrict",
  isDeleted: "isDeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var SequenceScalarFieldEnum = {
  id: "id",
  current: "current"
};
var GuardianInfoScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  whatsappNumber: "whatsappNumber",
  fatherName: "fatherName",
  fatherNameBangla: "fatherNameBangla",
  fatherMobileNumber: "fatherMobileNumber",
  fatherOccupation: "fatherOccupation",
  motherName: "motherName",
  motherNameBangla: "motherNameBangla",
  motherMobileNumber: "motherMobileNumber",
  motherOccupation: "motherOccupation",
  nameOfLocalGuardian: "nameOfLocalGuardian",
  relationShipOfStudent: "relationShipOfStudent",
  GuardianMobileNumber: "GuardianMobileNumber",
  isdeleted: "isdeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var StudentScalarFieldEnum = {
  id: "id",
  userId: "userId",
  classId: "classId",
  studentId: "studentId",
  fullName: "fullName",
  fullNameBangla: "fullNameBangla",
  dateOfBirth: "dateOfBirth",
  birthRegistrationNumber: "birthRegistrationNumber",
  religion: "religion",
  admissionTotalFees: "admissionTotalFees",
  admissionDate: "admissionDate",
  gender: "gender",
  bloodGroup: "bloodGroup",
  previousInstituteName: "previousInstituteName",
  endingClass: "endingClass",
  result: "result",
  testimonialNumber: "testimonialNumber",
  studentSign: "studentSign",
  studentSignPublicId: "studentSignPublicId",
  studentsignName: "studentsignName",
  studentSignType: "studentSignType",
  authoritySign: "authoritySign",
  authoritySignPublicId: "authoritySignPublicId",
  authoritySignName: "authoritySignName",
  authoritySignType: "authoritySignType",
  guardianSign: "guardianSign",
  guardianSignPublicId: "guardianSignPublicId",
  guardianSignName: "guardianSignName",
  guardianSignType: "guardianSignType",
  picture: "picture",
  picturePublicId: "picturePublicId",
  pictureName: "pictureName",
  pictureType: "pictureType",
  isdeleted: "isdeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var SubjectScalarFieldEnum = {
  id: "id",
  subjectName: "subjectName",
  maxMarks: "maxMarks",
  classId: "classId",
  isdeleted: "isdeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/client.ts
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/lib/auth.ts
var auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql"
    // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.STUDENT
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (!user) {
            console.error(
              `User with email ${email} not found. Cannot send verification OTP.`
            );
            return;
          }
          if (user && user.role === UserRole.SUPER_ADMIN) {
            console.log(
              `User with email ${email} is a super admin. Skipping sending verification OTP.`
            );
            return;
          }
          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp
              }
            });
          }
        }
      },
      expiresIn: 2 * 60,
      // 2 minutes in seconds
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:5000",
    envVars.FRONTEND_URL
  ],
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/app/middleware/globalErrorHandler.ts
import status5 from "http-status";
import z from "zod";

// src/app/errorHelpers/handlePrismaErrors.ts
import status3 from "http-status";
var getStatusCodeFromPrismaError = (errorCode) => {
  if (errorCode === "P2002") {
    return status3.CONFLICT;
  }
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status3.NOT_FOUND;
  }
  if (["P1000", "P6002"].includes(errorCode)) {
    return status3.UNAUTHORIZED;
  }
  if (["P1010", "P6010"].includes(errorCode)) {
    return status3.FORBIDDEN;
  }
  if (errorCode === "P6003") {
    return status3.PAYMENT_REQUIRED;
  }
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status3.GATEWAY_TIMEOUT;
  }
  if (errorCode === "P5011") {
    return status3.TOO_MANY_REQUESTS;
  }
  if (errorCode === "P6009") {
    return 413;
  }
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
    return status3.SERVICE_UNAVAILABLE;
  }
  if (errorCode.startsWith("P2")) {
    return status3.BAD_REQUEST;
  }
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status3.INTERNAL_SERVER_ERROR;
  }
  return status3.INTERNAL_SERVER_ERROR;
};
var formatErrorMeta = (meta) => {
  if (!meta) return "";
  const parts = [];
  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field: ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column: ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table: ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model: ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation: ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint: ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error: ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" |") : "";
};
var handlePrismaClientKnownRequestError = (error) => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred with the database operation.";
  const errorSources = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage
    }
  ];
  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause)
    });
  }
  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientUnknownError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An unknown error occurred with the database operation.";
  const errorSources = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode: status3.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientValidationError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const errorSources = [];
  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch?.[1] ?? "Unknown Field";
  const mainMessage = lines.find(
    (line) => !line.includes("Argument") && !line.includes("\u2192") && line.length > 10
  ) || lines[0] || "Invalid query parameters provided to the database operation.";
  errorSources.push({
    path: fieldName,
    message: mainMessage
  });
  return {
    success: false,
    statusCode: status3.BAD_REQUEST,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientInitializationError = (error) => {
  const statusCode = error.errorCode ? getStatusCodeFromPrismaError(error.errorCode) : status3.SERVICE_UNAVAILABLE;
  const cleanMessage = error.message;
  cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred while initializing the Prisma Client.";
  const errorSources = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientRustPanicError = () => {
  const errorSources = [
    {
      path: "Rust Engine Crashed",
      message: "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists."
    }
  ];
  return {
    success: false,
    statusCode: status3.INTERNAL_SERVER_ERROR,
    message: "Prisma Client Rust Panic Error: The database engine crashed due to a fatal error.",
    errorSources
  };
};

// src/app/errorHelpers/handleZodError.ts
import status4 from "http-status";
var handelZodError = (err) => {
  const statusCode = status4.BAD_REQUEST;
  const message = "Zod Validation Error";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" => "),
      message: issue.message
    });
  });
  return {
    success: true,
    message,
    errorSources,
    statusCode
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let errorSources = [];
  let statusCode = status5.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    const simplifiedError = handlerPrismaClientInitializationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof z.ZodError) {
    const simplifiedError = handelZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status5.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    ...envVars.NODE_ENV === "development" && { error: err },
    ...envVars.NODE_ENV === "development" && stack && { stack }
  };
  res.status(statusCode).json(errorResponse);
};

// src/app/middleware/notFound.ts
import status6 from "http-status";
var notFound = (req, res) => {
  res.status(status6.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app/routes/index.ts
import { Router as Router9 } from "express";

// src/app/modules/attendance/attendance.routes.ts
import { Router } from "express";

// src/generated/internal/prismaNamespaceBrowser.ts
import * as runtime3 from "@prisma/client/runtime/index-browser";
var NullTypes4 = {
  DbNull: runtime3.NullTypes.DbNull,
  JsonNull: runtime3.NullTypes.JsonNull,
  AnyNull: runtime3.NullTypes.AnyNull
};
var TransactionIsolationLevel2 = runtime3.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});

// src/app/middleware/auth.ts
import status7 from "http-status";

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/middleware/auth.ts
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1] || null;
    }
    if (!token) {
      token = req.cookies?.accessToken;
    }
    if (!token) {
      throw new AppError_default(status7.UNAUTHORIZED, "Unauthorized access!");
    }
    const verifiedToken = jwtUtils.verifyToken(
      token,
      envVars.ACCESS_TOKEN_SECRET
    );
    if (!verifiedToken.success) {
      throw new AppError_default(
        status7.UNAUTHORIZED,
        "Invalid access token."
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: verifiedToken.data.userId
      }
    });
    if (!user) {
      throw new AppError_default(status7.UNAUTHORIZED, "User not found.");
    }
    if (user.isDeleted) {
      throw new AppError_default(status7.UNAUTHORIZED, "User deleted.");
    }
    if (user.status === "BLOCKED" || user.status === "DELETED") {
      throw new AppError_default(status7.UNAUTHORIZED, "User inactive.");
    }
    if (authRoles.length && !authRoles.includes(user.role)) {
      throw new AppError_default(status7.FORBIDDEN, "Forbidden access.");
    }
    req.user = {
      userId: user.id,
      role: user.role,
      email: user.email
    };
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/modules/attendance/attendance.controller.ts
import status9 from "http-status";

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/app/modules/attendance/attendance.service.ts
import status8 from "http-status";
var getAttendanceStudents = async (classId, date) => {
  const attendanceDate = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
  let isTaken = false;
  const existingClass = await prisma.class.findFirst({
    where: {
      id: classId,
      isDeleted: false
    },
    select: {
      id: true,
      name: true
    }
  });
  if (!existingClass) {
    throw new AppError_default(status8.NOT_FOUND, "Class not found");
  }
  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: {
      classId_date: {
        classId,
        date: attendanceDate
      }
    },
    select: {
      id: true
    }
  });
  isTaken = !!attendanceSession;
  const sessions = await prisma.attendanceSession.findMany({
    where: {
      classId
    },
    select: {
      id: true,
      classId: true,
      date: true
    }
  });
  console.log("ALL SESSIONS:", sessions);
  console.log("GET DATE:", attendanceDate.toISOString());
  const students = await prisma.student.findMany({
    where: {
      classId,
      isdeleted: false
    },
    select: {
      id: true,
      birthRegistrationNumber: true,
      fullName: true
    },
    orderBy: {
      studentId: "asc"
    }
  });
  let attendanceRecords = [];
  if (attendanceSession) {
    attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        sessionId: attendanceSession.id
      },
      select: {
        studentId: true,
        status: true
      }
    });
  }
  const attendanceMap = new Map(
    attendanceRecords.map((record) => [record.studentId, record.status])
  );
  const formattedStudents = students.map((student) => {
    const { birthRegistrationNumber, fullName, ...studentData } = student;
    return {
      ...studentData,
      studentId: birthRegistrationNumber,
      name: fullName,
      status: attendanceMap.get(student.id) ?? null
    };
  });
  return {
    date: date.split("-").reverse().join("/"),
    classId: existingClass.id,
    isTaken,
    students: formattedStudents
  };
};
var getEmployeeAttendance = async (payload) => {
  const { date } = payload;
  let isTaken = false;
  const attendanceDate = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
  const attendanceSession = await prisma.employeeAttendanceSession.findUnique(
    {
      where: {
        date: attendanceDate
      },
      select: {
        id: true
      }
    }
  );
  const employees = await prisma.employee.findMany({
    where: {
      isdeleted: false
    },
    select: {
      id: true,
      employeeId: true,
      fullName: true,
      employeeRole: true
    },
    orderBy: {
      employeeId: "asc"
    }
  });
  let attendanceRecords = [];
  if (attendanceSession) {
    attendanceRecords = await prisma.employeeAttendanceRecord.findMany({
      where: {
        sessionId: attendanceSession.id
      },
      select: {
        employeeId: true,
        status: true
      }
    });
  }
  isTaken = !!attendanceSession;
  const attendanceMap = new Map(
    attendanceRecords.map((record) => [record.employeeId, record.status])
  );
  const formattedEmployees = employees.map((employee) => ({
    ...employee,
    status: attendanceMap.get(employee.id) ?? null
  }));
  return {
    date: date.split("-").reverse().join("/"),
    isTaken,
    employees: formattedEmployees
  };
};
var saveAttendance = async (payload) => {
  const { classId, date, records } = payload;
  if (!records.length) {
    throw new AppError_default(
      status8.BAD_REQUEST,
      "Attendance records are required"
    );
  }
  console.log("orgianl date: ", date);
  const attendanceDate = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
  console.log("date:", attendanceDate);
  const existingClass = await prisma.class.findFirst({
    where: {
      id: classId,
      isDeleted: false
    },
    select: {
      id: true
    }
  });
  if (!existingClass) {
    throw new AppError_default(status8.NOT_FOUND, "Class not found");
  }
  const students = await prisma.student.findMany({
    where: {
      classId,
      isdeleted: false
    },
    select: {
      id: true
    }
  });
  const studentIds = new Set(students.map((student) => student.id));
  const invalidStudents = records.filter(
    (record) => !studentIds.has(record.studentId)
  );
  if (invalidStudents.length > 0) {
    throw new AppError_default(
      status8.BAD_REQUEST,
      "One or more students do not belong to this class"
    );
  }
  const uniqueStudentIds = new Set(records.map((record) => record.studentId));
  if (uniqueStudentIds.size !== records.length) {
    throw new AppError_default(
      status8.BAD_REQUEST,
      "Duplicate student attendance records are not allowed"
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    const existingSession = await tx.attendanceSession.findUnique({
      where: {
        classId_date: {
          classId,
          date: attendanceDate
        }
      },
      select: {
        id: true
      }
    });
    if (!existingSession) {
      return tx.attendanceSession.create({
        data: {
          classId,
          date: attendanceDate,
          records: {
            create: records.map((record) => ({
              studentId: record.studentId,
              status: record.status
            }))
          }
        },
        include: {
          records: {
            select: {
              id: true,
              studentId: true,
              status: true
            }
          }
        }
      });
    }
    await tx.attendanceRecord.deleteMany({
      where: {
        sessionId: existingSession.id
      }
    });
    return tx.attendanceSession.update({
      where: {
        id: existingSession.id
      },
      data: {
        records: {
          create: records.map((record) => ({
            studentId: record.studentId,
            status: record.status
          }))
        }
      },
      include: {
        records: {
          select: {
            id: true,
            studentId: true,
            status: true
          }
        }
      }
    });
  });
  return result;
};
var saveEmployeeAttendance = async (payload) => {
  const { date, records } = payload;
  const attendanceDate = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
  const employees = await prisma.employee.findMany({
    where: {
      isdeleted: false
    },
    select: {
      id: true
    }
  });
  const employeeIds = new Set(employees.map((employee) => employee.id));
  const invalidEmployees = records.filter(
    (record) => !employeeIds.has(record.employeeId)
  );
  if (invalidEmployees.length > 0) {
    throw new AppError_default(
      status8.BAD_REQUEST,
      "One or more employees do not exist or are inactive"
    );
  }
  const uniqueEmployeeIds = new Set(
    records.map((record) => record.employeeId)
  );
  if (uniqueEmployeeIds.size !== records.length) {
    throw new AppError_default(
      status8.BAD_REQUEST,
      "Duplicate employee attendance records are not allowed"
    );
  }
  const result = await prisma.$transaction(async (tx) => {
    const existingSession = await tx.employeeAttendanceSession.findUnique({
      where: {
        date: attendanceDate
      },
      select: {
        id: true
      }
    });
    if (!existingSession) {
      return tx.employeeAttendanceSession.create({
        data: {
          date: attendanceDate,
          records: {
            create: records.map((record) => ({
              employeeId: record.employeeId,
              status: record.status
            }))
          }
        },
        include: {
          records: {
            select: {
              id: true,
              employeeId: true,
              status: true
            }
          }
        }
      });
    }
    await tx.employeeAttendanceRecord.deleteMany({
      where: {
        sessionId: existingSession.id
      }
    });
    return tx.employeeAttendanceSession.update({
      where: {
        id: existingSession.id
      },
      data: {
        records: {
          create: records.map((record) => ({
            employeeId: record.employeeId,
            status: record.status
          }))
        }
      },
      include: {
        records: {
          select: {
            id: true,
            employeeId: true,
            status: true
          }
        }
      }
    });
  });
  return {
    ...result,
    date: date.split("-").reverse().join("/")
  };
};
var AttendanceService = {
  getEmployeeAttendance,
  getAttendanceStudents,
  saveAttendance,
  saveEmployeeAttendance
};

// src/app/modules/attendance/attendance.validation.ts
import { z as z2 } from "zod";
var getAttendanceStudentsSchema = z2.object({
  classId: z2.string().trim().min(1, "Class ID is required"),
  date: z2.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format").refine((value) => {
    const [day, month, year] = value.split("/").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    return parsedDate.getUTCFullYear() === year && parsedDate.getUTCMonth() === month - 1 && parsedDate.getUTCDate() === day;
  }, "Invalid date").transform((value) => {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  })
});
var createAttendanceSchema = z2.object({
  classId: z2.string().min(1, "Class ID is required"),
  date: z2.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format").refine((value) => {
    const [day, month, year] = value.split("/").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    return parsedDate.getUTCFullYear() === year && parsedDate.getUTCMonth() === month - 1 && parsedDate.getUTCDate() === day;
  }, "Invalid date").transform((value) => {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }),
  records: z2.array(
    z2.object({
      studentId: z2.string().min(1, "Student ID is required"),
      status: z2.enum(AttendanceStatus)
    })
  ).min(1, "At least one attendance record is required")
});
var saveEmployeeAttendanceSchema = z2.object({
  date: z2.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format").refine((value) => {
    const [day, month, year] = value.split("/").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    return parsedDate.getUTCFullYear() === year && parsedDate.getUTCMonth() === month - 1 && parsedDate.getUTCDate() === day;
  }, "Invalid date").transform((value) => {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }),
  records: z2.array(
    z2.object({
      employeeId: z2.string().trim().min(1, "Employee ID is required"),
      status: z2.nativeEnum(EmployeeAttendanceStatus)
    })
  ).min(1, "Attendance records are required")
});
var getEmployeeAttendanceSchema = z2.object({
  date: z2.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format").refine((value) => {
    const [day, month, year] = value.split("/").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    return parsedDate.getUTCFullYear() === year && parsedDate.getUTCMonth() === month - 1 && parsedDate.getUTCDate() === day;
  }, "Invalid date").transform((value) => {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  })
});

// src/app/modules/attendance/attendance.controller.ts
var getAttendanceStudents2 = catchAsync(
  async (req, res) => {
    const { classId, date } = getAttendanceStudentsSchema.parse(req.query);
    const result = await AttendanceService.getAttendanceStudents(
      classId,
      date
    );
    sendResponse(res, {
      httpStatusCode: status9.OK,
      success: true,
      message: "Students with Attendance Fetched successfully",
      data: result
    });
  }
);
var getEmployeeAttendance2 = catchAsync(async (req, res) => {
  const validatedQuery = getEmployeeAttendanceSchema.parse(req.query);
  const result = await AttendanceService.getEmployeeAttendance(validatedQuery);
  sendResponse(res, {
    success: true,
    httpStatusCode: status9.OK,
    message: "Employee attendance retrieved successfully",
    data: result
  });
});
var saveAttendance2 = catchAsync(async (req, res) => {
  const payload = createAttendanceSchema.parse(req.body);
  const result = await AttendanceService.saveAttendance(payload);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Attendance Created successfully",
    data: result
  });
});
var saveEmployeeAttendance2 = catchAsync(async (req, res) => {
  const validatedData = saveEmployeeAttendanceSchema.parse(req.body);
  const result = await AttendanceService.saveEmployeeAttendance(validatedData);
  sendResponse(res, {
    success: true,
    httpStatusCode: status9.CREATED,
    message: "Employee attendance saved successfully",
    data: result
  });
});
var AttendanceController = {
  getAttendanceStudents: getAttendanceStudents2,
  getEmployeeAttendance: getEmployeeAttendance2,
  saveAttendance: saveAttendance2,
  saveEmployeeAttendance: saveEmployeeAttendance2
};

// src/app/modules/attendance/attendance.routes.ts
var router = Router();
router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AttendanceController.getAttendanceStudents
);
router.get(
  "/employee",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AttendanceController.getEmployeeAttendance
);
router.patch(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AttendanceController.saveAttendance
);
router.patch(
  "/employee",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AttendanceController.saveEmployeeAttendance
);
var AttendanceRoutes = router;

// src/app/modules/auth/auth.routes.ts
import { Router as Router2 } from "express";

// src/app/modules/auth/auth.controller.ts
import status11 from "http-status";

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //7d
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    //1 day
    maxAge: 60 * 60 * 24 * 1e3
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/app/modules/auth/auth.service.ts
import status10 from "http-status";
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status10.FORBIDDEN, "User is blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status10.NOT_FOUND, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new AppError_default(status10.UNAUTHORIZED, "Invalid Session Token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var forgetPassword = async (email) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status10.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status10.BAD_REQUEST, "Email not verified!");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status10.NOT_FOUND, "User not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: { email }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email
    }
  });
  console.log("\u{1F680} User : ", isUserExist?.email + "\u{1F680}");
  if (!isUserExist) {
    throw new AppError_default(status10.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status10.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status10.NOT_FOUND, "User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword
    }
  });
  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  await prisma.session.deleteMany({
    where: {
      userId: isUserExist.id
    }
  });
};
var AuthService = {
  loginUser,
  changePassword,
  forgetPassword,
  resetPassword
};

// src/app/modules/auth/auth.controller.ts
var loginUser2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthService.loginUser(payload);
  const { accessToken, refreshToken, token, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "User Logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest
    }
  });
});
var changePassword2 = catchAsync(async (req, res) => {
  const payload = req.body;
  const betterAuthSessionToken = req.cookies["__Secure-better-auth.session_token"] || req.cookies["better-auth.session_token"] || req.headers["x-session-token"] || // ✅ mobile sends this
  payload.sessionToken || // ✅ or in body
  null;
  if (!betterAuthSessionToken) {
    throw new AppError_default(status11.UNAUTHORIZED, "No session token found");
  }
  const { sessionToken: _, ...cleanPayload } = payload;
  const result = await AuthService.changePassword(
    cleanPayload,
    betterAuthSessionToken
  );
  const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Password changed successfully",
    data: result
  });
});
var forgetPassword2 = catchAsync(async (req, res) => {
  const { email } = req.body;
  await AuthService.forgetPassword(email);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Passwrd reset OTP sent to email successfully"
  });
});
var resetPassword2 = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Password reset successfully"
  });
});
var getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};
var AuthController = {
  loginUser: loginUser2,
  changePassword: changePassword2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  getMe
};

// src/app/modules/auth/auth.routes.ts
var router2 = Router2();
router2.post("/login", AuthController.loginUser);
router2.post(
  "/change-password",
  checkAuth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTANT,
    UserRole.LIBRARIAN,
    UserRole.STUDENT,
    UserRole.TEACHER
  ),
  AuthController.changePassword
);
router2.post("/forget-password", AuthController.forgetPassword);
router2.post("/reset-password", AuthController.resetPassword);
router2.get(
  "/me",
  checkAuth(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.ACCOUNTANT,
    UserRole.LIBRARIAN,
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.OTHER
  ),
  getMe
);
var AuthRoutes = router2;

// src/app/modules/classes/classes.routes.ts
import { Router as Router3 } from "express";

// src/app/modules/classes/classes.controller.ts
import status13 from "http-status";

// src/app/modules/classes/classes.services.ts
import status12 from "http-status";

// src/app/utils/QueryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config2 = {}) {
    __publicField(this, "model", model);
    __publicField(this, "queryParams", queryParams);
    __publicField(this, "config", config2);
    __publicField(this, "query");
    __publicField(this, "countQuery");
    __publicField(this, "page", 1);
    __publicField(this, "limit", 10);
    __publicField(this, "skip", 0);
    __publicField(this, "sortBy", "createdAt");
    __publicField(this, "sortOrder", "desc");
    __publicField(this, "selectFields");
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map((field) => {
        if (field.includes(".")) {
          const parts = field.split(".");
          if (parts.length === 2) {
            const [relation, nestedField] = parts;
            const stringFilter2 = relation === "user" && nestedField === "email" ? {
              startsWith: searchTerm,
              mode: "insensitive"
            } : {
              contains: searchTerm,
              mode: "insensitive"
            };
            return {
              [relation]: {
                [nestedField]: stringFilter2
              }
            };
          } else if (parts.length === 3) {
            const [relation, nestedRelation, nestedField] = parts;
            const stringFilter2 = {
              contains: searchTerm,
              mode: "insensitive"
            };
            return {
              [relation]: {
                some: {
                  [nestedRelation]: {
                    [nestedField]: stringFilter2
                  }
                }
              }
            };
          }
        }
        const stringFilter = {
          contains: searchTerm,
          mode: "insensitive"
        };
        return {
          [field]: stringFilter
        };
      });
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  // /doctors?searchTerm=john&page=1&sortBy=name&specialty=cardiology&appointmentFee[lt]=100 => {}
  // { specialty: 'cardiology', appointmentFee: { lt: '100' } }
  filter() {
    const { filterableFields } = this.config;
    const excludedField = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "include"
    ];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") {
        return;
      }
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {
              some: {}
            };
            countQueryWhere[relation] = {
              some: {}
            };
          }
          const queryRelation = queryWhere[relation];
          const countRelation = countQueryWhere[relation];
          if (!queryRelation.some) {
            queryRelation.some = {};
          }
          if (!countRelation.some) {
            countRelation.some = {};
          }
          const querySome = queryRelation.some;
          const countSome = countRelation.some;
          if (!querySome[nestedRelation]) {
            querySome[nestedRelation] = {};
          }
          if (!countSome[nestedRelation]) {
            countSome[nestedRelation] = {};
          }
          const queryNestedRelation = querySome[nestedRelation];
          const countNestedRelation = countSome[nestedRelation];
          queryNestedRelation[nestedField] = this.parseFilterValue(value);
          countNestedRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(
          value
        );
        countQueryWhere[key] = this.parseRangeFilter(
          value
        );
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [relation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedField]: sortOrder
          }
        };
      } else if (parts.length === 3) {
        const [relation, nestedRelation, nestedField] = parts;
        this.query.orderBy = {
          [relation]: {
            [nestedRelation]: {
              [nestedField]: sortOrder
            }
          }
        };
      } else {
        this.query.orderBy = {
          [sortBy]: sortOrder
        };
      }
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder
      };
    }
    return this;
  }
  // fields(): this {
  //     const fieldsParam = this.queryParams.fields;
  //     // /doctors?fields=id,name,user => select: { id: true, name: true, user: { select: { name: true } } }
  //     //no nested field selection for now, only direct fields
  //     if (fieldsParam && typeof fieldsParam === "string") {
  //         const fieldsArray = fieldsParam
  //             ?.split(",")
  //             .map((field) => field.trim());
  //         this.selectFields = {};
  //         fieldsArray?.forEach((field) => {
  //             if (this.selectFields) {
  //                 this.selectFields[field] = true;
  //             }
  //         });
  //         this.query.select = this.selectFields as Record<
  //             string,
  //             boolean | Record<string, unknown>
  //         >;
  //         delete this.query.include;
  //     }
  //     return this;
  // }
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam.split(",").map((field) => field.trim()).filter(Boolean);
      const select = {};
      fieldsArray.forEach((field) => {
        const parts = field.split(".");
        if (parts.length === 1) {
          select[field] = true;
          return;
        }
        let current = select;
        parts.forEach((part, index) => {
          if (index === parts.length - 1) {
            current[part] = true;
          } else {
            if (!current[part]) {
              current[part] = {
                select: {}
              };
            }
            current = current[part].select;
          }
        });
      });
      this.selectFields = select;
      this.query.select = select;
      delete this.query.include;
      return this;
    }
    if (this.config.defaultSelect) {
      this.query.select = this.config.defaultSelect;
      delete this.query.include;
    }
    return this;
  }
  include(relation) {
    if (this.selectFields) {
      return this;
    }
    this.query.include = {
      ...this.query.include,
      ...relation
    };
    return this;
  }
  dynamicInclude(includeConfig, defaultInclude) {
    if (this.selectFields) {
      return this;
    }
    const result = {};
    defaultInclude?.forEach((field) => {
      if (includeConfig[field]) {
        result[field] = includeConfig[field];
      }
    });
    const includeParam = this.queryParams.include;
    if (includeParam && typeof includeParam === "string") {
      const requestedRelations = includeParam.split(",").map((relation) => relation.trim());
      requestedRelations.forEach((relation) => {
        if (includeConfig[relation]) {
          result[relation] = includeConfig[relation];
        }
      });
    }
    this.query.include = {
      ...this.query.include,
      ...result
    };
    return this;
  }
  where(condition) {
    this.query.where = this.deepMerge(
      this.query.where,
      condition
    );
    this.countQuery.where = this.deepMerge(
      this.countQuery.where,
      condition
    );
    return this;
  }
  select(select) {
    this.query.select = select;
    delete this.query.include;
    return this;
  }
  async execute() {
    const [total, data] = await Promise.all([
      this.model.count(
        this.countQuery
      ),
      this.model.findMany(
        this.query
      )
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages
      }
    };
  }
  async count() {
    return await this.model.count(
      this.countQuery
    );
  }
  getQuery() {
    return this.query;
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(
            result[key],
            source[key]
          );
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    if (typeof value === "string" && !isNaN(Number(value)) && value != "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      if (operatorValue === void 0) {
        return;
      }
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/app/modules/classes/classes.services.ts
var getAllTeachers = async () => {
  const teachers = await prisma.employee.findMany({
    where: {
      isdeleted: false,
      user: {
        role: {
          in: ["TEACHER", "PRINCIPAL"]
        }
      }
    },
    select: {
      id: true,
      fullName: true,
      employeeId: true
    }
  });
  const formattedTeachers = teachers.map((teacher) => ({
    label: `${teacher.fullName} [${teacher.employeeId}]`,
    value: teacher.id
  }));
  return formattedTeachers;
};
var getAllClass = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.class, query);
  const result = await queryBuilder.where({
    isDeleted: false
  }).select({
    id: true,
    name: true
  }).paginate().sort().execute();
  const classIds = result.data.map((classItem) => classItem.id);
  const studentCounts = await prisma.student.groupBy({
    by: ["classId", "gender"],
    where: {
      classId: {
        in: classIds
      },
      isdeleted: false
    },
    _count: {
      _all: true
    }
  });
  const data = result.data.map((classItem) => {
    const counts = studentCounts.filter(
      (item) => item.classId === classItem.id
    );
    const totalStudents = counts.reduce(
      (total, item) => total + item._count._all,
      0
    );
    const boys = counts.find((item) => item.gender === Gender.MALE)?._count._all ?? 0;
    const girls = counts.find((item) => item.gender === Gender.FEMALE)?._count._all ?? 0;
    return {
      ...classItem,
      totalStudents,
      boys,
      girls
    };
  });
  return {
    data,
    meta: result.meta
  };
};
var getAllClassForUpdate = async () => {
  const classes = await prisma.class.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true
    }
  });
  const data = classes.map((classItem) => {
    return {
      label: classItem.name,
      value: classItem.id
    };
  });
  return data;
};
var getSingleClass = async (id) => {
  const result = await prisma.class.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      monthlyTuitionFee: true,
      classTeacher: true
    }
  });
  const formattedResult = {
    id: result?.id,
    className: result?.name,
    tuitionFee: result?.monthlyTuitionFee,
    classTeacher: result?.classTeacher
  };
  return formattedResult;
};
var createClass = async (payload) => {
  const newClass = await prisma.class.create({
    data: {
      name: payload.className,
      monthlyTuitionFee: payload.tuitionFee,
      classTeacher: payload.classTeacher
    },
    include: {
      employee: true
    }
  });
  return {
    ...newClass,
    totalStudents: 0,
    boys: 0,
    girls: 0
  };
};
var updateClass = async (id, payload) => {
  const existingClass = await prisma.class.findUnique({
    where: {
      id
    }
  });
  console.log(existingClass);
  if (!existingClass) {
    throw new AppError_default(status12.NOT_FOUND, "Class not found");
  }
  if (payload.classTeacher !== void 0) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: payload.classTeacher,
        isdeleted: false
      }
    });
    if (!employee) {
      throw new AppError_default(status12.NOT_FOUND, "Class teacher not found");
    }
  }
  const updateClass2 = await prisma.class.update({
    where: { id },
    data: {
      ...payload.className !== void 0 && {
        name: payload.className
      },
      ...payload.tuitionFee !== void 0 && {
        monthlyTuitionFee: payload.tuitionFee
      },
      ...payload.classTeacher !== void 0 && {
        classTeacher: payload.classTeacher
      }
    },
    include: {
      employee: true
    }
  });
  return {
    ...updateClass2,
    totalStudents: 0,
    boys: 0,
    girls: 0
  };
};
var deleteClass = async (id) => {
  const result = await prisma.class.update({
    where: { id },
    data: {
      isDeleted: true
    }
  });
  return result;
};
var ClassesService = {
  getAllTeachers,
  getAllClass,
  getSingleClass,
  getAllClassForUpdate,
  createClass,
  updateClass,
  deleteClass
};

// src/app/modules/classes/classes.validation.ts
import z3 from "zod";
var createClassSchema = z3.object({
  className: z3.string({ error: "Class Name is required" }).min(1, "Class Name can't be empty"),
  classTeacher: z3.string({ error: "Class Teacher is required" }).min(1, "Class Teacher can't be empty"),
  tuitionFee: z3.coerce.number({ error: "Tuition Fee is required" }).min(0, "Tuition Fee cannot be negative")
});
var updateClassSchema = z3.object({
  className: z3.string().min(1, "Class Name can't be empty").optional(),
  classTeacher: z3.string().min(1, "Class Teacher can't be empty").optional(),
  tuitionFee: z3.coerce.number().min(0, "Tuition Fee cannot be negative").optional()
});

// src/app/modules/classes/classes.controller.ts
var getAllTeachers2 = async (req, res) => {
  const result = await ClassesService.getAllTeachers();
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Teachers fetched successfully",
    data: result
  });
};
var getAllClass2 = async (req, res) => {
  const query = req.query;
  const result = await ClassesService.getAllClass(query);
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Classes fetched successfully",
    data: result.data,
    meta: result.meta
  });
};
var getAllClassForUpdate2 = async (req, res) => {
  const result = await ClassesService.getAllClassForUpdate();
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Class for update fetched successfully",
    data: result
  });
};
var getSingleClass2 = async (req, res) => {
  const { id } = req.params;
  const result = await ClassesService.getSingleClass(id);
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Class fetched Successfully",
    data: result
  });
};
var createClass2 = async (req, res) => {
  const payload = createClassSchema.parse(req.body);
  const createdClass = await ClassesService.createClass(payload);
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Class Created Successfully",
    data: createdClass
  });
};
var udpateClass = async (req, res) => {
  const { id } = req.params;
  const payload = updateClassSchema.parse(req.body);
  const updatedClass = await ClassesService.updateClass(
    id,
    payload
  );
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Class Updated Succssfully",
    data: updatedClass
  });
};
var deleteClass2 = async (req, res) => {
  const { id } = req.params;
  const deletedClass = await ClassesService.deleteClass(id);
  sendResponse(res, {
    httpStatusCode: status13.OK,
    success: true,
    message: "Class Deleted Successfully",
    data: deletedClass
  });
};
var ClassesController = {
  getAllTeachers: getAllTeachers2,
  getAllClass: getAllClass2,
  getSingleClass: getSingleClass2,
  getAllClassForUpdate: getAllClassForUpdate2,
  createClass: createClass2,
  udpateClass,
  deleteClass: deleteClass2
};

// src/app/modules/classes/classes.routes.ts
var router3 = Router3();
router3.get(
  "/teachers",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.getAllTeachers
);
router3.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.getAllClass
);
router3.get(
  "/classes-for-update",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.getAllClassForUpdate
);
router3.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.getSingleClass
);
router3.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.createClass
);
router3.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.udpateClass
);
router3.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.deleteClass
);
var ClassesRoutes = router3;

// src/app/modules/employees/employees.routes.ts
import { Router as Router4 } from "express";

// src/app/middleware/upload.ts
import multer from "multer";
var upload = multer({
  storage: multer.memoryStorage()
});

// src/app/modules/employees/employees.controller.ts
import status15 from "http-status";

// src/app/modules/employees/employees.validation.ts
import { z as z4 } from "zod";
var presentAddressSchema = z4.object({
  village: z4.string({ error: "Present address village is required" }).min(1, { error: "Present address village cannot be empty" }),
  postOffice: z4.string({ error: "Present address post office is required" }).min(1, { error: "Present address post office cannot be empty" }),
  postCode: z4.string({ error: "Present address post code is required" }).min(1, { error: "Present address post code cannot be empty" }),
  district: z4.string({ error: "Present address district is required" }).min(1, { error: "Present address district cannot be empty" })
});
var permanentAddressSchema = z4.object({
  village: z4.string({ error: "Permanent address village is required" }).min(1, { error: "Permanent address village cannot be empty" }),
  postOffice: z4.string({ error: "Permanent address post office is required" }).min(1, { error: "Permanent address post office cannot be empty" }),
  postCode: z4.string({ error: "Permanent address post code is required" }).min(1, { error: "Permanent address post code cannot be empty" }),
  district: z4.string({ error: "Permanent address district is required" }).min(1, { error: "Permanent address district cannot be empty" })
});
var createEmployeeSchema = z4.object({
  fullName: z4.string({ error: "Full name is required" }).min(1, { error: "Full name cannot be empty" }),
  fatherName: z4.string({ error: "Father's name is required" }).min(1, { error: "Father's name cannot be empty" }),
  motherName: z4.string({ error: "Mother's name is required" }).min(1, { error: "Mother's name cannot be empty" }),
  phone: z4.string({ error: "Phone number is required" }).min(11, { error: "Phone number must be at least 11 digits" }),
  gender: z4.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }),
  bloodGroup: z4.enum(BloodGroup, {
    error: "Blood group must be one of: " + Object.values(BloodGroup).join(", ")
  }),
  religion: z4.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }),
  employeeRole: z4.enum(UserRole, {
    error: "Employee role must be one of: " + Object.values(UserRole).join(", ")
  }),
  emergencyContact: z4.string().min(11, { error: "Emergency contact must be at least 11 digits" }).optional(),
  dateOfJoining: z4.string().min(1, { error: "Date of joining is required" }),
  monthlySalary: z4.coerce.number({
    error: "Monthly salary must be a valid number"
  }),
  email: z4.email({ error: "Please provide a valid email address" }),
  nid: z4.string({ error: "NID is required" }).min(1, { error: "NID cannot be empty" }),
  birthRegistrationNumber: z4.string().optional(),
  address: z4.object({
    present: presentAddressSchema,
    permanent: permanentAddressSchema
  })
});
var updateEmployeeSchema = z4.object({
  fullName: z4.string().optional(),
  fatherName: z4.string().optional(),
  motherName: z4.string().optional(),
  phone: z4.string().optional(),
  gender: z4.enum(Gender).optional(),
  bloodGroup: z4.enum(BloodGroup).optional(),
  religion: z4.enum(Religion).optional(),
  employeeRole: z4.enum(UserRole).optional(),
  emergencyContact: z4.string().optional(),
  monthlySalary: z4.coerce.number().optional(),
  dateOfJoining: z4.string().optional(),
  nid: z4.string().optional(),
  address: z4.object({
    present: presentAddressSchema.partial().optional(),
    permanent: permanentAddressSchema.partial().optional()
  }).optional()
});

// src/app/modules/employees/employess.service.ts
import status14 from "http-status";

// src/services/cloudinary/cloudinary.service.ts
import streamifier from "streamifier";

// src/app/config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
var cloudinary_default = cloudinary;

// src/services/cloudinary/cloudinary.service.ts
var CloudinaryService = class {
  async upload(file, options = {}) {
    const uploadOptions = {
      resource_type: options.resourceType ?? "image"
    };
    if (options.folder) {
      uploadOptions.folder = options.folder;
    }
    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }
    if (options.overwrite !== void 0) {
      uploadOptions.overwrite = options.overwrite;
    }
    return new Promise((resolve, reject) => {
      const stream = cloudinary_default.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error("Cloudinary upload failed."));
          }
          resolve(result);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  }
  async delete(publicId) {
    return cloudinary_default.uploader.destroy(publicId);
  }
};
var cloudinary_service_default = new CloudinaryService();

// src/app/config/cloudinary.folders.ts
var ROOT = "school-management-system";
var CloudinaryFolders = {
  employee: {
    profile: `${ROOT}/employees/profile`,
    authoritySign: `${ROOT}/employees/AuthoritySign`,
    employeeSign: `${ROOT}/employees/EmoloyeeSign`,
    experience: `${ROOT}/employees/Experience`
  },
  student: {
    profile: `${ROOT}/students/profile`,
    studentSign: `${ROOT}/students/studentSign`,
    guardianSign: `${ROOT}/students/guardianSign`,
    authoritySign: `${ROOT}/students/AuthoritySign`
  },
  general: {
    instituteLogo: `${ROOT}/general/instituteLogo`,
    bankLogo: `${ROOT}/general/bankLogo`,
    authoritySign: `${ROOT}/general/authoritySign`
  }
  // add more as your project grows
};

// src/app/modules/employees/employees.constant.ts
var employeeSearchableFields = [
  "fullName",
  "user.email",
  "employeeId"
];
var employeeFilterableFields = ["user.role"];

// src/app/modules/employees/employees.mapper.ts
var formatEmployeeResponse = (employee) => {
  const address = employee.address;
  return {
    ...employee,
    picture: {
      uri: employee.picture,
      name: employee.pictureName,
      type: employee.pictureType
    },
    experience: {
      uri: employee.experience,
      name: employee.experienceName,
      type: employee.experienceType
    },
    authoritySign: {
      uri: employee.authoritySign,
      name: employee.authoritySignName,
      type: employee.authoritySignType
    },
    employeeSign: {
      uri: employee.employeeSign,
      name: employee.employeeSignName,
      type: employee.employeeSignType
    },
    address: address ? {
      present: {
        village: address.presentAddressVillage,
        postOffice: address.presentAddressPostOffice,
        postCode: address.presentAddressPostCode,
        district: address.presentAddressDistrict
      },
      permanent: {
        village: address.permanentAddressVillage,
        postOffice: address.permanentAddressPostOffice,
        postCode: address.permanentAddressPostCode,
        district: address.permanentAddressDistrict
      }
    } : null
  };
};

// src/app/modules/employees/employess.service.ts
var getAllEmployees = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.employee, query, {
    searchableFields: employeeSearchableFields,
    filterableFields: employeeFilterableFields
  });
  const result = await queryBuilder.search().filter().where({ isdeleted: false }).select({
    id: true,
    fullName: true,
    picture: true,
    gender: true,
    user: {
      select: {
        email: true,
        role: true
      }
    }
  }).paginate().sort().execute();
  const data = result.data;
  return {
    ...result,
    data: data.map(({ user, ...employee }) => ({
      ...employee,
      email: user.email,
      role: user.role
    }))
  };
};
var getEmployeeById = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: {
      id,
      isdeleted: false
    },
    include: {
      user: true,
      address: true
    }
  });
  if (!employee || employee.isdeleted) {
    throw new AppError_default(status14.NOT_FOUND, "Employee not found");
  }
  return employee;
};
var getEmployeeByIdForUpdate = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: {
      id,
      isdeleted: false
    },
    select: {
      fullName: true,
      fatherName: true,
      motherName: true,
      gender: true,
      bloodGroup: true,
      religion: true,
      employeeRole: true,
      emergencyContact: true,
      monthlySalary: true,
      dateOfJoining: true,
      phone: true,
      nid: true,
      address: {
        select: {
          presentAddressVillage: true,
          presentAddressPostOffice: true,
          presentAddressPostCode: true,
          presentAddressDistrict: true,
          permanentAddressVillage: true,
          permanentAddressPostOffice: true,
          permanentAddressPostCode: true,
          permanentAddressDistrict: true
        }
      },
      picture: true,
      pictureName: true,
      pictureType: true,
      authoritySign: true,
      authoritySignName: true,
      authoritySignType: true,
      employeeSign: true,
      employeeSignName: true,
      employeeSignType: true,
      experience: true,
      experienceName: true,
      experienceType: true,
      user: {
        select: {
          email: true
        }
      }
    }
  });
  if (!employee) {
    throw new AppError_default(status14.NOT_FOUND, "Employee Not found");
  }
  if (!employee?.address) {
    throw new AppError_default(status14.NOT_FOUND, "Employee address not found");
  }
  const {
    pictureName,
    pictureType,
    authoritySignName,
    authoritySignType,
    employeeSignName,
    employeeSignType,
    experienceName,
    experienceType,
    user: { email },
    ...employeeData
  } = employee;
  const formattedEmployee = {
    ...employeeData,
    picture: {
      uri: employee.picture,
      name: pictureName,
      type: pictureType
    },
    authoritySign: {
      uri: employee.authoritySign,
      name: authoritySignName,
      type: authoritySignType
    },
    employeeSign: {
      uri: employee.employeeSign,
      name: employeeSignName,
      type: employeeSignType
    },
    experience: employee.experience ? {
      uri: employee.experience,
      name: experienceName,
      type: experienceType
    } : null,
    address: {
      present: {
        village: employee.address.presentAddressVillage,
        postOffice: employee.address.presentAddressPostOffice,
        postCode: employee.address.presentAddressPostCode,
        district: employee.address.presentAddressDistrict
      },
      permanent: {
        village: employee.address.permanentAddressVillage,
        postOffice: employee.address.permanentAddressPostOffice,
        postCode: employee.address.permanentAddressPostCode,
        district: employee.address.permanentAddressDistrict
      }
    },
    email
  };
  return formattedEmployee;
};
var createEmployee = async (payload, files) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLocaleLowerCase() },
    select: { id: true }
  });
  if (existingUser) {
    throw new AppError_default(
      status14.CONFLICT,
      "An account with this email already exists"
    );
  }
  const pictureFile = files.picture?.[0];
  const authoritySignFile = files.authoritySign?.[0];
  const employeeSignFile = files.employeeSign?.[0];
  const experienceFile = files.experience?.[0];
  if (!authoritySignFile) {
    throw new AppError_default(400, "Missing Authority Sign Image");
  }
  if (!employeeSignFile) {
    throw new AppError_default(400, "Missing Employee Sign Image");
  }
  const [picture, authoritySign, employeeSign, experience] = await Promise.all([
    pictureFile ? cloudinary_service_default.upload(pictureFile, {
      folder: CloudinaryFolders.employee.profile
    }) : Promise.resolve(null),
    cloudinary_service_default.upload(authoritySignFile, {
      folder: CloudinaryFolders.employee.authoritySign
    }),
    cloudinary_service_default.upload(employeeSignFile, {
      folder: CloudinaryFolders.employee.employeeSign
    }),
    experienceFile ? cloudinary_service_default.upload(experienceFile, {
      folder: CloudinaryFolders.employee.experience
    }) : Promise.resolve(null)
  ]);
  const uploadedPublicIds = [
    picture?.public_id,
    authoritySign?.public_id,
    employeeSign?.public_id,
    experience?.public_id
  ].filter((id) => !!id);
  const tempPassword = "Temp@12345";
  let userId = null;
  try {
    const authUser = await auth.api.signUpEmail({
      body: {
        email: payload.email,
        password: tempPassword,
        role: payload.employeeRole,
        name: payload.fullName,
        image: picture?.secure_url,
        needPasswordChange: true
      }
    });
    userId = authUser.user.id;
    const employee = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          needPasswordChange: true
        }
      });
      const sequence = await tx.sequence.update({
        where: { id: "employee" },
        data: {
          current: {
            increment: 1
          }
        }
      });
      return await tx.employee.create({
        data: {
          userId,
          employeeId: sequence.current.toString(),
          phone: payload.phone,
          fullName: payload.fullName,
          picture: picture?.secure_url ?? null,
          picturePublicId: picture?.public_id ?? null,
          pictureName: pictureFile?.originalname ?? null,
          pictureType: pictureFile?.mimetype ?? null,
          employeeSign: employeeSign.secure_url,
          employeeSignPublicId: employeeSign.public_id,
          employeeSignName: employeeSignFile.originalname,
          employeeSignType: employeeSignFile.mimetype,
          nid: payload.nid,
          fatherName: payload.fatherName,
          motherName: payload.motherName,
          emergencyContact: payload.emergencyContact ?? null,
          monthlySalary: payload.monthlySalary,
          authoritySign: authoritySign.secure_url,
          authoritySignPublicId: authoritySign.public_id ?? null,
          authoritySignName: authoritySignFile.originalname,
          authoritySignType: authoritySignFile.mimetype,
          experience: experience?.secure_url ?? null,
          experiencePublicId: experience?.public_id ?? null,
          experienceName: experienceFile?.originalname ?? null,
          experienceType: experienceFile?.mimetype ?? null,
          gender: payload.gender,
          bloodGroup: payload.bloodGroup,
          religion: payload.religion,
          employeeRole: payload.employeeRole,
          dateOfJoining: payload.dateOfJoining,
          address: {
            create: {
              permanentAddressVillage: payload.address.permanent.village,
              permanentAddressPostOffice: payload.address.permanent.postOffice,
              permanentAddressPostCode: payload.address.permanent.postCode,
              permanentAddressDistrict: payload.address.permanent.district,
              presentAddressVillage: payload.address.present.village,
              presentAddressPostOffice: payload.address.present.postOffice,
              presentAddressPostCode: payload.address.present.postCode,
              presentAddressDistrict: payload.address.present.district
            }
          }
        },
        include: {
          user: true,
          address: true
        }
      });
    });
    return {
      employee: {
        ...formatEmployeeResponse(employee),
        picture: picture ? {
          uri: employee.picture,
          name: employee.pictureName,
          type: employee.pictureType
        } : void 0,
        experience: experience ? {
          uri: experience.secure_url,
          name: employee.experienceName,
          type: employee.experienceType
        } : null,
        authoritySign: {
          uri: authoritySign.secure_url,
          name: employee.authoritySignName,
          type: employee.authoritySignType
        },
        employeeSign: {
          uri: employeeSign,
          name: employee.employeeSignName,
          type: employee.employeeSignType
        }
      },
      credentials: {
        email: payload.email,
        password: tempPassword
      }
    };
  } catch (err) {
    console.log("Transaction error : ", err);
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch((delErr) => {
        console.log("Failed to rollback user:", delErr);
      });
    }
    await Promise.all(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId).catch((delErr) => {
          console.log(
            `Failed to rollback Cloudinary asset ${publicId}:`,
            delErr
          );
        })
      )
    );
    throw err;
  }
};
var updateEmployee = async (id, payload, files) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: true,
      address: true
    }
  });
  if (!employee) {
    throw new AppError_default(status14.NOT_FOUND, "Employee Not found");
  }
  const pictureFile = files.picture?.[0];
  const authoritySignFile = files.authoritySign?.[0];
  const employeeSignFile = files.employeeSign?.[0];
  const experienceFile = files.experience?.[0];
  const [picture, authoritySign, employeeSign, experience] = await Promise.all([
    pictureFile ? cloudinary_service_default.upload(pictureFile, {
      folder: CloudinaryFolders.employee.profile
    }) : Promise.resolve(null),
    authoritySignFile ? cloudinary_service_default.upload(authoritySignFile, {
      folder: CloudinaryFolders.employee.authoritySign
    }) : Promise.resolve(null),
    employeeSignFile ? cloudinary_service_default.upload(employeeSignFile, {
      folder: CloudinaryFolders.employee.employeeSign
    }) : Promise.resolve(null),
    experienceFile ? cloudinary_service_default.upload(experienceFile, {
      folder: CloudinaryFolders.employee.experience
    }) : Promise.resolve(null)
  ]);
  const uploadedPublicIds = [
    picture?.public_id,
    authoritySign?.public_id,
    employeeSign?.public_id,
    experience?.public_id
  ].filter((id2) => Boolean(id2));
  try {
    const updatedEmployee = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: employee.userId },
        data: {
          ...payload.fullName !== void 0 && {
            name: payload.fullName
          },
          ...payload.employeeRole !== void 0 && {
            role: payload.employeeRole
          },
          ...picture && {
            image: picture.secure_url
          }
        }
      });
      if (payload.address) {
        await tx.address.update({
          where: { employeeId: employee.id },
          data: {
            ...payload.address.permanent?.village !== void 0 && {
              permanentAddressVillage: payload.address.permanent.village
            },
            ...payload.address.permanent?.postOffice !== void 0 && {
              permanentAddressPostOffice: payload.address.permanent.postOffice
            },
            ...payload.address.permanent?.postCode !== void 0 && {
              permanentAddressPostCode: payload.address.permanent.postCode
            },
            ...payload.address.permanent?.district !== void 0 && {
              permanentAddressDistrict: payload.address.permanent.district
            },
            ...payload.address.present?.village !== void 0 && {
              presentAddressVillage: payload.address.present.village
            },
            ...payload.address.present?.postOffice !== void 0 && {
              presentAddressPostOffice: payload.address.present.postOffice
            },
            ...payload.address.present?.postCode !== void 0 && {
              presentAddressPostCode: payload.address.present.postCode
            },
            ...payload.address.present?.district !== void 0 && {
              presentAddressDistrict: payload.address.present.district
            }
          }
        });
      }
      return await tx.employee.update({
        where: {
          id
        },
        data: {
          ...payload.fullName !== void 0 && {
            fullName: payload.fullName
          },
          ...payload.phone !== void 0 && {
            phone: payload.phone
          },
          ...payload.fatherName !== void 0 && {
            fatherName: payload.fatherName
          },
          ...payload.motherName !== void 0 && {
            motherName: payload.motherName
          },
          ...payload.gender !== void 0 && {
            gender: payload.gender
          },
          ...payload.bloodGroup !== void 0 && {
            bloodGroup: payload.bloodGroup
          },
          ...payload.religion !== void 0 && {
            religion: payload.religion
          },
          ...payload.employeeRole !== void 0 && {
            employeeRole: payload.employeeRole
          },
          ...payload.monthlySalary !== void 0 && {
            monthlySalary: payload.monthlySalary
          },
          ...payload.nid !== void 0 && {
            nid: payload.nid
          },
          ...payload.dateOfJoining !== void 0 && {
            dateOfJoining: payload.dateOfJoining
          },
          ...payload.emergencyContact !== void 0 && {
            emergencyContact: payload.emergencyContact
          },
          ...picture && {
            picture: picture.secure_url,
            picturePublicId: picture.public_id,
            ...pictureFile !== void 0 && {
              pictureName: pictureFile.originalname,
              pictureType: pictureFile.mimetype
            }
          },
          ...authoritySign && {
            authoritySign: authoritySign.secure_url,
            authoritySignPublicId: authoritySign.public_id,
            ...authoritySignFile !== void 0 && {
              authoritySignName: authoritySignFile.originalname,
              authoritySignType: authoritySignFile.mimetype
            }
          },
          ...employeeSign && {
            employeeSign: employeeSign.secure_url,
            employeeSignPublicId: employeeSign.public_id,
            ...employeeSignFile !== void 0 && {
              employeeSignName: employeeSignFile.originalname,
              employeeSignType: employeeSignFile.mimetype
            }
          },
          ...experience && {
            experience: experience.secure_url,
            experiencePublicId: experience.public_id,
            ...experienceFile !== void 0 && {
              experienceName: experienceFile.originalname,
              experienceType: experienceFile.mimetype
            }
          }
        },
        include: {
          user: true,
          address: true
        }
      });
    });
    await Promise.all([
      picture && employee.picturePublicId && cloudinary_service_default.delete(employee.picturePublicId),
      authoritySign && employee.authoritySignPublicId && cloudinary_service_default.delete(employee.authoritySignPublicId),
      employeeSign && employee.employeeSignPublicId && cloudinary_service_default.delete(employee.employeeSignPublicId),
      experience && employee.experiencePublicId && cloudinary_service_default.delete(employee.experiencePublicId)
    ]);
    return formatEmployeeResponse(updatedEmployee);
  } catch (error) {
    await Promise.all(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId).catch(() => {
        })
      )
    );
    throw error;
  }
};
var deleteEmployee = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      picturePublicId: true,
      authoritySignPublicId: true,
      employeeSignPublicId: true,
      experiencePublicId: true
    }
  });
  if (!employee) {
    throw new AppError_default(status14.NOT_FOUND, "Employee Not found");
  }
  await prisma.$transaction(async (tx) => {
    await tx.employee.update({
      where: { id },
      data: {
        isdeleted: true,
        deletedAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.user.update({
      where: { id: employee.userId },
      data: {
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date(),
        status: UserStatus.DELETED
      }
    });
    await tx.session.deleteMany({
      where: { userId: employee.userId }
    });
  });
  await Promise.allSettled([
    employee.picturePublicId ? cloudinary_service_default.delete(employee.picturePublicId) : Promise.resolve(),
    employee.authoritySignPublicId ? cloudinary_service_default.delete(employee.authoritySignPublicId) : Promise.resolve(),
    employee.employeeSignPublicId ? cloudinary_service_default.delete(employee.employeeSignPublicId) : Promise.resolve(),
    employee.experiencePublicId ? cloudinary_service_default.delete(employee.experiencePublicId) : Promise.resolve()
  ]);
  return { message: "Employee deleted successfully" };
};
var EmployeeService = {
  getAllEmployees,
  getEmployeeById,
  getEmployeeByIdForUpdate,
  createEmployee,
  updateEmployee,
  deleteEmployee
};

// src/app/modules/employees/employees.controller.ts
var getAllEmployees2 = async (req, res) => {
  const query = req.query;
  const result = await EmployeeService.getAllEmployees(query);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Employees fetched successfully",
    data: result.data,
    meta: result.meta
  });
};
var getEmployeeById2 = async (req, res) => {
  const { id } = req.params;
  const employee = await EmployeeService.getEmployeeById(id);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Employee fetched successfully",
    data: employee
  });
};
var getEmployeeByIdForUpdate2 = async (req, res) => {
  const { id } = req.params;
  const employee = await EmployeeService.getEmployeeByIdForUpdate(
    id
  );
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Employee For Update fetched successfully",
    data: employee
  });
};
var createEmployee2 = async (req, res) => {
  const payload = createEmployeeSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
  if (!files.picture?.length) {
    throw new AppError_default(400, "Picture is required");
  }
  if (!files.authoritySign?.length) {
    throw new AppError_default(400, "Authority Sign is required");
  }
  if (!files.employeeSign?.length) {
    throw new AppError_default(400, "Employee Sign is required");
  }
  const employee = await EmployeeService.createEmployee(payload, files);
  res.status(201).json({
    success: true,
    data: employee
  });
};
var updateEmployee2 = async (req, res) => {
  const { id } = req.params;
  const payload = req.body.data ? updateEmployeeSchema.parse(JSON.parse(req.body.data)) : {};
  const files = req.files;
  const employee = await EmployeeService.updateEmployee(
    id,
    payload,
    files
  );
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: "Employee Updated Successfully",
    data: employee
  });
};
var deleteEmployee2 = async (req, res) => {
  const { id } = req.params;
  const result = await EmployeeService.deleteEmployee(id);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: result.message || "Employee Deleted Successfully"
  });
};
var EmployeeController = {
  getAllEmployees: getAllEmployees2,
  getEmployeeById: getEmployeeById2,
  createEmployee: createEmployee2,
  updateEmployee: updateEmployee2,
  deleteEmployee: deleteEmployee2,
  getEmployeeByIdForUpdate: getEmployeeByIdForUpdate2
};

// src/app/modules/employees/employees.routes.ts
var router4 = Router4();
router4.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getAllEmployees
);
router4.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getEmployeeById
);
router4.get(
  "/:id/update",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getEmployeeByIdForUpdate
);
router4.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.fields([
    {
      name: "picture",
      maxCount: 1
    },
    {
      name: "authoritySign",
      maxCount: 1
    },
    {
      name: "employeeSign",
      maxCount: 1
    },
    {
      name: "experience",
      maxCount: 1
    }
  ]),
  EmployeeController.createEmployee
);
router4.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.fields([
    {
      name: "picture",
      maxCount: 1
    },
    {
      name: "authoritySign",
      maxCount: 1
    },
    {
      name: "employeeSign",
      maxCount: 1
    },
    {
      name: "experience",
      maxCount: 1
    }
  ]),
  EmployeeController.updateEmployee
);
router4.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.deleteEmployee
);
var EmployeeRoutes = router4;

// src/app/modules/general/general.routes.ts
import { Router as Router5 } from "express";

// src/app/modules/general/general.controller.ts
import status16 from "http-status";

// src/app/modules/general/general.constant.ts
var bankInfoSearchableFields = ["nameOfBank", "accountNumber"];

// src/app/modules/general/general.service.ts
var getGeneralSetting = async () => {
  const result = await prisma.generalSettings.findFirst({
    where: { isDeleted: false },
    select: {
      id: true,
      instituteName: true,
      institutePhoneNumber: true,
      instituteEmail: true,
      instituteWebsite: true,
      instituteAddress: true,
      instituteCountry: true,
      instituteLogo: true,
      instituteLogoPublicId: true,
      instituteLogoName: true,
      instituteLogoType: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!result) {
    throw new AppError_default(404, "General settings not found");
  }
  const {
    instituteLogo,
    instituteLogoPublicId,
    instituteLogoName,
    instituteLogoType,
    ...rest
  } = result;
  return {
    ...rest,
    instituteLogo: {
      instituteLogo,
      instituteLogoPublicId,
      instituteLogoName,
      instituteLogoType
    }
  };
};
var updateGeneralSetting = async (payload, files, id) => {
  const instituteLogoFile = files.instituteLogo?.[0];
  const instituteLogo = instituteLogoFile ? await cloudinary_service_default.upload(instituteLogoFile, {
    folder: CloudinaryFolders.general.instituteLogo
  }) : null;
  const uploadedPublicIds = instituteLogo?.public_id ? [instituteLogo.public_id] : [];
  try {
    const settingData = {
      ...payload.instituteName !== void 0 && {
        instituteName: payload.instituteName
      },
      ...payload.institutePhoneNumber !== void 0 && {
        institutePhoneNumber: payload.institutePhoneNumber
      },
      ...payload.instituteEmail !== void 0 && {
        instituteEmail: payload.instituteEmail
      },
      ...payload.instituteWebsite !== void 0 && {
        instituteWebsite: payload.instituteWebsite
      },
      ...payload.instituteAddress !== void 0 && {
        instituteAddress: payload.instituteAddress
      },
      ...payload.instituteCountry !== void 0 && {
        instituteCountry: payload.instituteCountry
      },
      ...instituteLogo && {
        instituteLogo: instituteLogo.secure_url,
        instituteLogoPublicId: instituteLogo.public_id,
        instituteLogoName: instituteLogoFile.originalname,
        instituteLogoType: instituteLogoFile.mimetype
      }
    };
    let result;
    if (id) {
      const existingSetting = await prisma.generalSettings.findFirst({
        where: {
          id,
          isDeleted: false
        },
        select: {
          instituteLogo: true,
          instituteLogoPublicId: true,
          instituteLogoName: true,
          instituteLogoType: true
        }
      });
      if (!existingSetting) {
        throw new AppError_default(404, "General settings not found");
      }
      result = await prisma.generalSettings.update({
        where: { id },
        data: settingData
      });
      if (instituteLogo && existingSetting.instituteLogoPublicId && existingSetting.instituteLogoPublicId !== instituteLogo.public_id) {
        await cloudinary_service_default.delete(
          existingSetting.instituteLogoPublicId
        );
      }
    } else {
      if (!instituteLogoFile) {
        throw new AppError_default(
          400,
          "Institute logo is required when creating general settings"
        );
      }
      const requiredFields = [
        { field: "instituteName", value: payload.instituteName },
        {
          field: "institutePhoneNumber",
          value: payload.institutePhoneNumber
        },
        { field: "instituteEmail", value: payload.instituteEmail },
        { field: "instituteAddress", value: payload.instituteAddress },
        { field: "instituteCountry", value: payload.instituteCountry }
      ];
      const missingFields = requiredFields.filter(({ value }) => value === void 0).map(({ field }) => field);
      if (missingFields.length > 0) {
        throw new AppError_default(
          400,
          `Missing required fields: ${missingFields.join(", ")}`
        );
      }
      result = await prisma.generalSettings.create({
        data: {
          ...settingData,
          instituteName: payload.instituteName,
          institutePhoneNumber: payload.institutePhoneNumber,
          instituteEmail: payload.instituteEmail,
          instituteAddress: payload.instituteAddress,
          instituteCountry: payload.instituteCountry
        }
      });
    }
    return result;
  } catch (error) {
    await Promise.all(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId)
      )
    );
    throw error;
  }
};
var updateStudentRulesRegulations = async (payload) => {
  if (!payload.studentRules || payload.studentRules.trim() === "") {
    throw new AppError_default(400, "Students rules & regulations are required");
  }
  const existingRules = await prisma.rulesRegulations.findFirst({
    where: { type: "STUDENT" }
  });
  if (existingRules) {
    return await prisma.rulesRegulations.update({
      where: { id: existingRules.id },
      data: { content: payload.studentRules }
    });
  } else {
    return await prisma.rulesRegulations.create({
      data: {
        content: payload.studentRules,
        type: "STUDENT"
      }
    });
  }
};
var updateEmployeeRulesRegulations = async (payload) => {
  if (!payload.employeeRules || payload.employeeRules.trim() === "") {
    throw new AppError_default(400, "Employees rules & regulations are required");
  }
  const existingRules = await prisma.rulesRegulations.findFirst({
    where: { type: "EMPLOYEE" }
  });
  if (existingRules) {
    return await prisma.rulesRegulations.update({
      where: { id: existingRules.id },
      data: { content: payload.employeeRules }
    });
  } else {
    return await prisma.rulesRegulations.create({
      data: {
        content: payload.employeeRules,
        type: "EMPLOYEE"
      }
    });
  }
};
var getAllBankInfo = async (query) => {
  const queryBuilder = new QueryBuilder(
    prisma.bankInfo,
    query,
    {
      searchableFields: bankInfoSearchableFields
    }
  );
  const result = await queryBuilder.search().where({ isDeleted: false }).paginate().sort().select({
    id: true,
    nameOfBank: true,
    // branchAddress: true,
    accountNumber: true,
    bankLogo: true,
    createdAt: true
  }).execute();
  return result;
};
var getBankInfoById = async (id) => {
  const result = await prisma.bankInfo.findFirst({
    where: {
      id,
      isDeleted: false
    },
    select: {
      id: true,
      nameOfBank: true,
      branchAddress: true,
      accountNumber: true,
      instruction: true,
      bankLogo: true,
      bankLogoName: true,
      bankLogoType: true,
      bankLogoPublicId: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!result) {
    throw new AppError_default(404, "Bank information not found");
  }
  const { bankLogo, bankLogoName, bankLogoType, bankLogoPublicId, ...rest } = result;
  return {
    ...rest,
    bankLogo: {
      bankLogo,
      bankLogoName,
      bankLogoType,
      bankLogoPublicId
    }
  };
};
var createbankInfo = async (payload, files) => {
  const { name, address, accountNumber, instruction } = payload;
  const bankLogoFile = files.bankLogo?.[0];
  if (!bankLogoFile) {
    throw new AppError_default(400, "Missing Bank Logo Image");
  }
  const bankLogo = bankLogoFile ? await cloudinary_service_default.upload(bankLogoFile, {
    folder: CloudinaryFolders.general.bankLogo
  }) : null;
  const uploadedPublicIds = bankLogo?.public_id ? [bankLogo.public_id] : [];
  if (!bankLogo) {
    throw new AppError_default(400, "Bank Logo upload failed!");
  }
  try {
    const result = prisma.bankInfo.create({
      data: {
        bankLogo: bankLogo.secure_url,
        bankLogoPublicId: bankLogo.public_id,
        bankLogoName: bankLogo.original_filename,
        bankLogoType: bankLogoFile.mimetype,
        nameOfBank: name,
        branchAddress: address,
        accountNumber,
        ...instruction && { instruction }
      }
    });
    return result;
  } catch (error) {
    await Promise.all(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId)
      )
    );
    throw error;
  }
};
var updateBankInfo = async (id, payload, files) => {
  const { name, address, accountNumber, instruction } = payload;
  const existingBankInfo = await prisma.bankInfo.findUnique({
    where: {
      id
    }
  });
  if (!existingBankInfo) {
    throw new AppError_default(404, "Bank information not found");
  }
  const bankLogoFile = files?.bankLogo?.[0];
  const bankLogo = bankLogoFile ? await cloudinary_service_default.upload(bankLogoFile, {
    folder: CloudinaryFolders.general.bankLogo
  }) : null;
  const uploadedPublicIds = bankLogo?.public_id ? [bankLogo.public_id] : [];
  try {
    const updateData = {
      ...name && {
        nameOfBank: name
      },
      ...address && {
        branchAddress: address
      },
      ...accountNumber && {
        accountNumber
      },
      ...instruction !== void 0 && {
        instruction
      }
    };
    if (bankLogo && bankLogoFile) {
      updateData.bankLogo = bankLogo.secure_url;
      updateData.bankLogoPublicId = bankLogo.public_id;
      updateData.bankLogoName = bankLogo.original_filename;
      updateData.bankLogoType = bankLogoFile.mimetype;
    }
    const result = await prisma.bankInfo.update({
      where: {
        id
      },
      data: updateData
    });
    if (bankLogo && existingBankInfo.bankLogoPublicId) {
      await cloudinary_service_default.delete(existingBankInfo.bankLogoPublicId);
    }
    return result;
  } catch (error) {
    await Promise.all(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId)
      )
    );
    throw error;
  }
};
var deleteBankInfo = async (id) => {
  const existingBankInfo = await prisma.bankInfo.findUnique({
    where: { id }
  });
  if (!existingBankInfo || existingBankInfo.isDeleted) {
    throw new AppError_default(404, "Bank information not found");
  }
  const result = await prisma.bankInfo.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
  return result;
};
var GeneralService = {
  getGeneralSetting,
  updateGeneralSetting,
  updateStudentRulesRegulations,
  updateEmployeeRulesRegulations,
  getAllBankInfo,
  getBankInfoById,
  createbankInfo,
  updateBankInfo,
  deleteBankInfo
};

// src/app/modules/general/general.valdation.ts
import { z as z5 } from "zod";
var generalSettingSchema = z5.object({
  id: z5.string().optional(),
  instituteName: z5.string().optional(),
  institutePhoneNumber: z5.string().optional(),
  instituteEmail: z5.string().optional(),
  instituteWebsite: z5.string().trim().url("Invalid institute website URL").optional().or(z5.literal("")),
  instituteAddress: z5.string().optional(),
  instituteCountry: z5.string().trim().optional()
});
var updateGeneralSettingSchema = z5.object({
  body: generalSettingSchema
});
var studentRulesAndRegulationSchema = z5.object({
  studentRules: z5.string().min(1, "Students rules & regulations are required")
});
var employeeRulesAndRegulationSchema = z5.object({
  employeeRules: z5.string().min(1, "Employees rules & regulations are required")
});
var bankInfoSchema = z5.object({
  name: z5.string().min(1, "Name of Bank is required"),
  address: z5.string().min(1, "Bank/Branch Address is required"),
  accountNumber: z5.string().min(1, "Account Number is required"),
  instruction: z5.string().optional()
});
var updateBankInfoSchema = z5.object({
  name: z5.string().optional(),
  address: z5.string().optional(),
  accountNumber: z5.string().optional(),
  instruction: z5.string().optional()
});

// src/app/modules/general/general.controller.ts
var getGeneralSetting2 = async (req, res) => {
  const result = await GeneralService.getGeneralSetting();
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "General Setting fetched successfully",
    data: result
  });
};
var updateGeneralSetting2 = async (req, res) => {
  const { id } = req.params;
  const payload = generalSettingSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
  if (!files.instituteLogo?.length) {
    throw new AppError_default(400, "Institute Logo is required");
  }
  const result = await GeneralService.updateGeneralSetting(
    payload,
    files,
    id
  );
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "General Setting Updated Successfully",
    data: result
  });
};
var updateStudentRulesRegulations2 = async (req, res) => {
  const { studentRules } = req.body;
  const result = await GeneralService.updateStudentRulesRegulations({
    studentRules
  });
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Student Rules & Regulations Updated Successfully",
    data: result
  });
};
var updateEmployeeRulesRegulations2 = async (req, res) => {
  const { employeeRules } = req.body;
  const result = await GeneralService.updateEmployeeRulesRegulations({
    employeeRules
  });
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Employee Rules & Regulations Updated Successfully",
    data: result
  });
};
var getAllBankInfo2 = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await GeneralService.getAllBankInfo(query);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Bank Informations fetched successfully",
    data: result.data,
    meta: result.meta
  });
});
var getBankInfoById2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GeneralService.getBankInfoById(id);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Bank Information fetched successfully",
    data: result
  });
});
var createBankInfo = catchAsync(async (req, res) => {
  const payload = bankInfoSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
  if (!files.bankLogo?.length) {
    throw new AppError_default(400, "Institute Logo is required");
  }
  const result = await GeneralService.createbankInfo(payload, files);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Bank Information Added Successfully",
    data: result
  });
});
var updateBankInfo2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = updateBankInfoSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
  const result = await GeneralService.updateBankInfo(
    id,
    payload,
    files
  );
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Bank Information Updated Successfully",
    data: result
  });
});
var deleteBankInfo2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await GeneralService.deleteBankInfo(id);
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Bank Information Deleted Successfully",
    data: result
  });
});
var GeneralController = {
  getGeneralSetting: getGeneralSetting2,
  updateGeneralSetting: updateGeneralSetting2,
  updateStudentRulesRegulations: updateStudentRulesRegulations2,
  updateEmployeeRulesRegulations: updateEmployeeRulesRegulations2,
  getAllBankInfo: getAllBankInfo2,
  getBankInfoById: getBankInfoById2,
  createBankInfo,
  updateBankInfo: updateBankInfo2,
  deleteBankInfo: deleteBankInfo2
};

// src/app/modules/general/general.routes.ts
var router5 = Router5();
var generalSettingsMiddleware = [
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.fields([
    {
      name: "instituteLogo",
      maxCount: 1
    }
  ])
];
router5.get(
  "/general-setting",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GeneralController.getGeneralSetting
);
router5.get(
  "/bank-informations",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GeneralController.getAllBankInfo
);
router5.patch(
  "/",
  ...generalSettingsMiddleware,
  GeneralController.updateGeneralSetting
);
router5.patch(
  "/student-rules-regulations",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GeneralController.updateStudentRulesRegulations
);
router5.patch(
  "/employee-rules-regulations",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GeneralController.updateEmployeeRulesRegulations
);
router5.post(
  "/bank-information",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.fields([
    {
      name: "bankLogo",
      maxCount: 1
    }
  ]),
  GeneralController.createBankInfo
);
router5.get(
  "/bank-information/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GeneralController.getBankInfoById
);
router5.post(
  "/bank-information/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.fields([
    {
      name: "bankLogo",
      maxCount: 1
    }
  ]),
  GeneralController.createBankInfo
);
router5.patch(
  "/:id",
  ...generalSettingsMiddleware,
  GeneralController.updateGeneralSetting
);
var GeneralSettingsRoutes = router5;

// src/app/modules/grades/grades.routes.ts
import { Router as Router6 } from "express";

// src/app/modules/grades/grades.controller.ts
import status18 from "http-status";

// src/app/modules/grades/grades.service.ts
import status17 from "http-status";
var getGradeData = async () => {
  const result = prisma.gradingConfiguration.findFirst({
    where: {
      isActive: true
    },
    include: {
      grades: true,
      failCriteria: true
    }
  });
  return result;
};
var updateGradingConfiguration = async (payload) => {
  const { name, grades } = payload;
  return await prisma.$transaction(async (tx) => {
    let configuration = await tx.gradingConfiguration.findFirst({
      where: {
        isActive: true
      },
      include: {
        grades: true,
        failCriteria: true
      }
    });
    if (!configuration) {
      configuration = await tx.gradingConfiguration.create({
        data: {
          name: name || "Default Grading",
          isActive: true
        },
        include: {
          grades: true,
          failCriteria: true
        }
      });
    } else if (name) {
      configuration = await tx.gradingConfiguration.update({
        where: {
          id: configuration.id
        },
        data: {
          name
        },
        include: {
          grades: true,
          failCriteria: true
        }
      });
    }
    if (grades !== void 0) {
      const existingGrades = await tx.gradeScale.findMany({
        where: {
          configurationId: configuration.id
        }
      });
      const incomingIds = grades.filter((grade) => grade.id).map((grade) => grade.id);
      await tx.gradeScale.deleteMany({
        where: {
          configurationId: configuration.id,
          ...incomingIds.length > 0 ? {
            id: {
              notIn: incomingIds
            }
          } : {}
        }
      });
      for (const grade of grades) {
        if (grade.id) {
          const existingGrade = existingGrades.find(
            (item) => item.id === grade.id
          );
          if (existingGrade) {
            await tx.gradeScale.update({
              where: {
                id: grade.id
              },
              data: {
                grade: grade.grade,
                minMarks: grade.minMarks,
                maxMarks: grade.maxMarks,
                status: grade.status
              }
            });
          }
        } else {
          await tx.gradeScale.create({
            data: {
              grade: grade.grade,
              minMarks: grade.minMarks,
              maxMarks: grade.maxMarks,
              status: grade.status,
              configurationId: configuration.id
            }
          });
        }
      }
    }
    return await tx.gradingConfiguration.findUnique({
      where: {
        id: configuration.id
      },
      include: {
        grades: {
          orderBy: {
            minMarks: "desc"
          }
        },
        failCriteria: true
      }
    });
  });
};
var updateFailCriteria = async (payload) => {
  const { overall, subject, number } = payload;
  return await prisma.$transaction(async (tx) => {
    const configuration = await tx.gradingConfiguration.findFirst({
      where: {
        isActive: true
      }
    });
    if (!configuration) {
      throw new AppError_default(
        status17.NOT_FOUND,
        "Active grading configuration not found"
      );
    }
    const existingFailCriteria = await tx.failCriteria.findUnique({
      where: {
        configurationId: configuration.id
      }
    });
    if (!existingFailCriteria) {
      return await tx.failCriteria.create({
        data: {
          overallPercentage: overall,
          subjectPercentage: subject,
          minFailedSubjects: number,
          configurationId: configuration.id
        }
      });
    }
    return await tx.failCriteria.update({
      where: {
        id: existingFailCriteria.id
      },
      data: {
        overallPercentage: overall,
        subjectPercentage: subject,
        minFailedSubjects: number
      }
    });
  });
};
var gradingConfigurationService = {
  getGradeData,
  updateGradingConfiguration,
  updateFailCriteria
};

// src/app/modules/grades/grades.validation.ts
import z6 from "zod";
var gradeScaleSchema = z6.object({
  id: z6.string().optional(),
  grade: z6.string().min(1),
  minMarks: z6.number().int().min(0).max(100),
  maxMarks: z6.number().int().min(0).max(100),
  status: z6.enum(["PASS", "FAIL"])
});
var gradingConfigurationSchema = z6.object({
  name: z6.string().optional(),
  grades: z6.array(gradeScaleSchema).optional()
  // failCriteria: z
  //     .object({
  //         overallPercentage: z.number().min(0).max(100),
  //         subjectPercentage: z.number().min(0).max(100),
  //         minFailedSubjects: z.number().int().min(1),
  //     })
  //     .nullable()
  //     .optional(),
});
var failCriteriaSchema = z6.object({
  overall: z6.number({ error: "Overall percentage is required" }).min(0).max(100),
  subject: z6.number({ error: "Subject percentage is required" }).min(0).max(100),
  number: z6.number({ error: "Number of subject is required" }).int().min(1)
});

// src/app/modules/grades/grades.controller.ts
var getGradeData2 = catchAsync(async (req, res) => {
  const result = await gradingConfigurationService.getGradeData();
  sendResponse(res, {
    httpStatusCode: status18.OK,
    success: true,
    message: "Grading configuration data fetched successfully",
    data: result
  });
});
var updateGradingConfiguration2 = catchAsync(
  async (req, res) => {
    const payload = gradingConfigurationSchema.parse(req.body);
    const result = await gradingConfigurationService.updateGradingConfiguration(
      payload
    );
    sendResponse(res, {
      httpStatusCode: status18.OK,
      success: true,
      message: "Grading configuration updated successfully",
      data: result
    });
  }
);
var updateFailCriteria2 = catchAsync(async (req, res) => {
  console.log(req.body);
  const payload = failCriteriaSchema.parse(req.body);
  console.log(payload);
  const result = await gradingConfigurationService.updateFailCriteria(payload);
  sendResponse(res, {
    httpStatusCode: status18.OK,
    success: true,
    message: "Fail Crieteria Updated Successfully",
    data: result
  });
});
var gradesController = {
  getGradeData: getGradeData2,
  updateGradingConfiguration: updateGradingConfiguration2,
  updateFailCriteria: updateFailCriteria2
};

// src/app/modules/grades/grades.routes.ts
var router6 = Router6();
router6.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  gradesController.getGradeData
);
router6.put(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  gradesController.updateGradingConfiguration
);
router6.put(
  "/fail-criteria",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  gradesController.updateFailCriteria
);
var GradeConfigurationRoutes = router6;

// src/app/modules/student/student.routes.ts
import { Router as Router7 } from "express";

// src/app/modules/student/student.controller.ts
import status20 from "http-status";

// src/app/modules/student/student.service.ts
import status19 from "http-status";

// src/app/modules/student/student.constant.ts
var studentSearchableFields = [
  "fullName",
  "user.email",
  "birthRegistrationNumber"
];
var studentFilterableFields = ["user.role", "classId"];

// src/app/modules/student/student.service.ts
var getAllStudent = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.student, query, {
    searchableFields: studentSearchableFields,
    filterableFields: studentFilterableFields,
    defaultSelect: {
      id: true,
      birthRegistrationNumber: true,
      fullName: true,
      gender: true,
      picture: true,
      user: {
        select: {
          email: true
        }
      }
    }
  });
  const result = await queryBuilder.search().filter().where({ isdeleted: false }).fields().paginate().sort().execute();
  const data = result.data;
  return {
    ...result,
    data: data.map((student) => {
      const { user, ...studentData } = student;
      return {
        ...studentData,
        ...user?.email && { email: user.email }
      };
    })
  };
};
var getStudentForUpdate = async (id) => {
  const student = await prisma.student.findUnique({
    where: {
      id,
      isdeleted: false
    },
    select: {
      fullName: true,
      fullNameBangla: true,
      dateOfBirth: true,
      birthRegistrationNumber: true,
      religion: true,
      gender: true,
      bloodGroup: true,
      classId: true,
      admissionTotalFees: true,
      previousInstituteName: true,
      admissionDate: true,
      endingClass: true,
      result: true,
      testimonialNumber: true,
      guardianInfo: {
        select: {
          fatherName: true,
          fatherNameBangla: true,
          fatherMobileNumber: true,
          fatherOccupation: true,
          motherName: true,
          motherNameBangla: true,
          motherMobileNumber: true,
          motherOccupation: true,
          nameOfLocalGuardian: true,
          relationShipOfStudent: true,
          GuardianMobileNumber: true,
          whatsappNumber: true
        }
      },
      address: {
        select: {
          presentAddressVillage: true,
          presentAddressPostOffice: true,
          presentAddressPostCode: true,
          presentAddressDistrict: true,
          permanentAddressVillage: true,
          permanentAddressPostOffice: true,
          permanentAddressPostCode: true,
          permanentAddressDistrict: true
        }
      },
      picture: true,
      pictureName: true,
      pictureType: true,
      studentSign: true,
      studentsignName: true,
      studentSignType: true,
      guardianSign: true,
      guardianSignName: true,
      guardianSignType: true,
      authoritySign: true,
      authoritySignName: true,
      authoritySignType: true,
      user: {
        select: {
          email: true
        }
      }
    }
  });
  if (!student) {
    throw new AppError_default(status19.NOT_FOUND, "Student Not found");
  }
  if (!student?.address) {
    throw new AppError_default(status19.NOT_FOUND, "Student address not found");
  }
  const {
    pictureName,
    pictureType,
    authoritySignName,
    authoritySignType,
    studentsignName,
    studentSignType,
    guardianSignName,
    guardianSignType,
    guardianInfo,
    previousInstituteName,
    user: { email },
    ...studenData
  } = student;
  const {
    nameOfLocalGuardian,
    relationShipOfStudent,
    GuardianMobileNumber,
    ...guardianData
  } = guardianInfo ?? {};
  const formattedStudent = {
    ...studenData,
    ...guardianData,
    guardianName: nameOfLocalGuardian,
    guardianRelationship: relationShipOfStudent,
    guardianMobile: GuardianMobileNumber,
    previousInstitute: previousInstituteName,
    picture: {
      uri: student.picture,
      name: pictureName,
      type: pictureType
    },
    authoritySign: {
      uri: student.authoritySign,
      name: authoritySignName,
      type: authoritySignType
    },
    studentSign: {
      uri: student.studentSign,
      name: studentsignName,
      type: studentSignType
    },
    guardianSign: {
      uri: student.guardianSign,
      name: guardianSignName,
      type: guardianSignType
    },
    address: {
      present: {
        village: student.address.presentAddressVillage,
        postOffice: student.address.presentAddressPostOffice,
        postCode: student.address.presentAddressPostCode,
        district: student.address.presentAddressDistrict
      },
      permanent: {
        village: student.address.permanentAddressVillage,
        postOffice: student.address.permanentAddressPostOffice,
        postCode: student.address.permanentAddressPostCode,
        district: student.address.permanentAddressDistrict
      }
    },
    email
  };
  return formattedStudent;
};
var createStudent = async (payload, files) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLocaleLowerCase() },
    select: { id: true }
  });
  if (existingUser) {
    throw new AppError_default(
      status19.CONFLICT,
      "An account with this email already exists"
    );
  }
  const pictureFile = files.picture?.[0];
  const authoritySignFile = files.authoritySign?.[0];
  const studentSignFile = files.studentSign?.[0];
  const guardianSignFile = files.guardianSign?.[0];
  if (!authoritySignFile) {
    throw new AppError_default(400, "Missing Authority Sign Image");
  }
  if (!pictureFile) {
    throw new AppError_default(400, "Missing Picture of Student");
  }
  if (!studentSignFile) {
    throw new AppError_default(400, "Missing Student Sign Image");
  }
  if (!guardianSignFile) {
    throw new AppError_default(400, "Missing Guardian Sign Image");
  }
  const [picture, authoritySign, studentSign, guardianSign] = await Promise.all([
    pictureFile ? cloudinary_service_default.upload(pictureFile, {
      folder: CloudinaryFolders.student.profile
    }) : Promise.resolve(null),
    cloudinary_service_default.upload(authoritySignFile, {
      folder: CloudinaryFolders.student.authoritySign
    }),
    cloudinary_service_default.upload(studentSignFile, {
      folder: CloudinaryFolders.student.studentSign
    }),
    cloudinary_service_default.upload(guardianSignFile, {
      folder: CloudinaryFolders.student.guardianSign
    })
  ]);
  const uploadedPublicIds = [
    picture?.public_id,
    authoritySign?.public_id,
    studentSign?.public_id,
    guardianSign?.public_id
  ].filter((id) => !!id);
  const tempPassword = "Temp@12345";
  let userId = null;
  try {
    const authUser = await auth.api.signUpEmail({
      body: {
        email: payload.email,
        password: tempPassword,
        role: UserRole.STUDENT,
        name: payload.fullName,
        image: picture?.secure_url,
        needPasswordChange: true
      }
    });
    userId = authUser.user.id;
    const student = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          needPasswordChange: true
        }
      });
      const sequence = await tx.sequence.update({
        where: { id: "student" },
        data: {
          current: {
            increment: 1
          }
        }
      });
      return await tx.student.create({
        data: {
          userId,
          studentId: sequence.current.toString(),
          fullName: payload.fullName,
          fullNameBangla: payload.fullNameBangla,
          picture: picture?.secure_url,
          picturePublicId: picture?.public_id ?? null,
          pictureName: pictureFile?.originalname ?? null,
          pictureType: pictureFile?.mimetype ?? null,
          dateOfBirth: payload.dateOfBirth,
          birthRegistrationNumber: payload.birthRegistrationNumber,
          religion: payload.religion,
          gender: payload.gender,
          classId: payload.classId,
          admissionTotalFees: payload.admissionTotalFees,
          admissionDate: payload.admissionDate,
          testimonialNumber: payload.testimonialNumber ?? null,
          previousInstituteName: payload.previousInstitute ?? null,
          endingClass: payload.endingClass ?? null,
          result: payload.result ?? null,
          bloodGroup: payload.bloodGroup ?? null,
          authoritySign: authoritySign.secure_url,
          authoritySignPublicId: authoritySign.public_id,
          authoritySignName: authoritySignFile.originalname,
          authoritySignType: authoritySignFile.mimetype,
          studentSign: studentSign.secure_url,
          studentSignPublicId: studentSign.public_id,
          studentsignName: studentSignFile.originalname,
          studentSignType: studentSignFile.mimetype,
          guardianSign: guardianSign.secure_url,
          guardianSignPublicId: guardianSign.public_id,
          guardianSignName: guardianSignFile.originalname,
          guardianSignType: guardianSignFile.mimetype,
          guardianInfo: {
            create: {
              fatherName: payload.fatherName,
              fatherNameBangla: payload.fatherNameBangla,
              whatsappNumber: payload.whatsappNumber,
              fatherOccupation: payload.fatherOccupation,
              motherName: payload.motherName,
              motherNameBangla: payload.motherNameBangla,
              motherMobileNumber: payload.motherMobileNumber,
              fatherMobileNumber: payload.fatherMobileNumber,
              motherOccupation: payload.motherOccupation,
              nameOfLocalGuardian: payload.guardianName,
              GuardianMobileNumber: payload.guardianMobile,
              relationShipOfStudent: payload.guardianRelationship
            }
          },
          address: {
            create: {
              permanentAddressVillage: payload.address.permanent.village,
              permanentAddressPostOffice: payload.address.permanent.postOffice,
              permanentAddressPostCode: payload.address.permanent.postCode,
              permanentAddressDistrict: payload.address.permanent.district,
              presentAddressVillage: payload.address.present.village,
              presentAddressPostOffice: payload.address.present.postOffice,
              presentAddressPostCode: payload.address.present.postCode,
              presentAddressDistrict: payload.address.present.district
            }
          }
        }
      });
    });
    return student;
  } catch (error) {
    console.log("Transaction error : ", error);
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch((delErr) => {
        console.log("Failed to rollback user:", delErr);
      });
    }
    await Promise.all(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId).catch((delErr) => {
          console.log(
            `Failed to rollback Cloudinary asset ${publicId}:`,
            delErr
          );
        })
      )
    );
    throw error;
  }
};
var updateStudent = async (id, payload, files) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      guardianInfo: true,
      address: true
    }
  });
  if (!student) {
    throw new AppError_default(status19.NOT_FOUND, "Student not found");
  }
  const pictureFile = files.picture?.[0];
  const authoritySignFile = files.authoritySign?.[0];
  const studentSignFile = files.studentSign?.[0];
  const guardianSignFile = files.guardianSign?.[0];
  const [picture, authoritySign, studentSign, guardianSign] = await Promise.all([
    pictureFile ? cloudinary_service_default.upload(pictureFile, {
      folder: CloudinaryFolders.student.profile
    }) : Promise.resolve(null),
    authoritySignFile ? cloudinary_service_default.upload(authoritySignFile, {
      folder: CloudinaryFolders.student.authoritySign
    }) : Promise.resolve(null),
    studentSignFile ? cloudinary_service_default.upload(studentSignFile, {
      folder: CloudinaryFolders.student.studentSign
    }) : Promise.resolve(null),
    guardianSignFile ? cloudinary_service_default.upload(guardianSignFile, {
      folder: CloudinaryFolders.student.guardianSign
    }) : Promise.resolve(null)
  ]);
  const uploadedPublicIds = [
    picture?.public_id,
    authoritySign?.public_id,
    studentSign?.public_id,
    guardianSign?.public_id
  ].filter((id2) => Boolean(id2));
  try {
    const updatedStudent = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: student.userId
        },
        data: {
          ...payload.fullName !== void 0 && {
            name: payload.fullName
          },
          ...picture && {
            image: picture.secure_url
          }
        }
      });
      const updatedStudent2 = await tx.student.update({
        where: {
          id: student.id
        },
        data: {
          ...payload.fullName !== void 0 && {
            fullName: payload.fullName
          },
          ...payload.fullNameBangla !== void 0 && {
            fullNameBangla: payload.fullNameBangla
          },
          ...payload.dateOfBirth !== void 0 && {
            dateOfBirth: payload.dateOfBirth
          },
          ...payload.birthRegistrationNumber !== void 0 && {
            birthRegistrationNumber: payload.birthRegistrationNumber
          },
          ...payload.religion !== void 0 && {
            religion: payload.religion
          },
          ...payload.classId !== void 0 && {
            classId: payload.classId
          },
          ...payload.admissionTotalFees !== void 0 && {
            admissionTotalFees: payload.admissionTotalFees
          },
          ...payload.admissionDate !== void 0 && {
            admissionDate: payload.admissionDate
          },
          ...payload.previousInstitute !== void 0 && {
            previousInstituteName: payload.previousInstitute || null
          },
          ...payload.endingClass !== void 0 && {
            endingClass: payload.endingClass || null
          },
          ...payload.result !== void 0 && {
            result: payload.result || null
          },
          ...payload.testimonialNumber !== void 0 && {
            testimonialNumber: payload.testimonialNumber || null
          },
          ...payload.gender !== void 0 && {
            gender: payload.gender
          },
          ...payload.bloodGroup !== void 0 && {
            bloodGroup: payload.bloodGroup || null
          },
          ...picture && {
            picture: picture.secure_url,
            picturePublicId: picture.public_id,
            ...pictureFile !== void 0 && {
              pictureName: pictureFile.originalname,
              pictureType: pictureFile.mimetype
            }
          },
          ...authoritySign && {
            authoritySign: authoritySign.secure_url,
            authoritySignPublicId: authoritySign.public_id,
            ...authoritySignFile !== void 0 && {
              authoritySignName: authoritySignFile.originalname,
              authoritySignType: authoritySignFile.mimetype
            }
          },
          ...studentSign && {
            studentSign: studentSign.secure_url,
            studentSignPublicId: studentSign.public_id,
            ...studentSignFile !== void 0 && {
              studentsignName: studentSignFile.originalname,
              studentSignType: studentSignFile.mimetype
            }
          },
          ...guardianSign && {
            guardianSign: guardianSign.secure_url,
            guardianSignPublicId: guardianSign.public_id,
            ...guardianSignFile !== void 0 && {
              guardianSignName: guardianSignFile.originalname,
              guardianSignType: guardianSignFile.mimetype
            }
          }
        }
      });
      if (student.guardianInfo) {
        await tx.guardianInfo.update({
          where: {
            studentId: student.id
          },
          data: {
            ...payload.fatherName !== void 0 && {
              fatherName: payload.fatherName
            },
            ...payload.fatherNameBangla !== void 0 && {
              fatherNameBangla: payload.fatherNameBangla
            },
            ...payload.fatherMobileNumber !== void 0 && {
              fatherMobileNumber: payload.fatherMobileNumber
            },
            ...payload.whatsappNumber !== void 0 && {
              whatsappNumber: payload.whatsappNumber
            },
            ...payload.fatherOccupation !== void 0 && {
              fatherOccupation: payload.fatherOccupation
            },
            ...payload.motherName !== void 0 && {
              motherName: payload.motherName
            },
            ...payload.motherNameBangla !== void 0 && {
              motherNameBangla: payload.motherNameBangla
            },
            ...payload.motherMobileNumber !== void 0 && {
              motherMobileNumber: payload.motherMobileNumber
            },
            ...payload.motherOccupation !== void 0 && {
              motherOccupation: payload.motherOccupation
            },
            ...payload.guardianName !== void 0 && {
              nameOfLocalGuardian: payload.guardianName
            },
            ...payload.guardianRelationship !== void 0 && {
              relationShipOfStudent: payload.guardianRelationship
            },
            ...payload.guardianMobile !== void 0 && {
              GuardianMobileNumber: payload.guardianMobile
            }
          }
        });
      }
      if (student.address && payload.address) {
        await tx.address.update({
          where: {
            id: student.address.id
          },
          data: {
            ...payload.address.permanent?.village !== void 0 && {
              permanentAddressVillage: payload.address.permanent.village
            },
            ...payload.address.permanent?.postOffice !== void 0 && {
              permanentAddressPostOffice: payload.address.permanent.postOffice
            },
            ...payload.address.permanent?.postCode !== void 0 && {
              permanentAddressPostCode: payload.address.permanent.postCode
            },
            ...payload.address.permanent?.district !== void 0 && {
              permanentAddressDistrict: payload.address.permanent.district
            },
            ...payload.address.present?.village !== void 0 && {
              presentAddressVillage: payload.address.present.village
            },
            ...payload.address.present?.postOffice !== void 0 && {
              presentAddressPostOffice: payload.address.present.postOffice
            },
            ...payload.address.present?.postCode !== void 0 && {
              presentAddressPostCode: payload.address.present.postCode
            },
            ...payload.address.present?.district !== void 0 && {
              presentAddressDistrict: payload.address.present.district
            }
          }
        });
      }
      return updatedStudent2;
    });
    const oldPublicIds = [
      picture && student.picturePublicId,
      authoritySign && student.authoritySignPublicId,
      studentSign && student.studentSignPublicId,
      guardianSign && student.guardianSignPublicId
    ].filter((id2) => Boolean(id2));
    await Promise.all(
      oldPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId).catch((error) => {
          console.log(
            `Failed to delete old Cloudinary file ${publicId}:`,
            error
          );
        })
      )
    );
    return updatedStudent;
  } catch (error) {
    await Promise.all(
      uploadedPublicIds.map(
        (publicId) => cloudinary_service_default.delete(publicId).catch((deleteError) => {
          console.log(
            `Failed to rollback Cloudinary asset ${publicId}:`,
            deleteError
          );
        })
      )
    );
    throw error;
  }
};
var promoteStudents = async (sourceClassId, targetClassId, studentIds) => {
  if (sourceClassId === targetClassId) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "Source and target classes cannot be the same"
    );
  }
  const uniqueStudentIds = [...new Set(studentIds)];
  if (uniqueStudentIds.length === 0) {
    throw new AppError_default(
      status19.BAD_REQUEST,
      "Please select at least one student"
    );
  }
  return prisma.$transaction(async (tx) => {
    const classes = await tx.class.findMany({
      where: {
        id: {
          in: [sourceClassId, targetClassId]
        },
        isDeleted: false
      },
      select: {
        id: true,
        name: true
      }
    });
    if (classes.length !== 2) {
      throw new AppError_default(
        status19.NOT_FOUND,
        "Source or target class not found"
      );
    }
    const students = await tx.student.findMany({
      where: {
        id: {
          in: uniqueStudentIds
        },
        classId: sourceClassId,
        isdeleted: false
      },
      select: {
        id: true
      }
    });
    if (students.length !== uniqueStudentIds.length) {
      throw new AppError_default(
        status19.BAD_REQUEST,
        "Some students do not belong to the source class or are inactive"
      );
    }
    const result = await tx.student.updateMany({
      where: {
        id: {
          in: uniqueStudentIds
        },
        classId: sourceClassId,
        isdeleted: false
      },
      data: {
        classId: targetClassId
      }
    });
    if (result.count !== uniqueStudentIds.length) {
      throw new AppError_default(
        status19.CONFLICT,
        "Some students could not be promoted. Please retry"
      );
    }
    return {
      message: "Students promoted successfully",
      promotedCount: result.count,
      sourceClass: classes.find((item) => item.id === sourceClassId).name,
      targetClass: classes.find((item) => item.id === targetClassId).name
    };
  });
};
var deleteStudent = async (id) => {
  const student = await prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      picturePublicId: true,
      studentSignPublicId: true,
      guardianSignPublicId: true,
      authoritySignPublicId: true
    }
  });
  if (!student) {
    throw new AppError_default(status19.NOT_FOUND, "Student Profile not found");
  }
  await prisma.$transaction(async (tx) => {
    await tx.student.update({
      where: { id },
      data: {
        isdeleted: true,
        deletedAt: /* @__PURE__ */ new Date()
      }
    });
    await tx.user.update({
      where: { id: student.userId },
      data: {
        isDeleted: true,
        deletedAt: /* @__PURE__ */ new Date(),
        status: UserStatus.DELETED
      }
    });
    await tx.session.deleteMany({
      where: { userId: student.userId }
    });
  });
  await Promise.allSettled([
    student.picturePublicId ? cloudinary_service_default.delete(student.picturePublicId) : Promise.resolve(),
    student.authoritySignPublicId ? cloudinary_service_default.delete(student.authoritySignPublicId) : Promise.resolve(),
    student.studentSignPublicId ? cloudinary_service_default.delete(student.studentSignPublicId) : Promise.resolve(),
    student.guardianSignPublicId ? cloudinary_service_default.delete(student.guardianSignPublicId) : Promise.resolve()
  ]);
  return { message: "Student Profile deleted successfully" };
};
var StudentService = {
  getAllStudent,
  getStudentForUpdate,
  createStudent,
  updateStudent,
  promoteStudents,
  deleteStudent
};

// src/app/modules/student/student.validation.ts
import z7 from "zod";
var createStudentSchema = z7.object({
  fullName: z7.string({ error: "Student Name is required" }).min(1, { error: "Student Name can't be empty" }),
  fullNameBangla: z7.string({ error: "Student Name Bangla is required" }).min(1, { error: "Student Name Bangla can't be empty" }),
  dateOfBirth: z7.string({ error: "Date of birth is required" }).min(1, { error: "Date of birth can't be empty" }),
  birthRegistrationNumber: z7.string({ error: "Birth Registration Number is required" }).min(1, { error: "Birth Registration Number can't be empty" }),
  religion: z7.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }),
  gender: z7.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }),
  bloodGroup: z7.enum(BloodGroup, {
    error: "BloodGroup must be one of: " + Object.values(BloodGroup).join(", ")
  }).optional(),
  classId: z7.string({ error: "Class Id is required" }).min(1, { error: "Class Id can't be empty" }),
  fatherName: z7.string({ error: "Father name is required" }).min(1, { error: "Father Name can't be emptry" }),
  fatherNameBangla: z7.string({ error: "Father name Bangla is required" }).min(1, { error: "Father Name Bangla can't be empty" }),
  fatherMobileNumber: z7.string({ error: "Father Mobile Number is required" }),
  whatsappNumber: z7.string({ error: "Whatsapp number is required" }).min(1, { error: "Whatsapp Number can't be empty" }),
  fatherOccupation: z7.string({ error: "Father Occupation is required" }).min(1, { error: "Father Occupation can't be empty" }),
  motherName: z7.string({ error: "Mother Name is required" }).min(1, { error: "Mother Name Bangla can't be empty" }),
  motherNameBangla: z7.string({ error: "Mother Name Bangla is required" }).min(1, { error: "Mother Name Bangla can't be empty" }),
  motherMobileNumber: z7.string({ error: "Mother Mobile Number is required" }),
  motherOccupation: z7.string({ error: "Mother Occupation is required" }).min(1, { error: "Mother Occupation can't be empty" }),
  email: z7.email({ error: "Please provide a valid email address" }),
  guardianName: z7.string({ error: "Guardian Name is required" }).min(1, { error: "Guardian Name can't be empty" }),
  guardianRelationship: z7.string({ error: "Guardian Relationship is required" }).min(1, { error: "Guardian Relationship can't be empty" }),
  guardianMobile: z7.string({ error: "Guardian Mobile number is required" }).min(11, { error: "Guardian Mobile must be minimum 11 digit" }),
  admissionTotalFees: z7.coerce.number({
    error: "Total Fees of Admission and Other Expenses is required "
  }),
  admissionDate: z7.string({ error: "Admission date is required" }).min(1, "Admission date can't be empty"),
  previousInstitute: z7.string().optional(),
  endingClass: z7.string().optional(),
  result: z7.string().optional(),
  testimonialNumber: z7.string().optional(),
  address: z7.object({
    present: presentAddressSchema,
    permanent: permanentAddressSchema
  })
});
var updateStudentSchema = z7.object({
  fullName: z7.string().optional(),
  fullNameBangla: z7.string().optional(),
  dateOfBirth: z7.string().optional(),
  birthRegistrationNumber: z7.string().optional(),
  religion: z7.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }).optional(),
  gender: z7.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }).optional(),
  bloodGroup: z7.enum(BloodGroup, {
    error: "BloodGroup must be one of: " + Object.values(BloodGroup).join(", ")
  }).optional(),
  classId: z7.string().optional(),
  fatherName: z7.string().optional(),
  fatherNameBangla: z7.string().optional(),
  fatherMobileNumber: z7.string().optional(),
  whatsappNumber: z7.string().optional(),
  fatherOccupation: z7.string().optional(),
  motherName: z7.string().optional(),
  motherNameBangla: z7.string().optional(),
  motherMobileNumber: z7.string().optional(),
  motherOccupation: z7.string().optional(),
  email: z7.email({ error: "Please provide a valid email address" }).optional(),
  guardianName: z7.string().optional(),
  guardianRelationship: z7.string().optional(),
  guardianMobile: z7.string().optional(),
  admissionTotalFees: z7.coerce.number().optional(),
  admissionDate: z7.string().optional(),
  previousInstitute: z7.string().optional(),
  endingClass: z7.string().optional(),
  result: z7.string().optional(),
  testimonialNumber: z7.string().optional(),
  address: z7.object({
    present: presentAddressSchema.partial().optional(),
    permanent: permanentAddressSchema.partial().optional()
  }).optional()
});
var promoteStudentsSchema = z7.object({
  sourceClassId: z7.uuid("Invalid source class ID"),
  targetClassId: z7.uuid("Invalid target class ID"),
  studentIds: z7.array(z7.uuid("Invalid student ID")).min(1, "Select at least one student").refine(
    (ids) => new Set(ids).size === ids.length,
    "Duplicate student IDs are not allowed"
  )
});

// src/app/modules/student/student.controller.ts
var getAllStudent2 = async (req, res) => {
  const query = req.query;
  const result = await StudentService.getAllStudent(query);
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Students Fetched Successfully",
    data: result.data,
    meta: result.meta
  });
};
var getStudentForUpdate2 = async (req, res) => {
  const { id } = req.params;
  const student = await StudentService.getStudentForUpdate(id);
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Student For Update fetched successfully",
    data: student
  });
};
var createStudent2 = async (req, res) => {
  const payload = createStudentSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
  if (!files.picture?.length) {
    throw new AppError_default(400, "Picture is required");
  }
  if (!files.authoritySign?.length) {
    throw new AppError_default(400, "Authority Sign is required");
  }
  if (!files.studentSign?.length) {
    throw new AppError_default(400, "Student Sign is required");
  }
  if (!files.guardianSign?.length) {
    throw new AppError_default(400, "Guardian Sign is required");
  }
  const student = await StudentService.createStudent(payload, files);
  sendResponse(res, {
    httpStatusCode: status20.CREATED,
    success: true,
    message: "Student profile created successfully",
    data: student
  });
};
var updateStudent2 = async (req, res) => {
  const { id } = req.params;
  const payload = updateStudentSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
  const student = await StudentService.updateStudent(
    id,
    payload,
    files
  );
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: "Student Updated Successfully",
    data: student
  });
};
var promoteStudents2 = async (req, res) => {
  const validatedData = req.body;
  const result = await StudentService.promoteStudents(
    validatedData.sourceClassId,
    validatedData.targetClassId,
    validatedData.studentIds
  );
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: result.message,
    data: result
  });
};
var deleteStudent2 = async (req, res) => {
  const { id } = req.params;
  const result = await StudentService.deleteStudent(id);
  sendResponse(res, {
    httpStatusCode: status20.OK,
    success: true,
    message: result.message || "Student Profile Deleted Successfully"
  });
};
var studentController = {
  getAllStudent: getAllStudent2,
  getStudentForUpdate: getStudentForUpdate2,
  createStudent: createStudent2,
  updateStudent: updateStudent2,
  promoteStudents: promoteStudents2,
  deleteStudent: deleteStudent2
};

// src/app/modules/student/student.routes.ts
var router7 = Router7();
router7.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.getAllStudent
);
router7.get(
  "/:id/update",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.getStudentForUpdate
);
router7.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.fields([
    {
      name: "picture",
      maxCount: 1
    },
    {
      name: "authoritySign",
      maxCount: 1
    },
    {
      name: "studentSign",
      maxCount: 1
    },
    {
      name: "guardianSign",
      maxCount: 1
    }
  ]),
  studentController.createStudent
);
router7.patch(
  "/promote",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.promoteStudents
);
router7.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.fields([
    {
      name: "picture",
      maxCount: 1
    },
    {
      name: "authoritySign",
      maxCount: 1
    },
    {
      name: "studentSign",
      maxCount: 1
    },
    {
      name: "guardianSign",
      maxCount: 1
    }
  ]),
  studentController.updateStudent
);
router7.delete(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  studentController.deleteStudent
);
var StudentRoutes = router7;

// src/app/modules/subjects/subject.routes.ts
import { Router as Router8 } from "express";

// src/app/modules/subjects/subject.controller.ts
import status21 from "http-status";

// src/app/modules/subjects/subject.service.ts
var getAllSubjectsByClassId = async (query) => {
  const queryBuilder = new QueryBuilder(prisma.class, query, {
    searchableFields: [],
    filterableFields: []
  });
  const result = await queryBuilder.where({
    isDeleted: false,
    subjects: {
      some: {
        isdeleted: false
      }
    }
  }).select({
    id: true,
    name: true,
    subjects: {
      where: {
        isdeleted: false
      },
      select: {
        id: true,
        subjectName: true,
        maxMarks: true
      }
    }
  }).paginate().sort().execute();
  return {
    ...result,
    data: result.data.map((classItem) => ({
      id: classItem.id,
      className: classItem.name,
      totalSubjects: classItem.subjects.length,
      totalMarks: classItem.subjects.reduce(
        (total, subject) => total + subject.maxMarks,
        0
      ),
      subjects: classItem.subjects.map((subject) => ({
        id: subject.id,
        subjectName: subject.subjectName,
        marks: subject.maxMarks
      }))
    })).filter((classItem) => classItem.totalSubjects > 0)
  };
};
var createSubject = async (payload) => {
  const { classId, subjects } = payload;
  const existingClass = await prisma.class.findUnique({
    where: {
      id: classId
    }
  });
  if (!existingClass) {
    throw new Error("Class not found");
  }
  const subjectData = subjects.map((subject) => ({
    classId,
    subjectName: subject.subjectName,
    maxMarks: subject.marks
  }));
  const createdSubjects = await prisma.subject.createMany({
    data: subjectData
  });
  return createdSubjects;
};
var updateSubjects = async (payload) => {
  const { classId, subjects } = payload;
  const existingClass = await prisma.class.findUnique({
    where: {
      id: classId
    }
  });
  if (!existingClass) {
    throw new Error("Class not found");
  }
  return await prisma.$transaction(async (tx) => {
    const existingSubjects = await tx.subject.findMany({
      where: {
        classId,
        isdeleted: false
      }
    });
    const submittedIds = subjects.filter((subject) => subject.id).map((subject) => subject.id);
    for (const subject of subjects) {
      if (subject.id) {
        await tx.subject.upsert({
          where: {
            id: subject.id
          },
          update: {
            subjectName: subject.subjectName,
            maxMarks: subject.marks,
            isdeleted: false,
            deletedAt: null
          },
          create: {
            classId,
            subjectName: subject.subjectName,
            maxMarks: subject.marks
          }
        });
      } else {
        await tx.subject.create({
          data: {
            classId,
            subjectName: subject.subjectName,
            maxMarks: subject.marks
          }
        });
      }
    }
    const deletedSubjectIds = existingSubjects.filter((subject) => !submittedIds.includes(subject.id)).map((subject) => subject.id);
    if (deletedSubjectIds.length > 0) {
      await tx.subject.updateMany({
        where: {
          id: {
            in: deletedSubjectIds
          },
          classId,
          isdeleted: false
        },
        data: {
          isdeleted: true,
          deletedAt: /* @__PURE__ */ new Date()
        }
      });
    }
    return await tx.subject.findMany({
      where: {
        classId,
        isdeleted: false
      }
    });
  });
};
var deleteSubjects = async (classId) => {
  const result = await prisma.subject.updateMany({
    where: {
      classId,
      isdeleted: false
    },
    data: {
      isdeleted: true
    }
  });
  return {
    deletedCount: result.count
  };
};
var SubjectService = {
  createSubject,
  updateSubjects,
  getAllSubjectsByClassId,
  deleteSubjects
};

// src/app/modules/subjects/subject.validation.ts
import { z as z8 } from "zod";
var subjectItemSchema = z8.object({
  subjectName: z8.string({ error: "Subject Name is required" }).trim().min(1, { error: "Subject Name cannot be empty" }),
  marks: z8.number({ error: "Total mark is required" }).int({ error: "Total mark must be a whole number" }).positive({ error: "Total mark must be greater than 0" })
});
var createSubjectSchema = z8.object({
  classId: z8.string({ error: "Class is required" }).trim().min(1, { error: "Class cannot be empty" }),
  subjects: z8.array(subjectItemSchema).min(1, { error: "At least one subject is required" })
});
var updateSubjectSchema = z8.object({
  classId: z8.string({ error: "Class is required" }).trim().min(1, { error: "Class cannot be empty" }),
  subjects: z8.array(
    subjectItemSchema.extend({
      id: z8.string().optional()
    })
  ).min(1, { error: "At least one subject is required" })
});

// src/app/modules/subjects/subject.controller.ts
var getAllSubjectsByClassId2 = async (req, res) => {
  const query = req.query;
  const result = await SubjectService.getAllSubjectsByClassId(
    query
  );
  sendResponse(res, {
    httpStatusCode: status21.OK,
    success: true,
    message: "Subjects Fetched Successfully",
    data: result.data,
    meta: result.meta
  });
};
var createSubject2 = async (req, res) => {
  const payload = createSubjectSchema.parse(req.body);
  const subject = await SubjectService.createSubject(payload);
  sendResponse(res, {
    httpStatusCode: status21.CREATED,
    success: true,
    message: "Subject created successfully",
    data: subject
  });
};
var updateSubject = async (req, res) => {
  const payload = updateSubjectSchema.parse(req.body);
  const subject = await SubjectService.updateSubjects(payload);
  sendResponse(res, {
    httpStatusCode: status21.OK,
    success: true,
    message: "Subjects updated successfully",
    data: subject
  });
};
var deleteSubjects2 = async (req, res) => {
  const { classId } = req.params;
  const result = await SubjectService.deleteSubjects(classId);
  sendResponse(res, {
    httpStatusCode: status21.OK,
    success: true,
    message: "Subjects deleted successfully",
    data: result
  });
};
var subjectController = {
  getAllSubjectsByClassId: getAllSubjectsByClassId2,
  createSubject: createSubject2,
  updateSubject,
  deleteSubjects: deleteSubjects2
};

// src/app/modules/subjects/subject.routes.ts
var router8 = Router8();
router8.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.getAllSubjectsByClassId
);
router8.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.createSubject
);
router8.patch(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.updateSubject
);
router8.delete(
  "/:classId",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.deleteSubjects
);
var subjectRoutes = router8;

// src/app/routes/index.ts
var routes = Router9();
var moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/employees",
    route: EmployeeRoutes
  },
  {
    path: "/classes",
    route: ClassesRoutes
  },
  {
    path: "/student",
    route: StudentRoutes
  },
  {
    path: "/settings",
    route: GeneralSettingsRoutes
  },
  {
    path: "/settings/grades",
    route: GradeConfigurationRoutes
  },
  {
    path: "/attendance",
    route: AttendanceRoutes
  },
  {
    path: "/subjects",
    route: subjectRoutes
  }
];
moduleRoutes.forEach((route) => routes.use(route.path, route.route));
var routes_default = routes;

// src/app.ts
var app = express();
app.set("query parser", (str) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path3.resolve(process.cwd(), `src/app/templates`));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
    // methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    // allowedHeaders: [["Content-Type", "Authorization", "Cookie"],
  })
);
app.use("/api/auth", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", routes_default);
app.get("/", async (req, res) => {
  res.status(201).json({
    success: true,
    message: "Welcome to GreenFare API"
  });
});
app.use(globalErrorHandler);
app.use(notFound);
var app_default = app;

// src/app/utils/seed.ts
var seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN
      }
    });
    if (isSuperAdminExists) {
      console.log(
        "Super admin already exists. Skipping seeding super admin."
      );
      return;
    }
    const superAdminUser = await auth.api.signUpEmail({
      body: {
        email: envVars.SUPER_ADMIN_EMAIL,
        password: envVars.SUPER_ADMIN_PASSWORD,
        name: "Super Admin",
        role: UserRole.SUPER_ADMIN,
        needPasswordChange: false,
        rememberMe: false
      }
    });
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: superAdminUser.user.id },
        data: {
          emailVerified: true
        }
      });
      await tx.admin.create({
        data: {
          userId: superAdminUser.user.id,
          name: "Super Admin",
          email: envVars.SUPER_ADMIN_EMAIL
        }
      });
    });
    const superAdmin = await prisma.admin.findFirst({
      where: {
        email: envVars.SUPER_ADMIN_EMAIL
      },
      include: {
        user: true
      }
    });
    console.log("Super Admin Created", superAdmin);
  } catch (error) {
    console.error("Error seeding super admin: ", error);
    await prisma.user.delete({
      where: {
        email: envVars.SUPER_ADMIN_EMAIL
      }
    });
  }
};
var seedEmployeeSequence = async () => {
  try {
    const sequenceExists = await prisma.sequence.findUnique({
      where: {
        id: "employee"
      }
    });
    if (sequenceExists) {
      console.log("Employee sequence already exists. Skipping seed.");
      return;
    }
    await prisma.sequence.create({
      data: {
        id: "employee",
        current: 999
      }
    });
    console.log("Employee sequence seeded successfully");
  } catch (error) {
    console.error("Error seeding employee sequence:", error);
  }
};
var seedStudentSequence = async () => {
  try {
    const sequenceExists = await prisma.sequence.findUnique({
      where: {
        id: "student"
      }
    });
    if (sequenceExists) {
      console.log("Student sequence already exists. Skipping seed.");
      return;
    }
    await prisma.sequence.create({
      data: {
        id: "student",
        current: 999
      }
    });
    console.log("Student sequence seeded successfully");
  } catch (error) {
    console.error("Error seeding Student sequence:", error);
  }
};

// src/server.ts
var bootstrap = async () => {
  try {
    await seedSuperAdmin();
    await seedEmployeeSequence();
    await seedStudentSequence();
    await prisma.$connect();
    app_default.listen(envVars.PORT, () => {
      console.log(
        `Server is running on http://localhost:${envVars.PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};
if (process.env.NODE_ENV !== "production") {
  bootstrap();
}
var server_default = app_default;
export {
  server_default as default
};
//# sourceMappingURL=server.js.map