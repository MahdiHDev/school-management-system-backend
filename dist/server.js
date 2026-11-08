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
  "inlineSchema": 'model SalaryPayment {\n  id         String @id @default(uuid())\n  employeeId String\n\n  // Salary period\n  salaryMonth String\n\n  // Payment information\n  paymentDate DateTime @db.Date\n\n  // Salary breakdown\n  fixedSalary Decimal @db.Decimal(10, 2)\n  bonus       Decimal @default(0) @db.Decimal(10, 2)\n  deduction   Decimal @default(0) @db.Decimal(10, 2)\n\n  // Employee relation\n  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Restrict)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // One salary payment per employee per month\n  @@unique([employeeId, salaryMonth])\n  @@index([salaryMonth])\n  @@index([employeeId])\n  @@map("salary_payments")\n}\n\n// enums\nenum RegulationType {\n  STUDENT\n  EMPLOYEE\n  ATTENDANCE\n  EXAMINATION\n  LEAVE\n  CODE_OF_CONDUCT\n  UNIFORM\n  OTHER\n}\n\nenum GradeStatus {\n  PASS\n  FAIL\n}\n\nenum FeeParticularScope {\n  ALL_STUDENTS\n  SPECIFIC_CLASS\n}\n\n// tables\nmodel GeneralSettings {\n  id                   String  @id @default(uuid())\n  instituteName        String\n  institutePhoneNumber String\n  instituteEmail       String\n  instituteWebsite     String?\n  instituteAddress     String\n  instituteCountry     String\n\n  instituteLogo         String?\n  instituteLogoPublicId String?\n  instituteLogoName     String?\n  instituteLogoType     String?\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel RulesRegulations {\n  id      String         @id @default(uuid())\n  content String         @db.Text\n  type    RegulationType\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([type])\n  @@map("rules_regulations")\n}\n\nmodel GradingConfiguration {\n  id        String   @id @default(uuid())\n  name      String   @default("Default Grading")\n  isActive  Boolean  @default(true)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  grades       GradeScale[]\n  failCriteria FailCriteria?\n}\n\nmodel GradeScale {\n  id       String      @id @default(uuid())\n  grade    String\n  minMarks Int\n  maxMarks Int\n  status   GradeStatus @default(PASS)\n\n  configurationId String\n  configuration   GradingConfiguration @relation(fields: [configurationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([configurationId, grade])\n  @@index([configurationId])\n}\n\nmodel FailCriteria {\n  id                String @id @default(uuid())\n  overallPercentage Float\n  subjectPercentage Float\n  minFailedSubjects Int\n\n  configurationId String               @unique\n  configuration   GradingConfiguration @relation(fields: [configurationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\n// model FeeParticular {\n//     id     String             @id @default(uuid())\n//     label  String\n//     amount Decimal            @db.Decimal(10, 2)\n//     scope  FeeParticularScope\n\n//     classId String?\n//     class   Class?  @relation(fields: [classId], references: [id], onDelete: Cascade)\n\n//     sortOrder Int @default(0)\n\n//     createdAt DateTime @default(now())\n//     updatedAt DateTime @updatedAt\n\n//     @@index([scope])\n//     @@index([classId])\n// }\n\nmodel BankInfo {\n  id            String  @id @default(uuid())\n  nameOfBank    String\n  branchAddress String\n  accountNumber String\n  instruction   String?\n\n  bankLogo         String\n  bankLogoPublicId String\n  bankLogoName     String\n  bankLogoType     String\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nenum AttendanceStatus {\n  PRESENT\n  ABSENT\n  LEAVE\n}\n\nmodel AttendanceSession {\n  id      String   @id @default(uuid())\n  classId String\n  date    DateTime\n\n  class   Class              @relation(fields: [classId], references: [id], onDelete: Cascade)\n  records AttendanceRecord[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([classId, date])\n  @@index([classId])\n  @@index([date])\n  @@map("attendance_sessions")\n}\n\nmodel AttendanceRecord {\n  id        String           @id @default(uuid())\n  sessionId String\n  studentId String\n  status    AttendanceStatus\n\n  session AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)\n  student Student           @relation(fields: [studentId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([sessionId, studentId])\n  @@index([sessionId])\n  @@index([studentId])\n  @@map("attendance_records")\n}\n\nenum EmployeeAttendanceStatus {\n  PRESENT\n  ABSENT\n  LATE\n  HALF_DAY\n  LEAVE\n}\n\nmodel EmployeeAttendanceSession {\n  id   String   @id @default(uuid())\n  date DateTime @db.Date\n\n  records EmployeeAttendanceRecord[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([date])\n  @@index([date])\n  @@map("employee_attendance_sessions")\n}\n\nmodel EmployeeAttendanceRecord {\n  id         String                   @id @default(uuid())\n  sessionId  String\n  employeeId String\n  status     EmployeeAttendanceStatus\n\n  session EmployeeAttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)\n\n  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([sessionId, employeeId])\n  @@index([sessionId])\n  @@index([employeeId])\n  @@map("employee_attendance_records")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n  students           Student[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone String\n\n  fullName         String\n  nid              String\n  fatherName       String\n  motherName       String\n  emergencyContact String?\n  monthlySalary    Float\n  employeeId       String  @unique\n\n  picture         String?\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  experience         String?\n  experiencePublicId String?\n  experienceName     String?\n  experienceType     String?\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  employeeSign         String\n  employeeSignPublicId String\n  employeeSignName     String?\n  employeeSignType     String?\n\n  gender        Gender\n  bloodGroup    BloodGroup\n  religion      Religion\n  employeeRole  UserRole   @default(OTHER)\n  dateOfJoining String\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  address           Address?\n  classes           Class[]\n  attendanceRecords EmployeeAttendanceRecord[]\n  salaryPayments    SalaryPayment[]\n\n  @@map("employee")\n}\n\n// model TutorProfile {\n//     id String @id @default(uuid())\n\n//     classId    String\n\n//     class    Class    @relation(fields: [classId], references: [id], onDelete: Cascade)\n//     employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n// }\n\nmodel Class {\n  id                String @id @default(uuid())\n  name              String\n  monthlyTuitionFee Float\n  classTeacher      String\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  employee           Employee            @relation(fields: [classTeacher], references: [id], onDelete: Cascade)\n  students           Student[]\n  subjects           Subject[]\n  // feeParticulars FeeParticular[]\n  attendanceSessions AttendanceSession[]\n\n  @@map("class")\n}\n\nmodel Address {\n  id String @id @default(uuid())\n\n  studentId  String? @unique @map("student_id")\n  employeeId String? @unique @map("employee_id")\n\n  permanentAddressVillage    String?\n  permanentAddressPostOffice String?\n  permanentAddressPostCode   String?\n  permanentAddressDistrict   String?\n\n  presentAddressVillage    String?\n  presentAddressPostOffice String?\n  presentAddressPostCode   String?\n  presentAddressDistrict   String?\n\n  isDeleted Boolean @default(false)\n\n  student  Student?  @relation(fields: [studentId], references: [id])\n  employee Employee? @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now()) @map("created_at")\n  updatedAt DateTime  @updatedAt @map("updated_at")\n  deletedAt DateTime? @map("deleted_at")\n}\n\nmodel Sequence {\n  id      String @id\n  current Int\n}\n\nmodel GuardianInfo {\n  id             String @id @default(uuid())\n  studentId      String @unique\n  whatsappNumber String\n\n  fatherName         String\n  fatherNameBangla   String\n  fatherMobileNumber String\n  fatherOccupation   String\n\n  motherName         String\n  motherNameBangla   String\n  motherMobileNumber String\n  motherOccupation   String\n\n  nameOfLocalGuardian   String\n  relationShipOfStudent String\n  GuardianMobileNumber  String\n\n  student Student @relation(fields: [studentId], references: [id])\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Student {\n  id                      String      @id @default(uuid())\n  userId                  String\n  classId                 String\n  studentId               String      @unique\n  fullName                String\n  fullNameBangla          String\n  dateOfBirth             String\n  birthRegistrationNumber String      @unique\n  religion                Religion\n  admissionTotalFees      Int\n  admissionDate           String\n  gender                  Gender\n  bloodGroup              BloodGroup?\n  previousInstituteName   String?\n  endingClass             String?\n  result                  String?\n  testimonialNumber       String?\n\n  studentSign         String\n  studentSignPublicId String\n  studentsignName     String\n  studentSignType     String\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  guardianSign         String\n  guardianSignPublicId String?\n  guardianSignName     String?\n  guardianSignType     String?\n\n  picture         String\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  address      Address?\n  guardianInfo GuardianInfo?\n  class        Class         @relation(fields: [classId], references: [id])\n  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  attendanceRecords AttendanceRecord[]\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Subject {\n  id          String @id @default(uuid())\n  subjectName String\n  maxMarks    Int\n  classId     String\n  class       Class  @relation(fields: [classId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"SalaryPayment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"salaryMonth","kind":"scalar","type":"String"},{"name":"paymentDate","kind":"scalar","type":"DateTime"},{"name":"fixedSalary","kind":"scalar","type":"Decimal"},{"name":"bonus","kind":"scalar","type":"Decimal"},{"name":"deduction","kind":"scalar","type":"Decimal"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToSalaryPayment"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"salary_payments"},"GeneralSettings":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"instituteName","kind":"scalar","type":"String"},{"name":"institutePhoneNumber","kind":"scalar","type":"String"},{"name":"instituteEmail","kind":"scalar","type":"String"},{"name":"instituteWebsite","kind":"scalar","type":"String"},{"name":"instituteAddress","kind":"scalar","type":"String"},{"name":"instituteCountry","kind":"scalar","type":"String"},{"name":"instituteLogo","kind":"scalar","type":"String"},{"name":"instituteLogoPublicId","kind":"scalar","type":"String"},{"name":"instituteLogoName","kind":"scalar","type":"String"},{"name":"instituteLogoType","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"RulesRegulations":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"RegulationType"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"rules_regulations"},"GradingConfiguration":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"grades","kind":"object","type":"GradeScale","relationName":"GradeScaleToGradingConfiguration"},{"name":"failCriteria","kind":"object","type":"FailCriteria","relationName":"FailCriteriaToGradingConfiguration"}],"dbName":null},"GradeScale":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"grade","kind":"scalar","type":"String"},{"name":"minMarks","kind":"scalar","type":"Int"},{"name":"maxMarks","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"GradeStatus"},{"name":"configurationId","kind":"scalar","type":"String"},{"name":"configuration","kind":"object","type":"GradingConfiguration","relationName":"GradeScaleToGradingConfiguration"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"FailCriteria":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"overallPercentage","kind":"scalar","type":"Float"},{"name":"subjectPercentage","kind":"scalar","type":"Float"},{"name":"minFailedSubjects","kind":"scalar","type":"Int"},{"name":"configurationId","kind":"scalar","type":"String"},{"name":"configuration","kind":"object","type":"GradingConfiguration","relationName":"FailCriteriaToGradingConfiguration"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"BankInfo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"nameOfBank","kind":"scalar","type":"String"},{"name":"branchAddress","kind":"scalar","type":"String"},{"name":"accountNumber","kind":"scalar","type":"String"},{"name":"instruction","kind":"scalar","type":"String"},{"name":"bankLogo","kind":"scalar","type":"String"},{"name":"bankLogoPublicId","kind":"scalar","type":"String"},{"name":"bankLogoName","kind":"scalar","type":"String"},{"name":"bankLogoType","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"AttendanceSession":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"class","kind":"object","type":"Class","relationName":"AttendanceSessionToClass"},{"name":"records","kind":"object","type":"AttendanceRecord","relationName":"AttendanceRecordToAttendanceSession"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"attendance_sessions"},"AttendanceRecord":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"AttendanceStatus"},{"name":"session","kind":"object","type":"AttendanceSession","relationName":"AttendanceRecordToAttendanceSession"},{"name":"student","kind":"object","type":"Student","relationName":"AttendanceRecordToStudent"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"attendance_records"},"EmployeeAttendanceSession":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"records","kind":"object","type":"EmployeeAttendanceRecord","relationName":"EmployeeAttendanceRecordToEmployeeAttendanceSession"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"employee_attendance_sessions"},"EmployeeAttendanceRecord":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"EmployeeAttendanceStatus"},{"name":"session","kind":"object","type":"EmployeeAttendanceSession","relationName":"EmployeeAttendanceRecordToEmployeeAttendanceSession"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToEmployeeAttendanceRecord"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"employee_attendance_records"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"},{"name":"students","kind":"object","type":"Student","relationName":"StudentToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContact","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"String"},{"name":"experiencePublicId","kind":"scalar","type":"String"},{"name":"experienceName","kind":"scalar","type":"String"},{"name":"experienceType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"employeeSign","kind":"scalar","type":"String"},{"name":"employeeSignPublicId","kind":"scalar","type":"String"},{"name":"employeeSignName","kind":"scalar","type":"String"},{"name":"employeeSignType","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"UserRole"},{"name":"dateOfJoining","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToEmployee"},{"name":"classes","kind":"object","type":"Class","relationName":"ClassToEmployee"},{"name":"attendanceRecords","kind":"object","type":"EmployeeAttendanceRecord","relationName":"EmployeeToEmployeeAttendanceRecord"},{"name":"salaryPayments","kind":"object","type":"SalaryPayment","relationName":"EmployeeToSalaryPayment"}],"dbName":"employee"},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTuitionFee","kind":"scalar","type":"Float"},{"name":"classTeacher","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"employee","kind":"object","type":"Employee","relationName":"ClassToEmployee"},{"name":"students","kind":"object","type":"Student","relationName":"ClassToStudent"},{"name":"subjects","kind":"object","type":"Subject","relationName":"ClassToSubject"},{"name":"attendanceSessions","kind":"object","type":"AttendanceSession","relationName":"AttendanceSessionToClass"}],"dbName":"class"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String","dbName":"student_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"permanentAddressVillage","kind":"scalar","type":"String"},{"name":"permanentAddressPostOffice","kind":"scalar","type":"String"},{"name":"permanentAddressPostCode","kind":"scalar","type":"String"},{"name":"permanentAddressDistrict","kind":"scalar","type":"String"},{"name":"presentAddressVillage","kind":"scalar","type":"String"},{"name":"presentAddressPostOffice","kind":"scalar","type":"String"},{"name":"presentAddressPostCode","kind":"scalar","type":"String"},{"name":"presentAddressDistrict","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"student","kind":"object","type":"Student","relationName":"AddressToStudent"},{"name":"employee","kind":"object","type":"Employee","relationName":"AddressToEmployee"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"}],"dbName":null},"Sequence":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"current","kind":"scalar","type":"Int"}],"dbName":null},"GuardianInfo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"whatsappNumber","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"fatherNameBangla","kind":"scalar","type":"String"},{"name":"fatherMobileNumber","kind":"scalar","type":"String"},{"name":"fatherOccupation","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"motherNameBangla","kind":"scalar","type":"String"},{"name":"motherMobileNumber","kind":"scalar","type":"String"},{"name":"motherOccupation","kind":"scalar","type":"String"},{"name":"nameOfLocalGuardian","kind":"scalar","type":"String"},{"name":"relationShipOfStudent","kind":"scalar","type":"String"},{"name":"GuardianMobileNumber","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"GuardianInfoToStudent"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Student":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"fullNameBangla","kind":"scalar","type":"String"},{"name":"dateOfBirth","kind":"scalar","type":"String"},{"name":"birthRegistrationNumber","kind":"scalar","type":"String"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"admissionTotalFees","kind":"scalar","type":"Int"},{"name":"admissionDate","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"previousInstituteName","kind":"scalar","type":"String"},{"name":"endingClass","kind":"scalar","type":"String"},{"name":"result","kind":"scalar","type":"String"},{"name":"testimonialNumber","kind":"scalar","type":"String"},{"name":"studentSign","kind":"scalar","type":"String"},{"name":"studentSignPublicId","kind":"scalar","type":"String"},{"name":"studentsignName","kind":"scalar","type":"String"},{"name":"studentSignType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"guardianSign","kind":"scalar","type":"String"},{"name":"guardianSignPublicId","kind":"scalar","type":"String"},{"name":"guardianSignName","kind":"scalar","type":"String"},{"name":"guardianSignType","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToStudent"},{"name":"guardianInfo","kind":"object","type":"GuardianInfo","relationName":"GuardianInfoToStudent"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToStudent"},{"name":"user","kind":"object","type":"User","relationName":"StudentToUser"},{"name":"attendanceRecords","kind":"object","type":"AttendanceRecord","relationName":"AttendanceRecordToStudent"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"subjectName","kind":"scalar","type":"String"},{"name":"maxMarks","kind":"scalar","type":"Int"},{"name":"classId","kind":"scalar","type":"String"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToSubject"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","employee","admin","student","address","guardianInfo","students","class","subjects","session","records","_count","attendanceSessions","attendanceRecords","classes","salaryPayments","SalaryPayment.findUnique","SalaryPayment.findUniqueOrThrow","SalaryPayment.findFirst","SalaryPayment.findFirstOrThrow","SalaryPayment.findMany","data","SalaryPayment.createOne","SalaryPayment.createMany","SalaryPayment.createManyAndReturn","SalaryPayment.updateOne","SalaryPayment.updateMany","SalaryPayment.updateManyAndReturn","create","update","SalaryPayment.upsertOne","SalaryPayment.deleteOne","SalaryPayment.deleteMany","having","_avg","_sum","_min","_max","SalaryPayment.groupBy","SalaryPayment.aggregate","GeneralSettings.findUnique","GeneralSettings.findUniqueOrThrow","GeneralSettings.findFirst","GeneralSettings.findFirstOrThrow","GeneralSettings.findMany","GeneralSettings.createOne","GeneralSettings.createMany","GeneralSettings.createManyAndReturn","GeneralSettings.updateOne","GeneralSettings.updateMany","GeneralSettings.updateManyAndReturn","GeneralSettings.upsertOne","GeneralSettings.deleteOne","GeneralSettings.deleteMany","GeneralSettings.groupBy","GeneralSettings.aggregate","RulesRegulations.findUnique","RulesRegulations.findUniqueOrThrow","RulesRegulations.findFirst","RulesRegulations.findFirstOrThrow","RulesRegulations.findMany","RulesRegulations.createOne","RulesRegulations.createMany","RulesRegulations.createManyAndReturn","RulesRegulations.updateOne","RulesRegulations.updateMany","RulesRegulations.updateManyAndReturn","RulesRegulations.upsertOne","RulesRegulations.deleteOne","RulesRegulations.deleteMany","RulesRegulations.groupBy","RulesRegulations.aggregate","configuration","grades","failCriteria","GradingConfiguration.findUnique","GradingConfiguration.findUniqueOrThrow","GradingConfiguration.findFirst","GradingConfiguration.findFirstOrThrow","GradingConfiguration.findMany","GradingConfiguration.createOne","GradingConfiguration.createMany","GradingConfiguration.createManyAndReturn","GradingConfiguration.updateOne","GradingConfiguration.updateMany","GradingConfiguration.updateManyAndReturn","GradingConfiguration.upsertOne","GradingConfiguration.deleteOne","GradingConfiguration.deleteMany","GradingConfiguration.groupBy","GradingConfiguration.aggregate","GradeScale.findUnique","GradeScale.findUniqueOrThrow","GradeScale.findFirst","GradeScale.findFirstOrThrow","GradeScale.findMany","GradeScale.createOne","GradeScale.createMany","GradeScale.createManyAndReturn","GradeScale.updateOne","GradeScale.updateMany","GradeScale.updateManyAndReturn","GradeScale.upsertOne","GradeScale.deleteOne","GradeScale.deleteMany","GradeScale.groupBy","GradeScale.aggregate","FailCriteria.findUnique","FailCriteria.findUniqueOrThrow","FailCriteria.findFirst","FailCriteria.findFirstOrThrow","FailCriteria.findMany","FailCriteria.createOne","FailCriteria.createMany","FailCriteria.createManyAndReturn","FailCriteria.updateOne","FailCriteria.updateMany","FailCriteria.updateManyAndReturn","FailCriteria.upsertOne","FailCriteria.deleteOne","FailCriteria.deleteMany","FailCriteria.groupBy","FailCriteria.aggregate","BankInfo.findUnique","BankInfo.findUniqueOrThrow","BankInfo.findFirst","BankInfo.findFirstOrThrow","BankInfo.findMany","BankInfo.createOne","BankInfo.createMany","BankInfo.createManyAndReturn","BankInfo.updateOne","BankInfo.updateMany","BankInfo.updateManyAndReturn","BankInfo.upsertOne","BankInfo.deleteOne","BankInfo.deleteMany","BankInfo.groupBy","BankInfo.aggregate","AttendanceSession.findUnique","AttendanceSession.findUniqueOrThrow","AttendanceSession.findFirst","AttendanceSession.findFirstOrThrow","AttendanceSession.findMany","AttendanceSession.createOne","AttendanceSession.createMany","AttendanceSession.createManyAndReturn","AttendanceSession.updateOne","AttendanceSession.updateMany","AttendanceSession.updateManyAndReturn","AttendanceSession.upsertOne","AttendanceSession.deleteOne","AttendanceSession.deleteMany","AttendanceSession.groupBy","AttendanceSession.aggregate","AttendanceRecord.findUnique","AttendanceRecord.findUniqueOrThrow","AttendanceRecord.findFirst","AttendanceRecord.findFirstOrThrow","AttendanceRecord.findMany","AttendanceRecord.createOne","AttendanceRecord.createMany","AttendanceRecord.createManyAndReturn","AttendanceRecord.updateOne","AttendanceRecord.updateMany","AttendanceRecord.updateManyAndReturn","AttendanceRecord.upsertOne","AttendanceRecord.deleteOne","AttendanceRecord.deleteMany","AttendanceRecord.groupBy","AttendanceRecord.aggregate","EmployeeAttendanceSession.findUnique","EmployeeAttendanceSession.findUniqueOrThrow","EmployeeAttendanceSession.findFirst","EmployeeAttendanceSession.findFirstOrThrow","EmployeeAttendanceSession.findMany","EmployeeAttendanceSession.createOne","EmployeeAttendanceSession.createMany","EmployeeAttendanceSession.createManyAndReturn","EmployeeAttendanceSession.updateOne","EmployeeAttendanceSession.updateMany","EmployeeAttendanceSession.updateManyAndReturn","EmployeeAttendanceSession.upsertOne","EmployeeAttendanceSession.deleteOne","EmployeeAttendanceSession.deleteMany","EmployeeAttendanceSession.groupBy","EmployeeAttendanceSession.aggregate","EmployeeAttendanceRecord.findUnique","EmployeeAttendanceRecord.findUniqueOrThrow","EmployeeAttendanceRecord.findFirst","EmployeeAttendanceRecord.findFirstOrThrow","EmployeeAttendanceRecord.findMany","EmployeeAttendanceRecord.createOne","EmployeeAttendanceRecord.createMany","EmployeeAttendanceRecord.createManyAndReturn","EmployeeAttendanceRecord.updateOne","EmployeeAttendanceRecord.updateMany","EmployeeAttendanceRecord.updateManyAndReturn","EmployeeAttendanceRecord.upsertOne","EmployeeAttendanceRecord.deleteOne","EmployeeAttendanceRecord.deleteMany","EmployeeAttendanceRecord.groupBy","EmployeeAttendanceRecord.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","Employee.groupBy","Employee.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","Sequence.findUnique","Sequence.findUniqueOrThrow","Sequence.findFirst","Sequence.findFirstOrThrow","Sequence.findMany","Sequence.createOne","Sequence.createMany","Sequence.createManyAndReturn","Sequence.updateOne","Sequence.updateMany","Sequence.updateManyAndReturn","Sequence.upsertOne","Sequence.deleteOne","Sequence.deleteMany","Sequence.groupBy","Sequence.aggregate","GuardianInfo.findUnique","GuardianInfo.findUniqueOrThrow","GuardianInfo.findFirst","GuardianInfo.findFirstOrThrow","GuardianInfo.findMany","GuardianInfo.createOne","GuardianInfo.createMany","GuardianInfo.createManyAndReturn","GuardianInfo.updateOne","GuardianInfo.updateMany","GuardianInfo.updateManyAndReturn","GuardianInfo.upsertOne","GuardianInfo.deleteOne","GuardianInfo.deleteMany","GuardianInfo.groupBy","GuardianInfo.aggregate","Student.findUnique","Student.findUniqueOrThrow","Student.findFirst","Student.findFirstOrThrow","Student.findMany","Student.createOne","Student.createMany","Student.createManyAndReturn","Student.updateOne","Student.updateMany","Student.updateManyAndReturn","Student.upsertOne","Student.deleteOne","Student.deleteMany","Student.groupBy","Student.aggregate","Subject.findUnique","Subject.findUniqueOrThrow","Subject.findFirst","Subject.findFirstOrThrow","Subject.findMany","Subject.createOne","Subject.createMany","Subject.createManyAndReturn","Subject.updateOne","Subject.updateMany","Subject.updateManyAndReturn","Subject.upsertOne","Subject.deleteOne","Subject.deleteMany","Subject.groupBy","Subject.aggregate","AND","OR","NOT","id","subjectName","maxMarks","classId","isdeleted","createdAt","updatedAt","deletedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","userId","studentId","fullName","fullNameBangla","dateOfBirth","birthRegistrationNumber","Religion","religion","admissionTotalFees","admissionDate","Gender","gender","BloodGroup","bloodGroup","previousInstituteName","endingClass","result","testimonialNumber","studentSign","studentSignPublicId","studentsignName","studentSignType","authoritySign","authoritySignPublicId","authoritySignName","authoritySignType","guardianSign","guardianSignPublicId","guardianSignName","guardianSignType","picture","picturePublicId","pictureName","pictureType","whatsappNumber","fatherName","fatherNameBangla","fatherMobileNumber","fatherOccupation","motherName","motherNameBangla","motherMobileNumber","motherOccupation","nameOfLocalGuardian","relationShipOfStudent","GuardianMobileNumber","current","employeeId","permanentAddressVillage","permanentAddressPostOffice","permanentAddressPostCode","permanentAddressDistrict","presentAddressVillage","presentAddressPostOffice","presentAddressPostCode","presentAddressDistrict","isDeleted","name","monthlyTuitionFee","classTeacher","phone","nid","emergencyContact","monthlySalary","experience","experiencePublicId","experienceName","experienceType","employeeSign","employeeSignPublicId","employeeSignName","employeeSignType","UserRole","employeeRole","dateOfJoining","every","some","none","email","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","role","UserStatus","status","needPasswordChange","emailVerified","image","sessionId","EmployeeAttendanceStatus","date","AttendanceStatus","nameOfBank","branchAddress","accountNumber","instruction","bankLogo","bankLogoPublicId","bankLogoName","bankLogoType","overallPercentage","subjectPercentage","minFailedSubjects","configurationId","grade","minMarks","GradeStatus","isActive","configurationId_grade","content","RegulationType","type","instituteName","institutePhoneNumber","instituteEmail","instituteWebsite","instituteAddress","instituteCountry","instituteLogo","instituteLogoPublicId","instituteLogoName","instituteLogoType","salaryMonth","paymentDate","fixedSalary","bonus","deduction","sessionId_employeeId","sessionId_studentId","classId_date","employeeId_salaryMonth","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "3gnQAfACDgYAAOIFACCQAwAA4AUAMJEDAAA6ABCSAwAA4AUAMJMDAQAAAAGYA0AAiQUAIZkDQACJBQAh1QMBAIcFACGuBAEAhwUAIa8EQACJBQAhsAQQAOEFACGxBBAA4QUAIbIEEADhBQAhtgQAAPgFACABAAAAAQAgDAMAAKQFACCQAwAA9wUAMJEDAAADABCSAwAA9wUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIaYDAQCHBQAh-QNAAIkFACGDBAEAhwUAIYQEAQCRBQAhhQQBAJEFACEDAwAAwgcAIIQEAAD5BQAghQQAAPkFACAMAwAApAUAIJADAAD3BQAwkQMAAAMAEJIDAAD3BQAwkwMBAAAAAZgDQACJBQAhmQNAAIkFACGmAwEAhwUAIfkDQACJBQAhgwQBAAAAAYQEAQCRBQAhhQQBAJEFACEDAAAAAwAgAQAABAAwAgAABQAgEQMAAKQFACCQAwAA9gUAMJEDAAAHABCSAwAA9gUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIaYDAQCHBQAh-gMBAIcFACH7AwEAhwUAIfwDAQCRBQAh_QMBAJEFACH-AwEAkQUAIf8DQACKBQAhgARAAIoFACGBBAEAkQUAIYIEAQCRBQAhCAMAAMIHACD8AwAA-QUAIP0DAAD5BQAg_gMAAPkFACD_AwAA-QUAIIAEAAD5BQAggQQAAPkFACCCBAAA-QUAIBEDAACkBQAgkAMAAPYFADCRAwAABwAQkgMAAPYFADCTAwEAAAABmANAAIkFACGZA0AAiQUAIaYDAQCHBQAh-gMBAIcFACH7AwEAhwUAIfwDAQCRBQAh_QMBAJEFACH-AwEAkQUAIf8DQACKBQAhgARAAIoFACGBBAEAkQUAIYIEAQCRBQAhAwAAAAcAIAEAAAgAMAIAAAkAICsDAACkBQAgCQAApQUAIBIAAKcFACATAACmBQAgFAAAqAUAIJADAACeBQAwkQMAAAsAEJIDAACeBQAwkwMBAIcFACGXAyAAiAUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAIaYDAQCHBQAhqAMBAIcFACGtAwAAogWtAyKxAwAAoAWxAyKzAwAAoQWzAyK8AwEAhwUAIb0DAQCHBQAhvgMBAJEFACG_AwEAkQUAIcQDAQCRBQAhxQMBAJEFACHGAwEAkQUAIccDAQCRBQAhyQMBAIcFACHNAwEAhwUAIdUDAQCHBQAh4gMBAIcFACHjAwEAhwUAIeQDAQCRBQAh5QMIAJ8FACHmAwEAkQUAIecDAQCRBQAh6AMBAJEFACHpAwEAkQUAIeoDAQCHBQAh6wMBAIcFACHsAwEAkQUAIe0DAQCRBQAh7wMAAKMF7wMi8AMBAIcFACEBAAAACwAgDgMAAKQFACCQAwAAqgUAMJEDAAANABCSAwAAqgUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhpgMBAIcFACHeAyAAiAUAId8DAQCHBQAh9AMBAIcFACH1AwEAkQUAIfYDAQCRBQAhAQAAAA0AIC0DAACkBQAgCQAApQUAIAoAAPUFACAMAADwBQAgEgAA8QUAIJADAADzBQAwkQMAAA8AEJIDAADzBQAwkwMBAIcFACGWAwEAhwUAIZcDIACIBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhpgMBAIcFACGnAwEAhwUAIagDAQCHBQAhqQMBAIcFACGqAwEAhwUAIasDAQCHBQAhrQMAAKIFrQMirgMCAI4FACGvAwEAhwUAIbEDAACgBbEDIrMDAAD0BbMDI7QDAQCRBQAhtQMBAJEFACG2AwEAkQUAIbcDAQCRBQAhuAMBAIcFACG5AwEAhwUAIboDAQCHBQAhuwMBAIcFACG8AwEAhwUAIb0DAQCHBQAhvgMBAJEFACG_AwEAkQUAIcADAQCHBQAhwQMBAJEFACHCAwEAkQUAIcMDAQCRBQAhxAMBAIcFACHFAwEAkQUAIcYDAQCRBQAhxwMBAJEFACETAwAAwgcAIAkAAMMHACAKAADyCAAgDAAA8AgAIBIAAPEIACCaAwAA-QUAILMDAAD5BQAgtAMAAPkFACC1AwAA-QUAILYDAAD5BQAgtwMAAPkFACC-AwAA-QUAIL8DAAD5BQAgwQMAAPkFACDCAwAA-QUAIMMDAAD5BQAgxQMAAPkFACDGAwAA-QUAIMcDAAD5BQAgLQMAAKQFACAJAAClBQAgCgAA9QUAIAwAAPAFACASAADxBQAgkAMAAPMFADCRAwAADwAQkgMAAPMFADCTAwEAAAABlgMBAIcFACGXAyAAiAUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAIaYDAQCHBQAhpwMBAAAAAagDAQCHBQAhqQMBAIcFACGqAwEAhwUAIasDAQAAAAGtAwAAogWtAyKuAwIAjgUAIa8DAQCHBQAhsQMAAKAFsQMiswMAAPQFswMjtAMBAJEFACG1AwEAkQUAIbYDAQCRBQAhtwMBAJEFACG4AwEAhwUAIbkDAQCHBQAhugMBAIcFACG7AwEAhwUAIbwDAQCHBQAhvQMBAIcFACG-AwEAkQUAIb8DAQCRBQAhwAMBAIcFACHBAwEAkQUAIcIDAQCRBQAhwwMBAJEFACHEAwEAhwUAIcUDAQCRBQAhxgMBAJEFACHHAwEAkQUAIQMAAAAPACABAAAQADACAAARACAUBgAAkwUAIAgAAJIFACCQAwAAkAUAMJEDAAATABCSAwAAkAUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhpwMBAJEFACHVAwEAkQUAIdYDAQCRBQAh1wMBAJEFACHYAwEAkQUAIdkDAQCRBQAh2gMBAJEFACHbAwEAkQUAIdwDAQCRBQAh3QMBAJEFACHeAyAAiAUAIQEAAAATACABAAAADwAgAQAAAAsAIBYIAACLBQAgkAMAAIYFADCRAwAAFwAQkgMAAIYFADCTAwEAhwUAIZcDIACIBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhpwMBAIcFACHIAwEAhwUAIckDAQCHBQAhygMBAIcFACHLAwEAhwUAIcwDAQCHBQAhzQMBAIcFACHOAwEAhwUAIc8DAQCHBQAh0AMBAIcFACHRAwEAhwUAIdIDAQCHBQAh0wMBAIcFACEBAAAAFwAgAwAAAA8AIAEAABAAMAIAABEAIAwMAADwBQAgkAMAAPIFADCRAwAAGgAQkgMAAPIFADCTAwEAhwUAIZQDAQCHBQAhlQMCAI4FACGWAwEAhwUAIZcDIACIBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhAgwAAPAIACCaAwAA-QUAIAwMAADwBQAgkAMAAPIFADCRAwAAGgAQkgMAAPIFADCTAwEAAAABlAMBAIcFACGVAwIAjgUAIZYDAQCHBQAhlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACEDAAAAGgAgAQAAGwAwAgAAHAAgCgwAAPAFACAPAADxBQAgkAMAAO8FADCRAwAAHgAQkgMAAO8FADCTAwEAhwUAIZYDAQCHBQAhmANAAIkFACGZA0AAiQUAIY4EQACJBQAhAgwAAPAIACAPAADxCAAgCwwAAPAFACAPAADxBQAgkAMAAO8FADCRAwAAHgAQkgMAAO8FADCTAwEAAAABlgMBAIcFACGYA0AAiQUAIZkDQACJBQAhjgRAAIkFACG1BAAA7gUAIAMAAAAeACABAAAfADACAAAgACALCAAAiwUAIA4AAO0FACCQAwAA6wUAMJEDAAAiABCSAwAA6wUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIacDAQCHBQAhiAQAAOwFkAQijAQBAIcFACECCAAAuQYAIA4AAO8IACAMCAAAiwUAIA4AAO0FACCQAwAA6wUAMJEDAAAiABCSAwAA6wUAMJMDAQAAAAGYA0AAiQUAIZkDQACJBQAhpwMBAIcFACGIBAAA7AWQBCKMBAEAhwUAIbQEAADqBQAgAwAAACIAIAEAACMAMAIAACQAIAEAAAAiACABAAAADwAgAQAAABoAIAEAAAAeACADAAAAIgAgAQAAIwAwAgAAJAAgAQAAACIAIAEAAAADACABAAAABwAgAQAAAA8AIAEAAAATACAPBgAA4gUAIAsAALgFACANAADoBQAgEQAA6QUAIJADAADnBQAwkQMAADAAEJIDAADnBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACHeAyAAiAUAId8DAQCHBQAh4AMIAJ8FACHhAwEAhwUAIQUGAADEBgAgCwAAlQgAIA0AAO0IACARAADuCAAgmgMAAPkFACAPBgAA4gUAIAsAALgFACANAADoBQAgEQAA6QUAIJADAADnBQAwkQMAADAAEJIDAADnBQAwkwMBAAAAAZgDQACJBQAhmQNAAIkFACGaA0AAigUAId4DIACIBQAh3wMBAIcFACHgAwgAnwUAIeEDAQCHBQAhAwAAADAAIAEAADEAMAIAADIAIAsGAADiBQAgDgAA5gUAIJADAADkBQAwkQMAADQAEJIDAADkBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAh1QMBAIcFACGIBAAA5QWOBCKMBAEAhwUAIQIGAADEBgAgDgAA7AgAIAwGAADiBQAgDgAA5gUAIJADAADkBQAwkQMAADQAEJIDAADkBQAwkwMBAAAAAZgDQACJBQAhmQNAAIkFACHVAwEAhwUAIYgEAADlBY4EIowEAQCHBQAhswQAAOMFACADAAAANAAgAQAANQAwAgAANgAgAwAAADQAIAEAADUAMAIAADYAIAEAAAA0ACANBgAA4gUAIJADAADgBQAwkQMAADoAEJIDAADgBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAh1QMBAIcFACGuBAEAhwUAIa8EQACJBQAhsAQQAOEFACGxBBAA4QUAIbIEEADhBQAhAQYAAMQGACADAAAAOgAgAQAAOwAwAgAAAQAgAQAAADAAIAEAAAA0ACABAAAAOgAgAQAAAAEAIAMAAAA6ACABAAA7ADACAAABACADAAAAOgAgAQAAOwAwAgAAAQAgAwAAADoAIAEAADsAMAIAAAEAIAoGAADrCAAgkwMBAAAAAZgDQAAAAAGZA0AAAAAB1QMBAAAAAa4EAQAAAAGvBEAAAAABsAQQAAAAAbEEEAAAAAGyBBAAAAABARoAAEQAIAmTAwEAAAABmANAAAAAAZkDQAAAAAHVAwEAAAABrgQBAAAAAa8EQAAAAAGwBBAAAAABsQQQAAAAAbIEEAAAAAEBGgAARgAwARoAAEYAMAoGAADqCAAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAh1QMBAP8FACGuBAEA_wUAIa8EQACCBgAhsAQQAJoHACGxBBAAmgcAIbIEEACaBwAhAgAAAAEAIBoAAEkAIAmTAwEA_wUAIZgDQACCBgAhmQNAAIIGACHVAwEA_wUAIa4EAQD_BQAhrwRAAIIGACGwBBAAmgcAIbEEEACaBwAhsgQQAJoHACECAAAAOgAgGgAASwAgAgAAADoAIBoAAEsAIAMAAAABACAhAABEACAiAABJACABAAAAAQAgAQAAADoAIAUQAADlCAAgJwAA5ggAICgAAOkIACApAADoCAAgKgAA5wgAIAyQAwAA3AUAMJEDAABSABCSAwAA3AUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIdUDAQDnBAAhrgQBAOcEACGvBEAA6gQAIbAEEADdBQAhsQQQAN0FACGyBBAA3QUAIQMAAAA6ACABAABRADAmAABSACADAAAAOgAgAQAAOwAwAgAAAQAgEpADAADbBQAwkQMAAFgAEJIDAADbBQAwkwMBAAAAAZgDQACJBQAhmQNAAIkFACGaA0AAigUAId4DIACIBQAhpAQBAIcFACGlBAEAhwUAIaYEAQCHBQAhpwQBAJEFACGoBAEAhwUAIakEAQCHBQAhqgQBAJEFACGrBAEAkQUAIawEAQCRBQAhrQQBAJEFACEBAAAAVQAgAQAAAFUAIBKQAwAA2wUAMJEDAABYABCSAwAA2wUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAh3gMgAIgFACGkBAEAhwUAIaUEAQCHBQAhpgQBAIcFACGnBAEAkQUAIagEAQCHBQAhqQQBAIcFACGqBAEAkQUAIasEAQCRBQAhrAQBAJEFACGtBAEAkQUAIQaaAwAA-QUAIKcEAAD5BQAgqgQAAPkFACCrBAAA-QUAIKwEAAD5BQAgrQQAAPkFACADAAAAWAAgAQAAWQAwAgAAVQAgAwAAAFgAIAEAAFkAMAIAAFUAIAMAAABYACABAABZADACAABVACAPkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAGkBAEAAAABpQQBAAAAAaYEAQAAAAGnBAEAAAABqAQBAAAAAakEAQAAAAGqBAEAAAABqwQBAAAAAawEAQAAAAGtBAEAAAABARoAAF0AIA-TAwEAAAABmANAAAAAAZkDQAAAAAGaA0AAAAAB3gMgAAAAAaQEAQAAAAGlBAEAAAABpgQBAAAAAacEAQAAAAGoBAEAAAABqQQBAAAAAaoEAQAAAAGrBAEAAAABrAQBAAAAAa0EAQAAAAEBGgAAXwAwARoAAF8AMA-TAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAId4DIACBBgAhpAQBAP8FACGlBAEA_wUAIaYEAQD_BQAhpwQBAI4GACGoBAEA_wUAIakEAQD_BQAhqgQBAI4GACGrBAEAjgYAIawEAQCOBgAhrQQBAI4GACECAAAAVQAgGgAAYgAgD5MDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACGkBAEA_wUAIaUEAQD_BQAhpgQBAP8FACGnBAEAjgYAIagEAQD_BQAhqQQBAP8FACGqBAEAjgYAIasEAQCOBgAhrAQBAI4GACGtBAEAjgYAIQIAAABYACAaAABkACACAAAAWAAgGgAAZAAgAwAAAFUAICEAAF0AICIAAGIAIAEAAABVACABAAAAWAAgCRAAAOIIACApAADkCAAgKgAA4wgAIJoDAAD5BQAgpwQAAPkFACCqBAAA-QUAIKsEAAD5BQAgrAQAAPkFACCtBAAA-QUAIBKQAwAA2gUAMJEDAABrABCSAwAA2gUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIZoDQADrBAAh3gMgAOkEACGkBAEA5wQAIaUEAQDnBAAhpgQBAOcEACGnBAEA_AQAIagEAQDnBAAhqQQBAOcEACGqBAEA_AQAIasEAQD8BAAhrAQBAPwEACGtBAEA_AQAIQMAAABYACABAABqADAmAABrACADAAAAWAAgAQAAWQAwAgAAVQAgCZADAADYBQAwkQMAAHEAEJIDAADYBQAwkwMBAAAAAZgDQACJBQAhmQNAAIkFACGaA0AAigUAIaEEAQCHBQAhowQAANkFowQiAQAAAG4AIAEAAABuACAJkAMAANgFADCRAwAAcQAQkgMAANgFADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAIaEEAQCHBQAhowQAANkFowQiAZoDAAD5BQAgAwAAAHEAIAEAAHIAMAIAAG4AIAMAAABxACABAAByADACAABuACADAAAAcQAgAQAAcgAwAgAAbgAgBpMDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGhBAEAAAABowQAAACjBAIBGgAAdgAgBpMDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGhBAEAAAABowQAAACjBAIBGgAAeAAwARoAAHgAMAaTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIaEEAQD_BQAhowQAAOEIowQiAgAAAG4AIBoAAHsAIAaTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIaEEAQD_BQAhowQAAOEIowQiAgAAAHEAIBoAAH0AIAIAAABxACAaAAB9ACADAAAAbgAgIQAAdgAgIgAAewAgAQAAAG4AIAEAAABxACAEEAAA3ggAICkAAOAIACAqAADfCAAgmgMAAPkFACAJkAMAANQFADCRAwAAhAEAEJIDAADUBQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACGhBAEA5wQAIaMEAADVBaMEIgMAAABxACABAACDAQAwJgAAhAEAIAMAAABxACABAAByADACAABuACAKTgAAzwUAIE8AANAFACCQAwAAzgUAMJEDAACRAQAQkgMAAM4FADCTAwEAAAABmANAAIkFACGZA0AAiQUAId8DAQCHBQAhnwQgAIgFACEBAAAAhwEAIAxNAADIBQAgkAMAANIFADCRAwAAiQEAEJIDAADSBQAwkwMBAIcFACGVAwIAjgUAIZgDQACJBQAhmQNAAIkFACGIBAAA0wWfBCKbBAEAhwUAIZwEAQCHBQAhnQQCAI4FACEBTQAAuwgAIA1NAADIBQAgkAMAANIFADCRAwAAiQEAEJIDAADSBQAwkwMBAAAAAZUDAgCOBQAhmANAAIkFACGZA0AAiQUAIYgEAADTBZ8EIpsEAQCHBQAhnAQBAIcFACGdBAIAjgUAIaAEAADRBQAgAwAAAIkBACABAACKAQAwAgAAiwEAIAtNAADIBQAgkAMAAMcFADCRAwAAjQEAEJIDAADHBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhmAQIAJ8FACGZBAgAnwUAIZoEAgCOBQAhmwQBAIcFACEBAAAAjQEAIAEAAACJAQAgAQAAAIcBACAKTgAAzwUAIE8AANAFACCQAwAAzgUAMJEDAACRAQAQkgMAAM4FADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACHfAwEAhwUAIZ8EIACIBQAhAk4AANwIACBPAADdCAAgAwAAAJEBACABAACSAQAwAgAAhwEAIAMAAACRAQAgAQAAkgEAMAIAAIcBACADAAAAkQEAIAEAAJIBADACAACHAQAgB04AANoIACBPAADbCAAgkwMBAAAAAZgDQAAAAAGZA0AAAAAB3wMBAAAAAZ8EIAAAAAEBGgAAlgEAIAWTAwEAAAABmANAAAAAAZkDQAAAAAHfAwEAAAABnwQgAAAAAQEaAACYAQAwARoAAJgBADAHTgAAxwgAIE8AAMgIACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACHfAwEA_wUAIZ8EIACBBgAhAgAAAIcBACAaAACbAQAgBZMDAQD_BQAhmANAAIIGACGZA0AAggYAId8DAQD_BQAhnwQgAIEGACECAAAAkQEAIBoAAJ0BACACAAAAkQEAIBoAAJ0BACADAAAAhwEAICEAAJYBACAiAACbAQAgAQAAAIcBACABAAAAkQEAIAMQAADECAAgKQAAxggAICoAAMUIACAIkAMAAM0FADCRAwAApAEAEJIDAADNBQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAh3wMBAOcEACGfBCAA6QQAIQMAAACRAQAgAQAAowEAMCYAAKQBACADAAAAkQEAIAEAAJIBADACAACHAQAgAQAAAIsBACABAAAAiwEAIAMAAACJAQAgAQAAigEAMAIAAIsBACADAAAAiQEAIAEAAIoBADACAACLAQAgAwAAAIkBACABAACKAQAwAgAAiwEAIAlNAADDCAAgkwMBAAAAAZUDAgAAAAGYA0AAAAABmQNAAAAAAYgEAAAAnwQCmwQBAAAAAZwEAQAAAAGdBAIAAAABARoAAKwBACAIkwMBAAAAAZUDAgAAAAGYA0AAAAABmQNAAAAAAYgEAAAAnwQCmwQBAAAAAZwEAQAAAAGdBAIAAAABARoAAK4BADABGgAArgEAMAlNAADCCAAgkwMBAP8FACGVAwIAgAYAIZgDQACCBgAhmQNAAIIGACGIBAAAwQifBCKbBAEA_wUAIZwEAQD_BQAhnQQCAIAGACECAAAAiwEAIBoAALEBACAIkwMBAP8FACGVAwIAgAYAIZgDQACCBgAhmQNAAIIGACGIBAAAwQifBCKbBAEA_wUAIZwEAQD_BQAhnQQCAIAGACECAAAAiQEAIBoAALMBACACAAAAiQEAIBoAALMBACADAAAAiwEAICEAAKwBACAiAACxAQAgAQAAAIsBACABAAAAiQEAIAUQAAC8CAAgJwAAvQgAICgAAMAIACApAAC_CAAgKgAAvggAIAuQAwAAyQUAMJEDAAC6AQAQkgMAAMkFADCTAwEA5wQAIZUDAgDoBAAhmANAAOoEACGZA0AA6gQAIYgEAADKBZ8EIpsEAQDnBAAhnAQBAOcEACGdBAIA6AQAIQMAAACJAQAgAQAAuQEAMCYAALoBACADAAAAiQEAIAEAAIoBADACAACLAQAgC00AAMgFACCQAwAAxwUAMJEDAACNAQAQkgMAAMcFADCTAwEAAAABmANAAIkFACGZA0AAiQUAIZgECACfBQAhmQQIAJ8FACGaBAIAjgUAIZsEAQAAAAEBAAAAvQEAIAEAAAC9AQAgAU0AALsIACADAAAAjQEAIAEAAMABADACAAC9AQAgAwAAAI0BACABAADAAQAwAgAAvQEAIAMAAACNAQAgAQAAwAEAMAIAAL0BACAITQAAuggAIJMDAQAAAAGYA0AAAAABmQNAAAAAAZgECAAAAAGZBAgAAAABmgQCAAAAAZsEAQAAAAEBGgAAxAEAIAeTAwEAAAABmANAAAAAAZkDQAAAAAGYBAgAAAABmQQIAAAAAZoEAgAAAAGbBAEAAAABARoAAMYBADABGgAAxgEAMAhNAAC5CAAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmAQIAMoGACGZBAgAygYAIZoEAgCABgAhmwQBAP8FACECAAAAvQEAIBoAAMkBACAHkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmAQIAMoGACGZBAgAygYAIZoEAgCABgAhmwQBAP8FACECAAAAjQEAIBoAAMsBACACAAAAjQEAIBoAAMsBACADAAAAvQEAICEAAMQBACAiAADJAQAgAQAAAL0BACABAAAAjQEAIAUQAAC0CAAgJwAAtQgAICgAALgIACApAAC3CAAgKgAAtggAIAqQAwAAxgUAMJEDAADSAQAQkgMAAMYFADCTAwEA5wQAIZgDQADqBAAhmQNAAOoEACGYBAgAlQUAIZkECACVBQAhmgQCAOgEACGbBAEA5wQAIQMAAACNAQAgAQAA0QEAMCYAANIBACADAAAAjQEAIAEAAMABADACAAC9AQAgEJADAADFBQAwkQMAANgBABCSAwAAxQUAMJMDAQAAAAGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACHeAyAAiAUAIZAEAQCHBQAhkQQBAIcFACGSBAEAhwUAIZMEAQCRBQAhlAQBAIcFACGVBAEAhwUAIZYEAQCHBQAhlwQBAIcFACEBAAAA1QEAIAEAAADVAQAgEJADAADFBQAwkQMAANgBABCSAwAAxQUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAh3gMgAIgFACGQBAEAhwUAIZEEAQCHBQAhkgQBAIcFACGTBAEAkQUAIZQEAQCHBQAhlQQBAIcFACGWBAEAhwUAIZcEAQCHBQAhApoDAAD5BQAgkwQAAPkFACADAAAA2AEAIAEAANkBADACAADVAQAgAwAAANgBACABAADZAQAwAgAA1QEAIAMAAADYAQAgAQAA2QEAMAIAANUBACANkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAGQBAEAAAABkQQBAAAAAZIEAQAAAAGTBAEAAAABlAQBAAAAAZUEAQAAAAGWBAEAAAABlwQBAAAAAQEaAADdAQAgDZMDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAHeAyAAAAABkAQBAAAAAZEEAQAAAAGSBAEAAAABkwQBAAAAAZQEAQAAAAGVBAEAAAABlgQBAAAAAZcEAQAAAAEBGgAA3wEAMAEaAADfAQAwDZMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACGQBAEA_wUAIZEEAQD_BQAhkgQBAP8FACGTBAEAjgYAIZQEAQD_BQAhlQQBAP8FACGWBAEA_wUAIZcEAQD_BQAhAgAAANUBACAaAADiAQAgDZMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACGQBAEA_wUAIZEEAQD_BQAhkgQBAP8FACGTBAEAjgYAIZQEAQD_BQAhlQQBAP8FACGWBAEA_wUAIZcEAQD_BQAhAgAAANgBACAaAADkAQAgAgAAANgBACAaAADkAQAgAwAAANUBACAhAADdAQAgIgAA4gEAIAEAAADVAQAgAQAAANgBACAFEAAAsQgAICkAALMIACAqAACyCAAgmgMAAPkFACCTBAAA-QUAIBCQAwAAxAUAMJEDAADrAQAQkgMAAMQFADCTAwEA5wQAIZgDQADqBAAhmQNAAOoEACGaA0AA6wQAId4DIADpBAAhkAQBAOcEACGRBAEA5wQAIZIEAQDnBAAhkwQBAPwEACGUBAEA5wQAIZUEAQDnBAAhlgQBAOcEACGXBAEA5wQAIQMAAADYAQAgAQAA6gEAMCYAAOsBACADAAAA2AEAIAEAANkBADACAADVAQAgAQAAACAAIAEAAAAgACADAAAAHgAgAQAAHwAwAgAAIAAgAwAAAB4AIAEAAB8AMAIAACAAIAMAAAAeACABAAAfADACAAAgACAHDAAAsAgAIA8AAOcGACCTAwEAAAABlgMBAAAAAZgDQAAAAAGZA0AAAAABjgRAAAAAAQEaAADzAQAgBZMDAQAAAAGWAwEAAAABmANAAAAAAZkDQAAAAAGOBEAAAAABARoAAPUBADABGgAA9QEAMAcMAACvCAAgDwAA2gYAIJMDAQD_BQAhlgMBAP8FACGYA0AAggYAIZkDQACCBgAhjgRAAIIGACECAAAAIAAgGgAA-AEAIAWTAwEA_wUAIZYDAQD_BQAhmANAAIIGACGZA0AAggYAIY4EQACCBgAhAgAAAB4AIBoAAPoBACACAAAAHgAgGgAA-gEAIAMAAAAgACAhAADzAQAgIgAA-AEAIAEAAAAgACABAAAAHgAgAxAAAKwIACApAACuCAAgKgAArQgAIAiQAwAAwwUAMJEDAACBAgAQkgMAAMMFADCTAwEA5wQAIZYDAQDnBAAhmANAAOoEACGZA0AA6gQAIY4EQADqBAAhAwAAAB4AIAEAAIACADAmAACBAgAgAwAAAB4AIAEAAB8AMAIAACAAIAEAAAAkACABAAAAJAAgAwAAACIAIAEAACMAMAIAACQAIAMAAAAiACABAAAjADACAAAkACADAAAAIgAgAQAAIwAwAgAAJAAgCAgAAOUGACAOAACiBgAgkwMBAAAAAZgDQAAAAAGZA0AAAAABpwMBAAAAAYgEAAAAkAQCjAQBAAAAAQEaAACJAgAgBpMDAQAAAAGYA0AAAAABmQNAAAAAAacDAQAAAAGIBAAAAJAEAowEAQAAAAEBGgAAiwIAMAEaAACLAgAwCAgAAOMGACAOAACgBgAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhpwMBAP8FACGIBAAAngaQBCKMBAEA_wUAIQIAAAAkACAaAACOAgAgBpMDAQD_BQAhmANAAIIGACGZA0AAggYAIacDAQD_BQAhiAQAAJ4GkAQijAQBAP8FACECAAAAIgAgGgAAkAIAIAIAAAAiACAaAACQAgAgAwAAACQAICEAAIkCACAiAACOAgAgAQAAACQAIAEAAAAiACADEAAAqQgAICkAAKsIACAqAACqCAAgCZADAAC_BQAwkQMAAJcCABCSAwAAvwUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIacDAQDnBAAhiAQAAMAFkAQijAQBAOcEACEDAAAAIgAgAQAAlgIAMCYAAJcCACADAAAAIgAgAQAAIwAwAgAAJAAgCA8AAKcFACCQAwAAvgUAMJEDAACdAgAQkgMAAL4FADCTAwEAAAABmANAAIkFACGZA0AAiQUAIY4EQAAAAAEBAAAAmgIAIAEAAACaAgAgCA8AAKcFACCQAwAAvgUAMJEDAACdAgAQkgMAAL4FADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGOBEAAiQUAIQEPAADFBwAgAwAAAJ0CACABAACeAgAwAgAAmgIAIAMAAACdAgAgAQAAngIAMAIAAJoCACADAAAAnQIAIAEAAJ4CADACAACaAgAgBQ8AAKgIACCTAwEAAAABmANAAAAAAZkDQAAAAAGOBEAAAAABARoAAKICACAEkwMBAAAAAZgDQAAAAAGZA0AAAAABjgRAAAAAAQEaAACkAgAwARoAAKQCADAFDwAAnggAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIY4EQACCBgAhAgAAAJoCACAaAACnAgAgBJMDAQD_BQAhmANAAIIGACGZA0AAggYAIY4EQACCBgAhAgAAAJ0CACAaAACpAgAgAgAAAJ0CACAaAACpAgAgAwAAAJoCACAhAACiAgAgIgAApwIAIAEAAACaAgAgAQAAAJ0CACADEAAAmwgAICkAAJ0IACAqAACcCAAgB5ADAAC9BQAwkQMAALACABCSAwAAvQUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIY4EQADqBAAhAwAAAJ0CACABAACvAgAwJgAAsAIAIAMAAACdAgAgAQAAngIAMAIAAJoCACABAAAANgAgAQAAADYAIAMAAAA0ACABAAA1ADACAAA2ACADAAAANAAgAQAANQAwAgAANgAgAwAAADQAIAEAADUAMAIAADYAIAgGAACaCAAgDgAAqwcAIJMDAQAAAAGYA0AAAAABmQNAAAAAAdUDAQAAAAGIBAAAAI4EAowEAQAAAAEBGgAAuAIAIAaTAwEAAAABmANAAAAAAZkDQAAAAAHVAwEAAAABiAQAAACOBAKMBAEAAAABARoAALoCADABGgAAugIAMAgGAACZCAAgDgAAqQcAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIdUDAQD_BQAhiAQAAKcHjgQijAQBAP8FACECAAAANgAgGgAAvQIAIAaTAwEA_wUAIZgDQACCBgAhmQNAAIIGACHVAwEA_wUAIYgEAACnB44EIowEAQD_BQAhAgAAADQAIBoAAL8CACACAAAANAAgGgAAvwIAIAMAAAA2ACAhAAC4AgAgIgAAvQIAIAEAAAA2ACABAAAANAAgAxAAAJYIACApAACYCAAgKgAAlwgAIAmQAwAAuQUAMJEDAADGAgAQkgMAALkFADCTAwEA5wQAIZgDQADqBAAhmQNAAOoEACHVAwEA5wQAIYgEAAC6BY4EIowEAQDnBAAhAwAAADQAIAEAAMUCADAmAADGAgAgAwAAADQAIAEAADUAMAIAADYAIBQEAAC1BQAgBQAAtgUAIAYAAJMFACAHAAC3BQAgCwAAuAUAIJADAACzBQAwkQMAAMwCABCSAwAAswUAMJMDAQAAAAGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACHeAyAAiAUAId8DAQCHBQAh9AMBAAAAAYYEAACjBe8DIogEAAC0BYgEIokEIACIBQAhigQgAIgFACGLBAEAkQUAIQEAAADJAgAgAQAAAMkCACAUBAAAtQUAIAUAALYFACAGAACTBQAgBwAAtwUAIAsAALgFACCQAwAAswUAMJEDAADMAgAQkgMAALMFADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAId4DIACIBQAh3wMBAIcFACH0AwEAhwUAIYYEAACjBe8DIogEAAC0BYgEIokEIACIBQAhigQgAIgFACGLBAEAkQUAIQcEAACSCAAgBQAAkwgAIAYAAMQGACAHAACUCAAgCwAAlQgAIJoDAAD5BQAgiwQAAPkFACADAAAAzAIAIAEAAM0CADACAADJAgAgAwAAAMwCACABAADNAgAwAgAAyQIAIAMAAADMAgAgAQAAzQIAMAIAAMkCACARBAAAjQgAIAUAAI4IACAGAACPCAAgBwAAkAgAIAsAAJEIACCTAwEAAAABmANAAAAAAZkDQAAAAAGaA0AAAAAB3gMgAAAAAd8DAQAAAAH0AwEAAAABhgQAAADvAwKIBAAAAIgEAokEIAAAAAGKBCAAAAABiwQBAAAAAQEaAADRAgAgDJMDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAHeAyAAAAAB3wMBAAAAAfQDAQAAAAGGBAAAAO8DAogEAAAAiAQCiQQgAAAAAYoEIAAAAAGLBAEAAAABARoAANMCADABGgAA0wIAMBEEAADdBwAgBQAA3gcAIAYAAN8HACAHAADgBwAgCwAA4QcAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACHfAwEA_wUAIfQDAQD_BQAhhgQAAIoH7wMiiAQAANwHiAQiiQQgAIEGACGKBCAAgQYAIYsEAQCOBgAhAgAAAMkCACAaAADWAgAgDJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACHfAwEA_wUAIfQDAQD_BQAhhgQAAIoH7wMiiAQAANwHiAQiiQQgAIEGACGKBCAAgQYAIYsEAQCOBgAhAgAAAMwCACAaAADYAgAgAgAAAMwCACAaAADYAgAgAwAAAMkCACAhAADRAgAgIgAA1gIAIAEAAADJAgAgAQAAAMwCACAFEAAA2QcAICkAANsHACAqAADaBwAgmgMAAPkFACCLBAAA-QUAIA-QAwAArwUAMJEDAADfAgAQkgMAAK8FADCTAwEA5wQAIZgDQADqBAAhmQNAAOoEACGaA0AA6wQAId4DIADpBAAh3wMBAOcEACH0AwEA5wQAIYYEAACZBe8DIogEAACwBYgEIokEIADpBAAhigQgAOkEACGLBAEA_AQAIQMAAADMAgAgAQAA3gIAMCYAAN8CACADAAAAzAIAIAEAAM0CADACAADJAgAgAQAAAAUAIAEAAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACAJAwAA2AcAIJMDAQAAAAGYA0AAAAABmQNAAAAAAaYDAQAAAAH5A0AAAAABgwQBAAAAAYQEAQAAAAGFBAEAAAABARoAAOcCACAIkwMBAAAAAZgDQAAAAAGZA0AAAAABpgMBAAAAAfkDQAAAAAGDBAEAAAABhAQBAAAAAYUEAQAAAAEBGgAA6QIAMAEaAADpAgAwCQMAANcHACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGmAwEA_wUAIfkDQACCBgAhgwQBAP8FACGEBAEAjgYAIYUEAQCOBgAhAgAAAAUAIBoAAOwCACAIkwMBAP8FACGYA0AAggYAIZkDQACCBgAhpgMBAP8FACH5A0AAggYAIYMEAQD_BQAhhAQBAI4GACGFBAEAjgYAIQIAAAADACAaAADuAgAgAgAAAAMAIBoAAO4CACADAAAABQAgIQAA5wIAICIAAOwCACABAAAABQAgAQAAAAMAIAUQAADUBwAgKQAA1gcAICoAANUHACCEBAAA-QUAIIUEAAD5BQAgC5ADAACuBQAwkQMAAPUCABCSAwAArgUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIaYDAQDnBAAh-QNAAOoEACGDBAEA5wQAIYQEAQD8BAAhhQQBAPwEACEDAAAAAwAgAQAA9AIAMCYAAPUCACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAOAwAA0wcAIJMDAQAAAAGYA0AAAAABmQNAAAAAAaYDAQAAAAH6AwEAAAAB-wMBAAAAAfwDAQAAAAH9AwEAAAAB_gMBAAAAAf8DQAAAAAGABEAAAAABgQQBAAAAAYIEAQAAAAEBGgAA_QIAIA2TAwEAAAABmANAAAAAAZkDQAAAAAGmAwEAAAAB-gMBAAAAAfsDAQAAAAH8AwEAAAAB_QMBAAAAAf4DAQAAAAH_A0AAAAABgARAAAAAAYEEAQAAAAGCBAEAAAABARoAAP8CADABGgAA_wIAMA4DAADSBwAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhpgMBAP8FACH6AwEA_wUAIfsDAQD_BQAh_AMBAI4GACH9AwEAjgYAIf4DAQCOBgAh_wNAAIMGACGABEAAgwYAIYEEAQCOBgAhggQBAI4GACECAAAACQAgGgAAggMAIA2TAwEA_wUAIZgDQACCBgAhmQNAAIIGACGmAwEA_wUAIfoDAQD_BQAh-wMBAP8FACH8AwEAjgYAIf0DAQCOBgAh_gMBAI4GACH_A0AAgwYAIYAEQACDBgAhgQQBAI4GACGCBAEAjgYAIQIAAAAHACAaAACEAwAgAgAAAAcAIBoAAIQDACADAAAACQAgIQAA_QIAICIAAIIDACABAAAACQAgAQAAAAcAIAoQAADPBwAgKQAA0QcAICoAANAHACD8AwAA-QUAIP0DAAD5BQAg_gMAAPkFACD_AwAA-QUAIIAEAAD5BQAggQQAAPkFACCCBAAA-QUAIBCQAwAArQUAMJEDAACLAwAQkgMAAK0FADCTAwEA5wQAIZgDQADqBAAhmQNAAOoEACGmAwEA5wQAIfoDAQDnBAAh-wMBAOcEACH8AwEA_AQAIf0DAQD8BAAh_gMBAPwEACH_A0AA6wQAIYAEQADrBAAhgQQBAPwEACGCBAEA_AQAIQMAAAAHACABAACKAwAwJgAAiwMAIAMAAAAHACABAAAIADACAAAJACAJkAMAAKwFADCRAwAAkQMAEJIDAACsBQAwkwMBAAAAAZgDQACJBQAhmQNAAIkFACH3AwEAhwUAIfgDAQCHBQAh-QNAAIkFACEBAAAAjgMAIAEAAACOAwAgCZADAACsBQAwkQMAAJEDABCSAwAArAUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIfcDAQCHBQAh-AMBAIcFACH5A0AAiQUAIQADAAAAkQMAIAEAAJIDADACAACOAwAgAwAAAJEDACABAACSAwAwAgAAjgMAIAMAAACRAwAgAQAAkgMAMAIAAI4DACAGkwMBAAAAAZgDQAAAAAGZA0AAAAAB9wMBAAAAAfgDAQAAAAH5A0AAAAABARoAAJYDACAGkwMBAAAAAZgDQAAAAAGZA0AAAAAB9wMBAAAAAfgDAQAAAAH5A0AAAAABARoAAJgDADABGgAAmAMAMAaTAwEA_wUAIZgDQACCBgAhmQNAAIIGACH3AwEA_wUAIfgDAQD_BQAh-QNAAIIGACECAAAAjgMAIBoAAJsDACAGkwMBAP8FACGYA0AAggYAIZkDQACCBgAh9wMBAP8FACH4AwEA_wUAIfkDQACCBgAhAgAAAJEDACAaAACdAwAgAgAAAJEDACAaAACdAwAgAwAAAI4DACAhAACWAwAgIgAAmwMAIAEAAACOAwAgAQAAAJEDACADEAAAzAcAICkAAM4HACAqAADNBwAgCZADAACrBQAwkQMAAKQDABCSAwAAqwUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIfcDAQDnBAAh-AMBAOcEACH5A0AA6gQAIQMAAACRAwAgAQAAowMAMCYAAKQDACADAAAAkQMAIAEAAJIDADACAACOAwAgDgMAAKQFACCQAwAAqgUAMJEDAAANABCSAwAAqgUAMJMDAQAAAAGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGmAwEAAAAB3gMgAIgFACHfAwEAhwUAIfQDAQAAAAH1AwEAkQUAIfYDAQCRBQAhAQAAAKcDACABAAAApwMAIAQDAADCBwAgmgMAAPkFACD1AwAA-QUAIPYDAAD5BQAgAwAAAA0AIAEAAKoDADACAACnAwAgAwAAAA0AIAEAAKoDADACAACnAwAgAwAAAA0AIAEAAKoDADACAACnAwAgCwMAAMsHACCTAwEAAAABmANAAAAAAZkDQAAAAAGaA0AAAAABpgMBAAAAAd4DIAAAAAHfAwEAAAAB9AMBAAAAAfUDAQAAAAH2AwEAAAABARoAAK4DACAKkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAaYDAQAAAAHeAyAAAAAB3wMBAAAAAfQDAQAAAAH1AwEAAAAB9gMBAAAAAQEaAACwAwAwARoAALADADALAwAAygcAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpgMBAP8FACHeAyAAgQYAId8DAQD_BQAh9AMBAP8FACH1AwEAjgYAIfYDAQCOBgAhAgAAAKcDACAaAACzAwAgCpMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpgMBAP8FACHeAyAAgQYAId8DAQD_BQAh9AMBAP8FACH1AwEAjgYAIfYDAQCOBgAhAgAAAA0AIBoAALUDACACAAAADQAgGgAAtQMAIAMAAACnAwAgIQAArgMAICIAALMDACABAAAApwMAIAEAAAANACAGEAAAxwcAICkAAMkHACAqAADIBwAgmgMAAPkFACD1AwAA-QUAIPYDAAD5BQAgDZADAACpBQAwkQMAALwDABCSAwAAqQUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIZoDQADrBAAhpgMBAOcEACHeAyAA6QQAId8DAQDnBAAh9AMBAOcEACH1AwEA_AQAIfYDAQD8BAAhAwAAAA0AIAEAALsDADAmAAC8AwAgAwAAAA0AIAEAAKoDADACAACnAwAgKwMAAKQFACAJAAClBQAgEgAApwUAIBMAAKYFACAUAACoBQAgkAMAAJ4FADCRAwAACwAQkgMAAJ4FADCTAwEAAAABlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGmAwEAAAABqAMBAIcFACGtAwAAogWtAyKxAwAAoAWxAyKzAwAAoQWzAyK8AwEAhwUAIb0DAQCHBQAhvgMBAJEFACG_AwEAkQUAIcQDAQCRBQAhxQMBAJEFACHGAwEAkQUAIccDAQCRBQAhyQMBAIcFACHNAwEAhwUAIdUDAQAAAAHiAwEAhwUAIeMDAQCHBQAh5AMBAJEFACHlAwgAnwUAIeYDAQCRBQAh5wMBAJEFACHoAwEAkQUAIekDAQCRBQAh6gMBAIcFACHrAwEAhwUAIewDAQCRBQAh7QMBAJEFACHvAwAAowXvAyLwAwEAhwUAIQEAAAC_AwAgAQAAAL8DACATAwAAwgcAIAkAAMMHACASAADFBwAgEwAAxAcAIBQAAMYHACCaAwAA-QUAIL4DAAD5BQAgvwMAAPkFACDEAwAA-QUAIMUDAAD5BQAgxgMAAPkFACDHAwAA-QUAIOQDAAD5BQAg5gMAAPkFACDnAwAA-QUAIOgDAAD5BQAg6QMAAPkFACDsAwAA-QUAIO0DAAD5BQAgAwAAAAsAIAEAAMIDADACAAC_AwAgAwAAAAsAIAEAAMIDADACAAC_AwAgAwAAAAsAIAEAAMIDADACAAC_AwAgKAMAAL0HACAJAAC-BwAgEgAAwAcAIBMAAL8HACAUAADBBwAgkwMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGmAwEAAAABqAMBAAAAAa0DAAAArQMCsQMAAACxAwKzAwAAALMDArwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHEAwEAAAABxQMBAAAAAcYDAQAAAAHHAwEAAAAByQMBAAAAAc0DAQAAAAHVAwEAAAAB4gMBAAAAAeMDAQAAAAHkAwEAAAAB5QMIAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQAAAAHqAwEAAAAB6wMBAAAAAewDAQAAAAHtAwEAAAAB7wMAAADvAwLwAwEAAAABARoAAMYDACAjkwMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGmAwEAAAABqAMBAAAAAa0DAAAArQMCsQMAAACxAwKzAwAAALMDArwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHEAwEAAAABxQMBAAAAAcYDAQAAAAHHAwEAAAAByQMBAAAAAc0DAQAAAAHVAwEAAAAB4gMBAAAAAeMDAQAAAAHkAwEAAAAB5QMIAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQAAAAHqAwEAAAAB6wMBAAAAAewDAQAAAAHtAwEAAAAB7wMAAADvAwLwAwEAAAABARoAAMgDADABGgAAyAMAMCgDAACLBwAgCQAAjAcAIBIAAI4HACATAACNBwAgFAAAjwcAIJMDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIagDAQD_BQAhrQMAAIsGrQMisQMAAIwGsQMiswMAAIkHswMivAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHEAwEAjgYAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAIckDAQD_BQAhzQMBAP8FACHVAwEA_wUAIeIDAQD_BQAh4wMBAP8FACHkAwEAjgYAIeUDCADKBgAh5gMBAI4GACHnAwEAjgYAIegDAQCOBgAh6QMBAI4GACHqAwEA_wUAIesDAQD_BQAh7AMBAI4GACHtAwEAjgYAIe8DAACKB-8DIvADAQD_BQAhAgAAAL8DACAaAADLAwAgI5MDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIagDAQD_BQAhrQMAAIsGrQMisQMAAIwGsQMiswMAAIkHswMivAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHEAwEAjgYAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAIckDAQD_BQAhzQMBAP8FACHVAwEA_wUAIeIDAQD_BQAh4wMBAP8FACHkAwEAjgYAIeUDCADKBgAh5gMBAI4GACHnAwEAjgYAIegDAQCOBgAh6QMBAI4GACHqAwEA_wUAIesDAQD_BQAh7AMBAI4GACHtAwEAjgYAIe8DAACKB-8DIvADAQD_BQAhAgAAAAsAIBoAAM0DACACAAAACwAgGgAAzQMAIAMAAAC_AwAgIQAAxgMAICIAAMsDACABAAAAvwMAIAEAAAALACATEAAAhAcAICcAAIUHACAoAACIBwAgKQAAhwcAICoAAIYHACCaAwAA-QUAIL4DAAD5BQAgvwMAAPkFACDEAwAA-QUAIMUDAAD5BQAgxgMAAPkFACDHAwAA-QUAIOQDAAD5BQAg5gMAAPkFACDnAwAA-QUAIOgDAAD5BQAg6QMAAPkFACDsAwAA-QUAIO0DAAD5BQAgJpADAACXBQAwkQMAANQDABCSAwAAlwUAMJMDAQDnBAAhlwMgAOkEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACGmAwEA5wQAIagDAQDnBAAhrQMAAPkErQMisQMAAPoEsQMiswMAAJgFswMivAMBAOcEACG9AwEA5wQAIb4DAQD8BAAhvwMBAPwEACHEAwEA_AQAIcUDAQD8BAAhxgMBAPwEACHHAwEA_AQAIckDAQDnBAAhzQMBAOcEACHVAwEA5wQAIeIDAQDnBAAh4wMBAOcEACHkAwEA_AQAIeUDCACVBQAh5gMBAPwEACHnAwEA_AQAIegDAQD8BAAh6QMBAPwEACHqAwEA5wQAIesDAQDnBAAh7AMBAPwEACHtAwEA_AQAIe8DAACZBe8DIvADAQDnBAAhAwAAAAsAIAEAANMDADAmAADUAwAgAwAAAAsAIAEAAMIDADACAAC_AwAgAQAAADIAIAEAAAAyACADAAAAMAAgAQAAMQAwAgAAMgAgAwAAADAAIAEAADEAMAIAADIAIAMAAAAwACABAAAxADACAAAyACAMBgAAgAcAIAsAAIEHACANAACCBwAgEQAAgwcAIJMDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAHeAyAAAAAB3wMBAAAAAeADCAAAAAHhAwEAAAABARoAANwDACAIkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAHfAwEAAAAB4AMIAAAAAeEDAQAAAAEBGgAA3gMAMAEaAADeAwAwDAYAAMsGACALAADMBgAgDQAAzQYAIBEAAM4GACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAId4DIACBBgAh3wMBAP8FACHgAwgAygYAIeEDAQD_BQAhAgAAADIAIBoAAOEDACAIkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHeAyAAgQYAId8DAQD_BQAh4AMIAMoGACHhAwEA_wUAIQIAAAAwACAaAADjAwAgAgAAADAAIBoAAOMDACADAAAAMgAgIQAA3AMAICIAAOEDACABAAAAMgAgAQAAADAAIAYQAADFBgAgJwAAxgYAICgAAMkGACApAADIBgAgKgAAxwYAIJoDAAD5BQAgC5ADAACUBQAwkQMAAOoDABCSAwAAlAUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIZoDQADrBAAh3gMgAOkEACHfAwEA5wQAIeADCACVBQAh4QMBAOcEACEDAAAAMAAgAQAA6QMAMCYAAOoDACADAAAAMAAgAQAAMQAwAgAAMgAgFAYAAJMFACAIAACSBQAgkAMAAJAFADCRAwAAEwAQkgMAAJAFADCTAwEAAAABmANAAIkFACGZA0AAiQUAIZoDQACKBQAhpwMBAAAAAdUDAQAAAAHWAwEAkQUAIdcDAQCRBQAh2AMBAJEFACHZAwEAkQUAIdoDAQCRBQAh2wMBAJEFACHcAwEAkQUAId0DAQCRBQAh3gMgAIgFACEBAAAA7QMAIAEAAADtAwAgDQYAAMQGACAIAAC5BgAgmgMAAPkFACCnAwAA-QUAINUDAAD5BQAg1gMAAPkFACDXAwAA-QUAINgDAAD5BQAg2QMAAPkFACDaAwAA-QUAINsDAAD5BQAg3AMAAPkFACDdAwAA-QUAIAMAAAATACABAADwAwAwAgAA7QMAIAMAAAATACABAADwAwAwAgAA7QMAIAMAAAATACABAADwAwAwAgAA7QMAIBEGAACuBgAgCAAAwwYAIJMDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGnAwEAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHaAwEAAAAB2wMBAAAAAdwDAQAAAAHdAwEAAAAB3gMgAAAAAQEaAAD0AwAgD5MDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGnAwEAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMBAAAAAdkDAQAAAAHaAwEAAAAB2wMBAAAAAdwDAQAAAAHdAwEAAAAB3gMgAAAAAQEaAAD2AwAwARoAAPYDADABAAAADwAgAQAAAAsAIBEGAACtBgAgCAAAwgYAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpwMBAI4GACHVAwEAjgYAIdYDAQCOBgAh1wMBAI4GACHYAwEAjgYAIdkDAQCOBgAh2gMBAI4GACHbAwEAjgYAIdwDAQCOBgAh3QMBAI4GACHeAyAAgQYAIQIAAADtAwAgGgAA-wMAIA-TAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIacDAQCOBgAh1QMBAI4GACHWAwEAjgYAIdcDAQCOBgAh2AMBAI4GACHZAwEAjgYAIdoDAQCOBgAh2wMBAI4GACHcAwEAjgYAId0DAQCOBgAh3gMgAIEGACECAAAAEwAgGgAA_QMAIAIAAAATACAaAAD9AwAgAQAAAA8AIAEAAAALACADAAAA7QMAICEAAPQDACAiAAD7AwAgAQAAAO0DACABAAAAEwAgDhAAAL8GACApAADBBgAgKgAAwAYAIJoDAAD5BQAgpwMAAPkFACDVAwAA-QUAINYDAAD5BQAg1wMAAPkFACDYAwAA-QUAINkDAAD5BQAg2gMAAPkFACDbAwAA-QUAINwDAAD5BQAg3QMAAPkFACASkAMAAI8FADCRAwAAhgQAEJIDAACPBQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACGnAwEA_AQAIdUDAQD8BAAh1gMBAPwEACHXAwEA_AQAIdgDAQD8BAAh2QMBAPwEACHaAwEA_AQAIdsDAQD8BAAh3AMBAPwEACHdAwEA_AQAId4DIADpBAAhAwAAABMAIAEAAIUEADAmAACGBAAgAwAAABMAIAEAAPADADACAADtAwAgBZADAACNBQAwkQMAAIwEABCSAwAAjQUAMJMDAQAAAAHUAwIAjgUAIQEAAACJBAAgAQAAAIkEACAFkAMAAI0FADCRAwAAjAQAEJIDAACNBQAwkwMBAIcFACHUAwIAjgUAIQADAAAAjAQAIAEAAI0EADACAACJBAAgAwAAAIwEACABAACNBAAwAgAAiQQAIAMAAACMBAAgAQAAjQQAMAIAAIkEACACkwMBAAAAAdQDAgAAAAEBGgAAkQQAIAKTAwEAAAAB1AMCAAAAAQEaAACTBAAwARoAAJMEADACkwMBAP8FACHUAwIAgAYAIQIAAACJBAAgGgAAlgQAIAKTAwEA_wUAIdQDAgCABgAhAgAAAIwEACAaAACYBAAgAgAAAIwEACAaAACYBAAgAwAAAIkEACAhAACRBAAgIgAAlgQAIAEAAACJBAAgAQAAAIwEACAFEAAAugYAICcAALsGACAoAAC-BgAgKQAAvQYAICoAALwGACAFkAMAAIwFADCRAwAAnwQAEJIDAACMBQAwkwMBAOcEACHUAwIA6AQAIQMAAACMBAAgAQAAngQAMCYAAJ8EACADAAAAjAQAIAEAAI0EADACAACJBAAgFggAAIsFACCQAwAAhgUAMJEDAAAXABCSAwAAhgUAMJMDAQAAAAGXAyAAiAUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAIacDAQAAAAHIAwEAhwUAIckDAQCHBQAhygMBAIcFACHLAwEAhwUAIcwDAQCHBQAhzQMBAIcFACHOAwEAhwUAIc8DAQCHBQAh0AMBAIcFACHRAwEAhwUAIdIDAQCHBQAh0wMBAIcFACEBAAAAogQAIAEAAACiBAAgAggAALkGACCaAwAA-QUAIAMAAAAXACABAAClBAAwAgAAogQAIAMAAAAXACABAAClBAAwAgAAogQAIAMAAAAXACABAAClBAAwAgAAogQAIBMIAAC4BgAgkwMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGnAwEAAAAByAMBAAAAAckDAQAAAAHKAwEAAAABywMBAAAAAcwDAQAAAAHNAwEAAAABzgMBAAAAAc8DAQAAAAHQAwEAAAAB0QMBAAAAAdIDAQAAAAHTAwEAAAABARoAAKkEACASkwMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGnAwEAAAAByAMBAAAAAckDAQAAAAHKAwEAAAABywMBAAAAAcwDAQAAAAHNAwEAAAABzgMBAAAAAc8DAQAAAAHQAwEAAAAB0QMBAAAAAdIDAQAAAAHTAwEAAAABARoAAKsEADABGgAAqwQAMBMIAAC3BgAgkwMBAP8FACGXAyAAgQYAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIacDAQD_BQAhyAMBAP8FACHJAwEA_wUAIcoDAQD_BQAhywMBAP8FACHMAwEA_wUAIc0DAQD_BQAhzgMBAP8FACHPAwEA_wUAIdADAQD_BQAh0QMBAP8FACHSAwEA_wUAIdMDAQD_BQAhAgAAAKIEACAaAACuBAAgEpMDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGnAwEA_wUAIcgDAQD_BQAhyQMBAP8FACHKAwEA_wUAIcsDAQD_BQAhzAMBAP8FACHNAwEA_wUAIc4DAQD_BQAhzwMBAP8FACHQAwEA_wUAIdEDAQD_BQAh0gMBAP8FACHTAwEA_wUAIQIAAAAXACAaAACwBAAgAgAAABcAIBoAALAEACADAAAAogQAICEAAKkEACAiAACuBAAgAQAAAKIEACABAAAAFwAgBBAAALQGACApAAC2BgAgKgAAtQYAIJoDAAD5BQAgFZADAACFBQAwkQMAALcEABCSAwAAhQUAMJMDAQDnBAAhlwMgAOkEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACGnAwEA5wQAIcgDAQDnBAAhyQMBAOcEACHKAwEA5wQAIcsDAQDnBAAhzAMBAOcEACHNAwEA5wQAIc4DAQDnBAAhzwMBAOcEACHQAwEA5wQAIdEDAQDnBAAh0gMBAOcEACHTAwEA5wQAIQMAAAAXACABAAC2BAAwJgAAtwQAIAMAAAAXACABAAClBAAwAgAAogQAIAEAAAARACABAAAAEQAgAwAAAA8AIAEAABAAMAIAABEAIAMAAAAPACABAAAQADACAAARACADAAAADwAgAQAAEAAwAgAAEQAgKgMAALIGACAJAACvBgAgCgAAsAYAIAwAALEGACASAACzBgAgkwMBAAAAAZYDAQAAAAGXAyAAAAABmANAAAAAAZkDQAAAAAGaA0AAAAABpgMBAAAAAacDAQAAAAGoAwEAAAABqQMBAAAAAaoDAQAAAAGrAwEAAAABrQMAAACtAwKuAwIAAAABrwMBAAAAAbEDAAAAsQMCswMAAACzAwO0AwEAAAABtQMBAAAAAbYDAQAAAAG3AwEAAAABuAMBAAAAAbkDAQAAAAG6AwEAAAABuwMBAAAAAbwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHAAwEAAAABwQMBAAAAAcIDAQAAAAHDAwEAAAABxAMBAAAAAcUDAQAAAAHGAwEAAAABxwMBAAAAAQEaAAC_BAAgJZMDAQAAAAGWAwEAAAABlwMgAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAaYDAQAAAAGnAwEAAAABqAMBAAAAAakDAQAAAAGqAwEAAAABqwMBAAAAAa0DAAAArQMCrgMCAAAAAa8DAQAAAAGxAwAAALEDArMDAAAAswMDtAMBAAAAAbUDAQAAAAG2AwEAAAABtwMBAAAAAbgDAQAAAAG5AwEAAAABugMBAAAAAbsDAQAAAAG8AwEAAAABvQMBAAAAAb4DAQAAAAG_AwEAAAABwAMBAAAAAcEDAQAAAAHCAwEAAAABwwMBAAAAAcQDAQAAAAHFAwEAAAABxgMBAAAAAccDAQAAAAEBGgAAwQQAMAEaAADBBAAwKgMAAJIGACAJAACPBgAgCgAAkAYAIAwAAJEGACASAACTBgAgkwMBAP8FACGWAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpgMBAP8FACGnAwEA_wUAIagDAQD_BQAhqQMBAP8FACGqAwEA_wUAIasDAQD_BQAhrQMAAIsGrQMirgMCAIAGACGvAwEA_wUAIbEDAACMBrEDIrMDAACNBrMDI7QDAQCOBgAhtQMBAI4GACG2AwEAjgYAIbcDAQCOBgAhuAMBAP8FACG5AwEA_wUAIboDAQD_BQAhuwMBAP8FACG8AwEA_wUAIb0DAQD_BQAhvgMBAI4GACG_AwEAjgYAIcADAQD_BQAhwQMBAI4GACHCAwEAjgYAIcMDAQCOBgAhxAMBAP8FACHFAwEAjgYAIcYDAQCOBgAhxwMBAI4GACECAAAAEQAgGgAAxAQAICWTAwEA_wUAIZYDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIacDAQD_BQAhqAMBAP8FACGpAwEA_wUAIaoDAQD_BQAhqwMBAP8FACGtAwAAiwatAyKuAwIAgAYAIa8DAQD_BQAhsQMAAIwGsQMiswMAAI0GswMjtAMBAI4GACG1AwEAjgYAIbYDAQCOBgAhtwMBAI4GACG4AwEA_wUAIbkDAQD_BQAhugMBAP8FACG7AwEA_wUAIbwDAQD_BQAhvQMBAP8FACG-AwEAjgYAIb8DAQCOBgAhwAMBAP8FACHBAwEAjgYAIcIDAQCOBgAhwwMBAI4GACHEAwEA_wUAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAIQIAAAAPACAaAADGBAAgAgAAAA8AIBoAAMYEACADAAAAEQAgIQAAvwQAICIAAMQEACABAAAAEQAgAQAAAA8AIBMQAACGBgAgJwAAhwYAICgAAIoGACApAACJBgAgKgAAiAYAIJoDAAD5BQAgswMAAPkFACC0AwAA-QUAILUDAAD5BQAgtgMAAPkFACC3AwAA-QUAIL4DAAD5BQAgvwMAAPkFACDBAwAA-QUAIMIDAAD5BQAgwwMAAPkFACDFAwAA-QUAIMYDAAD5BQAgxwMAAPkFACAokAMAAPgEADCRAwAAzQQAEJIDAAD4BAAwkwMBAOcEACGWAwEA5wQAIZcDIADpBAAhmANAAOoEACGZA0AA6gQAIZoDQADrBAAhpgMBAOcEACGnAwEA5wQAIagDAQDnBAAhqQMBAOcEACGqAwEA5wQAIasDAQDnBAAhrQMAAPkErQMirgMCAOgEACGvAwEA5wQAIbEDAAD6BLEDIrMDAAD7BLMDI7QDAQD8BAAhtQMBAPwEACG2AwEA_AQAIbcDAQD8BAAhuAMBAOcEACG5AwEA5wQAIboDAQDnBAAhuwMBAOcEACG8AwEA5wQAIb0DAQDnBAAhvgMBAPwEACG_AwEA_AQAIcADAQDnBAAhwQMBAPwEACHCAwEA_AQAIcMDAQD8BAAhxAMBAOcEACHFAwEA_AQAIcYDAQD8BAAhxwMBAPwEACEDAAAADwAgAQAAzAQAMCYAAM0EACADAAAADwAgAQAAEAAwAgAAEQAgAQAAABwAIAEAAAAcACADAAAAGgAgAQAAGwAwAgAAHAAgAwAAABoAIAEAABsAMAIAABwAIAMAAAAaACABAAAbADACAAAcACAJDAAAhQYAIJMDAQAAAAGUAwEAAAABlQMCAAAAAZYDAQAAAAGXAyAAAAABmANAAAAAAZkDQAAAAAGaA0AAAAABARoAANUEACAIkwMBAAAAAZQDAQAAAAGVAwIAAAABlgMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAEBGgAA1wQAMAEaAADXBAAwCQwAAIQGACCTAwEA_wUAIZQDAQD_BQAhlQMCAIAGACGWAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhAgAAABwAIBoAANoEACAIkwMBAP8FACGUAwEA_wUAIZUDAgCABgAhlgMBAP8FACGXAyAAgQYAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIQIAAAAaACAaAADcBAAgAgAAABoAIBoAANwEACADAAAAHAAgIQAA1QQAICIAANoEACABAAAAHAAgAQAAABoAIAYQAAD6BQAgJwAA-wUAICgAAP4FACApAAD9BQAgKgAA_AUAIJoDAAD5BQAgC5ADAADmBAAwkQMAAOMEABCSAwAA5gQAMJMDAQDnBAAhlAMBAOcEACGVAwIA6AQAIZYDAQDnBAAhlwMgAOkEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACEDAAAAGgAgAQAA4gQAMCYAAOMEACADAAAAGgAgAQAAGwAwAgAAHAAgC5ADAADmBAAwkQMAAOMEABCSAwAA5gQAMJMDAQDnBAAhlAMBAOcEACGVAwIA6AQAIZYDAQDnBAAhlwMgAOkEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACEOEAAA8AQAICkAAPcEACAqAAD3BAAgmwMBAAAAAZwDAQAAAASdAwEAAAAEngMBAAAAAZ8DAQAAAAGgAwEAAAABoQMBAAAAAaIDAQD2BAAhowMBAAAAAaQDAQAAAAGlAwEAAAABDRAAAPAEACAnAAD1BAAgKAAA8AQAICkAAPAEACAqAADwBAAgmwMCAAAAAZwDAgAAAASdAwIAAAAEngMCAAAAAZ8DAgAAAAGgAwIAAAABoQMCAAAAAaIDAgD0BAAhBRAAAPAEACApAADzBAAgKgAA8wQAIJsDIAAAAAGiAyAA8gQAIQsQAADwBAAgKQAA8QQAICoAAPEEACCbA0AAAAABnANAAAAABJ0DQAAAAASeA0AAAAABnwNAAAAAAaADQAAAAAGhA0AAAAABogNAAO8EACELEAAA7QQAICkAAO4EACAqAADuBAAgmwNAAAAAAZwDQAAAAAWdA0AAAAAFngNAAAAAAZ8DQAAAAAGgA0AAAAABoQNAAAAAAaIDQADsBAAhCxAAAO0EACApAADuBAAgKgAA7gQAIJsDQAAAAAGcA0AAAAAFnQNAAAAABZ4DQAAAAAGfA0AAAAABoANAAAAAAaEDQAAAAAGiA0AA7AQAIQibAwIAAAABnAMCAAAABZ0DAgAAAAWeAwIAAAABnwMCAAAAAaADAgAAAAGhAwIAAAABogMCAO0EACEImwNAAAAAAZwDQAAAAAWdA0AAAAAFngNAAAAAAZ8DQAAAAAGgA0AAAAABoQNAAAAAAaIDQADuBAAhCxAAAPAEACApAADxBAAgKgAA8QQAIJsDQAAAAAGcA0AAAAAEnQNAAAAABJ4DQAAAAAGfA0AAAAABoANAAAAAAaEDQAAAAAGiA0AA7wQAIQibAwIAAAABnAMCAAAABJ0DAgAAAASeAwIAAAABnwMCAAAAAaADAgAAAAGhAwIAAAABogMCAPAEACEImwNAAAAAAZwDQAAAAASdA0AAAAAEngNAAAAAAZ8DQAAAAAGgA0AAAAABoQNAAAAAAaIDQADxBAAhBRAAAPAEACApAADzBAAgKgAA8wQAIJsDIAAAAAGiAyAA8gQAIQKbAyAAAAABogMgAPMEACENEAAA8AQAICcAAPUEACAoAADwBAAgKQAA8AQAICoAAPAEACCbAwIAAAABnAMCAAAABJ0DAgAAAASeAwIAAAABnwMCAAAAAaADAgAAAAGhAwIAAAABogMCAPQEACEImwMIAAAAAZwDCAAAAASdAwgAAAAEngMIAAAAAZ8DCAAAAAGgAwgAAAABoQMIAAAAAaIDCAD1BAAhDhAAAPAEACApAAD3BAAgKgAA9wQAIJsDAQAAAAGcAwEAAAAEnQMBAAAABJ4DAQAAAAGfAwEAAAABoAMBAAAAAaEDAQAAAAGiAwEA9gQAIaMDAQAAAAGkAwEAAAABpQMBAAAAAQubAwEAAAABnAMBAAAABJ0DAQAAAASeAwEAAAABnwMBAAAAAaADAQAAAAGhAwEAAAABogMBAPcEACGjAwEAAAABpAMBAAAAAaUDAQAAAAEokAMAAPgEADCRAwAAzQQAEJIDAAD4BAAwkwMBAOcEACGWAwEA5wQAIZcDIADpBAAhmANAAOoEACGZA0AA6gQAIZoDQADrBAAhpgMBAOcEACGnAwEA5wQAIagDAQDnBAAhqQMBAOcEACGqAwEA5wQAIasDAQDnBAAhrQMAAPkErQMirgMCAOgEACGvAwEA5wQAIbEDAAD6BLEDIrMDAAD7BLMDI7QDAQD8BAAhtQMBAPwEACG2AwEA_AQAIbcDAQD8BAAhuAMBAOcEACG5AwEA5wQAIboDAQDnBAAhuwMBAOcEACG8AwEA5wQAIb0DAQDnBAAhvgMBAPwEACG_AwEA_AQAIcADAQDnBAAhwQMBAPwEACHCAwEA_AQAIcMDAQD8BAAhxAMBAOcEACHFAwEA_AQAIcYDAQD8BAAhxwMBAPwEACEHEAAA8AQAICkAAIQFACAqAACEBQAgmwMAAACtAwKcAwAAAK0DCJ0DAAAArQMIogMAAIMFrQMiBxAAAPAEACApAACCBQAgKgAAggUAIJsDAAAAsQMCnAMAAACxAwidAwAAALEDCKIDAACBBbEDIgcQAADtBAAgKQAAgAUAICoAAIAFACCbAwAAALMDA5wDAAAAswMJnQMAAACzAwmiAwAA_wSzAyMOEAAA7QQAICkAAP4EACAqAAD-BAAgmwMBAAAAAZwDAQAAAAWdAwEAAAAFngMBAAAAAZ8DAQAAAAGgAwEAAAABoQMBAAAAAaIDAQD9BAAhowMBAAAAAaQDAQAAAAGlAwEAAAABDhAAAO0EACApAAD-BAAgKgAA_gQAIJsDAQAAAAGcAwEAAAAFnQMBAAAABZ4DAQAAAAGfAwEAAAABoAMBAAAAAaEDAQAAAAGiAwEA_QQAIaMDAQAAAAGkAwEAAAABpQMBAAAAAQubAwEAAAABnAMBAAAABZ0DAQAAAAWeAwEAAAABnwMBAAAAAaADAQAAAAGhAwEAAAABogMBAP4EACGjAwEAAAABpAMBAAAAAaUDAQAAAAEHEAAA7QQAICkAAIAFACAqAACABQAgmwMAAACzAwOcAwAAALMDCZ0DAAAAswMJogMAAP8EswMjBJsDAAAAswMDnAMAAACzAwmdAwAAALMDCaIDAACABbMDIwcQAADwBAAgKQAAggUAICoAAIIFACCbAwAAALEDApwDAAAAsQMInQMAAACxAwiiAwAAgQWxAyIEmwMAAACxAwKcAwAAALEDCJ0DAAAAsQMIogMAAIIFsQMiBxAAAPAEACApAACEBQAgKgAAhAUAIJsDAAAArQMCnAMAAACtAwidAwAAAK0DCKIDAACDBa0DIgSbAwAAAK0DApwDAAAArQMInQMAAACtAwiiAwAAhAWtAyIVkAMAAIUFADCRAwAAtwQAEJIDAACFBQAwkwMBAOcEACGXAyAA6QQAIZgDQADqBAAhmQNAAOoEACGaA0AA6wQAIacDAQDnBAAhyAMBAOcEACHJAwEA5wQAIcoDAQDnBAAhywMBAOcEACHMAwEA5wQAIc0DAQDnBAAhzgMBAOcEACHPAwEA5wQAIdADAQDnBAAh0QMBAOcEACHSAwEA5wQAIdMDAQDnBAAhFggAAIsFACCQAwAAhgUAMJEDAAAXABCSAwAAhgUAMJMDAQCHBQAhlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGnAwEAhwUAIcgDAQCHBQAhyQMBAIcFACHKAwEAhwUAIcsDAQCHBQAhzAMBAIcFACHNAwEAhwUAIc4DAQCHBQAhzwMBAIcFACHQAwEAhwUAIdEDAQCHBQAh0gMBAIcFACHTAwEAhwUAIQubAwEAAAABnAMBAAAABJ0DAQAAAASeAwEAAAABnwMBAAAAAaADAQAAAAGhAwEAAAABogMBAPcEACGjAwEAAAABpAMBAAAAAaUDAQAAAAECmwMgAAAAAaIDIADzBAAhCJsDQAAAAAGcA0AAAAAEnQNAAAAABJ4DQAAAAAGfA0AAAAABoANAAAAAAaEDQAAAAAGiA0AA8QQAIQibA0AAAAABnANAAAAABZ0DQAAAAAWeA0AAAAABnwNAAAAAAaADQAAAAAGhA0AAAAABogNAAO4EACEvAwAApAUAIAkAAKUFACAKAAD1BQAgDAAA8AUAIBIAAPEFACCQAwAA8wUAMJEDAAAPABCSAwAA8wUAMJMDAQCHBQAhlgMBAIcFACGXAyAAiAUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAIaYDAQCHBQAhpwMBAIcFACGoAwEAhwUAIakDAQCHBQAhqgMBAIcFACGrAwEAhwUAIa0DAACiBa0DIq4DAgCOBQAhrwMBAIcFACGxAwAAoAWxAyKzAwAA9AWzAyO0AwEAkQUAIbUDAQCRBQAhtgMBAJEFACG3AwEAkQUAIbgDAQCHBQAhuQMBAIcFACG6AwEAhwUAIbsDAQCHBQAhvAMBAIcFACG9AwEAhwUAIb4DAQCRBQAhvwMBAJEFACHAAwEAhwUAIcEDAQCRBQAhwgMBAJEFACHDAwEAkQUAIcQDAQCHBQAhxQMBAJEFACHGAwEAkQUAIccDAQCRBQAhtwQAAA8AILgEAAAPACAFkAMAAIwFADCRAwAAnwQAEJIDAACMBQAwkwMBAOcEACHUAwIA6AQAIQWQAwAAjQUAMJEDAACMBAAQkgMAAI0FADCTAwEAhwUAIdQDAgCOBQAhCJsDAgAAAAGcAwIAAAAEnQMCAAAABJ4DAgAAAAGfAwIAAAABoAMCAAAAAaEDAgAAAAGiAwIA8AQAIRKQAwAAjwUAMJEDAACGBAAQkgMAAI8FADCTAwEA5wQAIZgDQADqBAAhmQNAAOoEACGaA0AA6wQAIacDAQD8BAAh1QMBAPwEACHWAwEA_AQAIdcDAQD8BAAh2AMBAPwEACHZAwEA_AQAIdoDAQD8BAAh2wMBAPwEACHcAwEA_AQAId0DAQD8BAAh3gMgAOkEACEUBgAAkwUAIAgAAJIFACCQAwAAkAUAMJEDAAATABCSAwAAkAUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhpwMBAJEFACHVAwEAkQUAIdYDAQCRBQAh1wMBAJEFACHYAwEAkQUAIdkDAQCRBQAh2gMBAJEFACHbAwEAkQUAIdwDAQCRBQAh3QMBAJEFACHeAyAAiAUAIQubAwEAAAABnAMBAAAABZ0DAQAAAAWeAwEAAAABnwMBAAAAAaADAQAAAAGhAwEAAAABogMBAP4EACGjAwEAAAABpAMBAAAAAaUDAQAAAAEvAwAApAUAIAkAAKUFACAKAAD1BQAgDAAA8AUAIBIAAPEFACCQAwAA8wUAMJEDAAAPABCSAwAA8wUAMJMDAQCHBQAhlgMBAIcFACGXAyAAiAUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAIaYDAQCHBQAhpwMBAIcFACGoAwEAhwUAIakDAQCHBQAhqgMBAIcFACGrAwEAhwUAIa0DAACiBa0DIq4DAgCOBQAhrwMBAIcFACGxAwAAoAWxAyKzAwAA9AWzAyO0AwEAkQUAIbUDAQCRBQAhtgMBAJEFACG3AwEAkQUAIbgDAQCHBQAhuQMBAIcFACG6AwEAhwUAIbsDAQCHBQAhvAMBAIcFACG9AwEAhwUAIb4DAQCRBQAhvwMBAJEFACHAAwEAhwUAIcEDAQCRBQAhwgMBAJEFACHDAwEAkQUAIcQDAQCHBQAhxQMBAJEFACHGAwEAkQUAIccDAQCRBQAhtwQAAA8AILgEAAAPACAtAwAApAUAIAkAAKUFACASAACnBQAgEwAApgUAIBQAAKgFACCQAwAAngUAMJEDAAALABCSAwAAngUAMJMDAQCHBQAhlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGmAwEAhwUAIagDAQCHBQAhrQMAAKIFrQMisQMAAKAFsQMiswMAAKEFswMivAMBAIcFACG9AwEAhwUAIb4DAQCRBQAhvwMBAJEFACHEAwEAkQUAIcUDAQCRBQAhxgMBAJEFACHHAwEAkQUAIckDAQCHBQAhzQMBAIcFACHVAwEAhwUAIeIDAQCHBQAh4wMBAIcFACHkAwEAkQUAIeUDCACfBQAh5gMBAJEFACHnAwEAkQUAIegDAQCRBQAh6QMBAJEFACHqAwEAhwUAIesDAQCHBQAh7AMBAJEFACHtAwEAkQUAIe8DAACjBe8DIvADAQCHBQAhtwQAAAsAILgEAAALACALkAMAAJQFADCRAwAA6gMAEJIDAACUBQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACHeAyAA6QQAId8DAQDnBAAh4AMIAJUFACHhAwEA5wQAIQ0QAADwBAAgJwAA9QQAICgAAPUEACApAAD1BAAgKgAA9QQAIJsDCAAAAAGcAwgAAAAEnQMIAAAABJ4DCAAAAAGfAwgAAAABoAMIAAAAAaEDCAAAAAGiAwgAlgUAIQ0QAADwBAAgJwAA9QQAICgAAPUEACApAAD1BAAgKgAA9QQAIJsDCAAAAAGcAwgAAAAEnQMIAAAABJ4DCAAAAAGfAwgAAAABoAMIAAAAAaEDCAAAAAGiAwgAlgUAISaQAwAAlwUAMJEDAADUAwAQkgMAAJcFADCTAwEA5wQAIZcDIADpBAAhmANAAOoEACGZA0AA6gQAIZoDQADrBAAhpgMBAOcEACGoAwEA5wQAIa0DAAD5BK0DIrEDAAD6BLEDIrMDAACYBbMDIrwDAQDnBAAhvQMBAOcEACG-AwEA_AQAIb8DAQD8BAAhxAMBAPwEACHFAwEA_AQAIcYDAQD8BAAhxwMBAPwEACHJAwEA5wQAIc0DAQDnBAAh1QMBAOcEACHiAwEA5wQAIeMDAQDnBAAh5AMBAPwEACHlAwgAlQUAIeYDAQD8BAAh5wMBAPwEACHoAwEA_AQAIekDAQD8BAAh6gMBAOcEACHrAwEA5wQAIewDAQD8BAAh7QMBAPwEACHvAwAAmQXvAyLwAwEA5wQAIQcQAADwBAAgKQAAnQUAICoAAJ0FACCbAwAAALMDApwDAAAAswMInQMAAACzAwiiAwAAnAWzAyIHEAAA8AQAICkAAJsFACAqAACbBQAgmwMAAADvAwKcAwAAAO8DCJ0DAAAA7wMIogMAAJoF7wMiBxAAAPAEACApAACbBQAgKgAAmwUAIJsDAAAA7wMCnAMAAADvAwidAwAAAO8DCKIDAACaBe8DIgSbAwAAAO8DApwDAAAA7wMInQMAAADvAwiiAwAAmwXvAyIHEAAA8AQAICkAAJ0FACAqAACdBQAgmwMAAACzAwKcAwAAALMDCJ0DAAAAswMIogMAAJwFswMiBJsDAAAAswMCnAMAAACzAwidAwAAALMDCKIDAACdBbMDIisDAACkBQAgCQAApQUAIBIAAKcFACATAACmBQAgFAAAqAUAIJADAACeBQAwkQMAAAsAEJIDAACeBQAwkwMBAIcFACGXAyAAiAUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAIaYDAQCHBQAhqAMBAIcFACGtAwAAogWtAyKxAwAAoAWxAyKzAwAAoQWzAyK8AwEAhwUAIb0DAQCHBQAhvgMBAJEFACG_AwEAkQUAIcQDAQCRBQAhxQMBAJEFACHGAwEAkQUAIccDAQCRBQAhyQMBAIcFACHNAwEAhwUAIdUDAQCHBQAh4gMBAIcFACHjAwEAhwUAIeQDAQCRBQAh5QMIAJ8FACHmAwEAkQUAIecDAQCRBQAh6AMBAJEFACHpAwEAkQUAIeoDAQCHBQAh6wMBAIcFACHsAwEAkQUAIe0DAQCRBQAh7wMAAKMF7wMi8AMBAIcFACEImwMIAAAAAZwDCAAAAASdAwgAAAAEngMIAAAAAZ8DCAAAAAGgAwgAAAABoQMIAAAAAaIDCAD1BAAhBJsDAAAAsQMCnAMAAACxAwidAwAAALEDCKIDAACCBbEDIgSbAwAAALMDApwDAAAAswMInQMAAACzAwiiAwAAnQWzAyIEmwMAAACtAwKcAwAAAK0DCJ0DAAAArQMIogMAAIQFrQMiBJsDAAAA7wMCnAMAAADvAwidAwAAAO8DCKIDAACbBe8DIhYEAAC1BQAgBQAAtgUAIAYAAJMFACAHAAC3BQAgCwAAuAUAIJADAACzBQAwkQMAAMwCABCSAwAAswUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAh3gMgAIgFACHfAwEAhwUAIfQDAQCHBQAhhgQAAKMF7wMiiAQAALQFiAQiiQQgAIgFACGKBCAAiAUAIYsEAQCRBQAhtwQAAMwCACC4BAAAzAIAIBYGAACTBQAgCAAAkgUAIJADAACQBQAwkQMAABMAEJIDAACQBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGnAwEAkQUAIdUDAQCRBQAh1gMBAJEFACHXAwEAkQUAIdgDAQCRBQAh2QMBAJEFACHaAwEAkQUAIdsDAQCRBQAh3AMBAJEFACHdAwEAkQUAId4DIACIBQAhtwQAABMAILgEAAATACAD8QMAADAAIPIDAAAwACDzAwAAMAAgA_EDAAA0ACDyAwAANAAg8wMAADQAIAPxAwAAOgAg8gMAADoAIPMDAAA6ACANkAMAAKkFADCRAwAAvAMAEJIDAACpBQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACGmAwEA5wQAId4DIADpBAAh3wMBAOcEACH0AwEA5wQAIfUDAQD8BAAh9gMBAPwEACEOAwAApAUAIJADAACqBQAwkQMAAA0AEJIDAACqBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGmAwEAhwUAId4DIACIBQAh3wMBAIcFACH0AwEAhwUAIfUDAQCRBQAh9gMBAJEFACEJkAMAAKsFADCRAwAApAMAEJIDAACrBQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAh9wMBAOcEACH4AwEA5wQAIfkDQADqBAAhCZADAACsBQAwkQMAAJEDABCSAwAArAUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIfcDAQCHBQAh-AMBAIcFACH5A0AAiQUAIRCQAwAArQUAMJEDAACLAwAQkgMAAK0FADCTAwEA5wQAIZgDQADqBAAhmQNAAOoEACGmAwEA5wQAIfoDAQDnBAAh-wMBAOcEACH8AwEA_AQAIf0DAQD8BAAh_gMBAPwEACH_A0AA6wQAIYAEQADrBAAhgQQBAPwEACGCBAEA_AQAIQuQAwAArgUAMJEDAAD1AgAQkgMAAK4FADCTAwEA5wQAIZgDQADqBAAhmQNAAOoEACGmAwEA5wQAIfkDQADqBAAhgwQBAOcEACGEBAEA_AQAIYUEAQD8BAAhD5ADAACvBQAwkQMAAN8CABCSAwAArwUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIZoDQADrBAAh3gMgAOkEACHfAwEA5wQAIfQDAQDnBAAhhgQAAJkF7wMiiAQAALAFiAQiiQQgAOkEACGKBCAA6QQAIYsEAQD8BAAhBxAAAPAEACApAACyBQAgKgAAsgUAIJsDAAAAiAQCnAMAAACIBAidAwAAAIgECKIDAACxBYgEIgcQAADwBAAgKQAAsgUAICoAALIFACCbAwAAAIgEApwDAAAAiAQInQMAAACIBAiiAwAAsQWIBCIEmwMAAACIBAKcAwAAAIgECJ0DAAAAiAQIogMAALIFiAQiFAQAALUFACAFAAC2BQAgBgAAkwUAIAcAALcFACALAAC4BQAgkAMAALMFADCRAwAAzAIAEJIDAACzBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACHeAyAAiAUAId8DAQCHBQAh9AMBAIcFACGGBAAAowXvAyKIBAAAtAWIBCKJBCAAiAUAIYoEIACIBQAhiwQBAJEFACEEmwMAAACIBAKcAwAAAIgECJ0DAAAAiAQIogMAALIFiAQiA_EDAAADACDyAwAAAwAg8wMAAAMAIAPxAwAABwAg8gMAAAcAIPMDAAAHACAQAwAApAUAIJADAACqBQAwkQMAAA0AEJIDAACqBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGmAwEAhwUAId4DIACIBQAh3wMBAIcFACH0AwEAhwUAIfUDAQCRBQAh9gMBAJEFACG3BAAADQAguAQAAA0AIAPxAwAADwAg8gMAAA8AIPMDAAAPACAJkAMAALkFADCRAwAAxgIAEJIDAAC5BQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAh1QMBAOcEACGIBAAAugWOBCKMBAEA5wQAIQcQAADwBAAgKQAAvAUAICoAALwFACCbAwAAAI4EApwDAAAAjgQInQMAAACOBAiiAwAAuwWOBCIHEAAA8AQAICkAALwFACAqAAC8BQAgmwMAAACOBAKcAwAAAI4ECJ0DAAAAjgQIogMAALsFjgQiBJsDAAAAjgQCnAMAAACOBAidAwAAAI4ECKIDAAC8BY4EIgeQAwAAvQUAMJEDAACwAgAQkgMAAL0FADCTAwEA5wQAIZgDQADqBAAhmQNAAOoEACGOBEAA6gQAIQgPAACnBQAgkAMAAL4FADCRAwAAnQIAEJIDAAC-BQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhjgRAAIkFACEJkAMAAL8FADCRAwAAlwIAEJIDAAC_BQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAhpwMBAOcEACGIBAAAwAWQBCKMBAEA5wQAIQcQAADwBAAgKQAAwgUAICoAAMIFACCbAwAAAJAEApwDAAAAkAQInQMAAACQBAiiAwAAwQWQBCIHEAAA8AQAICkAAMIFACAqAADCBQAgmwMAAACQBAKcAwAAAJAECJ0DAAAAkAQIogMAAMEFkAQiBJsDAAAAkAQCnAMAAACQBAidAwAAAJAECKIDAADCBZAEIgiQAwAAwwUAMJEDAACBAgAQkgMAAMMFADCTAwEA5wQAIZYDAQDnBAAhmANAAOoEACGZA0AA6gQAIY4EQADqBAAhEJADAADEBQAwkQMAAOsBABCSAwAAxAUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIZoDQADrBAAh3gMgAOkEACGQBAEA5wQAIZEEAQDnBAAhkgQBAOcEACGTBAEA_AQAIZQEAQDnBAAhlQQBAOcEACGWBAEA5wQAIZcEAQDnBAAhEJADAADFBQAwkQMAANgBABCSAwAAxQUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAh3gMgAIgFACGQBAEAhwUAIZEEAQCHBQAhkgQBAIcFACGTBAEAkQUAIZQEAQCHBQAhlQQBAIcFACGWBAEAhwUAIZcEAQCHBQAhCpADAADGBQAwkQMAANIBABCSAwAAxgUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAIZgECACVBQAhmQQIAJUFACGaBAIA6AQAIZsEAQDnBAAhC00AAMgFACCQAwAAxwUAMJEDAACNAQAQkgMAAMcFADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGYBAgAnwUAIZkECACfBQAhmgQCAI4FACGbBAEAhwUAIQxOAADPBQAgTwAA0AUAIJADAADOBQAwkQMAAJEBABCSAwAAzgUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAId8DAQCHBQAhnwQgAIgFACG3BAAAkQEAILgEAACRAQAgC5ADAADJBQAwkQMAALoBABCSAwAAyQUAMJMDAQDnBAAhlQMCAOgEACGYA0AA6gQAIZkDQADqBAAhiAQAAMoFnwQimwQBAOcEACGcBAEA5wQAIZ0EAgDoBAAhBxAAAPAEACApAADMBQAgKgAAzAUAIJsDAAAAnwQCnAMAAACfBAidAwAAAJ8ECKIDAADLBZ8EIgcQAADwBAAgKQAAzAUAICoAAMwFACCbAwAAAJ8EApwDAAAAnwQInQMAAACfBAiiAwAAywWfBCIEmwMAAACfBAKcAwAAAJ8ECJ0DAAAAnwQIogMAAMwFnwQiCJADAADNBQAwkQMAAKQBABCSAwAAzQUAMJMDAQDnBAAhmANAAOoEACGZA0AA6gQAId8DAQDnBAAhnwQgAOkEACEKTgAAzwUAIE8AANAFACCQAwAAzgUAMJEDAACRAQAQkgMAAM4FADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACHfAwEAhwUAIZ8EIACIBQAhA_EDAACJAQAg8gMAAIkBACDzAwAAiQEAIA1NAADIBQAgkAMAAMcFADCRAwAAjQEAEJIDAADHBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhmAQIAJ8FACGZBAgAnwUAIZoEAgCOBQAhmwQBAIcFACG3BAAAjQEAILgEAACNAQAgApsEAQAAAAGcBAEAAAABDE0AAMgFACCQAwAA0gUAMJEDAACJAQAQkgMAANIFADCTAwEAhwUAIZUDAgCOBQAhmANAAIkFACGZA0AAiQUAIYgEAADTBZ8EIpsEAQCHBQAhnAQBAIcFACGdBAIAjgUAIQSbAwAAAJ8EApwDAAAAnwQInQMAAACfBAiiAwAAzAWfBCIJkAMAANQFADCRAwAAhAEAEJIDAADUBQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACGhBAEA5wQAIaMEAADVBaMEIgcQAADwBAAgKQAA1wUAICoAANcFACCbAwAAAKMEApwDAAAAowQInQMAAACjBAiiAwAA1gWjBCIHEAAA8AQAICkAANcFACAqAADXBQAgmwMAAACjBAKcAwAAAKMECJ0DAAAAowQIogMAANYFowQiBJsDAAAAowQCnAMAAACjBAidAwAAAKMECKIDAADXBaMEIgmQAwAA2AUAMJEDAABxABCSAwAA2AUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhoQQBAIcFACGjBAAA2QWjBCIEmwMAAACjBAKcAwAAAKMECJ0DAAAAowQIogMAANcFowQiEpADAADaBQAwkQMAAGsAEJIDAADaBQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAhmgNAAOsEACHeAyAA6QQAIaQEAQDnBAAhpQQBAOcEACGmBAEA5wQAIacEAQD8BAAhqAQBAOcEACGpBAEA5wQAIaoEAQD8BAAhqwQBAPwEACGsBAEA_AQAIa0EAQD8BAAhEpADAADbBQAwkQMAAFgAEJIDAADbBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACHeAyAAiAUAIaQEAQCHBQAhpQQBAIcFACGmBAEAhwUAIacEAQCRBQAhqAQBAIcFACGpBAEAhwUAIaoEAQCRBQAhqwQBAJEFACGsBAEAkQUAIa0EAQCRBQAhDJADAADcBQAwkQMAAFIAEJIDAADcBQAwkwMBAOcEACGYA0AA6gQAIZkDQADqBAAh1QMBAOcEACGuBAEA5wQAIa8EQADqBAAhsAQQAN0FACGxBBAA3QUAIbIEEADdBQAhDRAAAPAEACAnAADfBQAgKAAA3wUAICkAAN8FACAqAADfBQAgmwMQAAAAAZwDEAAAAASdAxAAAAAEngMQAAAAAZ8DEAAAAAGgAxAAAAABoQMQAAAAAaIDEADeBQAhDRAAAPAEACAnAADfBQAgKAAA3wUAICkAAN8FACAqAADfBQAgmwMQAAAAAZwDEAAAAASdAxAAAAAEngMQAAAAAZ8DEAAAAAGgAxAAAAABoQMQAAAAAaIDEADeBQAhCJsDEAAAAAGcAxAAAAAEnQMQAAAABJ4DEAAAAAGfAxAAAAABoAMQAAAAAaEDEAAAAAGiAxAA3wUAIQ0GAADiBQAgkAMAAOAFADCRAwAAOgAQkgMAAOAFADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACHVAwEAhwUAIa4EAQCHBQAhrwRAAIkFACGwBBAA4QUAIbEEEADhBQAhsgQQAOEFACEImwMQAAAAAZwDEAAAAASdAxAAAAAEngMQAAAAAZ8DEAAAAAGgAxAAAAABoQMQAAAAAaIDEADfBQAhLQMAAKQFACAJAAClBQAgEgAApwUAIBMAAKYFACAUAACoBQAgkAMAAJ4FADCRAwAACwAQkgMAAJ4FADCTAwEAhwUAIZcDIACIBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhpgMBAIcFACGoAwEAhwUAIa0DAACiBa0DIrEDAACgBbEDIrMDAAChBbMDIrwDAQCHBQAhvQMBAIcFACG-AwEAkQUAIb8DAQCRBQAhxAMBAJEFACHFAwEAkQUAIcYDAQCRBQAhxwMBAJEFACHJAwEAhwUAIc0DAQCHBQAh1QMBAIcFACHiAwEAhwUAIeMDAQCHBQAh5AMBAJEFACHlAwgAnwUAIeYDAQCRBQAh5wMBAJEFACHoAwEAkQUAIekDAQCRBQAh6gMBAIcFACHrAwEAhwUAIewDAQCRBQAh7QMBAJEFACHvAwAAowXvAyLwAwEAhwUAIbcEAAALACC4BAAACwAgAtUDAQAAAAGMBAEAAAABCwYAAOIFACAOAADmBQAgkAMAAOQFADCRAwAANAAQkgMAAOQFADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACHVAwEAhwUAIYgEAADlBY4EIowEAQCHBQAhBJsDAAAAjgQCnAMAAACOBAidAwAAAI4ECKIDAAC8BY4EIgoPAACnBQAgkAMAAL4FADCRAwAAnQIAEJIDAAC-BQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhjgRAAIkFACG3BAAAnQIAILgEAACdAgAgDwYAAOIFACALAAC4BQAgDQAA6AUAIBEAAOkFACCQAwAA5wUAMJEDAAAwABCSAwAA5wUAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAh3gMgAIgFACHfAwEAhwUAIeADCACfBQAh4QMBAIcFACED8QMAABoAIPIDAAAaACDzAwAAGgAgA_EDAAAeACDyAwAAHgAg8wMAAB4AIAKnAwEAAAABjAQBAAAAAQsIAACLBQAgDgAA7QUAIJADAADrBQAwkQMAACIAEJIDAADrBQAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhpwMBAIcFACGIBAAA7AWQBCKMBAEAhwUAIQSbAwAAAJAEApwDAAAAkAQInQMAAACQBAiiAwAAwgWQBCIMDAAA8AUAIA8AAPEFACCQAwAA7wUAMJEDAAAeABCSAwAA7wUAMJMDAQCHBQAhlgMBAIcFACGYA0AAiQUAIZkDQACJBQAhjgRAAIkFACG3BAAAHgAguAQAAB4AIAKWAwEAAAABjgRAAAAAAQoMAADwBQAgDwAA8QUAIJADAADvBQAwkQMAAB4AEJIDAADvBQAwkwMBAIcFACGWAwEAhwUAIZgDQACJBQAhmQNAAIkFACGOBEAAiQUAIREGAADiBQAgCwAAuAUAIA0AAOgFACARAADpBQAgkAMAAOcFADCRAwAAMAAQkgMAAOcFADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAId4DIACIBQAh3wMBAIcFACHgAwgAnwUAIeEDAQCHBQAhtwQAADAAILgEAAAwACAD8QMAACIAIPIDAAAiACDzAwAAIgAgDAwAAPAFACCQAwAA8gUAMJEDAAAaABCSAwAA8gUAMJMDAQCHBQAhlAMBAIcFACGVAwIAjgUAIZYDAQCHBQAhlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACEtAwAApAUAIAkAAKUFACAKAAD1BQAgDAAA8AUAIBIAAPEFACCQAwAA8wUAMJEDAAAPABCSAwAA8wUAMJMDAQCHBQAhlgMBAIcFACGXAyAAiAUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAIaYDAQCHBQAhpwMBAIcFACGoAwEAhwUAIakDAQCHBQAhqgMBAIcFACGrAwEAhwUAIa0DAACiBa0DIq4DAgCOBQAhrwMBAIcFACGxAwAAoAWxAyKzAwAA9AWzAyO0AwEAkQUAIbUDAQCRBQAhtgMBAJEFACG3AwEAkQUAIbgDAQCHBQAhuQMBAIcFACG6AwEAhwUAIbsDAQCHBQAhvAMBAIcFACG9AwEAhwUAIb4DAQCRBQAhvwMBAJEFACHAAwEAhwUAIcEDAQCRBQAhwgMBAJEFACHDAwEAkQUAIcQDAQCHBQAhxQMBAJEFACHGAwEAkQUAIccDAQCRBQAhBJsDAAAAswMDnAMAAACzAwmdAwAAALMDCaIDAACABbMDIxgIAACLBQAgkAMAAIYFADCRAwAAFwAQkgMAAIYFADCTAwEAhwUAIZcDIACIBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhpwMBAIcFACHIAwEAhwUAIckDAQCHBQAhygMBAIcFACHLAwEAhwUAIcwDAQCHBQAhzQMBAIcFACHOAwEAhwUAIc8DAQCHBQAh0AMBAIcFACHRAwEAhwUAIdIDAQCHBQAh0wMBAIcFACG3BAAAFwAguAQAABcAIBEDAACkBQAgkAMAAPYFADCRAwAABwAQkgMAAPYFADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGmAwEAhwUAIfoDAQCHBQAh-wMBAIcFACH8AwEAkQUAIf0DAQCRBQAh_gMBAJEFACH_A0AAigUAIYAEQACKBQAhgQQBAJEFACGCBAEAkQUAIQwDAACkBQAgkAMAAPcFADCRAwAAAwAQkgMAAPcFADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGmAwEAhwUAIfkDQACJBQAhgwQBAIcFACGEBAEAkQUAIYUEAQCRBQAhAtUDAQAAAAGuBAEAAAABAAAAAAAAAbwEAQAAAAEFvAQCAAAAAcIEAgAAAAHDBAIAAAABxAQCAAAAAcUEAgAAAAEBvAQgAAAAAQG8BEAAAAABAbwEQAAAAAEFIQAA2gkAICIAAN0JACC5BAAA2wkAILoEAADcCQAgvwQAADIAIAMhAADaCQAguQQAANsJACC_BAAAMgAgAAAAAAABvAQAAACtAwIBvAQAAACxAwIBvAQAAACzAwMBvAQBAAAAAQchAACoBgAgIgAAqwYAILkEAACpBgAgugQAAKoGACC9BAAAEwAgvgQAABMAIL8EAADtAwAgByEAAKMGACAiAACmBgAguQQAAKQGACC6BAAApQYAIL0EAAAXACC-BAAAFwAgvwQAAKIEACAFIQAAxwkAICIAANgJACC5BAAAyAkAILoEAADXCQAgvwQAADIAIAUhAADFCQAgIgAA1QkAILkEAADGCQAgugQAANQJACC_BAAAyQIAIAshAACUBgAwIgAAmQYAMLkEAACVBgAwugQAAJYGADC7BAAAlwYAILwEAACYBgAwvQQAAJgGADC-BAAAmAYAML8EAACYBgAwwAQAAJoGADDBBAAAmwYAMAYOAACiBgAgkwMBAAAAAZgDQAAAAAGZA0AAAAABiAQAAACQBAKMBAEAAAABAgAAACQAICEAAKEGACADAAAAJAAgIQAAoQYAICIAAJ8GACABGgAA0wkAMAwIAACLBQAgDgAA7QUAIJADAADrBQAwkQMAACIAEJIDAADrBQAwkwMBAAAAAZgDQACJBQAhmQNAAIkFACGnAwEAhwUAIYgEAADsBZAEIowEAQCHBQAhtAQAAOoFACACAAAAJAAgGgAAnwYAIAIAAACcBgAgGgAAnQYAIAmQAwAAmwYAMJEDAACcBgAQkgMAAJsGADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGnAwEAhwUAIYgEAADsBZAEIowEAQCHBQAhCZADAACbBgAwkQMAAJwGABCSAwAAmwYAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIacDAQCHBQAhiAQAAOwFkAQijAQBAIcFACEFkwMBAP8FACGYA0AAggYAIZkDQACCBgAhiAQAAJ4GkAQijAQBAP8FACEBvAQAAACQBAIGDgAAoAYAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIYgEAACeBpAEIowEAQD_BQAhBSEAAM4JACAiAADRCQAguQQAAM8JACC6BAAA0AkAIL8EAAAgACAGDgAAogYAIJMDAQAAAAGYA0AAAAABmQNAAAAAAYgEAAAAkAQCjAQBAAAAAQMhAADOCQAguQQAAM8JACC_BAAAIAAgEZMDAQAAAAGXAyAAAAABmANAAAAAAZkDQAAAAAGaA0AAAAAByAMBAAAAAckDAQAAAAHKAwEAAAABywMBAAAAAcwDAQAAAAHNAwEAAAABzgMBAAAAAc8DAQAAAAHQAwEAAAAB0QMBAAAAAdIDAQAAAAHTAwEAAAABAgAAAKIEACAhAACjBgAgAwAAABcAICEAAKMGACAiAACnBgAgEwAAABcAIBoAAKcGACCTAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhyAMBAP8FACHJAwEA_wUAIcoDAQD_BQAhywMBAP8FACHMAwEA_wUAIc0DAQD_BQAhzgMBAP8FACHPAwEA_wUAIdADAQD_BQAh0QMBAP8FACHSAwEA_wUAIdMDAQD_BQAhEZMDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHIAwEA_wUAIckDAQD_BQAhygMBAP8FACHLAwEA_wUAIcwDAQD_BQAhzQMBAP8FACHOAwEA_wUAIc8DAQD_BQAh0AMBAP8FACHRAwEA_wUAIdIDAQD_BQAh0wMBAP8FACEPBgAArgYAIJMDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwEAAAAB2QMBAAAAAdoDAQAAAAHbAwEAAAAB3AMBAAAAAd0DAQAAAAHeAyAAAAABAgAAAO0DACAhAACoBgAgAwAAABMAICEAAKgGACAiAACsBgAgEQAAABMAIAYAAK0GACAaAACsBgAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHVAwEAjgYAIdYDAQCOBgAh1wMBAI4GACHYAwEAjgYAIdkDAQCOBgAh2gMBAI4GACHbAwEAjgYAIdwDAQCOBgAh3QMBAI4GACHeAyAAgQYAIQ8GAACtBgAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHVAwEAjgYAIdYDAQCOBgAh1wMBAI4GACHYAwEAjgYAIdkDAQCOBgAh2gMBAI4GACHbAwEAjgYAIdwDAQCOBgAh3QMBAI4GACHeAyAAgQYAIQchAADJCQAgIgAAzAkAILkEAADKCQAgugQAAMsJACC9BAAACwAgvgQAAAsAIL8EAAC_AwAgAyEAAMkJACC5BAAAygkAIL8EAAC_AwAgAyEAAKgGACC5BAAAqQYAIL8EAADtAwAgAyEAAKMGACC5BAAApAYAIL8EAACiBAAgAyEAAMcJACC5BAAAyAkAIL8EAAAyACADIQAAxQkAILkEAADGCQAgvwQAAMkCACAEIQAAlAYAMLkEAACVBgAwuwQAAJcGACC_BAAAmAYAMAAAAAUhAADACQAgIgAAwwkAILkEAADBCQAgugQAAMIJACC_BAAAEQAgAyEAAMAJACC5BAAAwQkAIL8EAAARACATAwAAwgcAIAkAAMMHACAKAADyCAAgDAAA8AgAIBIAAPEIACCaAwAA-QUAILMDAAD5BQAgtAMAAPkFACC1AwAA-QUAILYDAAD5BQAgtwMAAPkFACC-AwAA-QUAIL8DAAD5BQAgwQMAAPkFACDCAwAA-QUAIMMDAAD5BQAgxQMAAPkFACDGAwAA-QUAIMcDAAD5BQAgAAAAAAAAAAAHIQAAuwkAICIAAL4JACC5BAAAvAkAILoEAAC9CQAgvQQAAA8AIL4EAAAPACC_BAAAEQAgAyEAALsJACC5BAAAvAkAIL8EAAARACATAwAAwgcAIAkAAMMHACASAADFBwAgEwAAxAcAIBQAAMYHACCaAwAA-QUAIL4DAAD5BQAgvwMAAPkFACDEAwAA-QUAIMUDAAD5BQAgxgMAAPkFACDHAwAA-QUAIOQDAAD5BQAg5gMAAPkFACDnAwAA-QUAIOgDAAD5BQAg6QMAAPkFACDsAwAA-QUAIO0DAAD5BQAgAAAAAAAFvAQIAAAAAcIECAAAAAHDBAgAAAABxAQIAAAAAcUECAAAAAEFIQAArQkAICIAALkJACC5BAAArgkAILoEAAC4CQAgvwQAAL8DACALIQAA9AYAMCIAAPkGADC5BAAA9QYAMLoEAAD2BgAwuwQAAPcGACC8BAAA-AYAML0EAAD4BgAwvgQAAPgGADC_BAAA-AYAMMAEAAD6BgAwwQQAAPsGADALIQAA6AYAMCIAAO0GADC5BAAA6QYAMLoEAADqBgAwuwQAAOsGACC8BAAA7AYAML0EAADsBgAwvgQAAOwGADC_BAAA7AYAMMAEAADuBgAwwQQAAO8GADALIQAAzwYAMCIAANQGADC5BAAA0AYAMLoEAADRBgAwuwQAANIGACC8BAAA0wYAML0EAADTBgAwvgQAANMGADC_BAAA0wYAMMAEAADVBgAwwQQAANYGADAFDwAA5wYAIJMDAQAAAAGYA0AAAAABmQNAAAAAAY4EQAAAAAECAAAAIAAgIQAA5gYAIAMAAAAgACAhAADmBgAgIgAA2QYAIAEaAAC3CQAwCwwAAPAFACAPAADxBQAgkAMAAO8FADCRAwAAHgAQkgMAAO8FADCTAwEAAAABlgMBAIcFACGYA0AAiQUAIZkDQACJBQAhjgRAAIkFACG1BAAA7gUAIAIAAAAgACAaAADZBgAgAgAAANcGACAaAADYBgAgCJADAADWBgAwkQMAANcGABCSAwAA1gYAMJMDAQCHBQAhlgMBAIcFACGYA0AAiQUAIZkDQACJBQAhjgRAAIkFACEIkAMAANYGADCRAwAA1wYAEJIDAADWBgAwkwMBAIcFACGWAwEAhwUAIZgDQACJBQAhmQNAAIkFACGOBEAAiQUAIQSTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGOBEAAggYAIQUPAADaBgAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhjgRAAIIGACELIQAA2wYAMCIAAN8GADC5BAAA3AYAMLoEAADdBgAwuwQAAN4GACC8BAAAmAYAML0EAACYBgAwvgQAAJgGADC_BAAAmAYAMMAEAADgBgAwwQQAAJsGADAGCAAA5QYAIJMDAQAAAAGYA0AAAAABmQNAAAAAAacDAQAAAAGIBAAAAJAEAgIAAAAkACAhAADkBgAgAwAAACQAICEAAOQGACAiAADiBgAgARoAALYJADACAAAAJAAgGgAA4gYAIAIAAACcBgAgGgAA4QYAIAWTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGnAwEA_wUAIYgEAACeBpAEIgYIAADjBgAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhpwMBAP8FACGIBAAAngaQBCIFIQAAsQkAICIAALQJACC5BAAAsgkAILoEAACzCQAgvwQAABEAIAYIAADlBgAgkwMBAAAAAZgDQAAAAAGZA0AAAAABpwMBAAAAAYgEAAAAkAQCAyEAALEJACC5BAAAsgkAIL8EAAARACAFDwAA5wYAIJMDAQAAAAGYA0AAAAABmQNAAAAAAY4EQAAAAAEEIQAA2wYAMLkEAADcBgAwuwQAAN4GACC_BAAAmAYAMAeTAwEAAAABlAMBAAAAAZUDAgAAAAGXAyAAAAABmANAAAAAAZkDQAAAAAGaA0AAAAABAgAAABwAICEAAPMGACADAAAAHAAgIQAA8wYAICIAAPIGACABGgAAsAkAMAwMAADwBQAgkAMAAPIFADCRAwAAGgAQkgMAAPIFADCTAwEAAAABlAMBAIcFACGVAwIAjgUAIZYDAQCHBQAhlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACECAAAAHAAgGgAA8gYAIAIAAADwBgAgGgAA8QYAIAuQAwAA7wYAMJEDAADwBgAQkgMAAO8GADCTAwEAhwUAIZQDAQCHBQAhlQMCAI4FACGWAwEAhwUAIZcDIACIBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAhC5ADAADvBgAwkQMAAPAGABCSAwAA7wYAMJMDAQCHBQAhlAMBAIcFACGVAwIAjgUAIZYDAQCHBQAhlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACEHkwMBAP8FACGUAwEA_wUAIZUDAgCABgAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACEHkwMBAP8FACGUAwEA_wUAIZUDAgCABgAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACEHkwMBAAAAAZQDAQAAAAGVAwIAAAABlwMgAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAASgDAACyBgAgCQAArwYAIAoAALAGACASAACzBgAgkwMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGmAwEAAAABpwMBAAAAAagDAQAAAAGpAwEAAAABqgMBAAAAAasDAQAAAAGtAwAAAK0DAq4DAgAAAAGvAwEAAAABsQMAAACxAwKzAwAAALMDA7QDAQAAAAG1AwEAAAABtgMBAAAAAbcDAQAAAAG4AwEAAAABuQMBAAAAAboDAQAAAAG7AwEAAAABvAMBAAAAAb0DAQAAAAG-AwEAAAABvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQAAAAHEAwEAAAABxQMBAAAAAcYDAQAAAAHHAwEAAAABAgAAABEAICEAAP8GACADAAAAEQAgIQAA_wYAICIAAP4GACABGgAArwkAMC0DAACkBQAgCQAApQUAIAoAAPUFACAMAADwBQAgEgAA8QUAIJADAADzBQAwkQMAAA8AEJIDAADzBQAwkwMBAAAAAZYDAQCHBQAhlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGmAwEAhwUAIacDAQAAAAGoAwEAhwUAIakDAQCHBQAhqgMBAIcFACGrAwEAAAABrQMAAKIFrQMirgMCAI4FACGvAwEAhwUAIbEDAACgBbEDIrMDAAD0BbMDI7QDAQCRBQAhtQMBAJEFACG2AwEAkQUAIbcDAQCRBQAhuAMBAIcFACG5AwEAhwUAIboDAQCHBQAhuwMBAIcFACG8AwEAhwUAIb0DAQCHBQAhvgMBAJEFACG_AwEAkQUAIcADAQCHBQAhwQMBAJEFACHCAwEAkQUAIcMDAQCRBQAhxAMBAIcFACHFAwEAkQUAIcYDAQCRBQAhxwMBAJEFACECAAAAEQAgGgAA_gYAIAIAAAD8BgAgGgAA_QYAICiQAwAA-wYAMJEDAAD8BgAQkgMAAPsGADCTAwEAhwUAIZYDAQCHBQAhlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGmAwEAhwUAIacDAQCHBQAhqAMBAIcFACGpAwEAhwUAIaoDAQCHBQAhqwMBAIcFACGtAwAAogWtAyKuAwIAjgUAIa8DAQCHBQAhsQMAAKAFsQMiswMAAPQFswMjtAMBAJEFACG1AwEAkQUAIbYDAQCRBQAhtwMBAJEFACG4AwEAhwUAIbkDAQCHBQAhugMBAIcFACG7AwEAhwUAIbwDAQCHBQAhvQMBAIcFACG-AwEAkQUAIb8DAQCRBQAhwAMBAIcFACHBAwEAkQUAIcIDAQCRBQAhwwMBAJEFACHEAwEAhwUAIcUDAQCRBQAhxgMBAJEFACHHAwEAkQUAISiQAwAA-wYAMJEDAAD8BgAQkgMAAPsGADCTAwEAhwUAIZYDAQCHBQAhlwMgAIgFACGYA0AAiQUAIZkDQACJBQAhmgNAAIoFACGmAwEAhwUAIacDAQCHBQAhqAMBAIcFACGpAwEAhwUAIaoDAQCHBQAhqwMBAIcFACGtAwAAogWtAyKuAwIAjgUAIa8DAQCHBQAhsQMAAKAFsQMiswMAAPQFswMjtAMBAJEFACG1AwEAkQUAIbYDAQCRBQAhtwMBAJEFACG4AwEAhwUAIbkDAQCHBQAhugMBAIcFACG7AwEAhwUAIbwDAQCHBQAhvQMBAIcFACG-AwEAkQUAIb8DAQCRBQAhwAMBAIcFACHBAwEAkQUAIcIDAQCRBQAhwwMBAJEFACHEAwEAhwUAIcUDAQCRBQAhxgMBAJEFACHHAwEAkQUAISSTAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpgMBAP8FACGnAwEA_wUAIagDAQD_BQAhqQMBAP8FACGqAwEA_wUAIasDAQD_BQAhrQMAAIsGrQMirgMCAIAGACGvAwEA_wUAIbEDAACMBrEDIrMDAACNBrMDI7QDAQCOBgAhtQMBAI4GACG2AwEAjgYAIbcDAQCOBgAhuAMBAP8FACG5AwEA_wUAIboDAQD_BQAhuwMBAP8FACG8AwEA_wUAIb0DAQD_BQAhvgMBAI4GACG_AwEAjgYAIcADAQD_BQAhwQMBAI4GACHCAwEAjgYAIcMDAQCOBgAhxAMBAP8FACHFAwEAjgYAIcYDAQCOBgAhxwMBAI4GACEoAwAAkgYAIAkAAI8GACAKAACQBgAgEgAAkwYAIJMDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIacDAQD_BQAhqAMBAP8FACGpAwEA_wUAIaoDAQD_BQAhqwMBAP8FACGtAwAAiwatAyKuAwIAgAYAIa8DAQD_BQAhsQMAAIwGsQMiswMAAI0GswMjtAMBAI4GACG1AwEAjgYAIbYDAQCOBgAhtwMBAI4GACG4AwEA_wUAIbkDAQD_BQAhugMBAP8FACG7AwEA_wUAIbwDAQD_BQAhvQMBAP8FACG-AwEAjgYAIb8DAQCOBgAhwAMBAP8FACHBAwEAjgYAIcIDAQCOBgAhwwMBAI4GACHEAwEA_wUAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAISgDAACyBgAgCQAArwYAIAoAALAGACASAACzBgAgkwMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGmAwEAAAABpwMBAAAAAagDAQAAAAGpAwEAAAABqgMBAAAAAasDAQAAAAGtAwAAAK0DAq4DAgAAAAGvAwEAAAABsQMAAACxAwKzAwAAALMDA7QDAQAAAAG1AwEAAAABtgMBAAAAAbcDAQAAAAG4AwEAAAABuQMBAAAAAboDAQAAAAG7AwEAAAABvAMBAAAAAb0DAQAAAAG-AwEAAAABvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQAAAAHEAwEAAAABxQMBAAAAAcYDAQAAAAHHAwEAAAABAyEAAK0JACC5BAAArgkAIL8EAAC_AwAgBCEAAPQGADC5BAAA9QYAMLsEAAD3BgAgvwQAAPgGADAEIQAA6AYAMLkEAADpBgAwuwQAAOsGACC_BAAA7AYAMAQhAADPBgAwuQQAANAGADC7BAAA0gYAIL8EAADTBgAwAAAAAAABvAQAAACzAwIBvAQAAADvAwIFIQAAoAkAICIAAKsJACC5BAAAoQkAILoEAACqCQAgvwQAAMkCACAHIQAAuAcAICIAALsHACC5BAAAuQcAILoEAAC6BwAgvQQAABMAIL4EAAATACC_BAAA7QMAIAshAACsBwAwIgAAsQcAMLkEAACtBwAwugQAAK4HADC7BAAArwcAILwEAACwBwAwvQQAALAHADC-BAAAsAcAML8EAACwBwAwwAQAALIHADDBBAAAswcAMAshAACdBwAwIgAAogcAMLkEAACeBwAwugQAAJ8HADC7BAAAoAcAILwEAAChBwAwvQQAAKEHADC-BAAAoQcAML8EAAChBwAwwAQAAKMHADDBBAAApAcAMAshAACQBwAwIgAAlQcAMLkEAACRBwAwugQAAJIHADC7BAAAkwcAILwEAACUBwAwvQQAAJQHADC-BAAAlAcAML8EAACUBwAwwAQAAJYHADDBBAAAlwcAMAiTAwEAAAABmANAAAAAAZkDQAAAAAGuBAEAAAABrwRAAAAAAbAEEAAAAAGxBBAAAAABsgQQAAAAAQIAAAABACAhAACcBwAgAwAAAAEAICEAAJwHACAiAACbBwAgARoAAKkJADAOBgAA4gUAIJADAADgBQAwkQMAADoAEJIDAADgBQAwkwMBAAAAAZgDQACJBQAhmQNAAIkFACHVAwEAhwUAIa4EAQCHBQAhrwRAAIkFACGwBBAA4QUAIbEEEADhBQAhsgQQAOEFACG2BAAA-AUAIAIAAAABACAaAACbBwAgAgAAAJgHACAaAACZBwAgDJADAACXBwAwkQMAAJgHABCSAwAAlwcAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIdUDAQCHBQAhrgQBAIcFACGvBEAAiQUAIbAEEADhBQAhsQQQAOEFACGyBBAA4QUAIQyQAwAAlwcAMJEDAACYBwAQkgMAAJcHADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACHVAwEAhwUAIa4EAQCHBQAhrwRAAIkFACGwBBAA4QUAIbEEEADhBQAhsgQQAOEFACEIkwMBAP8FACGYA0AAggYAIZkDQACCBgAhrgQBAP8FACGvBEAAggYAIbAEEACaBwAhsQQQAJoHACGyBBAAmgcAIQW8BBAAAAABwgQQAAAAAcMEEAAAAAHEBBAAAAABxQQQAAAAAQiTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGuBAEA_wUAIa8EQACCBgAhsAQQAJoHACGxBBAAmgcAIbIEEACaBwAhCJMDAQAAAAGYA0AAAAABmQNAAAAAAa4EAQAAAAGvBEAAAAABsAQQAAAAAbEEEAAAAAGyBBAAAAABBg4AAKsHACCTAwEAAAABmANAAAAAAZkDQAAAAAGIBAAAAI4EAowEAQAAAAECAAAANgAgIQAAqgcAIAMAAAA2ACAhAACqBwAgIgAAqAcAIAEaAACoCQAwDAYAAOIFACAOAADmBQAgkAMAAOQFADCRAwAANAAQkgMAAOQFADCTAwEAAAABmANAAIkFACGZA0AAiQUAIdUDAQCHBQAhiAQAAOUFjgQijAQBAIcFACGzBAAA4wUAIAIAAAA2ACAaAACoBwAgAgAAAKUHACAaAACmBwAgCZADAACkBwAwkQMAAKUHABCSAwAApAcAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIdUDAQCHBQAhiAQAAOUFjgQijAQBAIcFACEJkAMAAKQHADCRAwAApQcAEJIDAACkBwAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAh1QMBAIcFACGIBAAA5QWOBCKMBAEAhwUAIQWTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGIBAAApweOBCKMBAEA_wUAIQG8BAAAAI4EAgYOAACpBwAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhiAQAAKcHjgQijAQBAP8FACEFIQAAowkAICIAAKYJACC5BAAApAkAILoEAAClCQAgvwQAAJoCACAGDgAAqwcAIJMDAQAAAAGYA0AAAAABmQNAAAAAAYgEAAAAjgQCjAQBAAAAAQMhAACjCQAguQQAAKQJACC_BAAAmgIAIAoLAACBBwAgDQAAggcAIBEAAIMHACCTAwEAAAABmANAAAAAAZkDQAAAAAGaA0AAAAAB3gMgAAAAAd8DAQAAAAHgAwgAAAABAgAAADIAICEAALcHACADAAAAMgAgIQAAtwcAICIAALYHACABGgAAogkAMA8GAADiBQAgCwAAuAUAIA0AAOgFACARAADpBQAgkAMAAOcFADCRAwAAMAAQkgMAAOcFADCTAwEAAAABmANAAIkFACGZA0AAiQUAIZoDQACKBQAh3gMgAIgFACHfAwEAhwUAIeADCACfBQAh4QMBAIcFACECAAAAMgAgGgAAtgcAIAIAAAC0BwAgGgAAtQcAIAuQAwAAswcAMJEDAAC0BwAQkgMAALMHADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGaA0AAigUAId4DIACIBQAh3wMBAIcFACHgAwgAnwUAIeEDAQCHBQAhC5ADAACzBwAwkQMAALQHABCSAwAAswcAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIZoDQACKBQAh3gMgAIgFACHfAwEAhwUAIeADCACfBQAh4QMBAIcFACEHkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHeAyAAgQYAId8DAQD_BQAh4AMIAMoGACEKCwAAzAYAIA0AAM0GACARAADOBgAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHeAyAAgQYAId8DAQD_BQAh4AMIAMoGACEKCwAAgQcAIA0AAIIHACARAACDBwAgkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAHfAwEAAAAB4AMIAAAAAQ8IAADDBgAgkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAacDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAQAAAAHZAwEAAAAB2gMBAAAAAdsDAQAAAAHcAwEAAAAB3QMBAAAAAd4DIAAAAAECAAAA7QMAICEAALgHACADAAAAEwAgIQAAuAcAICIAALwHACARAAAAEwAgCAAAwgYAIBoAALwHACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIacDAQCOBgAh1gMBAI4GACHXAwEAjgYAIdgDAQCOBgAh2QMBAI4GACHaAwEAjgYAIdsDAQCOBgAh3AMBAI4GACHdAwEAjgYAId4DIACBBgAhDwgAAMIGACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIacDAQCOBgAh1gMBAI4GACHXAwEAjgYAIdgDAQCOBgAh2QMBAI4GACHaAwEAjgYAIdsDAQCOBgAh3AMBAI4GACHdAwEAjgYAId4DIACBBgAhAyEAAKAJACC5BAAAoQkAIL8EAADJAgAgAyEAALgHACC5BAAAuQcAIL8EAADtAwAgBCEAAKwHADC5BAAArQcAMLsEAACvBwAgvwQAALAHADAEIQAAnQcAMLkEAACeBwAwuwQAAKAHACC_BAAAoQcAMAQhAACQBwAwuQQAAJEHADC7BAAAkwcAIL8EAACUBwAwBwQAAJIIACAFAACTCAAgBgAAxAYAIAcAAJQIACALAACVCAAgmgMAAPkFACCLBAAA-QUAIA0GAADEBgAgCAAAuQYAIJoDAAD5BQAgpwMAAPkFACDVAwAA-QUAINYDAAD5BQAg1wMAAPkFACDYAwAA-QUAINkDAAD5BQAg2gMAAPkFACDbAwAA-QUAINwDAAD5BQAg3QMAAPkFACAAAAAAAAAFIQAAmwkAICIAAJ4JACC5BAAAnAkAILoEAACdCQAgvwQAAMkCACADIQAAmwkAILkEAACcCQAgvwQAAMkCACAAAAAAAAAFIQAAlgkAICIAAJkJACC5BAAAlwkAILoEAACYCQAgvwQAAMkCACADIQAAlgkAILkEAACXCQAgvwQAAMkCACAAAAAFIQAAkQkAICIAAJQJACC5BAAAkgkAILoEAACTCQAgvwQAAMkCACADIQAAkQkAILkEAACSCQAgvwQAAMkCACAAAAABvAQAAACIBAILIQAAgQgAMCIAAIYIADC5BAAAgggAMLoEAACDCAAwuwQAAIQIACC8BAAAhQgAML0EAACFCAAwvgQAAIUIADC_BAAAhQgAMMAEAACHCAAwwQQAAIgIADALIQAA9QcAMCIAAPoHADC5BAAA9gcAMLoEAAD3BwAwuwQAAPgHACC8BAAA-QcAML0EAAD5BwAwvgQAAPkHADC_BAAA-QcAMMAEAAD7BwAwwQQAAPwHADAHIQAA8AcAICIAAPMHACC5BAAA8QcAILoEAADyBwAgvQQAAAsAIL4EAAALACC_BAAAvwMAIAchAADrBwAgIgAA7gcAILkEAADsBwAgugQAAO0HACC9BAAADQAgvgQAAA0AIL8EAACnAwAgCyEAAOIHADAiAADmBwAwuQQAAOMHADC6BAAA5AcAMLsEAADlBwAgvAQAAPgGADC9BAAA-AYAML4EAAD4BgAwvwQAAPgGADDABAAA5wcAMMEEAAD7BgAwKAkAAK8GACAKAACwBgAgDAAAsQYAIBIAALMGACCTAwEAAAABlgMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGnAwEAAAABqAMBAAAAAakDAQAAAAGqAwEAAAABqwMBAAAAAa0DAAAArQMCrgMCAAAAAa8DAQAAAAGxAwAAALEDArMDAAAAswMDtAMBAAAAAbUDAQAAAAG2AwEAAAABtwMBAAAAAbgDAQAAAAG5AwEAAAABugMBAAAAAbsDAQAAAAG8AwEAAAABvQMBAAAAAb4DAQAAAAG_AwEAAAABwAMBAAAAAcEDAQAAAAHCAwEAAAABwwMBAAAAAcQDAQAAAAHFAwEAAAABxgMBAAAAAccDAQAAAAECAAAAEQAgIQAA6gcAIAMAAAARACAhAADqBwAgIgAA6QcAIAEaAACQCQAwAgAAABEAIBoAAOkHACACAAAA_AYAIBoAAOgHACAkkwMBAP8FACGWAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpwMBAP8FACGoAwEA_wUAIakDAQD_BQAhqgMBAP8FACGrAwEA_wUAIa0DAACLBq0DIq4DAgCABgAhrwMBAP8FACGxAwAAjAaxAyKzAwAAjQazAyO0AwEAjgYAIbUDAQCOBgAhtgMBAI4GACG3AwEAjgYAIbgDAQD_BQAhuQMBAP8FACG6AwEA_wUAIbsDAQD_BQAhvAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHAAwEA_wUAIcEDAQCOBgAhwgMBAI4GACHDAwEAjgYAIcQDAQD_BQAhxQMBAI4GACHGAwEAjgYAIccDAQCOBgAhKAkAAI8GACAKAACQBgAgDAAAkQYAIBIAAJMGACCTAwEA_wUAIZYDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGnAwEA_wUAIagDAQD_BQAhqQMBAP8FACGqAwEA_wUAIasDAQD_BQAhrQMAAIsGrQMirgMCAIAGACGvAwEA_wUAIbEDAACMBrEDIrMDAACNBrMDI7QDAQCOBgAhtQMBAI4GACG2AwEAjgYAIbcDAQCOBgAhuAMBAP8FACG5AwEA_wUAIboDAQD_BQAhuwMBAP8FACG8AwEA_wUAIb0DAQD_BQAhvgMBAI4GACG_AwEAjgYAIcADAQD_BQAhwQMBAI4GACHCAwEAjgYAIcMDAQCOBgAhxAMBAP8FACHFAwEAjgYAIcYDAQCOBgAhxwMBAI4GACEoCQAArwYAIAoAALAGACAMAACxBgAgEgAAswYAIJMDAQAAAAGWAwEAAAABlwMgAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAacDAQAAAAGoAwEAAAABqQMBAAAAAaoDAQAAAAGrAwEAAAABrQMAAACtAwKuAwIAAAABrwMBAAAAAbEDAAAAsQMCswMAAACzAwO0AwEAAAABtQMBAAAAAbYDAQAAAAG3AwEAAAABuAMBAAAAAbkDAQAAAAG6AwEAAAABuwMBAAAAAbwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHAAwEAAAABwQMBAAAAAcIDAQAAAAHDAwEAAAABxAMBAAAAAcUDAQAAAAHGAwEAAAABxwMBAAAAAQmTAwEAAAABmANAAAAAAZkDQAAAAAGaA0AAAAAB3gMgAAAAAd8DAQAAAAH0AwEAAAAB9QMBAAAAAfYDAQAAAAECAAAApwMAICEAAOsHACADAAAADQAgIQAA6wcAICIAAO8HACALAAAADQAgGgAA7wcAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACHfAwEA_wUAIfQDAQD_BQAh9QMBAI4GACH2AwEAjgYAIQmTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAId4DIACBBgAh3wMBAP8FACH0AwEA_wUAIfUDAQCOBgAh9gMBAI4GACEmCQAAvgcAIBIAAMAHACATAAC_BwAgFAAAwQcAIJMDAQAAAAGXAyAAAAABmANAAAAAAZkDQAAAAAGaA0AAAAABqAMBAAAAAa0DAAAArQMCsQMAAACxAwKzAwAAALMDArwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHEAwEAAAABxQMBAAAAAcYDAQAAAAHHAwEAAAAByQMBAAAAAc0DAQAAAAHVAwEAAAAB4gMBAAAAAeMDAQAAAAHkAwEAAAAB5QMIAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQAAAAHqAwEAAAAB6wMBAAAAAewDAQAAAAHtAwEAAAAB7wMAAADvAwLwAwEAAAABAgAAAL8DACAhAADwBwAgAwAAAAsAICEAAPAHACAiAAD0BwAgKAAAAAsAIAkAAIwHACASAACOBwAgEwAAjQcAIBQAAI8HACAaAAD0BwAgkwMBAP8FACGXAyAAgQYAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIagDAQD_BQAhrQMAAIsGrQMisQMAAIwGsQMiswMAAIkHswMivAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHEAwEAjgYAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAIckDAQD_BQAhzQMBAP8FACHVAwEA_wUAIeIDAQD_BQAh4wMBAP8FACHkAwEAjgYAIeUDCADKBgAh5gMBAI4GACHnAwEAjgYAIegDAQCOBgAh6QMBAI4GACHqAwEA_wUAIesDAQD_BQAh7AMBAI4GACHtAwEAjgYAIe8DAACKB-8DIvADAQD_BQAhJgkAAIwHACASAACOBwAgEwAAjQcAIBQAAI8HACCTAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhqAMBAP8FACGtAwAAiwatAyKxAwAAjAaxAyKzAwAAiQezAyK8AwEA_wUAIb0DAQD_BQAhvgMBAI4GACG_AwEAjgYAIcQDAQCOBgAhxQMBAI4GACHGAwEAjgYAIccDAQCOBgAhyQMBAP8FACHNAwEA_wUAIdUDAQD_BQAh4gMBAP8FACHjAwEA_wUAIeQDAQCOBgAh5QMIAMoGACHmAwEAjgYAIecDAQCOBgAh6AMBAI4GACHpAwEAjgYAIeoDAQD_BQAh6wMBAP8FACHsAwEAjgYAIe0DAQCOBgAh7wMAAIoH7wMi8AMBAP8FACEMkwMBAAAAAZgDQAAAAAGZA0AAAAAB-gMBAAAAAfsDAQAAAAH8AwEAAAAB_QMBAAAAAf4DAQAAAAH_A0AAAAABgARAAAAAAYEEAQAAAAGCBAEAAAABAgAAAAkAICEAAIAIACADAAAACQAgIQAAgAgAICIAAP8HACABGgAAjwkAMBEDAACkBQAgkAMAAPYFADCRAwAABwAQkgMAAPYFADCTAwEAAAABmANAAIkFACGZA0AAiQUAIaYDAQCHBQAh-gMBAIcFACH7AwEAhwUAIfwDAQCRBQAh_QMBAJEFACH-AwEAkQUAIf8DQACKBQAhgARAAIoFACGBBAEAkQUAIYIEAQCRBQAhAgAAAAkAIBoAAP8HACACAAAA_QcAIBoAAP4HACAQkAMAAPwHADCRAwAA_QcAEJIDAAD8BwAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhpgMBAIcFACH6AwEAhwUAIfsDAQCHBQAh_AMBAJEFACH9AwEAkQUAIf4DAQCRBQAh_wNAAIoFACGABEAAigUAIYEEAQCRBQAhggQBAJEFACEQkAMAAPwHADCRAwAA_QcAEJIDAAD8BwAwkwMBAIcFACGYA0AAiQUAIZkDQACJBQAhpgMBAIcFACH6AwEAhwUAIfsDAQCHBQAh_AMBAJEFACH9AwEAkQUAIf4DAQCRBQAh_wNAAIoFACGABEAAigUAIYEEAQCRBQAhggQBAJEFACEMkwMBAP8FACGYA0AAggYAIZkDQACCBgAh-gMBAP8FACH7AwEA_wUAIfwDAQCOBgAh_QMBAI4GACH-AwEAjgYAIf8DQACDBgAhgARAAIMGACGBBAEAjgYAIYIEAQCOBgAhDJMDAQD_BQAhmANAAIIGACGZA0AAggYAIfoDAQD_BQAh-wMBAP8FACH8AwEAjgYAIf0DAQCOBgAh_gMBAI4GACH_A0AAgwYAIYAEQACDBgAhgQQBAI4GACGCBAEAjgYAIQyTAwEAAAABmANAAAAAAZkDQAAAAAH6AwEAAAAB-wMBAAAAAfwDAQAAAAH9AwEAAAAB_gMBAAAAAf8DQAAAAAGABEAAAAABgQQBAAAAAYIEAQAAAAEHkwMBAAAAAZgDQAAAAAGZA0AAAAAB-QNAAAAAAYMEAQAAAAGEBAEAAAABhQQBAAAAAQIAAAAFACAhAACMCAAgAwAAAAUAICEAAIwIACAiAACLCAAgARoAAI4JADAMAwAApAUAIJADAAD3BQAwkQMAAAMAEJIDAAD3BQAwkwMBAAAAAZgDQACJBQAhmQNAAIkFACGmAwEAhwUAIfkDQACJBQAhgwQBAAAAAYQEAQCRBQAhhQQBAJEFACECAAAABQAgGgAAiwgAIAIAAACJCAAgGgAAiggAIAuQAwAAiAgAMJEDAACJCAAQkgMAAIgIADCTAwEAhwUAIZgDQACJBQAhmQNAAIkFACGmAwEAhwUAIfkDQACJBQAhgwQBAIcFACGEBAEAkQUAIYUEAQCRBQAhC5ADAACICAAwkQMAAIkIABCSAwAAiAgAMJMDAQCHBQAhmANAAIkFACGZA0AAiQUAIaYDAQCHBQAh-QNAAIkFACGDBAEAhwUAIYQEAQCRBQAhhQQBAJEFACEHkwMBAP8FACGYA0AAggYAIZkDQACCBgAh-QNAAIIGACGDBAEA_wUAIYQEAQCOBgAhhQQBAI4GACEHkwMBAP8FACGYA0AAggYAIZkDQACCBgAh-QNAAIIGACGDBAEA_wUAIYQEAQCOBgAhhQQBAI4GACEHkwMBAAAAAZgDQAAAAAGZA0AAAAAB-QNAAAAAAYMEAQAAAAGEBAEAAAABhQQBAAAAAQQhAACBCAAwuQQAAIIIADC7BAAAhAgAIL8EAACFCAAwBCEAAPUHADC5BAAA9gcAMLsEAAD4BwAgvwQAAPkHADADIQAA8AcAILkEAADxBwAgvwQAAL8DACADIQAA6wcAILkEAADsBwAgvwQAAKcDACAEIQAA4gcAMLkEAADjBwAwuwQAAOUHACC_BAAA-AYAMAAABAMAAMIHACCaAwAA-QUAIPUDAAD5BQAg9gMAAPkFACAAAAAABSEAAIkJACAiAACMCQAguQQAAIoJACC6BAAAiwkAIL8EAAC_AwAgAyEAAIkJACC5BAAAigkAIL8EAAC_AwAgAAAACyEAAJ8IADAiAACjCAAwuQQAAKAIADC6BAAAoQgAMLsEAACiCAAgvAQAAKEHADC9BAAAoQcAML4EAAChBwAwvwQAAKEHADDABAAApAgAMMEEAACkBwAwBgYAAJoIACCTAwEAAAABmANAAAAAAZkDQAAAAAHVAwEAAAABiAQAAACOBAICAAAANgAgIQAApwgAIAMAAAA2ACAhAACnCAAgIgAApggAIAEaAACICQAwAgAAADYAIBoAAKYIACACAAAApQcAIBoAAKUIACAFkwMBAP8FACGYA0AAggYAIZkDQACCBgAh1QMBAP8FACGIBAAApweOBCIGBgAAmQgAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIdUDAQD_BQAhiAQAAKcHjgQiBgYAAJoIACCTAwEAAAABmANAAAAAAZkDQAAAAAHVAwEAAAABiAQAAACOBAIEIQAAnwgAMLkEAACgCAAwuwQAAKIIACC_BAAAoQcAMAAAAAAAAAUhAACDCQAgIgAAhgkAILkEAACECQAgugQAAIUJACC_BAAAMgAgAyEAAIMJACC5BAAAhAkAIL8EAAAyACAAAAAAAAAAAAUhAAD-CAAgIgAAgQkAILkEAAD_CAAgugQAAIAJACC_BAAAhwEAIAMhAAD-CAAguQQAAP8IACC_BAAAhwEAIAJOAADcCAAgTwAA3QgAIAAAAAAAAbwEAAAAnwQCBSEAAPkIACAiAAD8CAAguQQAAPoIACC6BAAA-wgAIL8EAACHAQAgAyEAAPkIACC5BAAA-ggAIL8EAACHAQAgAAAACyEAAM4IADAiAADTCAAwuQQAAM8IADC6BAAA0AgAMLsEAADRCAAgvAQAANIIADC9BAAA0ggAML4EAADSCAAwvwQAANIIADDABAAA1AgAMMEEAADVCAAwByEAAMkIACAiAADMCAAguQQAAMoIACC6BAAAywgAIL0EAACNAQAgvgQAAI0BACC_BAAAvQEAIAaTAwEAAAABmANAAAAAAZkDQAAAAAGYBAgAAAABmQQIAAAAAZoEAgAAAAECAAAAvQEAICEAAMkIACADAAAAjQEAICEAAMkIACAiAADNCAAgCAAAAI0BACAaAADNCAAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmAQIAMoGACGZBAgAygYAIZoEAgCABgAhBpMDAQD_BQAhmANAAIIGACGZA0AAggYAIZgECADKBgAhmQQIAMoGACGaBAIAgAYAIQeTAwEAAAABlQMCAAAAAZgDQAAAAAGZA0AAAAABiAQAAACfBAKcBAEAAAABnQQCAAAAAQIAAACLAQAgIQAA2QgAIAMAAACLAQAgIQAA2QgAICIAANgIACABGgAA-AgAMA1NAADIBQAgkAMAANIFADCRAwAAiQEAEJIDAADSBQAwkwMBAAAAAZUDAgCOBQAhmANAAIkFACGZA0AAiQUAIYgEAADTBZ8EIpsEAQCHBQAhnAQBAIcFACGdBAIAjgUAIaAEAADRBQAgAgAAAIsBACAaAADYCAAgAgAAANYIACAaAADXCAAgC5ADAADVCAAwkQMAANYIABCSAwAA1QgAMJMDAQCHBQAhlQMCAI4FACGYA0AAiQUAIZkDQACJBQAhiAQAANMFnwQimwQBAIcFACGcBAEAhwUAIZ0EAgCOBQAhC5ADAADVCAAwkQMAANYIABCSAwAA1QgAMJMDAQCHBQAhlQMCAI4FACGYA0AAiQUAIZkDQACJBQAhiAQAANMFnwQimwQBAIcFACGcBAEAhwUAIZ0EAgCOBQAhB5MDAQD_BQAhlQMCAIAGACGYA0AAggYAIZkDQACCBgAhiAQAAMEInwQinAQBAP8FACGdBAIAgAYAIQeTAwEA_wUAIZUDAgCABgAhmANAAIIGACGZA0AAggYAIYgEAADBCJ8EIpwEAQD_BQAhnQQCAIAGACEHkwMBAAAAAZUDAgAAAAGYA0AAAAABmQNAAAAAAYgEAAAAnwQCnAQBAAAAAZ0EAgAAAAEEIQAAzggAMLkEAADPCAAwuwQAANEIACC_BAAA0ggAMAMhAADJCAAguQQAAMoIACC_BAAAvQEAIAABTQAAuwgAIAAAAAG8BAAAAKMEAgAAAAAAAAAABSEAAPMIACAiAAD2CAAguQQAAPQIACC6BAAA9QgAIL8EAAC_AwAgAyEAAPMIACC5BAAA9AgAIL8EAAC_AwAgAQ8AAMUHACAAAAIMAADwCAAgDwAA8QgAIAUGAADEBgAgCwAAlQgAIA0AAO0IACARAADuCAAgmgMAAPkFACAAAggAALkGACCaAwAA-QUAICcDAAC9BwAgCQAAvgcAIBIAAMAHACATAAC_BwAgkwMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGmAwEAAAABqAMBAAAAAa0DAAAArQMCsQMAAACxAwKzAwAAALMDArwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHEAwEAAAABxQMBAAAAAcYDAQAAAAHHAwEAAAAByQMBAAAAAc0DAQAAAAHVAwEAAAAB4gMBAAAAAeMDAQAAAAHkAwEAAAAB5QMIAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQAAAAHqAwEAAAAB6wMBAAAAAewDAQAAAAHtAwEAAAAB7wMAAADvAwLwAwEAAAABAgAAAL8DACAhAADzCAAgAwAAAAsAICEAAPMIACAiAAD3CAAgKQAAAAsAIAMAAIsHACAJAACMBwAgEgAAjgcAIBMAAI0HACAaAAD3CAAgkwMBAP8FACGXAyAAgQYAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIaYDAQD_BQAhqAMBAP8FACGtAwAAiwatAyKxAwAAjAaxAyKzAwAAiQezAyK8AwEA_wUAIb0DAQD_BQAhvgMBAI4GACG_AwEAjgYAIcQDAQCOBgAhxQMBAI4GACHGAwEAjgYAIccDAQCOBgAhyQMBAP8FACHNAwEA_wUAIdUDAQD_BQAh4gMBAP8FACHjAwEA_wUAIeQDAQCOBgAh5QMIAMoGACHmAwEAjgYAIecDAQCOBgAh6AMBAI4GACHpAwEAjgYAIeoDAQD_BQAh6wMBAP8FACHsAwEAjgYAIe0DAQCOBgAh7wMAAIoH7wMi8AMBAP8FACEnAwAAiwcAIAkAAIwHACASAACOBwAgEwAAjQcAIJMDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIagDAQD_BQAhrQMAAIsGrQMisQMAAIwGsQMiswMAAIkHswMivAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHEAwEAjgYAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAIckDAQD_BQAhzQMBAP8FACHVAwEA_wUAIeIDAQD_BQAh4wMBAP8FACHkAwEAjgYAIeUDCADKBgAh5gMBAI4GACHnAwEAjgYAIegDAQCOBgAh6QMBAI4GACHqAwEA_wUAIesDAQD_BQAh7AMBAI4GACHtAwEAjgYAIe8DAACKB-8DIvADAQD_BQAhB5MDAQAAAAGVAwIAAAABmANAAAAAAZkDQAAAAAGIBAAAAJ8EApwEAQAAAAGdBAIAAAABBk8AANsIACCTAwEAAAABmANAAAAAAZkDQAAAAAHfAwEAAAABnwQgAAAAAQIAAACHAQAgIQAA-QgAIAMAAACRAQAgIQAA-QgAICIAAP0IACAIAAAAkQEAIBoAAP0IACBPAADICAAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAh3wMBAP8FACGfBCAAgQYAIQZPAADICAAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAh3wMBAP8FACGfBCAAgQYAIQZOAADaCAAgkwMBAAAAAZgDQAAAAAGZA0AAAAAB3wMBAAAAAZ8EIAAAAAECAAAAhwEAICEAAP4IACADAAAAkQEAICEAAP4IACAiAACCCQAgCAAAAJEBACAaAACCCQAgTgAAxwgAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAId8DAQD_BQAhnwQgAIEGACEGTgAAxwgAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAId8DAQD_BQAhnwQgAIEGACELBgAAgAcAIAsAAIEHACANAACCBwAgkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAHfAwEAAAAB4AMIAAAAAeEDAQAAAAECAAAAMgAgIQAAgwkAIAMAAAAwACAhAACDCQAgIgAAhwkAIA0AAAAwACAGAADLBgAgCwAAzAYAIA0AAM0GACAaAACHCQAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHeAyAAgQYAId8DAQD_BQAh4AMIAMoGACHhAwEA_wUAIQsGAADLBgAgCwAAzAYAIA0AAM0GACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAId4DIACBBgAh3wMBAP8FACHgAwgAygYAIeEDAQD_BQAhBZMDAQAAAAGYA0AAAAABmQNAAAAAAdUDAQAAAAGIBAAAAI4EAicDAAC9BwAgCQAAvgcAIBMAAL8HACAUAADBBwAgkwMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGmAwEAAAABqAMBAAAAAa0DAAAArQMCsQMAAACxAwKzAwAAALMDArwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHEAwEAAAABxQMBAAAAAcYDAQAAAAHHAwEAAAAByQMBAAAAAc0DAQAAAAHVAwEAAAAB4gMBAAAAAeMDAQAAAAHkAwEAAAAB5QMIAAAAAeYDAQAAAAHnAwEAAAAB6AMBAAAAAekDAQAAAAHqAwEAAAAB6wMBAAAAAewDAQAAAAHtAwEAAAAB7wMAAADvAwLwAwEAAAABAgAAAL8DACAhAACJCQAgAwAAAAsAICEAAIkJACAiAACNCQAgKQAAAAsAIAMAAIsHACAJAACMBwAgEwAAjQcAIBQAAI8HACAaAACNCQAgkwMBAP8FACGXAyAAgQYAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIaYDAQD_BQAhqAMBAP8FACGtAwAAiwatAyKxAwAAjAaxAyKzAwAAiQezAyK8AwEA_wUAIb0DAQD_BQAhvgMBAI4GACG_AwEAjgYAIcQDAQCOBgAhxQMBAI4GACHGAwEAjgYAIccDAQCOBgAhyQMBAP8FACHNAwEA_wUAIdUDAQD_BQAh4gMBAP8FACHjAwEA_wUAIeQDAQCOBgAh5QMIAMoGACHmAwEAjgYAIecDAQCOBgAh6AMBAI4GACHpAwEAjgYAIeoDAQD_BQAh6wMBAP8FACHsAwEAjgYAIe0DAQCOBgAh7wMAAIoH7wMi8AMBAP8FACEnAwAAiwcAIAkAAIwHACATAACNBwAgFAAAjwcAIJMDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIagDAQD_BQAhrQMAAIsGrQMisQMAAIwGsQMiswMAAIkHswMivAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHEAwEAjgYAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAIckDAQD_BQAhzQMBAP8FACHVAwEA_wUAIeIDAQD_BQAh4wMBAP8FACHkAwEAjgYAIeUDCADKBgAh5gMBAI4GACHnAwEAjgYAIegDAQCOBgAh6QMBAI4GACHqAwEA_wUAIesDAQD_BQAh7AMBAI4GACHtAwEAjgYAIe8DAACKB-8DIvADAQD_BQAhB5MDAQAAAAGYA0AAAAABmQNAAAAAAfkDQAAAAAGDBAEAAAABhAQBAAAAAYUEAQAAAAEMkwMBAAAAAZgDQAAAAAGZA0AAAAAB-gMBAAAAAfsDAQAAAAH8AwEAAAAB_QMBAAAAAf4DAQAAAAH_A0AAAAABgARAAAAAAYEEAQAAAAGCBAEAAAABJJMDAQAAAAGWAwEAAAABlwMgAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAacDAQAAAAGoAwEAAAABqQMBAAAAAaoDAQAAAAGrAwEAAAABrQMAAACtAwKuAwIAAAABrwMBAAAAAbEDAAAAsQMCswMAAACzAwO0AwEAAAABtQMBAAAAAbYDAQAAAAG3AwEAAAABuAMBAAAAAbkDAQAAAAG6AwEAAAABuwMBAAAAAbwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHAAwEAAAABwQMBAAAAAcIDAQAAAAHDAwEAAAABxAMBAAAAAcUDAQAAAAHGAwEAAAABxwMBAAAAARAFAACOCAAgBgAAjwgAIAcAAJAIACALAACRCAAgkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAHfAwEAAAAB9AMBAAAAAYYEAAAA7wMCiAQAAACIBAKJBCAAAAABigQgAAAAAYsEAQAAAAECAAAAyQIAICEAAJEJACADAAAAzAIAICEAAJEJACAiAACVCQAgEgAAAMwCACAFAADeBwAgBgAA3wcAIAcAAOAHACALAADhBwAgGgAAlQkAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACHfAwEA_wUAIfQDAQD_BQAhhgQAAIoH7wMiiAQAANwHiAQiiQQgAIEGACGKBCAAgQYAIYsEAQCOBgAhEAUAAN4HACAGAADfBwAgBwAA4AcAIAsAAOEHACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAId4DIACBBgAh3wMBAP8FACH0AwEA_wUAIYYEAACKB-8DIogEAADcB4gEIokEIACBBgAhigQgAIEGACGLBAEAjgYAIRAEAACNCAAgBgAAjwgAIAcAAJAIACALAACRCAAgkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAHfAwEAAAAB9AMBAAAAAYYEAAAA7wMCiAQAAACIBAKJBCAAAAABigQgAAAAAYsEAQAAAAECAAAAyQIAICEAAJYJACADAAAAzAIAICEAAJYJACAiAACaCQAgEgAAAMwCACAEAADdBwAgBgAA3wcAIAcAAOAHACALAADhBwAgGgAAmgkAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACHfAwEA_wUAIfQDAQD_BQAhhgQAAIoH7wMiiAQAANwHiAQiiQQgAIEGACGKBCAAgQYAIYsEAQCOBgAhEAQAAN0HACAGAADfBwAgBwAA4AcAIAsAAOEHACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAId4DIACBBgAh3wMBAP8FACH0AwEA_wUAIYYEAACKB-8DIogEAADcB4gEIokEIACBBgAhigQgAIEGACGLBAEAjgYAIRAEAACNCAAgBQAAjggAIAYAAI8IACALAACRCAAgkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAHfAwEAAAAB9AMBAAAAAYYEAAAA7wMCiAQAAACIBAKJBCAAAAABigQgAAAAAYsEAQAAAAECAAAAyQIAICEAAJsJACADAAAAzAIAICEAAJsJACAiAACfCQAgEgAAAMwCACAEAADdBwAgBQAA3gcAIAYAAN8HACALAADhBwAgGgAAnwkAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACHfAwEA_wUAIfQDAQD_BQAhhgQAAIoH7wMiiAQAANwHiAQiiQQgAIEGACGKBCAAgQYAIYsEAQCOBgAhEAQAAN0HACAFAADeBwAgBgAA3wcAIAsAAOEHACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAId4DIACBBgAh3wMBAP8FACH0AwEA_wUAIYYEAACKB-8DIogEAADcB4gEIokEIACBBgAhigQgAIEGACGLBAEAjgYAIRAEAACNCAAgBQAAjggAIAcAAJAIACALAACRCAAgkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAHfAwEAAAAB9AMBAAAAAYYEAAAA7wMCiAQAAACIBAKJBCAAAAABigQgAAAAAYsEAQAAAAECAAAAyQIAICEAAKAJACAHkwMBAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAd4DIAAAAAHfAwEAAAAB4AMIAAAAAQSTAwEAAAABmANAAAAAAZkDQAAAAAGOBEAAAAABAgAAAJoCACAhAACjCQAgAwAAAJ0CACAhAACjCQAgIgAApwkAIAYAAACdAgAgGgAApwkAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIY4EQACCBgAhBJMDAQD_BQAhmANAAIIGACGZA0AAggYAIY4EQACCBgAhBZMDAQAAAAGYA0AAAAABmQNAAAAAAYgEAAAAjgQCjAQBAAAAAQiTAwEAAAABmANAAAAAAZkDQAAAAAGuBAEAAAABrwRAAAAAAbAEEAAAAAGxBBAAAAABsgQQAAAAAQMAAADMAgAgIQAAoAkAICIAAKwJACASAAAAzAIAIAQAAN0HACAFAADeBwAgBwAA4AcAIAsAAOEHACAaAACsCQAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHeAyAAgQYAId8DAQD_BQAh9AMBAP8FACGGBAAAigfvAyKIBAAA3AeIBCKJBCAAgQYAIYoEIACBBgAhiwQBAI4GACEQBAAA3QcAIAUAAN4HACAHAADgBwAgCwAA4QcAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACHfAwEA_wUAIfQDAQD_BQAhhgQAAIoH7wMiiAQAANwHiAQiiQQgAIEGACGKBCAAgQYAIYsEAQCOBgAhJwMAAL0HACAJAAC-BwAgEgAAwAcAIBQAAMEHACCTAwEAAAABlwMgAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAaYDAQAAAAGoAwEAAAABrQMAAACtAwKxAwAAALEDArMDAAAAswMCvAMBAAAAAb0DAQAAAAG-AwEAAAABvwMBAAAAAcQDAQAAAAHFAwEAAAABxgMBAAAAAccDAQAAAAHJAwEAAAABzQMBAAAAAdUDAQAAAAHiAwEAAAAB4wMBAAAAAeQDAQAAAAHlAwgAAAAB5gMBAAAAAecDAQAAAAHoAwEAAAAB6QMBAAAAAeoDAQAAAAHrAwEAAAAB7AMBAAAAAe0DAQAAAAHvAwAAAO8DAvADAQAAAAECAAAAvwMAICEAAK0JACAkkwMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGmAwEAAAABpwMBAAAAAagDAQAAAAGpAwEAAAABqgMBAAAAAasDAQAAAAGtAwAAAK0DAq4DAgAAAAGvAwEAAAABsQMAAACxAwKzAwAAALMDA7QDAQAAAAG1AwEAAAABtgMBAAAAAbcDAQAAAAG4AwEAAAABuQMBAAAAAboDAQAAAAG7AwEAAAABvAMBAAAAAb0DAQAAAAG-AwEAAAABvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQAAAAHEAwEAAAABxQMBAAAAAcYDAQAAAAHHAwEAAAABB5MDAQAAAAGUAwEAAAABlQMCAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAEpAwAAsgYAIAkAAK8GACAKAACwBgAgDAAAsQYAIJMDAQAAAAGWAwEAAAABlwMgAAAAAZgDQAAAAAGZA0AAAAABmgNAAAAAAaYDAQAAAAGnAwEAAAABqAMBAAAAAakDAQAAAAGqAwEAAAABqwMBAAAAAa0DAAAArQMCrgMCAAAAAa8DAQAAAAGxAwAAALEDArMDAAAAswMDtAMBAAAAAbUDAQAAAAG2AwEAAAABtwMBAAAAAbgDAQAAAAG5AwEAAAABugMBAAAAAbsDAQAAAAG8AwEAAAABvQMBAAAAAb4DAQAAAAG_AwEAAAABwAMBAAAAAcEDAQAAAAHCAwEAAAABwwMBAAAAAcQDAQAAAAHFAwEAAAABxgMBAAAAAccDAQAAAAECAAAAEQAgIQAAsQkAIAMAAAAPACAhAACxCQAgIgAAtQkAICsAAAAPACADAACSBgAgCQAAjwYAIAoAAJAGACAMAACRBgAgGgAAtQkAIJMDAQD_BQAhlgMBAP8FACGXAyAAgQYAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIaYDAQD_BQAhpwMBAP8FACGoAwEA_wUAIakDAQD_BQAhqgMBAP8FACGrAwEA_wUAIa0DAACLBq0DIq4DAgCABgAhrwMBAP8FACGxAwAAjAaxAyKzAwAAjQazAyO0AwEAjgYAIbUDAQCOBgAhtgMBAI4GACG3AwEAjgYAIbgDAQD_BQAhuQMBAP8FACG6AwEA_wUAIbsDAQD_BQAhvAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHAAwEA_wUAIcEDAQCOBgAhwgMBAI4GACHDAwEAjgYAIcQDAQD_BQAhxQMBAI4GACHGAwEAjgYAIccDAQCOBgAhKQMAAJIGACAJAACPBgAgCgAAkAYAIAwAAJEGACCTAwEA_wUAIZYDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIacDAQD_BQAhqAMBAP8FACGpAwEA_wUAIaoDAQD_BQAhqwMBAP8FACGtAwAAiwatAyKuAwIAgAYAIa8DAQD_BQAhsQMAAIwGsQMiswMAAI0GswMjtAMBAI4GACG1AwEAjgYAIbYDAQCOBgAhtwMBAI4GACG4AwEA_wUAIbkDAQD_BQAhugMBAP8FACG7AwEA_wUAIbwDAQD_BQAhvQMBAP8FACG-AwEAjgYAIb8DAQCOBgAhwAMBAP8FACHBAwEAjgYAIcIDAQCOBgAhwwMBAI4GACHEAwEA_wUAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAIQWTAwEAAAABmANAAAAAAZkDQAAAAAGnAwEAAAABiAQAAACQBAIEkwMBAAAAAZgDQAAAAAGZA0AAAAABjgRAAAAAAQMAAAALACAhAACtCQAgIgAAugkAICkAAAALACADAACLBwAgCQAAjAcAIBIAAI4HACAUAACPBwAgGgAAugkAIJMDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIagDAQD_BQAhrQMAAIsGrQMisQMAAIwGsQMiswMAAIkHswMivAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHEAwEAjgYAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAIckDAQD_BQAhzQMBAP8FACHVAwEA_wUAIeIDAQD_BQAh4wMBAP8FACHkAwEAjgYAIeUDCADKBgAh5gMBAI4GACHnAwEAjgYAIegDAQCOBgAh6QMBAI4GACHqAwEA_wUAIesDAQD_BQAh7AMBAI4GACHtAwEAjgYAIe8DAACKB-8DIvADAQD_BQAhJwMAAIsHACAJAACMBwAgEgAAjgcAIBQAAI8HACCTAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpgMBAP8FACGoAwEA_wUAIa0DAACLBq0DIrEDAACMBrEDIrMDAACJB7MDIrwDAQD_BQAhvQMBAP8FACG-AwEAjgYAIb8DAQCOBgAhxAMBAI4GACHFAwEAjgYAIcYDAQCOBgAhxwMBAI4GACHJAwEA_wUAIc0DAQD_BQAh1QMBAP8FACHiAwEA_wUAIeMDAQD_BQAh5AMBAI4GACHlAwgAygYAIeYDAQCOBgAh5wMBAI4GACHoAwEAjgYAIekDAQCOBgAh6gMBAP8FACHrAwEA_wUAIewDAQCOBgAh7QMBAI4GACHvAwAAigfvAyLwAwEA_wUAISkDAACyBgAgCgAAsAYAIAwAALEGACASAACzBgAgkwMBAAAAAZYDAQAAAAGXAyAAAAABmANAAAAAAZkDQAAAAAGaA0AAAAABpgMBAAAAAacDAQAAAAGoAwEAAAABqQMBAAAAAaoDAQAAAAGrAwEAAAABrQMAAACtAwKuAwIAAAABrwMBAAAAAbEDAAAAsQMCswMAAACzAwO0AwEAAAABtQMBAAAAAbYDAQAAAAG3AwEAAAABuAMBAAAAAbkDAQAAAAG6AwEAAAABuwMBAAAAAbwDAQAAAAG9AwEAAAABvgMBAAAAAb8DAQAAAAHAAwEAAAABwQMBAAAAAcIDAQAAAAHDAwEAAAABxAMBAAAAAcUDAQAAAAHGAwEAAAABxwMBAAAAAQIAAAARACAhAAC7CQAgAwAAAA8AICEAALsJACAiAAC_CQAgKwAAAA8AIAMAAJIGACAKAACQBgAgDAAAkQYAIBIAAJMGACAaAAC_CQAgkwMBAP8FACGWAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpgMBAP8FACGnAwEA_wUAIagDAQD_BQAhqQMBAP8FACGqAwEA_wUAIasDAQD_BQAhrQMAAIsGrQMirgMCAIAGACGvAwEA_wUAIbEDAACMBrEDIrMDAACNBrMDI7QDAQCOBgAhtQMBAI4GACG2AwEAjgYAIbcDAQCOBgAhuAMBAP8FACG5AwEA_wUAIboDAQD_BQAhuwMBAP8FACG8AwEA_wUAIb0DAQD_BQAhvgMBAI4GACG_AwEAjgYAIcADAQD_BQAhwQMBAI4GACHCAwEAjgYAIcMDAQCOBgAhxAMBAP8FACHFAwEAjgYAIcYDAQCOBgAhxwMBAI4GACEpAwAAkgYAIAoAAJAGACAMAACRBgAgEgAAkwYAIJMDAQD_BQAhlgMBAP8FACGXAyAAgQYAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAIaYDAQD_BQAhpwMBAP8FACGoAwEA_wUAIakDAQD_BQAhqgMBAP8FACGrAwEA_wUAIa0DAACLBq0DIq4DAgCABgAhrwMBAP8FACGxAwAAjAaxAyKzAwAAjQazAyO0AwEAjgYAIbUDAQCOBgAhtgMBAI4GACG3AwEAjgYAIbgDAQD_BQAhuQMBAP8FACG6AwEA_wUAIbsDAQD_BQAhvAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHAAwEA_wUAIcEDAQCOBgAhwgMBAI4GACHDAwEAjgYAIcQDAQD_BQAhxQMBAI4GACHGAwEAjgYAIccDAQCOBgAhKQMAALIGACAJAACvBgAgDAAAsQYAIBIAALMGACCTAwEAAAABlgMBAAAAAZcDIAAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAGmAwEAAAABpwMBAAAAAagDAQAAAAGpAwEAAAABqgMBAAAAAasDAQAAAAGtAwAAAK0DAq4DAgAAAAGvAwEAAAABsQMAAACxAwKzAwAAALMDA7QDAQAAAAG1AwEAAAABtgMBAAAAAbcDAQAAAAG4AwEAAAABuQMBAAAAAboDAQAAAAG7AwEAAAABvAMBAAAAAb0DAQAAAAG-AwEAAAABvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQAAAAHEAwEAAAABxQMBAAAAAcYDAQAAAAHHAwEAAAABAgAAABEAICEAAMAJACADAAAADwAgIQAAwAkAICIAAMQJACArAAAADwAgAwAAkgYAIAkAAI8GACAMAACRBgAgEgAAkwYAIBoAAMQJACCTAwEA_wUAIZYDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIacDAQD_BQAhqAMBAP8FACGpAwEA_wUAIaoDAQD_BQAhqwMBAP8FACGtAwAAiwatAyKuAwIAgAYAIa8DAQD_BQAhsQMAAIwGsQMiswMAAI0GswMjtAMBAI4GACG1AwEAjgYAIbYDAQCOBgAhtwMBAI4GACG4AwEA_wUAIbkDAQD_BQAhugMBAP8FACG7AwEA_wUAIbwDAQD_BQAhvQMBAP8FACG-AwEAjgYAIb8DAQCOBgAhwAMBAP8FACHBAwEAjgYAIcIDAQCOBgAhwwMBAI4GACHEAwEA_wUAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAISkDAACSBgAgCQAAjwYAIAwAAJEGACASAACTBgAgkwMBAP8FACGWAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpgMBAP8FACGnAwEA_wUAIagDAQD_BQAhqQMBAP8FACGqAwEA_wUAIasDAQD_BQAhrQMAAIsGrQMirgMCAIAGACGvAwEA_wUAIbEDAACMBrEDIrMDAACNBrMDI7QDAQCOBgAhtQMBAI4GACG2AwEAjgYAIbcDAQCOBgAhuAMBAP8FACG5AwEA_wUAIboDAQD_BQAhuwMBAP8FACG8AwEA_wUAIb0DAQD_BQAhvgMBAI4GACG_AwEAjgYAIcADAQD_BQAhwQMBAI4GACHCAwEAjgYAIcMDAQCOBgAhxAMBAP8FACHFAwEAjgYAIcYDAQCOBgAhxwMBAI4GACEQBAAAjQgAIAUAAI4IACAGAACPCAAgBwAAkAgAIJMDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAHeAyAAAAAB3wMBAAAAAfQDAQAAAAGGBAAAAO8DAogEAAAAiAQCiQQgAAAAAYoEIAAAAAGLBAEAAAABAgAAAMkCACAhAADFCQAgCwYAAIAHACANAACCBwAgEQAAgwcAIJMDAQAAAAGYA0AAAAABmQNAAAAAAZoDQAAAAAHeAyAAAAAB3wMBAAAAAeADCAAAAAHhAwEAAAABAgAAADIAICEAAMcJACAnAwAAvQcAIBIAAMAHACATAAC_BwAgFAAAwQcAIJMDAQAAAAGXAyAAAAABmANAAAAAAZkDQAAAAAGaA0AAAAABpgMBAAAAAagDAQAAAAGtAwAAAK0DArEDAAAAsQMCswMAAACzAwK8AwEAAAABvQMBAAAAAb4DAQAAAAG_AwEAAAABxAMBAAAAAcUDAQAAAAHGAwEAAAABxwMBAAAAAckDAQAAAAHNAwEAAAAB1QMBAAAAAeIDAQAAAAHjAwEAAAAB5AMBAAAAAeUDCAAAAAHmAwEAAAAB5wMBAAAAAegDAQAAAAHpAwEAAAAB6gMBAAAAAesDAQAAAAHsAwEAAAAB7QMBAAAAAe8DAAAA7wMC8AMBAAAAAQIAAAC_AwAgIQAAyQkAIAMAAAALACAhAADJCQAgIgAAzQkAICkAAAALACADAACLBwAgEgAAjgcAIBMAAI0HACAUAACPBwAgGgAAzQkAIJMDAQD_BQAhlwMgAIEGACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACGmAwEA_wUAIagDAQD_BQAhrQMAAIsGrQMisQMAAIwGsQMiswMAAIkHswMivAMBAP8FACG9AwEA_wUAIb4DAQCOBgAhvwMBAI4GACHEAwEAjgYAIcUDAQCOBgAhxgMBAI4GACHHAwEAjgYAIckDAQD_BQAhzQMBAP8FACHVAwEA_wUAIeIDAQD_BQAh4wMBAP8FACHkAwEAjgYAIeUDCADKBgAh5gMBAI4GACHnAwEAjgYAIegDAQCOBgAh6QMBAI4GACHqAwEA_wUAIesDAQD_BQAh7AMBAI4GACHtAwEAjgYAIe8DAACKB-8DIvADAQD_BQAhJwMAAIsHACASAACOBwAgEwAAjQcAIBQAAI8HACCTAwEA_wUAIZcDIACBBgAhmANAAIIGACGZA0AAggYAIZoDQACDBgAhpgMBAP8FACGoAwEA_wUAIa0DAACLBq0DIrEDAACMBrEDIrMDAACJB7MDIrwDAQD_BQAhvQMBAP8FACG-AwEAjgYAIb8DAQCOBgAhxAMBAI4GACHFAwEAjgYAIcYDAQCOBgAhxwMBAI4GACHJAwEA_wUAIc0DAQD_BQAh1QMBAP8FACHiAwEA_wUAIeMDAQD_BQAh5AMBAI4GACHlAwgAygYAIeYDAQCOBgAh5wMBAI4GACHoAwEAjgYAIekDAQCOBgAh6gMBAP8FACHrAwEA_wUAIewDAQCOBgAh7QMBAI4GACHvAwAAigfvAyLwAwEA_wUAIQYMAACwCAAgkwMBAAAAAZYDAQAAAAGYA0AAAAABmQNAAAAAAY4EQAAAAAECAAAAIAAgIQAAzgkAIAMAAAAeACAhAADOCQAgIgAA0gkAIAgAAAAeACAMAACvCAAgGgAA0gkAIJMDAQD_BQAhlgMBAP8FACGYA0AAggYAIZkDQACCBgAhjgRAAIIGACEGDAAArwgAIJMDAQD_BQAhlgMBAP8FACGYA0AAggYAIZkDQACCBgAhjgRAAIIGACEFkwMBAAAAAZgDQAAAAAGZA0AAAAABiAQAAACQBAKMBAEAAAABAwAAAMwCACAhAADFCQAgIgAA1gkAIBIAAADMAgAgBAAA3QcAIAUAAN4HACAGAADfBwAgBwAA4AcAIBoAANYJACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAId4DIACBBgAh3wMBAP8FACH0AwEA_wUAIYYEAACKB-8DIogEAADcB4gEIokEIACBBgAhigQgAIEGACGLBAEAjgYAIRAEAADdBwAgBQAA3gcAIAYAAN8HACAHAADgBwAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHeAyAAgQYAId8DAQD_BQAh9AMBAP8FACGGBAAAigfvAyKIBAAA3AeIBCKJBCAAgQYAIYoEIACBBgAhiwQBAI4GACEDAAAAMAAgIQAAxwkAICIAANkJACANAAAAMAAgBgAAywYAIA0AAM0GACARAADOBgAgGgAA2QkAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACHfAwEA_wUAIeADCADKBgAh4QMBAP8FACELBgAAywYAIA0AAM0GACARAADOBgAgkwMBAP8FACGYA0AAggYAIZkDQACCBgAhmgNAAIMGACHeAyAAgQYAId8DAQD_BQAh4AMIAMoGACHhAwEA_wUAIQsGAACABwAgCwAAgQcAIBEAAIMHACCTAwEAAAABmANAAAAAAZkDQAAAAAGaA0AAAAAB3gMgAAAAAd8DAQAAAAHgAwgAAAAB4QMBAAAAAQIAAAAyACAhAADaCQAgAwAAADAAICEAANoJACAiAADeCQAgDQAAADAAIAYAAMsGACALAADMBgAgEQAAzgYAIBoAAN4JACCTAwEA_wUAIZgDQACCBgAhmQNAAIIGACGaA0AAgwYAId4DIACBBgAh3wMBAP8FACHgAwgAygYAIeEDAQD_BQAhCwYAAMsGACALAADMBgAgEQAAzgYAIJMDAQD_BQAhmANAAIIGACGZA0AAggYAIZoDQACDBgAh3gMgAIEGACHfAwEA_wUAIeADCADKBgAh4QMBAP8FACEBBgACBgMAAwkvCBAAFRI3EhMzChQ8AQYEBgQFCgUGDAIHDgYLEgcQABEBAwADAQMAAwEDAAMGAwADCRQIChgJDAAKEAAQEioNAgYWAggVBwEIAAcFBgACCxkHDR0LEAAPESEMAQwACgMMAAoPJQ0QAA4CCAAHDgAMAQ8mAAMLJwANKAARKQABEisAAwQsAAUtAAsuAAIGAAIOABMCDzgSEAAUAQ85AAMSPgATPQAUPwAAAQYAAgEGAAIFEAAaJwAbKAAcKQAdKgAeAAAAAAAFEAAaJwAbKAAcKQAdKgAeAAAAAxAAJCkAJSoAJgAAAAMQACQpACUqACYAAAADEAAsKQAtKgAuAAAAAxAALCkALSoALgMQADNOjAExT44BMgFNADABTQAwAU6PAQAAAAMQADcpADgqADkAAAADEAA3KQA4KgA5AU0AMAFNADAFEAA-JwA_KABAKQBBKgBCAAAAAAAFEAA-JwA_KABAKQBBKgBCAU0AMAFNADAFEABHJwBIKABJKQBKKgBLAAAAAAAFEABHJwBIKABJKQBKKgBLAAAAAxAAUSkAUioAUwAAAAMQAFEpAFIqAFMBDAAKAQwACgMQAFgpAFkqAFoAAAADEABYKQBZKgBaAggABw4ADAIIAAcOAAwDEABfKQBgKgBhAAAAAxAAXykAYCoAYQAAAxAAZikAZyoAaAAAAAMQAGYpAGcqAGgCBgACDgATAgYAAg4AEwMQAG0pAG4qAG8AAAADEABtKQBuKgBvAAADEAB0KQB1KgB2AAAAAxAAdCkAdSoAdgEDAAMBAwADAxAAeykAfCoAfQAAAAMQAHspAHwqAH0BAwADAQMAAwMQAIIBKQCDASoAhAEAAAADEACCASkAgwEqAIQBAAAAAxAAigEpAIsBKgCMAQAAAAMQAIoBKQCLASoAjAEBAwADAQMAAwMQAJEBKQCSASoAkwEAAAADEACRASkAkgEqAJMBAQMAAwEDAAMFEACYAScAmQEoAJoBKQCbASoAnAEAAAAAAAUQAJgBJwCZASgAmgEpAJsBKgCcAQEGAAIBBgACBRAAoQEnAKIBKACjASkApAEqAKUBAAAAAAAFEAChAScAogEoAKMBKQCkASoApQECBvoDAgj5AwcCBoEEAgiABAcDEACqASkAqwEqAKwBAAAAAxAAqgEpAKsBKgCsAQAAAAUQALIBJwCzASgAtAEpALUBKgC2AQAAAAAABRAAsgEnALMBKAC0ASkAtQEqALYBAQgABwEIAAcDEAC7ASkAvAEqAL0BAAAAAxAAuwEpALwBKgC9AQIDAAMMAAoCAwADDAAKBRAAwgEnAMMBKADEASkAxQEqAMYBAAAAAAAFEADCAScAwwEoAMQBKQDFASoAxgEBDAAKAQwACgUQAMsBJwDMASgAzQEpAM4BKgDPAQAAAAAABRAAywEnAMwBKADNASkAzgEqAM8BFQIBFkABF0EBGEIBGUMBG0UBHEcWHUgXHkoBH0wWIE0YI04BJE8BJVAWK1MZLFQfLVYgLlcgL1ogMFsgMVwgMl4gM2AWNGEhNWMgNmUWN2YiOGcgOWggOmkWO2wjPG0nPW8oPnAoP3MoQHQoQXUoQncoQ3kWRHopRXwoRn4WR38qSIABKEmBAShKggEWS4UBK0yGAS9QiAEwUZABMFKTATBTlAEwVJUBMFWXATBWmQEWV5oBNFicATBZngEWWp8BNVugATBcoQEwXaIBFl6lATZfpgE6YKcBMWGoATFiqQExY6oBMWSrATFlrQExZq8BFmewATtosgExabQBFmq1ATxrtgExbLcBMW24ARZuuwE9b7wBQ3C-ATJxvwEycsEBMnPCATJ0wwEydcUBMnbHARZ3yAFEeMoBMnnMARZ6zQFFe84BMnzPATJ90AEWftMBRn_UAUyAAdYBTYEB1wFNggHaAU2DAdsBTYQB3AFNhQHeAU2GAeABFocB4QFOiAHjAU2JAeUBFooB5gFPiwHnAU2MAegBTY0B6QEWjgHsAVCPAe0BVJAB7gEMkQHvAQySAfABDJMB8QEMlAHyAQyVAfQBDJYB9gEWlwH3AVWYAfkBDJkB-wEWmgH8AVabAf0BDJwB_gEMnQH_ARaeAYICV58BgwJboAGEAg2hAYUCDaIBhgINowGHAg2kAYgCDaUBigINpgGMAhanAY0CXKgBjwINqQGRAhaqAZICXasBkwINrAGUAg2tAZUCFq4BmAJerwGZAmKwAZsCE7EBnAITsgGfAhOzAaACE7QBoQITtQGjAhO2AaUCFrcBpgJjuAGoAhO5AaoCFroBqwJkuwGsAhO8Aa0CE70BrgIWvgGxAmW_AbICacABswISwQG0AhLCAbUCEsMBtgISxAG3AhLFAbkCEsYBuwIWxwG8AmrIAb4CEskBwAIWygHBAmvLAcICEswBwwISzQHEAhbOAccCbM8ByAJw0AHKAgPRAcsCA9IBzgID0wHPAgPUAdACA9UB0gID1gHUAhbXAdUCcdgB1wID2QHZAhbaAdoCctsB2wID3AHcAgPdAd0CFt4B4AJz3wHhAnfgAeICBOEB4wIE4gHkAgTjAeUCBOQB5gIE5QHoAgTmAeoCFucB6wJ46AHtAgTpAe8CFuoB8AJ56wHxAgTsAfICBO0B8wIW7gH2AnrvAfcCfvAB-AIF8QH5AgXyAfoCBfMB-wIF9AH8AgX1Af4CBfYBgAMW9wGBA3_4AYMDBfkBhQMW-gGGA4AB-wGHAwX8AYgDBf0BiQMW_gGMA4EB_wGNA4UBgAKPA4YBgQKQA4YBggKTA4YBgwKUA4YBhAKVA4YBhQKXA4YBhgKZAxaHApoDhwGIApwDhgGJAp4DFooCnwOIAYsCoAOGAYwCoQOGAY0CogMWjgKlA4kBjwKmA40BkAKoAwaRAqkDBpICqwMGkwKsAwaUAq0DBpUCrwMGlgKxAxaXArIDjgGYArQDBpkCtgMWmgK3A48BmwK4AwacArkDBp0CugMWngK9A5ABnwK-A5QBoALAAwKhAsEDAqICwwMCowLEAwKkAsUDAqUCxwMCpgLJAxanAsoDlQGoAswDAqkCzgMWqgLPA5YBqwLQAwKsAtEDAq0C0gMWrgLVA5cBrwLWA50BsALXAwqxAtgDCrIC2QMKswLaAwq0AtsDCrUC3QMKtgLfAxa3AuADngG4AuIDCrkC5AMWugLlA58BuwLmAwq8AucDCr0C6AMWvgLrA6ABvwLsA6YBwALuAwjBAu8DCMIC8QMIwwLyAwjEAvMDCMUC9QMIxgL3AxbHAvgDpwHIAvwDCMkC_gMWygL_A6gBywKCBAjMAoMECM0ChAQWzgKHBKkBzwKIBK0B0AKKBK4B0QKLBK4B0gKOBK4B0wKPBK4B1AKQBK4B1QKSBK4B1gKUBBbXApUErwHYApcErgHZApkEFtoCmgSwAdsCmwSuAdwCnASuAd0CnQQW3gKgBLEB3wKhBLcB4AKjBAnhAqQECeICpgQJ4wKnBAnkAqgECeUCqgQJ5gKsBBbnAq0EuAHoAq8ECekCsQQW6gKyBLkB6wKzBAnsArQECe0CtQQW7gK4BLoB7wK5BL4B8AK6BAfxArsEB_ICvAQH8wK9BAf0Ar4EB_UCwAQH9gLCBBb3AsMEvwH4AsUEB_kCxwQW-gLIBMAB-wLJBAf8AsoEB_0CywQW_gLOBMEB_wLPBMcBgAPQBAuBA9EEC4ID0gQLgwPTBAuEA9QEC4UD1gQLhgPYBBaHA9kEyAGIA9sEC4kD3QQWigPeBMkBiwPfBAuMA-AEC40D4QQWjgPkBMoBjwPlBNAB"
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
  SalaryPaymentScalarFieldEnum: () => SalaryPaymentScalarFieldEnum,
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
  SalaryPayment: "SalaryPayment",
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
var SalaryPaymentScalarFieldEnum = {
  id: "id",
  employeeId: "employeeId",
  salaryMonth: "salaryMonth",
  paymentDate: "paymentDate",
  fixedSalary: "fixedSalary",
  bonus: "bonus",
  deduction: "deduction",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
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
            await sendEmail({
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
import { Router as Router10 } from "express";

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
      uri: instituteLogo,
      name: instituteLogoName,
      type: instituteLogoType
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
var getRulesRegulations = async () => {
  const rules = await prisma.rulesRegulations.findMany({
    where: {
      type: { in: ["STUDENT", "EMPLOYEE"] }
    }
  });
  return {
    studentRules: rules.find((rule) => rule.type === "STUDENT")?.content ?? null,
    employeeRules: rules.find((rule) => rule.type === "EMPLOYEE")?.content ?? null
  };
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
  getRulesRegulations,
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
  instituteWebsite: z5.string().trim().optional(),
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
var getGeneralSetting2 = catchAsync(async (_req, res) => {
  const result = await GeneralService.getGeneralSetting();
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "General Setting fetched successfully",
    data: result
  });
});
var getRulesRegulations2 = catchAsync(async (req, res) => {
  const result = await GeneralService.getRulesRegulations();
  sendResponse(res, {
    httpStatusCode: status16.OK,
    success: true,
    message: "Rules & Regulations fetched successfully",
    data: result
  });
});
var updateGeneralSetting2 = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = generalSettingSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
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
});
var updateStudentRulesRegulations2 = catchAsync(async (req, res) => {
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
});
var updateEmployeeRulesRegulations2 = catchAsync(async (req, res) => {
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
});
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
  getRulesRegulations: getRulesRegulations2,
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
router5.get(
  "/rules-regulations",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GeneralController.getRulesRegulations
);
router5.patch(
  "/general-setting",
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
  "/general-setting/:id",
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

// src/app/modules/salary/salary.routes.ts
import { Router as Router7 } from "express";

// src/app/modules/salary/salary.service.ts
var createSalary = async (payload) => {
  const { employeeId, salaryMonth, paymentDate, bonus, deduction } = payload;
  const employee = await prisma.employee.findFirst({
    where: {
      id: employeeId,
      isdeleted: false
    },
    select: {
      id: true,
      fullName: true,
      employeeId: true,
      employeeRole: true,
      monthlySalary: true
    }
  });
  if (!employee) {
    throw new AppError_default(404, "Employee not found");
  }
  const fixedSalary = employee.monthlySalary;
  const totalAmount = fixedSalary + bonus;
  const netPaid = totalAmount - deduction;
  if (deduction > totalAmount) {
    throw new AppError_default(
      400,
      "Deduction cannot be greater than total salary"
    );
  }
  const existingSalary = await prisma.salaryPayment.findUnique({
    where: {
      employeeId_salaryMonth: {
        employeeId,
        salaryMonth
      }
    }
  });
  if (existingSalary) {
    throw new AppError_default(
      409,
      `Salary has already been paid for ${salaryMonth}`
    );
  }
  const [day, month, year] = paymentDate.split("/").map(Number);
  const formattedPaymentDate = new Date(Date.UTC(year, month - 1, day));
  try {
    const result = await prisma.salaryPayment.create({
      data: {
        employeeId,
        salaryMonth,
        paymentDate: formattedPaymentDate,
        fixedSalary,
        bonus,
        deduction
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            employeeRole: true
          }
        }
      }
    });
    return {
      ...result,
      totalAmount,
      netPaid
    };
  } catch (error) {
    if (error instanceof prismaNamespace_exports.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError_default(
        409,
        `Salary has already been paid for ${salaryMonth}`
      );
    }
    throw error;
  }
};
var SalaryService = {
  createSalary
};

// src/app/modules/salary/salary.validation.ts
import { z as z7 } from "zod";
var createSalarySchema = z7.object({
  employeeId: z7.string().trim().min(1, "Employee ID is required"),
  salaryMonth: z7.string().trim().regex(
    /^(0[1-9]|1[0-2])\/\d{4}$/,
    "Salary month must be in MM/YYYY format"
  ),
  paymentDate: z7.string().trim().regex(
    /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    "Payment date must be in DD/MM/YYYY format"
  ).refine((value) => {
    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }, "Invalid payment date"),
  bonus: z7.number().min(0, "Bonus cannot be negative").default(0),
  deduction: z7.number().min(0, "Deduction cannot be negative").default(0)
});

// src/app/modules/salary/salary.controller.ts
var createSalary2 = catchAsync(async (req, res) => {
  const payload = createSalarySchema.parse(req.body);
  const salary = await SalaryService.createSalary(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Salary created successfully",
    data: salary
  });
});
var SalaryController = {
  createSalary: createSalary2
};

// src/app/modules/salary/salary.routes.ts
var router7 = Router7();
router7.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SalaryController.createSalary
);
var salaryRoutes = router7;

// src/app/modules/student/student.routes.ts
import { Router as Router8 } from "express";

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
import z8 from "zod";
var createStudentSchema = z8.object({
  fullName: z8.string({ error: "Student Name is required" }).min(1, { error: "Student Name can't be empty" }),
  fullNameBangla: z8.string({ error: "Student Name Bangla is required" }).min(1, { error: "Student Name Bangla can't be empty" }),
  dateOfBirth: z8.string({ error: "Date of birth is required" }).min(1, { error: "Date of birth can't be empty" }),
  birthRegistrationNumber: z8.string({ error: "Birth Registration Number is required" }).min(1, { error: "Birth Registration Number can't be empty" }),
  religion: z8.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }),
  gender: z8.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }),
  bloodGroup: z8.enum(BloodGroup, {
    error: "BloodGroup must be one of: " + Object.values(BloodGroup).join(", ")
  }).optional(),
  classId: z8.string({ error: "Class Id is required" }).min(1, { error: "Class Id can't be empty" }),
  fatherName: z8.string({ error: "Father name is required" }).min(1, { error: "Father Name can't be emptry" }),
  fatherNameBangla: z8.string({ error: "Father name Bangla is required" }).min(1, { error: "Father Name Bangla can't be empty" }),
  fatherMobileNumber: z8.string({ error: "Father Mobile Number is required" }),
  whatsappNumber: z8.string({ error: "Whatsapp number is required" }).min(1, { error: "Whatsapp Number can't be empty" }),
  fatherOccupation: z8.string({ error: "Father Occupation is required" }).min(1, { error: "Father Occupation can't be empty" }),
  motherName: z8.string({ error: "Mother Name is required" }).min(1, { error: "Mother Name Bangla can't be empty" }),
  motherNameBangla: z8.string({ error: "Mother Name Bangla is required" }).min(1, { error: "Mother Name Bangla can't be empty" }),
  motherMobileNumber: z8.string({ error: "Mother Mobile Number is required" }),
  motherOccupation: z8.string({ error: "Mother Occupation is required" }).min(1, { error: "Mother Occupation can't be empty" }),
  email: z8.email({ error: "Please provide a valid email address" }),
  guardianName: z8.string({ error: "Guardian Name is required" }).min(1, { error: "Guardian Name can't be empty" }),
  guardianRelationship: z8.string({ error: "Guardian Relationship is required" }).min(1, { error: "Guardian Relationship can't be empty" }),
  guardianMobile: z8.string({ error: "Guardian Mobile number is required" }).min(11, { error: "Guardian Mobile must be minimum 11 digit" }),
  admissionTotalFees: z8.coerce.number({
    error: "Total Fees of Admission and Other Expenses is required "
  }),
  admissionDate: z8.string({ error: "Admission date is required" }).min(1, "Admission date can't be empty"),
  previousInstitute: z8.string().optional(),
  endingClass: z8.string().optional(),
  result: z8.string().optional(),
  testimonialNumber: z8.string().optional(),
  address: z8.object({
    present: presentAddressSchema,
    permanent: permanentAddressSchema
  })
});
var updateStudentSchema = z8.object({
  fullName: z8.string().optional(),
  fullNameBangla: z8.string().optional(),
  dateOfBirth: z8.string().optional(),
  birthRegistrationNumber: z8.string().optional(),
  religion: z8.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }).optional(),
  gender: z8.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }).optional(),
  bloodGroup: z8.enum(BloodGroup, {
    error: "BloodGroup must be one of: " + Object.values(BloodGroup).join(", ")
  }).optional(),
  classId: z8.string().optional(),
  fatherName: z8.string().optional(),
  fatherNameBangla: z8.string().optional(),
  fatherMobileNumber: z8.string().optional(),
  whatsappNumber: z8.string().optional(),
  fatherOccupation: z8.string().optional(),
  motherName: z8.string().optional(),
  motherNameBangla: z8.string().optional(),
  motherMobileNumber: z8.string().optional(),
  motherOccupation: z8.string().optional(),
  email: z8.email({ error: "Please provide a valid email address" }).optional(),
  guardianName: z8.string().optional(),
  guardianRelationship: z8.string().optional(),
  guardianMobile: z8.string().optional(),
  admissionTotalFees: z8.coerce.number().optional(),
  admissionDate: z8.string().optional(),
  previousInstitute: z8.string().optional(),
  endingClass: z8.string().optional(),
  result: z8.string().optional(),
  testimonialNumber: z8.string().optional(),
  address: z8.object({
    present: presentAddressSchema.partial().optional(),
    permanent: permanentAddressSchema.partial().optional()
  }).optional()
});
var promoteStudentsSchema = z8.object({
  sourceClassId: z8.uuid("Invalid source class ID"),
  targetClassId: z8.uuid("Invalid target class ID"),
  studentIds: z8.array(z8.uuid("Invalid student ID")).min(1, "Select at least one student").refine(
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
var router8 = Router8();
router8.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.getAllStudent
);
router8.get(
  "/:id/update",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.getStudentForUpdate
);
router8.post(
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
router8.patch(
  "/promote",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.promoteStudents
);
router8.patch(
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
router8.delete(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  studentController.deleteStudent
);
var StudentRoutes = router8;

// src/app/modules/subjects/subject.routes.ts
import { Router as Router9 } from "express";

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
import { z as z9 } from "zod";
var subjectItemSchema = z9.object({
  subjectName: z9.string({ error: "Subject Name is required" }).trim().min(1, { error: "Subject Name cannot be empty" }),
  marks: z9.number({ error: "Total mark is required" }).int({ error: "Total mark must be a whole number" }).positive({ error: "Total mark must be greater than 0" })
});
var createSubjectSchema = z9.object({
  classId: z9.string({ error: "Class is required" }).trim().min(1, { error: "Class cannot be empty" }),
  subjects: z9.array(subjectItemSchema).min(1, { error: "At least one subject is required" })
});
var updateSubjectSchema = z9.object({
  classId: z9.string({ error: "Class is required" }).trim().min(1, { error: "Class cannot be empty" }),
  subjects: z9.array(
    subjectItemSchema.extend({
      id: z9.string().optional()
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
var router9 = Router9();
router9.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.getAllSubjectsByClassId
);
router9.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.createSubject
);
router9.patch(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.updateSubject
);
router9.delete(
  "/:classId",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.deleteSubjects
);
var subjectRoutes = router9;

// src/app/routes/index.ts
var routes = Router10();
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
    path: "/salary",
    route: salaryRoutes
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