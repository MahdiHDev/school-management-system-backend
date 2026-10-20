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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nenum RegulationType {\n  STUDENT\n  EMPLOYEE\n  ATTENDANCE\n  EXAMINATION\n  LEAVE\n  CODE_OF_CONDUCT\n  UNIFORM\n  OTHER\n}\n\nenum GradeStatus {\n  PASS\n  FAIL\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n  students           Student[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone String\n\n  fullName         String\n  nid              String\n  fatherName       String\n  motherName       String\n  emergencyContact String?\n  monthlySalary    Float\n  employeeId       String  @unique\n\n  picture         String?\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  experience         String?\n  experiencePublicId String?\n  experienceName     String?\n  experienceType     String?\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  employeeSign         String\n  employeeSignPublicId String\n  employeeSignName     String?\n  employeeSignType     String?\n\n  gender        Gender\n  bloodGroup    BloodGroup\n  religion      Religion\n  employeeRole  UserRole   @default(OTHER)\n  dateOfJoining String\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  address Address?\n  classes Class[]\n\n  @@map("employee")\n}\n\n// model TutorProfile {\n//     id String @id @default(uuid())\n\n//     classId    String\n\n//     class    Class    @relation(fields: [classId], references: [id], onDelete: Cascade)\n//     employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n// }\n\nmodel Class {\n  id                String @id @default(uuid())\n  name              String\n  monthlyTuitionFee Float\n  classTeacher      String\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  employee Employee  @relation(fields: [classTeacher], references: [id], onDelete: Cascade)\n  students Student[]\n  subjects Subject[]\n\n  @@map("class")\n}\n\nmodel Address {\n  id String @id @default(uuid())\n\n  studentId  String? @unique @map("student_id")\n  employeeId String? @unique @map("employee_id")\n\n  permanentAddressVillage    String?\n  permanentAddressPostOffice String?\n  permanentAddressPostCode   String?\n  permanentAddressDistrict   String?\n\n  presentAddressVillage    String?\n  presentAddressPostOffice String?\n  presentAddressPostCode   String?\n  presentAddressDistrict   String?\n\n  isDeleted Boolean @default(false)\n\n  student  Student?  @relation(fields: [studentId], references: [id])\n  employee Employee? @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now()) @map("created_at")\n  updatedAt DateTime  @updatedAt @map("updated_at")\n  deletedAt DateTime? @map("deleted_at")\n}\n\nmodel Sequence {\n  id      String @id\n  current Int\n}\n\nmodel GuardianInfo {\n  id             String @id @default(uuid())\n  studentId      String @unique\n  whatsappNumber String\n\n  fatherName         String\n  fatherNameBangla   String\n  fatherMobileNumber String\n  fatherOccupation   String\n\n  motherName         String\n  motherNameBangla   String\n  motherMobileNumber String\n  motherOccupation   String\n\n  nameOfLocalGuardian   String\n  relationShipOfStudent String\n  GuardianMobileNumber  String\n\n  student Student @relation(fields: [studentId], references: [id])\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Student {\n  id                      String      @id @default(uuid())\n  userId                  String\n  classId                 String\n  studentId               String      @unique\n  fullName                String\n  fullNameBangla          String\n  dateOfBirth             String\n  birthRegistrationNumber String      @unique\n  religion                Religion\n  admissionTotalFees      Int\n  admissionDate           String\n  gender                  Gender\n  bloodGroup              BloodGroup?\n  previousInstituteName   String?\n  endingClass             String?\n  result                  String?\n  testimonialNumber       String?\n\n  studentSign         String\n  studentSignPublicId String\n  studentsignName     String\n  studentSignType     String\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  guardianSign         String\n  guardianSignPublicId String?\n  guardianSignName     String?\n  guardianSignType     String?\n\n  picture         String\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  address      Address?\n  guardianInfo GuardianInfo?\n  class        Class         @relation(fields: [classId], references: [id])\n  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Subject {\n  id          String @id @default(uuid())\n  subjectName String\n  maxMarks    Int\n  classId     String\n  class       Class  @relation(fields: [classId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel GeneralSettings {\n  id            String  @id @default(uuid())\n  schoolName    String\n  schoolPhone   String\n  schoolEmail   String\n  schoolWebsite String?\n  schoolAddress String\n  country       String\n\n  instituteLogo      String?\n  schoolLogoPublicId String?\n  schoolLogoName     String?\n  schoolLogoType     String?\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel RulesRegulations {\n  id      String         @id @default(uuid())\n  content String         @db.Text\n  type    RegulationType\n\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@index([type])\n  @@map("rules_regulations")\n}\n\nmodel GradingConfiguration {\n  id        String   @id @default(uuid())\n  name      String   @default("Default Grading")\n  isActive  Boolean  @default(true)\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  grades       GradeScale[]\n  failCriteria FailCriteria?\n}\n\nmodel GradeScale {\n  id       String      @id @default(uuid())\n  grade    String\n  minMarks Int\n  maxMarks Int\n  status   GradeStatus @default(PASS)\n\n  configurationId String\n  configuration   GradingConfiguration @relation(fields: [configurationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@unique([configurationId, grade])\n  @@index([configurationId])\n}\n\nmodel FailCriteria {\n  id                String @id @default(uuid())\n  overallPercentage Float\n  subjectPercentage Float\n  minFailedSubjects Int\n\n  configurationId String               @unique\n  configuration   GradingConfiguration @relation(fields: [configurationId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"},{"name":"students","kind":"object","type":"Student","relationName":"StudentToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContact","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"String"},{"name":"experiencePublicId","kind":"scalar","type":"String"},{"name":"experienceName","kind":"scalar","type":"String"},{"name":"experienceType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"employeeSign","kind":"scalar","type":"String"},{"name":"employeeSignPublicId","kind":"scalar","type":"String"},{"name":"employeeSignName","kind":"scalar","type":"String"},{"name":"employeeSignType","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"UserRole"},{"name":"dateOfJoining","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToEmployee"},{"name":"classes","kind":"object","type":"Class","relationName":"ClassToEmployee"}],"dbName":"employee"},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTuitionFee","kind":"scalar","type":"Float"},{"name":"classTeacher","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"employee","kind":"object","type":"Employee","relationName":"ClassToEmployee"},{"name":"students","kind":"object","type":"Student","relationName":"ClassToStudent"},{"name":"subjects","kind":"object","type":"Subject","relationName":"ClassToSubject"}],"dbName":"class"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String","dbName":"student_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"permanentAddressVillage","kind":"scalar","type":"String"},{"name":"permanentAddressPostOffice","kind":"scalar","type":"String"},{"name":"permanentAddressPostCode","kind":"scalar","type":"String"},{"name":"permanentAddressDistrict","kind":"scalar","type":"String"},{"name":"presentAddressVillage","kind":"scalar","type":"String"},{"name":"presentAddressPostOffice","kind":"scalar","type":"String"},{"name":"presentAddressPostCode","kind":"scalar","type":"String"},{"name":"presentAddressDistrict","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"student","kind":"object","type":"Student","relationName":"AddressToStudent"},{"name":"employee","kind":"object","type":"Employee","relationName":"AddressToEmployee"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"}],"dbName":null},"Sequence":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"current","kind":"scalar","type":"Int"}],"dbName":null},"GuardianInfo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"whatsappNumber","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"fatherNameBangla","kind":"scalar","type":"String"},{"name":"fatherMobileNumber","kind":"scalar","type":"String"},{"name":"fatherOccupation","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"motherNameBangla","kind":"scalar","type":"String"},{"name":"motherMobileNumber","kind":"scalar","type":"String"},{"name":"motherOccupation","kind":"scalar","type":"String"},{"name":"nameOfLocalGuardian","kind":"scalar","type":"String"},{"name":"relationShipOfStudent","kind":"scalar","type":"String"},{"name":"GuardianMobileNumber","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"GuardianInfoToStudent"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Student":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"fullNameBangla","kind":"scalar","type":"String"},{"name":"dateOfBirth","kind":"scalar","type":"String"},{"name":"birthRegistrationNumber","kind":"scalar","type":"String"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"admissionTotalFees","kind":"scalar","type":"Int"},{"name":"admissionDate","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"previousInstituteName","kind":"scalar","type":"String"},{"name":"endingClass","kind":"scalar","type":"String"},{"name":"result","kind":"scalar","type":"String"},{"name":"testimonialNumber","kind":"scalar","type":"String"},{"name":"studentSign","kind":"scalar","type":"String"},{"name":"studentSignPublicId","kind":"scalar","type":"String"},{"name":"studentsignName","kind":"scalar","type":"String"},{"name":"studentSignType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"guardianSign","kind":"scalar","type":"String"},{"name":"guardianSignPublicId","kind":"scalar","type":"String"},{"name":"guardianSignName","kind":"scalar","type":"String"},{"name":"guardianSignType","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToStudent"},{"name":"guardianInfo","kind":"object","type":"GuardianInfo","relationName":"GuardianInfoToStudent"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToStudent"},{"name":"user","kind":"object","type":"User","relationName":"StudentToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"subjectName","kind":"scalar","type":"String"},{"name":"maxMarks","kind":"scalar","type":"Int"},{"name":"classId","kind":"scalar","type":"String"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToSubject"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"GeneralSettings":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"schoolName","kind":"scalar","type":"String"},{"name":"schoolPhone","kind":"scalar","type":"String"},{"name":"schoolEmail","kind":"scalar","type":"String"},{"name":"schoolWebsite","kind":"scalar","type":"String"},{"name":"schoolAddress","kind":"scalar","type":"String"},{"name":"country","kind":"scalar","type":"String"},{"name":"instituteLogo","kind":"scalar","type":"String"},{"name":"schoolLogoPublicId","kind":"scalar","type":"String"},{"name":"schoolLogoName","kind":"scalar","type":"String"},{"name":"schoolLogoType","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"RulesRegulations":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"RegulationType"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"rules_regulations"},"GradingConfiguration":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"grades","kind":"object","type":"GradeScale","relationName":"GradeScaleToGradingConfiguration"},{"name":"failCriteria","kind":"object","type":"FailCriteria","relationName":"FailCriteriaToGradingConfiguration"}],"dbName":null},"GradeScale":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"grade","kind":"scalar","type":"String"},{"name":"minMarks","kind":"scalar","type":"Int"},{"name":"maxMarks","kind":"scalar","type":"Int"},{"name":"status","kind":"enum","type":"GradeStatus"},{"name":"configurationId","kind":"scalar","type":"String"},{"name":"configuration","kind":"object","type":"GradingConfiguration","relationName":"GradeScaleToGradingConfiguration"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"FailCriteria":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"overallPercentage","kind":"scalar","type":"Float"},{"name":"subjectPercentage","kind":"scalar","type":"Float"},{"name":"minFailedSubjects","kind":"scalar","type":"Int"},{"name":"configurationId","kind":"scalar","type":"String"},{"name":"configuration","kind":"object","type":"GradingConfiguration","relationName":"FailCriteriaToGradingConfiguration"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","address","student","guardianInfo","employee","students","class","subjects","_count","classes","admin","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","_avg","_sum","Employee.groupBy","Employee.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","Sequence.findUnique","Sequence.findUniqueOrThrow","Sequence.findFirst","Sequence.findFirstOrThrow","Sequence.findMany","Sequence.createOne","Sequence.createMany","Sequence.createManyAndReturn","Sequence.updateOne","Sequence.updateMany","Sequence.updateManyAndReturn","Sequence.upsertOne","Sequence.deleteOne","Sequence.deleteMany","Sequence.groupBy","Sequence.aggregate","GuardianInfo.findUnique","GuardianInfo.findUniqueOrThrow","GuardianInfo.findFirst","GuardianInfo.findFirstOrThrow","GuardianInfo.findMany","GuardianInfo.createOne","GuardianInfo.createMany","GuardianInfo.createManyAndReturn","GuardianInfo.updateOne","GuardianInfo.updateMany","GuardianInfo.updateManyAndReturn","GuardianInfo.upsertOne","GuardianInfo.deleteOne","GuardianInfo.deleteMany","GuardianInfo.groupBy","GuardianInfo.aggregate","Student.findUnique","Student.findUniqueOrThrow","Student.findFirst","Student.findFirstOrThrow","Student.findMany","Student.createOne","Student.createMany","Student.createManyAndReturn","Student.updateOne","Student.updateMany","Student.updateManyAndReturn","Student.upsertOne","Student.deleteOne","Student.deleteMany","Student.groupBy","Student.aggregate","Subject.findUnique","Subject.findUniqueOrThrow","Subject.findFirst","Subject.findFirstOrThrow","Subject.findMany","Subject.createOne","Subject.createMany","Subject.createManyAndReturn","Subject.updateOne","Subject.updateMany","Subject.updateManyAndReturn","Subject.upsertOne","Subject.deleteOne","Subject.deleteMany","Subject.groupBy","Subject.aggregate","GeneralSettings.findUnique","GeneralSettings.findUniqueOrThrow","GeneralSettings.findFirst","GeneralSettings.findFirstOrThrow","GeneralSettings.findMany","GeneralSettings.createOne","GeneralSettings.createMany","GeneralSettings.createManyAndReturn","GeneralSettings.updateOne","GeneralSettings.updateMany","GeneralSettings.updateManyAndReturn","GeneralSettings.upsertOne","GeneralSettings.deleteOne","GeneralSettings.deleteMany","GeneralSettings.groupBy","GeneralSettings.aggregate","RulesRegulations.findUnique","RulesRegulations.findUniqueOrThrow","RulesRegulations.findFirst","RulesRegulations.findFirstOrThrow","RulesRegulations.findMany","RulesRegulations.createOne","RulesRegulations.createMany","RulesRegulations.createManyAndReturn","RulesRegulations.updateOne","RulesRegulations.updateMany","RulesRegulations.updateManyAndReturn","RulesRegulations.upsertOne","RulesRegulations.deleteOne","RulesRegulations.deleteMany","RulesRegulations.groupBy","RulesRegulations.aggregate","configuration","grades","failCriteria","GradingConfiguration.findUnique","GradingConfiguration.findUniqueOrThrow","GradingConfiguration.findFirst","GradingConfiguration.findFirstOrThrow","GradingConfiguration.findMany","GradingConfiguration.createOne","GradingConfiguration.createMany","GradingConfiguration.createManyAndReturn","GradingConfiguration.updateOne","GradingConfiguration.updateMany","GradingConfiguration.updateManyAndReturn","GradingConfiguration.upsertOne","GradingConfiguration.deleteOne","GradingConfiguration.deleteMany","GradingConfiguration.groupBy","GradingConfiguration.aggregate","GradeScale.findUnique","GradeScale.findUniqueOrThrow","GradeScale.findFirst","GradeScale.findFirstOrThrow","GradeScale.findMany","GradeScale.createOne","GradeScale.createMany","GradeScale.createManyAndReturn","GradeScale.updateOne","GradeScale.updateMany","GradeScale.updateManyAndReturn","GradeScale.upsertOne","GradeScale.deleteOne","GradeScale.deleteMany","GradeScale.groupBy","GradeScale.aggregate","FailCriteria.findUnique","FailCriteria.findUniqueOrThrow","FailCriteria.findFirst","FailCriteria.findFirstOrThrow","FailCriteria.findMany","FailCriteria.createOne","FailCriteria.createMany","FailCriteria.createManyAndReturn","FailCriteria.updateOne","FailCriteria.updateMany","FailCriteria.updateManyAndReturn","FailCriteria.upsertOne","FailCriteria.deleteOne","FailCriteria.deleteMany","FailCriteria.groupBy","FailCriteria.aggregate","AND","OR","NOT","id","overallPercentage","subjectPercentage","minFailedSubjects","configurationId","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","grade","minMarks","maxMarks","GradeStatus","status","name","isActive","every","some","none","configurationId_grade","content","RegulationType","type","deletedAt","schoolName","schoolPhone","schoolEmail","schoolWebsite","schoolAddress","country","instituteLogo","schoolLogoPublicId","schoolLogoName","schoolLogoType","isDeleted","subjectName","classId","isdeleted","userId","studentId","fullName","fullNameBangla","dateOfBirth","birthRegistrationNumber","Religion","religion","admissionTotalFees","admissionDate","Gender","gender","BloodGroup","bloodGroup","previousInstituteName","endingClass","result","testimonialNumber","studentSign","studentSignPublicId","studentsignName","studentSignType","authoritySign","authoritySignPublicId","authoritySignName","authoritySignType","guardianSign","guardianSignPublicId","guardianSignName","guardianSignType","picture","picturePublicId","pictureName","pictureType","whatsappNumber","fatherName","fatherNameBangla","fatherMobileNumber","fatherOccupation","motherName","motherNameBangla","motherMobileNumber","motherOccupation","nameOfLocalGuardian","relationShipOfStudent","GuardianMobileNumber","current","employeeId","permanentAddressVillage","permanentAddressPostOffice","permanentAddressPostCode","permanentAddressDistrict","presentAddressVillage","presentAddressPostOffice","presentAddressPostCode","presentAddressDistrict","monthlyTuitionFee","classTeacher","phone","nid","emergencyContact","monthlySalary","experience","experiencePublicId","experienceName","experienceType","employeeSign","employeeSignPublicId","employeeSignName","employeeSignType","UserRole","employeeRole","dateOfJoining","email","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","role","UserStatus","needPasswordChange","emailVerified","image","is","isNot","connectOrCreate","upsert","disconnect","delete","connect","createMany","set","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "_wabAZACFAQAAKcEACAFAACoBAAgCQAAigQAIAoAAKoEACAPAACpBAAgqwIAAKUEADCsAgAAKgAQrQIAAKUEADCuAgEAAAABswJAANQDACG0AkAA1AMAIcQCAACmBLoDIsUCAQDfAwAhzgJAAPADACHZAiAA4AMAIaYDAQAAAAG4AwAAlwSkAyK6AyAA4AMAIbsDIADgAwAhvAMBAPYDACEBAAAAAQAgDAMAAJgEACCrAgAAtAQAMKwCAAADABCtAgAAtAQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAId0CAQDfAwAhqwNAANQDACG1AwEA3wMAIbYDAQD2AwAhtwMBAPYDACEDAwAA4wUAILYDAADkBAAgtwMAAOQEACAMAwAAmAQAIKsCAAC0BAAwrAIAAAMAEK0CAAC0BAAwrgIBAAAAAbMCQADUAwAhtAJAANQDACHdAgEA3wMAIasDQADUAwAhtQMBAAAAAbYDAQD2AwAhtwMBAPYDACEDAAAAAwAgAQAABAAwAgAABQAgEQMAAJgEACCrAgAAswQAMKwCAAAHABCtAgAAswQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAId0CAQDfAwAhrAMBAN8DACGtAwEA3wMAIa4DAQD2AwAhrwMBAPYDACGwAwEA9gMAIbEDQADwAwAhsgNAAPADACGzAwEA9gMAIbQDAQD2AwAhCAMAAOMFACCuAwAA5AQAIK8DAADkBAAgsAMAAOQEACCxAwAA5AQAILIDAADkBAAgswMAAOQEACC0AwAA5AQAIBEDAACYBAAgqwIAALMEADCsAgAABwAQrQIAALMEADCuAgEAAAABswJAANQDACG0AkAA1AMAId0CAQDfAwAhrAMBAN8DACGtAwEA3wMAIa4DAQD2AwAhrwMBAPYDACGwAwEA9gMAIbEDQADwAwAhsgNAAPADACGzAwEA9gMAIbQDAQD2AwAhAwAAAAcAIAEAAAgAMAIAAAkAICkDAACYBAAgBgAAmQQAIA4AAJoEACCrAgAAkwQAMKwCAAALABCtAgAAkwQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIc4CQADwAwAh3AIgAOADACHdAgEA3wMAId8CAQDfAwAh5AIAAJYE5AIi6AIAAJQE6AIi6gIAAJUE6gIi8wIBAN8DACH0AgEA3wMAIfUCAQD2AwAh9gIBAPYDACH7AgEA9gMAIfwCAQD2AwAh_QIBAPYDACH-AgEA9gMAIYADAQDfAwAhhAMBAN8DACGMAwEA3wMAIZcDAQDfAwAhmAMBAN8DACGZAwEA9gMAIZoDCADSAwAhmwMBAPYDACGcAwEA9gMAIZ0DAQD2AwAhngMBAPYDACGfAwEA3wMAIaADAQDfAwAhoQMBAPYDACGiAwEA9gMAIaQDAACXBKQDIqUDAQDfAwAhAQAAAAsAIBQHAACJBAAgCQAAigQAIKsCAACIBAAwrAIAAA0AEK0CAACIBAAwrgIBAN8DACGzAkAA1AMAIbQCQADUAwAhzgJAAPADACHZAiAA4AMAId4CAQD2AwAhjAMBAPYDACGNAwEA9gMAIY4DAQD2AwAhjwMBAPYDACGQAwEA9gMAIZEDAQD2AwAhkgMBAPYDACGTAwEA9gMAIZQDAQD2AwAhAQAAAA0AICwDAACYBAAgBgAAmQQAIAgAALIEACALAACvBAAgqwIAALAEADCsAgAADwAQrQIAALAEADCuAgEA3wMAIbMCQADUAwAhtAJAANQDACHOAkAA8AMAIdsCAQDfAwAh3AIgAOADACHdAgEA3wMAId4CAQDfAwAh3wIBAN8DACHgAgEA3wMAIeECAQDfAwAh4gIBAN8DACHkAgAAlgTkAiLlAgIA0wMAIeYCAQDfAwAh6AIAAJQE6AIi6gIAALEE6gIj6wIBAPYDACHsAgEA9gMAIe0CAQD2AwAh7gIBAPYDACHvAgEA3wMAIfACAQDfAwAh8QIBAN8DACHyAgEA3wMAIfMCAQDfAwAh9AIBAN8DACH1AgEA9gMAIfYCAQD2AwAh9wIBAN8DACH4AgEA9gMAIfkCAQD2AwAh-gIBAPYDACH7AgEA3wMAIfwCAQD2AwAh_QIBAPYDACH-AgEA9gMAIQEAAAAPACABAAAADQAgFgcAAIQEACCrAgAAgwQAMKwCAAASABCtAgAAgwQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIc4CQADwAwAh3AIgAOADACHeAgEA3wMAIf8CAQDfAwAhgAMBAN8DACGBAwEA3wMAIYIDAQDfAwAhgwMBAN8DACGEAwEA3wMAIYUDAQDfAwAhhgMBAN8DACGHAwEA3wMAIYgDAQDfAwAhiQMBAN8DACGKAwEA3wMAIQEAAAASACASAwAA4wUAIAYAAOQFACAIAAC3BgAgCwAAtgYAIM4CAADkBAAg6gIAAOQEACDrAgAA5AQAIOwCAADkBAAg7QIAAOQEACDuAgAA5AQAIPUCAADkBAAg9gIAAOQEACD4AgAA5AQAIPkCAADkBAAg-gIAAOQEACD8AgAA5AQAIP0CAADkBAAg_gIAAOQEACAsAwAAmAQAIAYAAJkEACAIAACyBAAgCwAArwQAIKsCAACwBAAwrAIAAA8AEK0CAACwBAAwrgIBAAAAAbMCQADUAwAhtAJAANQDACHOAkAA8AMAIdsCAQDfAwAh3AIgAOADACHdAgEA3wMAId4CAQAAAAHfAgEA3wMAIeACAQDfAwAh4QIBAN8DACHiAgEAAAAB5AIAAJYE5AIi5QICANMDACHmAgEA3wMAIegCAACUBOgCIuoCAACxBOoCI-sCAQD2AwAh7AIBAPYDACHtAgEA9gMAIe4CAQD2AwAh7wIBAN8DACHwAgEA3wMAIfECAQDfAwAh8gIBAN8DACHzAgEA3wMAIfQCAQDfAwAh9QIBAPYDACH2AgEA9gMAIfcCAQDfAwAh-AIBAPYDACH5AgEA9gMAIfoCAQD2AwAh-wIBAN8DACH8AgEA9gMAIf0CAQD2AwAh_gIBAPYDACEDAAAADwAgAQAAFAAwAgAAFQAgDAsAAK8EACCrAgAArgQAMKwCAAAXABCtAgAArgQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIcICAgDTAwAhzgJAAPADACHaAgEA3wMAIdsCAQDfAwAh3AIgAOADACECCwAAtgYAIM4CAADkBAAgDAsAAK8EACCrAgAArgQAMKwCAAAXABCtAgAArgQAMK4CAQAAAAGzAkAA1AMAIbQCQADUAwAhwgICANMDACHOAkAA8AMAIdoCAQDfAwAh2wIBAN8DACHcAiAA4AMAIQMAAAAXACABAAAYADACAAAZACABAAAADwAgAQAAABcAIAEAAAALACAOCQAArAQAIAoAAKoEACAMAACtBAAgqwIAAKsEADCsAgAAHgAQrQIAAKsEADCuAgEA3wMAIbMCQADUAwAhtAJAANQDACHFAgEA3wMAIc4CQADwAwAh2QIgAOADACGVAwgA0gMAIZYDAQDfAwAhBAkAAKEFACAKAAC0BgAgDAAAtQYAIM4CAADkBAAgDgkAAKwEACAKAACqBAAgDAAArQQAIKsCAACrBAAwrAIAAB4AEK0CAACrBAAwrgIBAAAAAbMCQADUAwAhtAJAANQDACHFAgEA3wMAIc4CQADwAwAh2QIgAOADACGVAwgA0gMAIZYDAQDfAwAhAwAAAB4AIAEAAB8AMAIAACAAIAEAAAAeACAOAwAAmAQAIKsCAACcBAAwrAIAACMAEK0CAACcBAAwrgIBAN8DACGzAkAA1AMAIbQCQADUAwAhxQIBAN8DACHOAkAA8AMAIdkCIADgAwAh3QIBAN8DACGmAwEA3wMAIacDAQD2AwAhqAMBAPYDACEBAAAAIwAgAwAAAA8AIAEAABQAMAIAABUAIAEAAAADACABAAAABwAgAQAAAA8AIAEAAAABACAUBAAApwQAIAUAAKgEACAJAACKBAAgCgAAqgQAIA8AAKkEACCrAgAApQQAMKwCAAAqABCtAgAApQQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIcQCAACmBLoDIsUCAQDfAwAhzgJAAPADACHZAiAA4AMAIaYDAQDfAwAhuAMAAJcEpAMiugMgAOADACG7AyAA4AMAIbwDAQD2AwAhBwQAALEGACAFAACyBgAgCQAAoQUAIAoAALQGACAPAACzBgAgzgIAAOQEACC8AwAA5AQAIAMAAAAqACABAAArADACAAABACADAAAAKgAgAQAAKwAwAgAAAQAgAwAAACoAIAEAACsAMAIAAAEAIBEEAACsBgAgBQAArQYAIAkAAK4GACAKAACwBgAgDwAArwYAIK4CAQAAAAGzAkAAAAABtAJAAAAAAcQCAAAAugMCxQIBAAAAAc4CQAAAAAHZAiAAAAABpgMBAAAAAbgDAAAApAMCugMgAAAAAbsDIAAAAAG8AwEAAAABARUAAC8AIAyuAgEAAAABswJAAAAAAbQCQAAAAAHEAgAAALoDAsUCAQAAAAHOAkAAAAAB2QIgAAAAAaYDAQAAAAG4AwAAAKQDAroDIAAAAAG7AyAAAAABvAMBAAAAAQEVAAAxADABFQAAMQAwEQQAAPwFACAFAAD9BQAgCQAA_gUAIAoAAIAGACAPAAD_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_QIBAPYDACH-AgEA9gMAIYADAQDfAwAhhAMBAN8DACGMAwEAAAABlwMBAN8DACGYAwEA3wMAIZkDAQD2AwAhmgMIANIDACGbAwEA9gMAIZwDAQD2AwAhnQMBAPYDACGeAwEA9gMAIZ8DAQDfAwAhoAMBAN8DACGhAwEA9gMAIaIDAQD2AwAhpAMAAJcEpAMipQMBAN8DACEBAAAAnQEAIAEAAACdAQAgEQMAAOMFACAGAADkBQAgDgAA5QUAIM4CAADkBAAg9QIAAOQEACD2AgAA5AQAIPsCAADkBAAg_AIAAOQEACD9AgAA5AQAIP4CAADkBAAgmQMAAOQEACCbAwAA5AQAIJwDAADkBAAgnQMAAOQEACCeAwAA5AQAIKEDAADkBAAgogMAAOQEACADAAAACwAgAQAAoAEAMAIAAJ0BACADAAAACwAgAQAAoAEAMAIAAJ0BACADAAAACwAgAQAAoAEAMAIAAJ0BACAmAwAA4AUAIAYAAOEFACAOAADiBQAgrgIBAAAAAbMCQAAAAAG0AkAAAAABzgJAAAAAAdwCIAAAAAHdAgEAAAAB3wIBAAAAAeQCAAAA5AIC6AIAAADoAgLqAgAAAOoCAvMCAQAAAAH0AgEAAAAB9QIBAAAAAfYCAQAAAAH7AgEAAAAB_AIBAAAAAf0CAQAAAAH-AgEAAAABgAMBAAAAAYQDAQAAAAGMAwEAAAABlwMBAAAAAZgDAQAAAAGZAwEAAAABmgMIAAAAAZsDAQAAAAGcAwEAAAABnQMBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAaEDAQAAAAGiAwEAAAABpAMAAACkAwKlAwEAAAABARUAAKQBACAjrgIBAAAAAbMCQAAAAAG0AkAAAAABzgJAAAAAAdwCIAAAAAHdAgEAAAAB3wIBAAAAAeQCAAAA5AIC6AIAAADoAgLqAgAAAOoCAvMCAQAAAAH0AgEAAAAB9QIBAAAAAfYCAQAAAAH7AgEAAAAB_AIBAAAAAf0CAQAAAAH-AgEAAAABgAMBAAAAAYQDAQAAAAGMAwEAAAABlwMBAAAAAZgDAQAAAAGZAwEAAAABmgMIAAAAAZsDAQAAAAGcAwEAAAABnQMBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAaEDAQAAAAGiAwEAAAABpAMAAACkAwKlAwEAAAABARUAAKYBADABFQAApgEAMCYDAADMBQAgBgAAzQUAIA4AAM4FACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdwCIADMBAAh3QIBALoEACHfAgEAugQAIeQCAAD6BOQCIugCAAD7BOgCIuoCAADKBeoCIvMCAQC6BAAh9AIBALoEACH1AgEA7QQAIfYCAQDtBAAh-wIBAO0EACH8AgEA7QQAIf0CAQDtBAAh_gIBAO0EACGAAwEAugQAIYQDAQC6BAAhjAMBALoEACGXAwEAugQAIZgDAQC6BAAhmQMBAO0EACGaAwgAuwQAIZsDAQDtBAAhnAMBAO0EACGdAwEA7QQAIZ4DAQDtBAAhnwMBALoEACGgAwEAugQAIaEDAQDtBAAhogMBAO0EACGkAwAAywWkAyKlAwEAugQAIQIAAACdAQAgFQAAqQEAICOuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdwCIADMBAAh3QIBALoEACHfAgEAugQAIeQCAAD6BOQCIugCAAD7BOgCIuoCAADKBeoCIvMCAQC6BAAh9AIBALoEACH1AgEA7QQAIfYCAQDtBAAh-wIBAO0EACH8AgEA7QQAIf0CAQDtBAAh_gIBAO0EACGAAwEAugQAIYQDAQC6BAAhjAMBALoEACGXAwEAugQAIZgDAQC6BAAhmQMBAO0EACGaAwgAuwQAIZsDAQDtBAAhnAMBAO0EACGdAwEA7QQAIZ4DAQDtBAAhnwMBALoEACGgAwEAugQAIaEDAQDtBAAhogMBAO0EACGkAwAAywWkAyKlAwEAugQAIQIAAAALACAVAACrAQAgAgAAAAsAIBUAAKsBACADAAAAnQEAIBwAAKQBACAdAACpAQAgAQAAAJ0BACABAAAACwAgEw0AAMUFACAiAADIBQAgIwAAxwUAIHQAAMYFACB1AADJBQAgzgIAAOQEACD1AgAA5AQAIPYCAADkBAAg-wIAAOQEACD8AgAA5AQAIP0CAADkBAAg_gIAAOQEACCZAwAA5AQAIJsDAADkBAAgnAMAAOQEACCdAwAA5AQAIJ4DAADkBAAgoQMAAOQEACCiAwAA5AQAICarAgAAjAQAMKwCAACyAQAQrQIAAIwEADCuAgEAxQMAIbMCQADIAwAhtAJAAMgDACHOAkAA6AMAIdwCIADbAwAh3QIBAMUDACHfAgEAxQMAIeQCAAD5A-QCIugCAAD6A-gCIuoCAACNBOoCIvMCAQDFAwAh9AIBAMUDACH1AgEA8gMAIfYCAQDyAwAh-wIBAPIDACH8AgEA8gMAIf0CAQDyAwAh_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_QEAIAMAAADqAQAgAQAA6wEAMAIAAOcBACAWBwAAhAQAIKsCAACDBAAwrAIAABIAEK0CAACDBAAwrgIBAAAAAbMCQADUAwAhtAJAANQDACHOAkAA8AMAIdwCIADgAwAh3gIBAAAAAf8CAQDfAwAhgAMBAN8DACGBAwEA3wMAIYIDAQDfAwAhgwMBAN8DACGEAwEA3wMAIYUDAQDfAwAhhgMBAN8DACGHAwEA3wMAIYgDAQDfAwAhiQMBAN8DACGKAwEA3wMAIQEAAACAAgAgAQAAAIACACACBwAAlgUAIM4CAADkBAAgAwAAABIAIAEAAIMCADACAACAAgAgAwAAABIAIAEAAIMCADACAACAAgAgAwAAABIAIAEAAIMCADACAACAAgAgEwcAAJUFACCuAgEAAAABswJAAAAAAbQCQAAAAAHOAkAAAAAB3AIgAAAAAd4CAQAAAAH_AgEAAAABgAMBAAAAAYEDAQAAAAGCAwEAAAABgwMBAAAAAYQDAQAAAAGFAwEAAAABhgMBAAAAAYcDAQAAAAGIAwEAAAABiQMBAAAAAYoDAQAAAAEBFQAAhwIAIBKuAgEAAAABswJAAAAAAbQCQAAAAAHOAkAAAAAB3AIgAAAAAd4CAQAAAAH_AgEAAAABgAMBAAAAAYEDAQAAAAGCAwEAAAABgwMBAAAAAYQDAQAAAAGFAwEAAAABhgMBAAAAAYcDAQAAAAGIAwEAAAABiQMBAAAAAYoDAQAAAAEBFQAAiQIAMAEVAACJAgAwEwcAAJQFACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdwCIADMBAAh3gIBALoEACH_AgEAugQAIYADAQC6BAAhgQMBALoEACGCAwEAugQAIYMDAQC6BAAhhAMBALoEACGFAwEAugQAIYYDAQC6BAAhhwMBALoEACGIAwEAugQAIYkDAQC6BAAhigMBALoEACECAAAAgAIAIBUAAIwCACASrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHcAiAAzAQAId4CAQC6BAAh_wIBALoEACGAAwEAugQAIYEDAQC6BAAhggMBALoEACGDAwEAugQAIYQDAQC6BAAhhQMBALoEACGGAwEAugQAIYcDAQC6BAAhiAMBALoEACGJAwEAugQAIYoDAQC6BAAhAgAAABIAIBUAAI4CACACAAAAEgAgFQAAjgIAIAMAAACAAgAgHAAAhwIAIB0AAIwCACABAAAAgAIAIAEAAAASACAEDQAAkQUAICIAAJMFACAjAACSBQAgzgIAAOQEACAVqwIAAIIEADCsAgAAlQIAEK0CAACCBAAwrgIBAMUDACGzAkAAyAMAIbQCQADIAwAhzgJAAOgDACHcAiAA2wMAId4CAQDFAwAh_wIBAMUDACGAAwEAxQMAIYEDAQDFAwAhggMBAMUDACGDAwEAxQMAIYQDAQDFAwAhhQMBAMUDACGGAwEAxQMAIYcDAQDFAwAhiAMBAMUDACGJAwEAxQMAIYoDAQDFAwAhAwAAABIAIAEAAJQCADAhAACVAgAgAwAAABIAIAEAAIMCADACAACAAgAgAQAAABUAIAEAAAAVACADAAAADwAgAQAAFAAwAgAAFQAgAwAAAA8AIAEAABQAMAIAABUAIAMAAAAPACABAAAUADACAAAVACApAwAAkAUAIAYAAI0FACAIAACOBQAgCwAAjwUAIK4CAQAAAAGzAkAAAAABtAJAAAAAAc4CQAAAAAHbAgEAAAAB3AIgAAAAAd0CAQAAAAHeAgEAAAAB3wIBAAAAAeACAQAAAAHhAgEAAAAB4gIBAAAAAeQCAAAA5AIC5QICAAAAAeYCAQAAAAHoAgAAAOgCAuoCAAAA6gID6wIBAAAAAewCAQAAAAHtAgEAAAAB7gIBAAAAAe8CAQAAAAHwAgEAAAAB8QIBAAAAAfICAQAAAAHzAgEAAAAB9AIBAAAAAfUCAQAAAAH2AgEAAAAB9wIBAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH8AgEAAAAB_QIBAAAAAf4CAQAAAAEBFQAAnQIAICWuAgEAAAABswJAAAAAAbQCQAAAAAHOAkAAAAAB2wIBAAAAAdwCIAAAAAHdAgEAAAAB3gIBAAAAAd8CAQAAAAHgAgEAAAAB4QIBAAAAAeICAQAAAAHkAgAAAOQCAuUCAgAAAAHmAgEAAAAB6AIAAADoAgLqAgAAAOoCA-sCAQAAAAHsAgEAAAAB7QIBAAAAAe4CAQAAAAHvAgEAAAAB8AIBAAAAAfECAQAAAAHyAgEAAAAB8wIBAAAAAfQCAQAAAAH1AgEAAAAB9gIBAAAAAfcCAQAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_AIBAAAAAf0CAQAAAAH-AgEAAAABARUAAJ8CADABFQAAnwIAMCkDAACABQAgBgAA_QQAIAgAAP4EACALAAD_BAAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHbAgEAugQAIdwCIADMBAAh3QIBALoEACHeAgEAugQAId8CAQC6BAAh4AIBALoEACHhAgEAugQAIeICAQC6BAAh5AIAAPoE5AIi5QICALwEACHmAgEAugQAIegCAAD7BOgCIuoCAAD8BOoCI-sCAQDtBAAh7AIBAO0EACHtAgEA7QQAIe4CAQDtBAAh7wIBALoEACHwAgEAugQAIfECAQC6BAAh8gIBALoEACHzAgEAugQAIfQCAQC6BAAh9QIBAO0EACH2AgEA7QQAIfcCAQC6BAAh-AIBAO0EACH5AgEA7QQAIfoCAQDtBAAh-wIBALoEACH8AgEA7QQAIf0CAQDtBAAh_gIBAO0EACECAAAAFQAgFQAAogIAICWuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdsCAQC6BAAh3AIgAMwEACHdAgEAugQAId4CAQC6BAAh3wIBALoEACHgAgEAugQAIeECAQC6BAAh4gIBALoEACHkAgAA-gTkAiLlAgIAvAQAIeYCAQC6BAAh6AIAAPsE6AIi6gIAAPwE6gIj6wIBAO0EACHsAgEA7QQAIe0CAQDtBAAh7gIBAO0EACHvAgEAugQAIfACAQC6BAAh8QIBALoEACHyAgEAugQAIfMCAQC6BAAh9AIBALoEACH1AgEA7QQAIfYCAQDtBAAh9wIBALoEACH4AgEA7QQAIfkCAQDtBAAh-gIBAO0EACH7AgEAugQAIfwCAQDtBAAh_QIBAO0EACH-AgEA7QQAIQIAAAAPACAVAACkAgAgAgAAAA8AIBUAAKQCACADAAAAFQAgHAAAnQIAIB0AAKICACABAAAAFQAgAQAAAA8AIBMNAAD1BAAgIgAA-AQAICMAAPcEACB0AAD2BAAgdQAA-QQAIM4CAADkBAAg6gIAAOQEACDrAgAA5AQAIOwCAADkBAAg7QIAAOQEACDuAgAA5AQAIPUCAADkBAAg9gIAAOQEACD4AgAA5AQAIPkCAADkBAAg-gIAAOQEACD8AgAA5AQAIP0CAADkBAAg_gIAAOQEACAoqwIAAPgDADCsAgAAqwIAEK0CAAD4AwAwrgIBAMUDACGzAkAAyAMAIbQCQADIAwAhzgJAAOgDACHbAgEAxQMAIdwCIADbAwAh3QIBAMUDACHeAgEAxQMAId8CAQDFAwAh4AIBAMUDACHhAgEAxQMAIeICAQDFAwAh5AIAAPkD5AIi5QICAMcDACHmAgEAxQMAIegCAAD6A-gCIuoCAAD7A-oCI-sCAQDyAwAh7AIBAPIDACHtAgEA8gMAIe4CAQDyAwAh7wIBAMUDACHwAgEAxQMAIfECAQDFAwAh8gIBAMUDACHzAgEAxQMAIfQCAQDFAwAh9QIBAPIDACH2AgEA8gMAIfcCAQDFAwAh-AIBAPIDACH5AgEA8gMAIfoCAQDyAwAh-wIBAMUDACH8AgEA8gMAIf0CAQDyAwAh_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-QIAMAIAAPoCACAL-AEAANUDACCrAgAA0QMAMKwCAAD8AgAQrQIAANEDADCuAgEA3wMAIa8CCADSAwAhsAIIANIDACGxAgIA0wMAIbICAQDfAwAhswJAANQDACG0AkAA1AMAIQEAAAD8AgAgAQAAAPgCACABAAAA9gIAIAr5AQAA4QMAIPoBAADiAwAgqwIAAN4DADCsAgAAgAMAEK0CAADeAwAwrgIBAN8DACGzAkAA1AMAIbQCQADUAwAhxQIBAN8DACHGAiAA4AMAIQL5AQAA4gQAIPoBAADjBAAgAwAAAIADACABAACBAwAwAgAA9gIAIAMAAACAAwAgAQAAgQMAMAIAAPYCACADAAAAgAMAIAEAAIEDADACAAD2AgAgB_kBAADgBAAg-gEAAOEEACCuAgEAAAABswJAAAAAAbQCQAAAAAHFAgEAAAABxgIgAAAAAQEVAACFAwAgBa4CAQAAAAGzAkAAAAABtAJAAAAAAcUCAQAAAAHGAiAAAAABARUAAIcDADABFQAAhwMAMAf5AQAAzQQAIPoBAADOBAAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxQIBALoEACHGAiAAzAQAIQIAAAD2AgAgFQAAigMAIAWuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHFAgEAugQAIcYCIADMBAAhAgAAAIADACAVAACMAwAgAgAAAIADACAVAACMAwAgAwAAAPYCACAcAACFAwAgHQAAigMAIAEAAAD2AgAgAQAAAIADACADDQAAyQQAICIAAMsEACAjAADKBAAgCKsCAADaAwAwrAIAAJMDABCtAgAA2gMAMK4CAQDFAwAhswJAAMgDACG0AkAAyAMAIcUCAQDFAwAhxgIgANsDACEDAAAAgAMAIAEAAJIDADAhAACTAwAgAwAAAIADACABAACBAwAwAgAA9gIAIAEAAAD6AgAgAQAAAPoCACADAAAA-AIAIAEAAPkCADACAAD6AgAgAwAAAPgCACABAAD5AgAwAgAA-gIAIAMAAAD4AgAgAQAA-QIAMAIAAPoCACAJ-AEAAMgEACCuAgEAAAABsgIBAAAAAbMCQAAAAAG0AkAAAAABwAIBAAAAAcECAgAAAAHCAgIAAAABxAIAAADEAgIBFQAAmwMAIAiuAgEAAAABsgIBAAAAAbMCQAAAAAG0AkAAAAABwAIBAAAAAcECAgAAAAHCAgIAAAABxAIAAADEAgIBFQAAnQMAMAEVAACdAwAwCfgBAADHBAAgrgIBALoEACGyAgEAugQAIbMCQAC9BAAhtAJAAL0EACHAAgEAugQAIcECAgC8BAAhwgICALwEACHEAgAAxgTEAiICAAAA-gIAIBUAAKADACAIrgIBALoEACGyAgEAugQAIbMCQAC9BAAhtAJAAL0EACHAAgEAugQAIcECAgC8BAAhwgICALwEACHEAgAAxgTEAiICAAAA-AIAIBUAAKIDACACAAAA-AIAIBUAAKIDACADAAAA-gIAIBwAAJsDACAdAACgAwAgAQAAAPoCACABAAAA-AIAIAUNAADBBAAgIgAAxAQAICMAAMMEACB0AADCBAAgdQAAxQQAIAurAgAA1gMAMKwCAACpAwAQrQIAANYDADCuAgEAxQMAIbICAQDFAwAhswJAAMgDACG0AkAAyAMAIcACAQDFAwAhwQICAMcDACHCAgIAxwMAIcQCAADXA8QCIgMAAAD4AgAgAQAAqAMAMCEAAKkDACADAAAA-AIAIAEAAPkCADACAAD6AgAgC_gBAADVAwAgqwIAANEDADCsAgAA_AIAEK0CAADRAwAwrgIBAAAAAa8CCADSAwAhsAIIANIDACGxAgIA0wMAIbICAQAAAAGzAkAA1AMAIbQCQADUAwAhAQAAAKwDACABAAAArAMAIAH4AQAAwAQAIAMAAAD8AgAgAQAArwMAMAIAAKwDACADAAAA_AIAIAEAAK8DADACAACsAwAgAwAAAPwCACABAACvAwAwAgAArAMAIAj4AQAAvwQAIK4CAQAAAAGvAggAAAABsAIIAAAAAbECAgAAAAGyAgEAAAABswJAAAAAAbQCQAAAAAEBFQAAswMAIAeuAgEAAAABrwIIAAAAAbACCAAAAAGxAgIAAAABsgIBAAAAAbMCQAAAAAG0AkAAAAABARUAALUDADABFQAAtQMAMAj4AQAAvgQAIK4CAQC6BAAhrwIIALsEACGwAggAuwQAIbECAgC8BAAhsgIBALoEACGzAkAAvQQAIbQCQAC9BAAhAgAAAKwDACAVAAC4AwAgB64CAQC6BAAhrwIIALsEACGwAggAuwQAIbECAgC8BAAhsgIBALoEACGzAkAAvQQAIbQCQAC9BAAhAgAAAPwCACAVAAC6AwAgAgAAAPwCACAVAAC6AwAgAwAAAKwDACAcAACzAwAgHQAAuAMAIAEAAACsAwAgAQAAAPwCACAFDQAAtQQAICIAALgEACAjAAC3BAAgdAAAtgQAIHUAALkEACAKqwIAAMQDADCsAgAAwQMAEK0CAADEAwAwrgIBAMUDACGvAggAxgMAIbACCADGAwAhsQICAMcDACGyAgEAxQMAIbMCQADIAwAhtAJAAMgDACEDAAAA_AIAIAEAAMADADAhAADBAwAgAwAAAPwCACABAACvAwAwAgAArAMAIAqrAgAAxAMAMKwCAADBAwAQrQIAAMQDADCuAgEAxQMAIa8CCADGAwAhsAIIAMYDACGxAgIAxwMAIbICAQDFAwAhswJAAMgDACG0AkAAyAMAIQ4NAADKAwAgIgAA0AMAICMAANADACC1AgEAAAABtgIBAAAABLcCAQAAAAS4AgEAAAABuQIBAAAAAboCAQAAAAG7AgEAAAABvAIBAM8DACG9AgEAAAABvgIBAAAAAb8CAQAAAAENDQAAygMAICIAAM0DACAjAADNAwAgdAAAzQMAIHUAAM0DACC1AggAAAABtgIIAAAABLcCCAAAAAS4AggAAAABuQIIAAAAAboCCAAAAAG7AggAAAABvAIIAM4DACENDQAAygMAICIAAMoDACAjAADKAwAgdAAAzQMAIHUAAMoDACC1AgIAAAABtgICAAAABLcCAgAAAAS4AgIAAAABuQICAAAAAboCAgAAAAG7AgIAAAABvAICAMwDACELDQAAygMAICIAAMsDACAjAADLAwAgtQJAAAAAAbYCQAAAAAS3AkAAAAAEuAJAAAAAAbkCQAAAAAG6AkAAAAABuwJAAAAAAbwCQADJAwAhCw0AAMoDACAiAADLAwAgIwAAywMAILUCQAAAAAG2AkAAAAAEtwJAAAAABLgCQAAAAAG5AkAAAAABugJAAAAAAbsCQAAAAAG8AkAAyQMAIQi1AgIAAAABtgICAAAABLcCAgAAAAS4AgIAAAABuQICAAAAAboCAgAAAAG7AgIAAAABvAICAMoDACEItQJAAAAAAbYCQAAAAAS3AkAAAAAEuAJAAAAAAbkCQAAAAAG6AkAAAAABuwJAAAAAAbwCQADLAwAhDQ0AAMoDACAiAADKAwAgIwAAygMAIHQAAM0DACB1AADKAwAgtQICAAAAAbYCAgAAAAS3AgIAAAAEuAICAAAAAbkCAgAAAAG6AgIAAAABuwICAAAAAbwCAgDMAwAhCLUCCAAAAAG2AggAAAAEtwIIAAAABLgCCAAAAAG5AggAAAABugIIAAAAAbsCCAAAAAG8AggAzQMAIQ0NAADKAwAgIgAAzQMAICMAAM0DACB0AADNAwAgdQAAzQMAILUCCAAAAAG2AggAAAAEtwIIAAAABLgCCAAAAAG5AggAAAABugIIAAAAAbsCCAAAAAG8AggAzgMAIQ4NAADKAwAgIgAA0AMAICMAANADACC1AgEAAAABtgIBAAAABLcCAQAAAAS4AgEAAAABuQIBAAAAAboCAQAAAAG7AgEAAAABvAIBAM8DACG9AgEAAAABvgIBAAAAAb8CAQAAAAELtQIBAAAAAbYCAQAAAAS3AgEAAAAEuAIBAAAAAbkCAQAAAAG6AgEAAAABuwIBAAAAAbwCAQDQAwAhvQIBAAAAAb4CAQAAAAG_AgEAAAABC_gBAADVAwAgqwIAANEDADCsAgAA_AIAEK0CAADRAwAwrgIBAN8DACGvAggA0gMAIbACCADSAwAhsQICANMDACGyAgEA3wMAIbMCQADUAwAhtAJAANQDACEItQIIAAAAAbYCCAAAAAS3AggAAAAEuAIIAAAAAbkCCAAAAAG6AggAAAABuwIIAAAAAbwCCADNAwAhCLUCAgAAAAG2AgIAAAAEtwICAAAABLgCAgAAAAG5AgIAAAABugICAAAAAbsCAgAAAAG8AgIAygMAIQi1AkAAAAABtgJAAAAABLcCQAAAAAS4AkAAAAABuQJAAAAAAboCQAAAAAG7AkAAAAABvAJAAMsDACEM-QEAAOEDACD6AQAA4gMAIKsCAADeAwAwrAIAAIADABCtAgAA3gMAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIcUCAQDfAwAhxgIgAOADACG9AwAAgAMAIL4DAACAAwAgC6sCAADWAwAwrAIAAKkDABCtAgAA1gMAMK4CAQDFAwAhsgIBAMUDACGzAkAAyAMAIbQCQADIAwAhwAIBAMUDACHBAgIAxwMAIcICAgDHAwAhxAIAANcDxAIiBw0AAMoDACAiAADZAwAgIwAA2QMAILUCAAAAxAICtgIAAADEAgi3AgAAAMQCCLwCAADYA8QCIgcNAADKAwAgIgAA2QMAICMAANkDACC1AgAAAMQCArYCAAAAxAIItwIAAADEAgi8AgAA2APEAiIEtQIAAADEAgK2AgAAAMQCCLcCAAAAxAIIvAIAANkDxAIiCKsCAADaAwAwrAIAAJMDABCtAgAA2gMAMK4CAQDFAwAhswJAAMgDACG0AkAAyAMAIcUCAQDFAwAhxgIgANsDACEFDQAAygMAICIAAN0DACAjAADdAwAgtQIgAAAAAbwCIADcAwAhBQ0AAMoDACAiAADdAwAgIwAA3QMAILUCIAAAAAG8AiAA3AMAIQK1AiAAAAABvAIgAN0DACEK-QEAAOEDACD6AQAA4gMAIKsCAADeAwAwrAIAAIADABCtAgAA3gMAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIcUCAQDfAwAhxgIgAOADACELtQIBAAAAAbYCAQAAAAS3AgEAAAAEuAIBAAAAAbkCAQAAAAG6AgEAAAABuwIBAAAAAbwCAQDQAwAhvQIBAAAAAb4CAQAAAAG_AgEAAAABArUCIAAAAAG8AiAA3QMAIQPHAgAA-AIAIMgCAAD4AgAgyQIAAPgCACAN-AEAANUDACCrAgAA0QMAMKwCAAD8AgAQrQIAANEDADCuAgEA3wMAIa8CCADSAwAhsAIIANIDACGxAgIA0wMAIbICAQDfAwAhswJAANQDACG0AkAA1AMAIb0DAAD8AgAgvgMAAPwCACACsgIBAAAAAcACAQAAAAEM-AEAANUDACCrAgAA5AMAMKwCAAD4AgAQrQIAAOQDADCuAgEA3wMAIbICAQDfAwAhswJAANQDACG0AkAA1AMAIcACAQDfAwAhwQICANMDACHCAgIA0wMAIcQCAADlA8QCIgS1AgAAAMQCArYCAAAAxAIItwIAAADEAgi8AgAA2QPEAiIJqwIAAOYDADCsAgAA8wIAEK0CAADmAwAwrgIBAMUDACGzAkAAyAMAIbQCQADIAwAhywIBAMUDACHNAgAA5wPNAiLOAkAA6AMAIQcNAADKAwAgIgAA7QMAICMAAO0DACC1AgAAAM0CArYCAAAAzQIItwIAAADNAgi8AgAA7APNAiILDQAA6gMAICIAAOsDACAjAADrAwAgtQJAAAAAAbYCQAAAAAW3AkAAAAAFuAJAAAAAAbkCQAAAAAG6AkAAAAABuwJAAAAAAbwCQADpAwAhCw0AAOoDACAiAADrAwAgIwAA6wMAILUCQAAAAAG2AkAAAAAFtwJAAAAABbgCQAAAAAG5AkAAAAABugJAAAAAAbsCQAAAAAG8AkAA6QMAIQi1AgIAAAABtgICAAAABbcCAgAAAAW4AgIAAAABuQICAAAAAboCAgAAAAG7AgIAAAABvAICAOoDACEItQJAAAAAAbYCQAAAAAW3AkAAAAAFuAJAAAAAAbkCQAAAAAG6AkAAAAABuwJAAAAAAbwCQADrAwAhBw0AAMoDACAiAADtAwAgIwAA7QMAILUCAAAAzQICtgIAAADNAgi3AgAAAM0CCLwCAADsA80CIgS1AgAAAM0CArYCAAAAzQIItwIAAADNAgi8AgAA7QPNAiIJqwIAAO4DADCsAgAA4AIAEK0CAADuAwAwrgIBAN8DACGzAkAA1AMAIbQCQADUAwAhywIBAN8DACHNAgAA7wPNAiLOAkAA8AMAIQS1AgAAAM0CArYCAAAAzQIItwIAAADNAgi8AgAA7QPNAiIItQJAAAAAAbYCQAAAAAW3AkAAAAAFuAJAAAAAAbkCQAAAAAG6AkAAAAABuwJAAAAAAbwCQADrAwAhEqsCAADxAwAwrAIAANoCABCtAgAA8QMAMK4CAQDFAwAhswJAAMgDACG0AkAAyAMAIc4CQADoAwAhzwIBAMUDACHQAgEAxQMAIdECAQDFAwAh0gIBAPIDACHTAgEAxQMAIdQCAQDFAwAh1QIBAPIDACHWAgEA8gMAIdcCAQDyAwAh2AIBAPIDACHZAiAA2wMAIQ4NAADqAwAgIgAA9AMAICMAAPQDACC1AgEAAAABtgIBAAAABbcCAQAAAAW4AgEAAAABuQIBAAAAAboCAQAAAAG7AgEAAAABvAIBAPMDACG9AgEAAAABvgIBAAAAAb8CAQAAAAEODQAA6gMAICIAAPQDACAjAAD0AwAgtQIBAAAAAbYCAQAAAAW3AgEAAAAFuAIBAAAAAbkCAQAAAAG6AgEAAAABuwIBAAAAAbwCAQDzAwAhvQIBAAAAAb4CAQAAAAG_AgEAAAABC7UCAQAAAAG2AgEAAAAFtwIBAAAABbgCAQAAAAG5AgEAAAABugIBAAAAAbsCAQAAAAG8AgEA9AMAIb0CAQAAAAG-AgEAAAABvwIBAAAAARKrAgAA9QMAMKwCAADHAgAQrQIAAPUDADCuAgEA3wMAIbMCQADUAwAhtAJAANQDACHOAkAA8AMAIc8CAQDfAwAh0AIBAN8DACHRAgEA3wMAIdICAQD2AwAh0wIBAN8DACHUAgEA3wMAIdUCAQD2AwAh1gIBAPYDACHXAgEA9gMAIdgCAQD2AwAh2QIgAOADACELtQIBAAAAAbYCAQAAAAW3AgEAAAAFuAIBAAAAAbkCAQAAAAG6AgEAAAABuwIBAAAAAbwCAQD0AwAhvQIBAAAAAb4CAQAAAAG_AgEAAAABC6sCAAD3AwAwrAIAAMECABCtAgAA9wMAMK4CAQDFAwAhswJAAMgDACG0AkAAyAMAIcICAgDHAwAhzgJAAOgDACHaAgEAxQMAIdsCAQDFAwAh3AIgANsDACEoqwIAAPgDADCsAgAAqwIAEK0CAAD4AwAwrgIBAMUDACGzAkAAyAMAIbQCQADIAwAhzgJAAOgDACHbAgEAxQMAIdwCIADbAwAh3QIBAMUDACHeAgEAxQMAId8CAQDFAwAh4AIBAMUDACHhAgEAxQMAIeICAQDFAwAh5AIAAPkD5AIi5QICAMcDACHmAgEAxQMAIegCAAD6A-gCIuoCAAD7A-oCI-sCAQDyAwAh7AIBAPIDACHtAgEA8gMAIe4CAQDyAwAh7wIBAMUDACHwAgEAxQMAIfECAQDFAwAh8gIBAMUDACHzAgEAxQMAIfQCAQDFAwAh9QIBAPIDACH2AgEA8gMAIfcCAQDFAwAh-AIBAPIDACH5AgEA8gMAIfoCAQDyAwAh-wIBAMUDACH8AgEA8gMAIf0CAQDyAwAh_gIBAPIDACEHDQAAygMAICIAAIEEACAjAACBBAAgtQIAAADkAgK2AgAAAOQCCLcCAAAA5AIIvAIAAIAE5AIiBw0AAMoDACAiAAD_AwAgIwAA_wMAILUCAAAA6AICtgIAAADoAgi3AgAAAOgCCLwCAAD-A-gCIgcNAADqAwAgIgAA_QMAICMAAP0DACC1AgAAAOoCA7YCAAAA6gIJtwIAAADqAgm8AgAA_APqAiMHDQAA6gMAICIAAP0DACAjAAD9AwAgtQIAAADqAgO2AgAAAOoCCbcCAAAA6gIJvAIAAPwD6gIjBLUCAAAA6gIDtgIAAADqAgm3AgAAAOoCCbwCAAD9A-oCIwcNAADKAwAgIgAA_wMAICMAAP8DACC1AgAAAOgCArYCAAAA6AIItwIAAADoAgi8AgAA_gPoAiIEtQIAAADoAgK2AgAAAOgCCLcCAAAA6AIIvAIAAP8D6AIiBw0AAMoDACAiAACBBAAgIwAAgQQAILUCAAAA5AICtgIAAADkAgi3AgAAAOQCCLwCAACABOQCIgS1AgAAAOQCArYCAAAA5AIItwIAAADkAgi8AgAAgQTkAiIVqwIAAIIEADCsAgAAlQIAEK0CAACCBAAwrgIBAMUDACGzAkAAyAMAIbQCQADIAwAhzgJAAOgDACHcAiAA2wMAId4CAQDFAwAh_wIBAMUDACGAAwEAxQMAIYEDAQDFAwAhggMBAMUDACGDAwEAxQMAIYQDAQDFAwAhhQMBAMUDACGGAwEAxQMAIYcDAQDFAwAhiAMBAMUDACGJAwEAxQMAIYoDAQDFAwAhFgcAAIQEACCrAgAAgwQAMKwCAAASABCtAgAAgwQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIc4CQADwAwAh3AIgAOADACHeAgEA3wMAIf8CAQDfAwAhgAMBAN8DACGBAwEA3wMAIYIDAQDfAwAhgwMBAN8DACGEAwEA3wMAIYUDAQDfAwAhhgMBAN8DACGHAwEA3wMAIYgDAQDfAwAhiQMBAN8DACGKAwEA3wMAIS4DAACYBAAgBgAAmQQAIAgAALIEACALAACvBAAgqwIAALAEADCsAgAADwAQrQIAALAEADCuAgEA3wMAIbMCQADUAwAhtAJAANQDACHOAkAA8AMAIdsCAQDfAwAh3AIgAOADACHdAgEA3wMAId4CAQDfAwAh3wIBAN8DACHgAgEA3wMAIeECAQDfAwAh4gIBAN8DACHkAgAAlgTkAiLlAgIA0wMAIeYCAQDfAwAh6AIAAJQE6AIi6gIAALEE6gIj6wIBAPYDACHsAgEA9gMAIe0CAQD2AwAh7gIBAPYDACHvAgEA3wMAIfACAQDfAwAh8QIBAN8DACHyAgEA3wMAIfMCAQDfAwAh9AIBAN8DACH1AgEA9gMAIfYCAQD2AwAh9wIBAN8DACH4AgEA9gMAIfkCAQD2AwAh-gIBAPYDACH7AgEA3wMAIfwCAQD2AwAh_QIBAPYDACH-AgEA9gMAIb0DAAAPACC-AwAADwAgBasCAACFBAAwrAIAAP0BABCtAgAAhQQAMK4CAQDFAwAhiwMCAMcDACEFqwIAAIYEADCsAgAA6gEAEK0CAACGBAAwrgIBAN8DACGLAwIA0wMAIRKrAgAAhwQAMKwCAADkAQAQrQIAAIcEADCuAgEAxQMAIbMCQADIAwAhtAJAAMgDACHOAkAA6AMAIdkCIADbAwAh3gIBAPIDACGMAwEA8gMAIY0DAQDyAwAhjgMBAPIDACGPAwEA8gMAIZADAQDyAwAhkQMBAPIDACGSAwEA8gMAIZMDAQDyAwAhlAMBAPIDACEUBwAAiQQAIAkAAIoEACCrAgAAiAQAMKwCAAANABCtAgAAiAQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIc4CQADwAwAh2QIgAOADACHeAgEA9gMAIYwDAQD2AwAhjQMBAPYDACGOAwEA9gMAIY8DAQD2AwAhkAMBAPYDACGRAwEA9gMAIZIDAQD2AwAhkwMBAPYDACGUAwEA9gMAIS4DAACYBAAgBgAAmQQAIAgAALIEACALAACvBAAgqwIAALAEADCsAgAADwAQrQIAALAEADCuAgEA3wMAIbMCQADUAwAhtAJAANQDACHOAkAA8AMAIdsCAQDfAwAh3AIgAOADACHdAgEA3wMAId4CAQDfAwAh3wIBAN8DACHgAgEA3wMAIeECAQDfAwAh4gIBAN8DACHkAgAAlgTkAiLlAgIA0wMAIeYCAQDfAwAh6AIAAJQE6AIi6gIAALEE6gIj6wIBAPYDACHsAgEA9gMAIe0CAQD2AwAh7gIBAPYDACHvAgEA3wMAIfACAQDfAwAh8QIBAN8DACHyAgEA3wMAIfMCAQDfAwAh9AIBAN8DACH1AgEA9gMAIfYCAQD2AwAh9wIBAN8DACH4AgEA9gMAIfkCAQD2AwAh-gIBAPYDACH7AgEA3wMAIfwCAQD2AwAh_QIBAPYDACH-AgEA9gMAIb0DAAAPACC-AwAADwAgKwMAAJgEACAGAACZBAAgDgAAmgQAIKsCAACTBAAwrAIAAAsAEK0CAACTBAAwrgIBAN8DACGzAkAA1AMAIbQCQADUAwAhzgJAAPADACHcAiAA4AMAId0CAQDfAwAh3wIBAN8DACHkAgAAlgTkAiLoAgAAlAToAiLqAgAAlQTqAiLzAgEA3wMAIfQCAQDfAwAh9QIBAPYDACH2AgEA9gMAIfsCAQD2AwAh_AIBAPYDACH9AgEA9gMAIf4CAQD2AwAhgAMBAN8DACGEAwEA3wMAIYwDAQDfAwAhlwMBAN8DACGYAwEA3wMAIZkDAQD2AwAhmgMIANIDACGbAwEA9gMAIZwDAQD2AwAhnQMBAPYDACGeAwEA9gMAIZ8DAQDfAwAhoAMBAN8DACGhAwEA9gMAIaIDAQD2AwAhpAMAAJcEpAMipQMBAN8DACG9AwAACwAgvgMAAAsAIAurAgAAiwQAMKwCAADIAQAQrQIAAIsEADCuAgEAxQMAIbMCQADIAwAhtAJAAMgDACHFAgEAxQMAIc4CQADoAwAh2QIgANsDACGVAwgAxgMAIZYDAQDFAwAhJqsCAACMBAAwrAIAALIBABCtAgAAjAQAMK4CAQDFAwAhswJAAMgDACG0AkAAyAMAIc4CQADoAwAh3AIgANsDACHdAgEAxQMAId8CAQDFAwAh5AIAAPkD5AIi6AIAAPoD6AIi6gIAAI0E6gIi8wIBAMUDACH0AgEAxQMAIfUCAQDyAwAh9gIBAPIDACH7AgEA8gMAIfwCAQDyAwAh_QIBAPIDACH-AgEA8gMAIYADAQDFAwAhhAMBAMUDACGMAwEAxQMAIZcDAQDFAwAhmAMBAMUDACGZAwEA8gMAIZoDCADGAwAhmwMBAPIDACGcAwEA8gMAIZ0DAQDyAwAhngMBAPIDACGfAwEAxQMAIaADAQDFAwAhoQMBAPIDACGiAwEA8gMAIaQDAACOBKQDIqUDAQDFAwAhBw0AAMoDACAiAACSBAAgIwAAkgQAILUCAAAA6gICtgIAAADqAgi3AgAAAOoCCLwCAACRBOoCIgcNAADKAwAgIgAAkAQAICMAAJAEACC1AgAAAKQDArYCAAAApAMItwIAAACkAwi8AgAAjwSkAyIHDQAAygMAICIAAJAEACAjAACQBAAgtQIAAACkAwK2AgAAAKQDCLcCAAAApAMIvAIAAI8EpAMiBLUCAAAApAMCtgIAAACkAwi3AgAAAKQDCLwCAACQBKQDIgcNAADKAwAgIgAAkgQAICMAAJIEACC1AgAAAOoCArYCAAAA6gIItwIAAADqAgi8AgAAkQTqAiIEtQIAAADqAgK2AgAAAOoCCLcCAAAA6gIIvAIAAJIE6gIiKQMAAJgEACAGAACZBAAgDgAAmgQAIKsCAACTBAAwrAIAAAsAEK0CAACTBAAwrgIBAN8DACGzAkAA1AMAIbQCQADUAwAhzgJAAPADACHcAiAA4AMAId0CAQDfAwAh3wIBAN8DACHkAgAAlgTkAiLoAgAAlAToAiLqAgAAlQTqAiLzAgEA3wMAIfQCAQDfAwAh9QIBAPYDACH2AgEA9gMAIfsCAQD2AwAh_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_QIBAPYDACH-AgEA9gMAIYADAQDfAwAhhAMBAN8DACGMAwEA3wMAIZcDAQDfAwAhmAMBAN8DACGZAwEA9gMAIZoDCADSAwAhmwMBAPYDACGcAwEA9gMAIZ0DAQD2AwAhngMBAPYDACGfAwEA3wMAIaADAQDfAwAhoQMBAPYDACGiAwEA9gMAIaQDAACXBKQDIqUDAQDfAwAhvQMAAAsAIL4DAAALACADxwIAABcAIMgCAAAXACDJAgAAFwAgDAsAAK8EACCrAgAArgQAMKwCAAAXABCtAgAArgQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIcICAgDTAwAhzgJAAPADACHaAgEA3wMAIdsCAQDfAwAh3AIgAOADACEQCQAArAQAIAoAAKoEACAMAACtBAAgqwIAAKsEADCsAgAAHgAQrQIAAKsEADCuAgEA3wMAIbMCQADUAwAhtAJAANQDACHFAgEA3wMAIc4CQADwAwAh2QIgAOADACGVAwgA0gMAIZYDAQDfAwAhvQMAAB4AIL4DAAAeACAsAwAAmAQAIAYAAJkEACAIAACyBAAgCwAArwQAIKsCAACwBAAwrAIAAA8AEK0CAACwBAAwrgIBAN8DACGzAkAA1AMAIbQCQADUAwAhzgJAAPADACHbAgEA3wMAIdwCIADgAwAh3QIBAN8DACHeAgEA3wMAId8CAQDfAwAh4AIBAN8DACHhAgEA3wMAIeICAQDfAwAh5AIAAJYE5AIi5QICANMDACHmAgEA3wMAIegCAACUBOgCIuoCAACxBOoCI-sCAQD2AwAh7AIBAPYDACHtAgEA9gMAIe4CAQD2AwAh7wIBAN8DACHwAgEA3wMAIfECAQDfAwAh8gIBAN8DACHzAgEA3wMAIfQCAQDfAwAh9QIBAPYDACH2AgEA9gMAIfcCAQDfAwAh-AIBAPYDACH5AgEA9gMAIfoCAQD2AwAh-wIBAN8DACH8AgEA9gMAIf0CAQD2AwAh_gIBAPYDACEEtQIAAADqAgO2AgAAAOoCCbcCAAAA6gIJvAIAAP0D6gIjGAcAAIQEACCrAgAAgwQAMKwCAAASABCtAgAAgwQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIc4CQADwAwAh3AIgAOADACHeAgEA3wMAIf8CAQDfAwAhgAMBAN8DACGBAwEA3wMAIYIDAQDfAwAhgwMBAN8DACGEAwEA3wMAIYUDAQDfAwAhhgMBAN8DACGHAwEA3wMAIYgDAQDfAwAhiQMBAN8DACGKAwEA3wMAIb0DAAASACC-AwAAEgAgEQMAAJgEACCrAgAAswQAMKwCAAAHABCtAgAAswQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAId0CAQDfAwAhrAMBAN8DACGtAwEA3wMAIa4DAQD2AwAhrwMBAPYDACGwAwEA9gMAIbEDQADwAwAhsgNAAPADACGzAwEA9gMAIbQDAQD2AwAhDAMAAJgEACCrAgAAtAQAMKwCAAADABCtAgAAtAQAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAId0CAQDfAwAhqwNAANQDACG1AwEA3wMAIbYDAQD2AwAhtwMBAPYDACEAAAAAAAHFAwEAAAABBcUDCAAAAAHIAwgAAAAByQMIAAAAAcoDCAAAAAHLAwgAAAABBcUDAgAAAAHIAwIAAAAByQMCAAAAAcoDAgAAAAHLAwIAAAABAcUDQAAAAAEFHAAA-wYAIB0AAP4GACC_AwAA_AYAIMADAAD9BgAgwwMAAPYCACADHAAA-wYAIL8DAAD8BgAgwwMAAPYCACAC-QEAAOIEACD6AQAA4wQAIAAAAAAAAcUDAAAAxAICBRwAAPYGACAdAAD5BgAgvwMAAPcGACDAAwAA-AYAIMMDAAD2AgAgAxwAAPYGACC_AwAA9wYAIMMDAAD2AgAgAAAAAcUDIAAAAAELHAAA1AQAMB0AANkEADC_AwAA1QQAMMADAADWBAAwwQMAANgEADDCAwAA2AQAMMMDAADYBAAwxAMAANcEACDFAwAA2AQAMMYDAADaBAAwxwMAANsEADAHHAAAzwQAIB0AANIEACC_AwAA0AQAIMADAADRBAAgwQMAAPwCACDCAwAA_AIAIMMDAACsAwAgBq4CAQAAAAGvAggAAAABsAIIAAAAAbECAgAAAAGzAkAAAAABtAJAAAAAAQIAAACsAwAgHAAAzwQAIAMAAAD8AgAgHAAAzwQAIB0AANMEACAIAAAA_AIAIBUAANMEACCuAgEAugQAIa8CCAC7BAAhsAIIALsEACGxAgIAvAQAIbMCQAC9BAAhtAJAAL0EACEGrgIBALoEACGvAggAuwQAIbACCAC7BAAhsQICALwEACGzAkAAvQQAIbQCQAC9BAAhB64CAQAAAAGzAkAAAAABtAJAAAAAAcACAQAAAAHBAgIAAAABwgICAAAAAcQCAAAAxAICAgAAAPoCACAcAADfBAAgAwAAAPoCACAcAADfBAAgHQAA3gQAIAEVAAD1BgAwDfgBAADVAwAgqwIAAOQDADCsAgAA-AIAEK0CAADkAwAwrgIBAAAAAbICAQDfAwAhswJAANQDACG0AkAA1AMAIcACAQDfAwAhwQICANMDACHCAgIA0wMAIcQCAADlA8QCIsoCAADjAwAgAgAAAPoCACAVAADeBAAgAgAAANwEACAVAADdBAAgC6sCAADbBAAwrAIAANwEABCtAgAA2wQAMK4CAQDfAwAhsgIBAN8DACGzAkAA1AMAIbQCQADUAwAhwAIBAN8DACHBAgIA0wMAIcICAgDTAwAhxAIAAOUDxAIiC6sCAADbBAAwrAIAANwEABCtAgAA2wQAMK4CAQDfAwAhsgIBAN8DACGzAkAA1AMAIbQCQADUAwAhwAIBAN8DACHBAgIA0wMAIcICAgDTAwAhxAIAAOUDxAIiB64CAQC6BAAhswJAAL0EACG0AkAAvQQAIcACAQC6BAAhwQICALwEACHCAgIAvAQAIcQCAADGBMQCIgeuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHAAgEAugQAIcECAgC8BAAhwgICALwEACHEAgAAxgTEAiIHrgIBAAAAAbMCQAAAAAG0AkAAAAABwAIBAAAAAcECAgAAAAHCAgIAAAABxAIAAADEAgIEHAAA1AQAML8DAADVBAAwwwMAANgEADDEAwAA1wQAIAMcAADPBAAgvwMAANAEACDDAwAArAMAIAAB-AEAAMAEACAAAAAAAcUDAAAAzQICAcUDQAAAAAEAAAABxQMBAAAAAQAAAAAABRwAAPAGACAdAADzBgAgvwMAAPEGACDAAwAA8gYAIMMDAAAgACADHAAA8AYAIL8DAADxBgAgwwMAACAAIAAAAAAAAcUDAAAA5AICAcUDAAAA6AICAcUDAAAA6gIDBxwAAIYFACAdAACJBQAgvwMAAIcFACDAAwAAiAUAIMEDAAANACDCAwAADQAgwwMAAMsBACAHHAAAgQUAIB0AAIQFACC_AwAAggUAIMADAACDBQAgwQMAABIAIMIDAAASACDDAwAAgAIAIAUcAADjBgAgHQAA7gYAIL8DAADkBgAgwAMAAO0GACDDAwAAIAAgBRwAAOEGACAdAADrBgAgvwMAAOIGACDAAwAA6gYAIMMDAAABACARrgIBAAAAAbMCQAAAAAG0AkAAAAABzgJAAAAAAdwCIAAAAAH_AgEAAAABgAMBAAAAAYEDAQAAAAGCAwEAAAABgwMBAAAAAYQDAQAAAAGFAwEAAAABhgMBAAAAAYcDAQAAAAGIAwEAAAABiQMBAAAAAYoDAQAAAAECAAAAgAIAIBwAAIEFACADAAAAEgAgHAAAgQUAIB0AAIUFACATAAAAEgAgFQAAhQUAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIc4CQADpBAAh3AIgAMwEACH_AgEAugQAIYADAQC6BAAhgQMBALoEACGCAwEAugQAIYMDAQC6BAAhhAMBALoEACGFAwEAugQAIYYDAQC6BAAhhwMBALoEACGIAwEAugQAIYkDAQC6BAAhigMBALoEACERrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHcAiAAzAQAIf8CAQC6BAAhgAMBALoEACGBAwEAugQAIYIDAQC6BAAhgwMBALoEACGEAwEAugQAIYUDAQC6BAAhhgMBALoEACGHAwEAugQAIYgDAQC6BAAhiQMBALoEACGKAwEAugQAIQ8JAACMBQAgrgIBAAAAAbMCQAAAAAG0AkAAAAABzgJAAAAAAdkCIAAAAAGMAwEAAAABjQMBAAAAAY4DAQAAAAGPAwEAAAABkAMBAAAAAZEDAQAAAAGSAwEAAAABkwMBAAAAAZQDAQAAAAECAAAAywEAIBwAAIYFACADAAAADQAgHAAAhgUAIB0AAIoFACARAAAADQAgCQAAiwUAIBUAAIoFACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdkCIADMBAAhjAMBAO0EACGNAwEA7QQAIY4DAQDtBAAhjwMBAO0EACGQAwEA7QQAIZEDAQDtBAAhkgMBAO0EACGTAwEA7QQAIZQDAQDtBAAhDwkAAIsFACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdkCIADMBAAhjAMBAO0EACGNAwEA7QQAIY4DAQDtBAAhjwMBAO0EACGQAwEA7QQAIZEDAQDtBAAhkgMBAO0EACGTAwEA7QQAIZQDAQDtBAAhBxwAAOUGACAdAADoBgAgvwMAAOYGACDAAwAA5wYAIMEDAAALACDCAwAACwAgwwMAAJ0BACADHAAA5QYAIL8DAADmBgAgwwMAAJ0BACADHAAAhgUAIL8DAACHBQAgwwMAAMsBACADHAAAgQUAIL8DAACCBQAgwwMAAIACACADHAAA4wYAIL8DAADkBgAgwwMAACAAIAMcAADhBgAgvwMAAOIGACDDAwAAAQAgAAAABRwAANwGACAdAADfBgAgvwMAAN0GACDAAwAA3gYAIMMDAAAVACADHAAA3AYAIL8DAADdBgAgwwMAABUAIBIDAADjBQAgBgAA5AUAIAgAALcGACALAAC2BgAgzgIAAOQEACDqAgAA5AQAIOsCAADkBAAg7AIAAOQEACDtAgAA5AQAIO4CAADkBAAg9QIAAOQEACD2AgAA5AQAIPgCAADkBAAg-QIAAOQEACD6AgAA5AQAIPwCAADkBAAg_QIAAOQEACD-AgAA5AQAIAAAAAAAAAAABxwAANcGACAdAADaBgAgvwMAANgGACDAAwAA2QYAIMEDAAAPACDCAwAADwAgwwMAABUAIAMcAADXBgAgvwMAANgGACDDAwAAFQAgEQMAAOMFACAGAADkBQAgDgAA5QUAIM4CAADkBAAg9QIAAOQEACD2AgAA5AQAIPsCAADkBAAg_AIAAOQEACD9AgAA5AQAIP4CAADkBAAgmQMAAOQEACCbAwAA5AQAIJwDAADkBAAgnQMAAOQEACCeAwAA5AQAIKEDAADkBAAgogMAAOQEACAAAAAAAAUcAADQBgAgHQAA1QYAIL8DAADRBgAgwAMAANQGACDDAwAAnQEAIAscAAC2BQAwHQAAuwUAML8DAAC3BQAwwAMAALgFADDBAwAAugUAMMIDAAC6BQAwwwMAALoFADDEAwAAuQUAIMUDAAC6BQAwxgMAALwFADDHAwAAvQUAMAscAACqBQAwHQAArwUAML8DAACrBQAwwAMAAKwFADDBAwAArgUAMMIDAACuBQAwwwMAAK4FADDEAwAArQUAIMUDAACuBQAwxgMAALAFADDHAwAAsQUAMAeuAgEAAAABswJAAAAAAbQCQAAAAAHCAgIAAAABzgJAAAAAAdoCAQAAAAHcAiAAAAABAgAAABkAIBwAALUFACADAAAAGQAgHAAAtQUAIB0AALQFACABFQAA0wYAMAwLAACvBAAgqwIAAK4EADCsAgAAFwAQrQIAAK4EADCuAgEAAAABswJAANQDACG0AkAA1AMAIcICAgDTAwAhzgJAAPADACHaAgEA3wMAIdsCAQDfAwAh3AIgAOADACECAAAAGQAgFQAAtAUAIAIAAACyBQAgFQAAswUAIAurAgAAsQUAMKwCAACyBQAQrQIAALEFADCuAgEA3wMAIbMCQADUAwAhtAJAANQDACHCAgIA0wMAIc4CQADwAwAh2gIBAN8DACHbAgEA3wMAIdwCIADgAwAhC6sCAACxBQAwrAIAALIFABCtAgAAsQUAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIcICAgDTAwAhzgJAAPADACHaAgEA3wMAIdsCAQDfAwAh3AIgAOADACEHrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhwgICALwEACHOAkAA6QQAIdoCAQC6BAAh3AIgAMwEACEHrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhwgICALwEACHOAkAA6QQAIdoCAQC6BAAh3AIgAMwEACEHrgIBAAAAAbMCQAAAAAG0AkAAAAABwgICAAAAAc4CQAAAAAHaAgEAAAAB3AIgAAAAAScDAACQBQAgBgAAjQUAIAgAAI4FACCuAgEAAAABswJAAAAAAbQCQAAAAAHOAkAAAAAB3AIgAAAAAd0CAQAAAAHeAgEAAAAB3wIBAAAAAeACAQAAAAHhAgEAAAAB4gIBAAAAAeQCAAAA5AIC5QICAAAAAeYCAQAAAAHoAgAAAOgCAuoCAAAA6gID6wIBAAAAAewCAQAAAAHtAgEAAAAB7gIBAAAAAe8CAQAAAAHwAgEAAAAB8QIBAAAAAfICAQAAAAHzAgEAAAAB9AIBAAAAAfUCAQAAAAH2AgEAAAAB9wIBAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH8AgEAAAAB_QIBAAAAAf4CAQAAAAECAAAAFQAgHAAAwQUAIAMAAAAVACAcAADBBQAgHQAAwAUAIAEVAADSBgAwLAMAAJgEACAGAACZBAAgCAAAsgQAIAsAAK8EACCrAgAAsAQAMKwCAAAPABCtAgAAsAQAMK4CAQAAAAGzAkAA1AMAIbQCQADUAwAhzgJAAPADACHbAgEA3wMAIdwCIADgAwAh3QIBAN8DACHeAgEAAAAB3wIBAN8DACHgAgEA3wMAIeECAQDfAwAh4gIBAAAAAeQCAACWBOQCIuUCAgDTAwAh5gIBAN8DACHoAgAAlAToAiLqAgAAsQTqAiPrAgEA9gMAIewCAQD2AwAh7QIBAPYDACHuAgEA9gMAIe8CAQDfAwAh8AIBAN8DACHxAgEA3wMAIfICAQDfAwAh8wIBAN8DACH0AgEA3wMAIfUCAQD2AwAh9gIBAPYDACH3AgEA3wMAIfgCAQD2AwAh-QIBAPYDACH6AgEA9gMAIfsCAQDfAwAh_AIBAPYDACH9AgEA9gMAIf4CAQD2AwAhAgAAABUAIBUAAMAFACACAAAAvgUAIBUAAL8FACAoqwIAAL0FADCsAgAAvgUAEK0CAAC9BQAwrgIBAN8DACGzAkAA1AMAIbQCQADUAwAhzgJAAPADACHbAgEA3wMAIdwCIADgAwAh3QIBAN8DACHeAgEA3wMAId8CAQDfAwAh4AIBAN8DACHhAgEA3wMAIeICAQDfAwAh5AIAAJYE5AIi5QICANMDACHmAgEA3wMAIegCAACUBOgCIuoCAACxBOoCI-sCAQD2AwAh7AIBAPYDACHtAgEA9gMAIe4CAQD2AwAh7wIBAN8DACHwAgEA3wMAIfECAQDfAwAh8gIBAN8DACHzAgEA3wMAIfQCAQDfAwAh9QIBAPYDACH2AgEA9gMAIfcCAQDfAwAh-AIBAPYDACH5AgEA9gMAIfoCAQD2AwAh-wIBAN8DACH8AgEA9gMAIf0CAQD2AwAh_gIBAPYDACEoqwIAAL0FADCsAgAAvgUAEK0CAAC9BQAwrgIBAN8DACGzAkAA1AMAIbQCQADUAwAhzgJAAPADACHbAgEA3wMAIdwCIADgAwAh3QIBAN8DACHeAgEA3wMAId8CAQDfAwAh4AIBAN8DACHhAgEA3wMAIeICAQDfAwAh5AIAAJYE5AIi5QICANMDACHmAgEA3wMAIegCAACUBOgCIuoCAACxBOoCI-sCAQD2AwAh7AIBAPYDACHtAgEA9gMAIe4CAQD2AwAh7wIBAN8DACHwAgEA3wMAIfECAQDfAwAh8gIBAN8DACHzAgEA3wMAIfQCAQDfAwAh9QIBAPYDACH2AgEA9gMAIfcCAQDfAwAh-AIBAPYDACH5AgEA9gMAIfoCAQD2AwAh-wIBAN8DACH8AgEA9gMAIf0CAQD2AwAh_gIBAPYDACEkrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHcAiAAzAQAId0CAQC6BAAh3gIBALoEACHfAgEAugQAIeACAQC6BAAh4QIBALoEACHiAgEAugQAIeQCAAD6BOQCIuUCAgC8BAAh5gIBALoEACHoAgAA-wToAiLqAgAA_ATqAiPrAgEA7QQAIewCAQDtBAAh7QIBAO0EACHuAgEA7QQAIe8CAQC6BAAh8AIBALoEACHxAgEAugQAIfICAQC6BAAh8wIBALoEACH0AgEAugQAIfUCAQDtBAAh9gIBAO0EACH3AgEAugQAIfgCAQDtBAAh-QIBAO0EACH6AgEA7QQAIfsCAQC6BAAh_AIBAO0EACH9AgEA7QQAIf4CAQDtBAAhJwMAAIAFACAGAAD9BAAgCAAA_gQAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIc4CQADpBAAh3AIgAMwEACHdAgEAugQAId4CAQC6BAAh3wIBALoEACHgAgEAugQAIeECAQC6BAAh4gIBALoEACHkAgAA-gTkAiLlAgIAvAQAIeYCAQC6BAAh6AIAAPsE6AIi6gIAAPwE6gIj6wIBAO0EACHsAgEA7QQAIe0CAQDtBAAh7gIBAO0EACHvAgEAugQAIfACAQC6BAAh8QIBALoEACHyAgEAugQAIfMCAQC6BAAh9AIBALoEACH1AgEA7QQAIfYCAQDtBAAh9wIBALoEACH4AgEA7QQAIfkCAQDtBAAh-gIBAO0EACH7AgEAugQAIfwCAQDtBAAh_QIBAO0EACH-AgEA7QQAIScDAACQBQAgBgAAjQUAIAgAAI4FACCuAgEAAAABswJAAAAAAbQCQAAAAAHOAkAAAAAB3AIgAAAAAd0CAQAAAAHeAgEAAAAB3wIBAAAAAeACAQAAAAHhAgEAAAAB4gIBAAAAAeQCAAAA5AIC5QICAAAAAeYCAQAAAAHoAgAAAOgCAuoCAAAA6gID6wIBAAAAAewCAQAAAAHtAgEAAAAB7gIBAAAAAe8CAQAAAAHwAgEAAAAB8QIBAAAAAfICAQAAAAHzAgEAAAAB9AIBAAAAAfUCAQAAAAH2AgEAAAAB9wIBAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH8AgEAAAAB_QIBAAAAAf4CAQAAAAEDHAAA0AYAIL8DAADRBgAgwwMAAJ0BACAEHAAAtgUAML8DAAC3BQAwwwMAALoFADDEAwAAuQUAIAQcAACqBQAwvwMAAKsFADDDAwAArgUAMMQDAACtBQAgAAAAAAABxQMAAADqAgIBxQMAAACkAwIFHAAAygYAIB0AAM4GACC_AwAAywYAIMADAADNBgAgwwMAAAEAIAccAADbBQAgHQAA3gUAIL8DAADcBQAgwAMAAN0FACDBAwAADQAgwgMAAA0AIMMDAADLAQAgCxwAAM8FADAdAADUBQAwvwMAANAFADDAAwAA0QUAMMEDAADTBQAwwgMAANMFADDDAwAA0wUAMMQDAADSBQAgxQMAANMFADDGAwAA1QUAMMcDAADWBQAwCQoAAMMFACAMAADEBQAgrgIBAAAAAbMCQAAAAAG0AkAAAAABxQIBAAAAAc4CQAAAAAHZAiAAAAABlQMIAAAAAQIAAAAgACAcAADaBQAgAwAAACAAIBwAANoFACAdAADZBQAgARUAAMwGADAOCQAArAQAIAoAAKoEACAMAACtBAAgqwIAAKsEADCsAgAAHgAQrQIAAKsEADCuAgEAAAABswJAANQDACG0AkAA1AMAIcUCAQDfAwAhzgJAAPADACHZAiAA4AMAIZUDCADSAwAhlgMBAN8DACECAAAAIAAgFQAA2QUAIAIAAADXBQAgFQAA2AUAIAurAgAA1gUAMKwCAADXBQAQrQIAANYFADCuAgEA3wMAIbMCQADUAwAhtAJAANQDACHFAgEA3wMAIc4CQADwAwAh2QIgAOADACGVAwgA0gMAIZYDAQDfAwAhC6sCAADWBQAwrAIAANcFABCtAgAA1gUAMK4CAQDfAwAhswJAANQDACG0AkAA1AMAIcUCAQDfAwAhzgJAAPADACHZAiAA4AMAIZUDCADSAwAhlgMBAN8DACEHrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxQIBALoEACHOAkAA6QQAIdkCIADMBAAhlQMIALsEACEJCgAAqAUAIAwAAKkFACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHFAgEAugQAIc4CQADpBAAh2QIgAMwEACGVAwgAuwQAIQkKAADDBQAgDAAAxAUAIK4CAQAAAAGzAkAAAAABtAJAAAAAAcUCAQAAAAHOAkAAAAAB2QIgAAAAAZUDCAAAAAEPBwAAoAUAIK4CAQAAAAGzAkAAAAABtAJAAAAAAc4CQAAAAAHZAiAAAAAB3gIBAAAAAY0DAQAAAAGOAwEAAAABjwMBAAAAAZADAQAAAAGRAwEAAAABkgMBAAAAAZMDAQAAAAGUAwEAAAABAgAAAMsBACAcAADbBQAgAwAAAA0AIBwAANsFACAdAADfBQAgEQAAAA0AIAcAAJ8FACAVAADfBQAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHZAiAAzAQAId4CAQDtBAAhjQMBAO0EACGOAwEA7QQAIY8DAQDtBAAhkAMBAO0EACGRAwEA7QQAIZIDAQDtBAAhkwMBAO0EACGUAwEA7QQAIQ8HAACfBQAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHZAiAAzAQAId4CAQDtBAAhjQMBAO0EACGOAwEA7QQAIY8DAQDtBAAhkAMBAO0EACGRAwEA7QQAIZIDAQDtBAAhkwMBAO0EACGUAwEA7QQAIQMcAADKBgAgvwMAAMsGACDDAwAAAQAgAxwAANsFACC_AwAA3AUAIMMDAADLAQAgBBwAAM8FADC_AwAA0AUAMMMDAADTBQAwxAMAANIFACAHBAAAsQYAIAUAALIGACAJAAChBQAgCgAAtAYAIA8AALMGACDOAgAA5AQAILwDAADkBAAgDQcAAJYFACAJAAChBQAgzgIAAOQEACDeAgAA5AQAIIwDAADkBAAgjQMAAOQEACCOAwAA5AQAII8DAADkBAAgkAMAAOQEACCRAwAA5AQAIJIDAADkBAAgkwMAAOQEACCUAwAA5AQAIAAAAAAFHAAAxQYAIB0AAMgGACC_AwAAxgYAIMADAADHBgAgwwMAAAEAIAMcAADFBgAgvwMAAMYGACDDAwAAAQAgAAAAAAAABRwAAMAGACAdAADDBgAgvwMAAMEGACDAAwAAwgYAIMMDAAABACADHAAAwAYAIL8DAADBBgAgwwMAAAEAIAAAAAUcAAC7BgAgHQAAvgYAIL8DAAC8BgAgwAMAAL0GACDDAwAAAQAgAxwAALsGACC_AwAAvAYAIMMDAAABACAAAAABxQMAAAC6AwILHAAAoAYAMB0AAKUGADC_AwAAoQYAMMADAACiBgAwwQMAAKQGADDCAwAApAYAMMMDAACkBgAwxAMAAKMGACDFAwAApAYAMMYDAACmBgAwxwMAAKcGADALHAAAlAYAMB0AAJkGADC_AwAAlQYAMMADAACWBgAwwQMAAJgGADDCAwAAmAYAMMMDAACYBgAwxAMAAJcGACDFAwAAmAYAMMYDAACaBgAwxwMAAJsGADAHHAAAjwYAIB0AAJIGACC_AwAAkAYAIMADAACRBgAgwQMAAAsAIMIDAAALACDDAwAAnQEAIAccAACKBgAgHQAAjQYAIL8DAACLBgAgwAMAAIwGACDBAwAAIwAgwgMAACMAIMMDAACFAQAgCxwAAIEGADAdAACFBgAwvwMAAIIGADDAAwAAgwYAMMEDAAC6BQAwwgMAALoFADDDAwAAugUAMMQDAACEBgAgxQMAALoFADDGAwAAhgYAMMcDAAC9BQAwJwYAAI0FACAIAACOBQAgCwAAjwUAIK4CAQAAAAGzAkAAAAABtAJAAAAAAc4CQAAAAAHbAgEAAAAB3AIgAAAAAd4CAQAAAAHfAgEAAAAB4AIBAAAAAeECAQAAAAHiAgEAAAAB5AIAAADkAgLlAgIAAAAB5gIBAAAAAegCAAAA6AIC6gIAAADqAgPrAgEAAAAB7AIBAAAAAe0CAQAAAAHuAgEAAAAB7wIBAAAAAfACAQAAAAHxAgEAAAAB8gIBAAAAAfMCAQAAAAH0AgEAAAAB9QIBAAAAAfYCAQAAAAH3AgEAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-wIBAAAAAfwCAQAAAAH9AgEAAAAB_gIBAAAAAQIAAAAVACAcAACJBgAgAwAAABUAIBwAAIkGACAdAACIBgAgARUAALoGADACAAAAFQAgFQAAiAYAIAIAAAC-BQAgFQAAhwYAICSuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdsCAQC6BAAh3AIgAMwEACHeAgEAugQAId8CAQC6BAAh4AIBALoEACHhAgEAugQAIeICAQC6BAAh5AIAAPoE5AIi5QICALwEACHmAgEAugQAIegCAAD7BOgCIuoCAAD8BOoCI-sCAQDtBAAh7AIBAO0EACHtAgEA7QQAIe4CAQDtBAAh7wIBALoEACHwAgEAugQAIfECAQC6BAAh8gIBALoEACHzAgEAugQAIfQCAQC6BAAh9QIBAO0EACH2AgEA7QQAIfcCAQC6BAAh-AIBAO0EACH5AgEA7QQAIfoCAQDtBAAh-wIBALoEACH8AgEA7QQAIf0CAQDtBAAh_gIBAO0EACEnBgAA_QQAIAgAAP4EACALAAD_BAAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHbAgEAugQAIdwCIADMBAAh3gIBALoEACHfAgEAugQAIeACAQC6BAAh4QIBALoEACHiAgEAugQAIeQCAAD6BOQCIuUCAgC8BAAh5gIBALoEACHoAgAA-wToAiLqAgAA_ATqAiPrAgEA7QQAIewCAQDtBAAh7QIBAO0EACHuAgEA7QQAIe8CAQC6BAAh8AIBALoEACHxAgEAugQAIfICAQC6BAAh8wIBALoEACH0AgEAugQAIfUCAQDtBAAh9gIBAO0EACH3AgEAugQAIfgCAQDtBAAh-QIBAO0EACH6AgEA7QQAIfsCAQC6BAAh_AIBAO0EACH9AgEA7QQAIf4CAQDtBAAhJwYAAI0FACAIAACOBQAgCwAAjwUAIK4CAQAAAAGzAkAAAAABtAJAAAAAAc4CQAAAAAHbAgEAAAAB3AIgAAAAAd4CAQAAAAHfAgEAAAAB4AIBAAAAAeECAQAAAAHiAgEAAAAB5AIAAADkAgLlAgIAAAAB5gIBAAAAAegCAAAA6AIC6gIAAADqAgPrAgEAAAAB7AIBAAAAAe0CAQAAAAHuAgEAAAAB7wIBAAAAAfACAQAAAAHxAgEAAAAB8gIBAAAAAfMCAQAAAAH0AgEAAAAB9QIBAAAAAfYCAQAAAAH3AgEAAAAB-AIBAAAAAfkCAQAAAAH6AgEAAAAB-wIBAAAAAfwCAQAAAAH9AgEAAAAB_gIBAAAAAQmuAgEAAAABswJAAAAAAbQCQAAAAAHFAgEAAAABzgJAAAAAAdkCIAAAAAGmAwEAAAABpwMBAAAAAagDAQAAAAECAAAAhQEAIBwAAIoGACADAAAAIwAgHAAAigYAIB0AAI4GACALAAAAIwAgFQAAjgYAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIcUCAQC6BAAhzgJAAOkEACHZAiAAzAQAIaYDAQC6BAAhpwMBAO0EACGoAwEA7QQAIQmuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHFAgEAugQAIc4CQADpBAAh2QIgAMwEACGmAwEAugQAIacDAQDtBAAhqAMBAO0EACEkBgAA4QUAIA4AAOIFACCuAgEAAAABswJAAAAAAbQCQAAAAAHOAkAAAAAB3AIgAAAAAd8CAQAAAAHkAgAAAOQCAugCAAAA6AIC6gIAAADqAgLzAgEAAAAB9AIBAAAAAfUCAQAAAAH2AgEAAAAB-wIBAAAAAfwCAQAAAAH9AgEAAAAB_gIBAAAAAYADAQAAAAGEAwEAAAABjAMBAAAAAZcDAQAAAAGYAwEAAAABmQMBAAAAAZoDCAAAAAGbAwEAAAABnAMBAAAAAZ0DAQAAAAGeAwEAAAABnwMBAAAAAaADAQAAAAGhAwEAAAABogMBAAAAAaQDAAAApAMCpQMBAAAAAQIAAACdAQAgHAAAjwYAIAMAAAALACAcAACPBgAgHQAAkwYAICYAAAALACAGAADNBQAgDgAAzgUAIBUAAJMGACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdwCIADMBAAh3wIBALoEACHkAgAA-gTkAiLoAgAA-wToAiLqAgAAygXqAiLzAgEAugQAIfQCAQC6BAAh9QIBAO0EACH2AgEA7QQAIfsCAQDtBAAh_AIBAO0EACH9AgEA7QQAIf4CAQDtBAAhgAMBALoEACGEAwEAugQAIYwDAQC6BAAhlwMBALoEACGYAwEAugQAIZkDAQDtBAAhmgMIALsEACGbAwEA7QQAIZwDAQDtBAAhnQMBAO0EACGeAwEA7QQAIZ8DAQC6BAAhoAMBALoEACGhAwEA7QQAIaIDAQDtBAAhpAMAAMsFpAMipQMBALoEACEkBgAAzQUAIA4AAM4FACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdwCIADMBAAh3wIBALoEACHkAgAA-gTkAiLoAgAA-wToAiLqAgAAygXqAiLzAgEAugQAIfQCAQC6BAAh9QIBAO0EACH2AgEA7QQAIfsCAQDtBAAh_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_AwAAlQYAMMMDAACYBgAwxAMAAJcGACADHAAAjwYAIL8DAACQBgAgwwMAAJ0BACADHAAAigYAIL8DAACLBgAgwwMAAIUBACAEHAAAgQYAML8DAACCBgAwwwMAALoFADDEAwAAhAYAIAAABAMAAOMFACDOAgAA5AQAIKcDAADkBAAgqAMAAOQEACAAAAQJAAChBQAgCgAAtAYAIAwAALUGACDOAgAA5AQAIAIHAACWBQAgzgIAAOQEACAHrgIBAAAAAbMCQAAAAAG0AkAAAAABqwNAAAAAAbUDAQAAAAG2AwEAAAABtwMBAAAAAQyuAgEAAAABswJAAAAAAbQCQAAAAAGsAwEAAAABrQMBAAAAAa4DAQAAAAGvAwEAAAABsAMBAAAAAbEDQAAAAAGyA0AAAAABswMBAAAAAbQDAQAAAAEkrgIBAAAAAbMCQAAAAAG0AkAAAAABzgJAAAAAAdsCAQAAAAHcAiAAAAAB3gIBAAAAAd8CAQAAAAHgAgEAAAAB4QIBAAAAAeICAQAAAAHkAgAAAOQCAuUCAgAAAAHmAgEAAAAB6AIAAADoAgLqAgAAAOoCA-sCAQAAAAHsAgEAAAAB7QIBAAAAAe4CAQAAAAHvAgEAAAAB8AIBAAAAAfECAQAAAAHyAgEAAAAB8wIBAAAAAfQCAQAAAAH1AgEAAAAB9gIBAAAAAfcCAQAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_AIBAAAAAf0CAQAAAAH-AgEAAAABEAUAAK0GACAJAACuBgAgCgAAsAYAIA8AAK8GACCuAgEAAAABswJAAAAAAbQCQAAAAAHEAgAAALoDAsUCAQAAAAHOAkAAAAAB2QIgAAAAAaYDAQAAAAG4AwAAAKQDAroDIAAAAAG7AyAAAAABvAMBAAAAAQIAAAABACAcAAC7BgAgAwAAACoAIBwAALsGACAdAAC_BgAgEgAAACoAIAUAAP0FACAJAAD-BQAgCgAAgAYAIA8AAP8FACAVAAC_BgAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxAIAAPsFugMixQIBALoEACHOAkAA6QQAIdkCIADMBAAhpgMBALoEACG4AwAAywWkAyK6AyAAzAQAIbsDIADMBAAhvAMBAO0EACEQBQAA_QUAIAkAAP4FACAKAACABgAgDwAA_wUAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIcQCAAD7BboDIsUCAQC6BAAhzgJAAOkEACHZAiAAzAQAIaYDAQC6BAAhuAMAAMsFpAMiugMgAMwEACG7AyAAzAQAIbwDAQDtBAAhEAQAAKwGACAJAACuBgAgCgAAsAYAIA8AAK8GACCuAgEAAAABswJAAAAAAbQCQAAAAAHEAgAAALoDAsUCAQAAAAHOAkAAAAAB2QIgAAAAAaYDAQAAAAG4AwAAAKQDAroDIAAAAAG7AyAAAAABvAMBAAAAAQIAAAABACAcAADABgAgAwAAACoAIBwAAMAGACAdAADEBgAgEgAAACoAIAQAAPwFACAJAAD-BQAgCgAAgAYAIA8AAP8FACAVAADEBgAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxAIAAPsFugMixQIBALoEACHOAkAA6QQAIdkCIADMBAAhpgMBALoEACG4AwAAywWkAyK6AyAAzAQAIbsDIADMBAAhvAMBAO0EACEQBAAA_AUAIAkAAP4FACAKAACABgAgDwAA_wUAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIcQCAAD7BboDIsUCAQC6BAAhzgJAAOkEACHZAiAAzAQAIaYDAQC6BAAhuAMAAMsFpAMiugMgAMwEACG7AyAAzAQAIbwDAQDtBAAhEAQAAKwGACAFAACtBgAgCQAArgYAIAoAALAGACCuAgEAAAABswJAAAAAAbQCQAAAAAHEAgAAALoDAsUCAQAAAAHOAkAAAAAB2QIgAAAAAaYDAQAAAAG4AwAAAKQDAroDIAAAAAG7AyAAAAABvAMBAAAAAQIAAAABACAcAADFBgAgAwAAACoAIBwAAMUGACAdAADJBgAgEgAAACoAIAQAAPwFACAFAAD9BQAgCQAA_gUAIAoAAIAGACAVAADJBgAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxAIAAPsFugMixQIBALoEACHOAkAA6QQAIdkCIADMBAAhpgMBALoEACG4AwAAywWkAyK6AyAAzAQAIbsDIADMBAAhvAMBAO0EACEQBAAA_AUAIAUAAP0FACAJAAD-BQAgCgAAgAYAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIcQCAAD7BboDIsUCAQC6BAAhzgJAAOkEACHZAiAAzAQAIaYDAQC6BAAhuAMAAMsFpAMiugMgAMwEACG7AyAAzAQAIbwDAQDtBAAhEAQAAKwGACAFAACtBgAgCgAAsAYAIA8AAK8GACCuAgEAAAABswJAAAAAAbQCQAAAAAHEAgAAALoDAsUCAQAAAAHOAkAAAAAB2QIgAAAAAaYDAQAAAAG4AwAAAKQDAroDIAAAAAG7AyAAAAABvAMBAAAAAQIAAAABACAcAADKBgAgB64CAQAAAAGzAkAAAAABtAJAAAAAAcUCAQAAAAHOAkAAAAAB2QIgAAAAAZUDCAAAAAEDAAAAKgAgHAAAygYAIB0AAM8GACASAAAAKgAgBAAA_AUAIAUAAP0FACAKAACABgAgDwAA_wUAIBUAAM8GACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHEAgAA-wW6AyLFAgEAugQAIc4CQADpBAAh2QIgAMwEACGmAwEAugQAIbgDAADLBaQDIroDIADMBAAhuwMgAMwEACG8AwEA7QQAIRAEAAD8BQAgBQAA_QUAIAoAAIAGACAPAAD_BQAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxAIAAPsFugMixQIBALoEACHOAkAA6QQAIdkCIADMBAAhpgMBALoEACG4AwAAywWkAyK6AyAAzAQAIbsDIADMBAAhvAMBAO0EACElAwAA4AUAIAYAAOEFACCuAgEAAAABswJAAAAAAbQCQAAAAAHOAkAAAAAB3AIgAAAAAd0CAQAAAAHfAgEAAAAB5AIAAADkAgLoAgAAAOgCAuoCAAAA6gIC8wIBAAAAAfQCAQAAAAH1AgEAAAAB9gIBAAAAAfsCAQAAAAH8AgEAAAAB_QIBAAAAAf4CAQAAAAGAAwEAAAABhAMBAAAAAYwDAQAAAAGXAwEAAAABmAMBAAAAAZkDAQAAAAGaAwgAAAABmwMBAAAAAZwDAQAAAAGdAwEAAAABngMBAAAAAZ8DAQAAAAGgAwEAAAABoQMBAAAAAaIDAQAAAAGkAwAAAKQDAqUDAQAAAAECAAAAnQEAIBwAANAGACAkrgIBAAAAAbMCQAAAAAG0AkAAAAABzgJAAAAAAdwCIAAAAAHdAgEAAAAB3gIBAAAAAd8CAQAAAAHgAgEAAAAB4QIBAAAAAeICAQAAAAHkAgAAAOQCAuUCAgAAAAHmAgEAAAAB6AIAAADoAgLqAgAAAOoCA-sCAQAAAAHsAgEAAAAB7QIBAAAAAe4CAQAAAAHvAgEAAAAB8AIBAAAAAfECAQAAAAHyAgEAAAAB8wIBAAAAAfQCAQAAAAH1AgEAAAAB9gIBAAAAAfcCAQAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_AIBAAAAAf0CAQAAAAH-AgEAAAABB64CAQAAAAGzAkAAAAABtAJAAAAAAcICAgAAAAHOAkAAAAAB2gIBAAAAAdwCIAAAAAEDAAAACwAgHAAA0AYAIB0AANYGACAnAAAACwAgAwAAzAUAIAYAAM0FACAVAADWBgAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHcAiAAzAQAId0CAQC6BAAh3wIBALoEACHkAgAA-gTkAiLoAgAA-wToAiLqAgAAygXqAiLzAgEAugQAIfQCAQC6BAAh9QIBAO0EACH2AgEA7QQAIfsCAQDtBAAh_AIBAO0EACH9AgEA7QQAIf4CAQDtBAAhgAMBALoEACGEAwEAugQAIYwDAQC6BAAhlwMBALoEACGYAwEAugQAIZkDAQDtBAAhmgMIALsEACGbAwEA7QQAIZwDAQDtBAAhnQMBAO0EACGeAwEA7QQAIZ8DAQC6BAAhoAMBALoEACGhAwEA7QQAIaIDAQDtBAAhpAMAAMsFpAMipQMBALoEACElAwAAzAUAIAYAAM0FACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHOAkAA6QQAIdwCIADMBAAh3QIBALoEACHfAgEAugQAIeQCAAD6BOQCIugCAAD7BOgCIuoCAADKBeoCIvMCAQC6BAAh9AIBALoEACH1AgEA7QQAIfYCAQDtBAAh-wIBAO0EACH8AgEA7QQAIf0CAQDtBAAh_gIBAO0EACGAAwEAugQAIYQDAQC6BAAhjAMBALoEACGXAwEAugQAIZgDAQC6BAAhmQMBAO0EACGaAwgAuwQAIZsDAQDtBAAhnAMBAO0EACGdAwEA7QQAIZ4DAQDtBAAhnwMBALoEACGgAwEAugQAIaEDAQDtBAAhogMBAO0EACGkAwAAywWkAyKlAwEAugQAISgDAACQBQAgCAAAjgUAIAsAAI8FACCuAgEAAAABswJAAAAAAbQCQAAAAAHOAkAAAAAB2wIBAAAAAdwCIAAAAAHdAgEAAAAB3gIBAAAAAd8CAQAAAAHgAgEAAAAB4QIBAAAAAeICAQAAAAHkAgAAAOQCAuUCAgAAAAHmAgEAAAAB6AIAAADoAgLqAgAAAOoCA-sCAQAAAAHsAgEAAAAB7QIBAAAAAe4CAQAAAAHvAgEAAAAB8AIBAAAAAfECAQAAAAHyAgEAAAAB8wIBAAAAAfQCAQAAAAH1AgEAAAAB9gIBAAAAAfcCAQAAAAH4AgEAAAAB-QIBAAAAAfoCAQAAAAH7AgEAAAAB_AIBAAAAAf0CAQAAAAH-AgEAAAABAgAAABUAIBwAANcGACADAAAADwAgHAAA1wYAIB0AANsGACAqAAAADwAgAwAAgAUAIAgAAP4EACALAAD_BAAgFQAA2wYAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIc4CQADpBAAh2wIBALoEACHcAiAAzAQAId0CAQC6BAAh3gIBALoEACHfAgEAugQAIeACAQC6BAAh4QIBALoEACHiAgEAugQAIeQCAAD6BOQCIuUCAgC8BAAh5gIBALoEACHoAgAA-wToAiLqAgAA_ATqAiPrAgEA7QQAIewCAQDtBAAh7QIBAO0EACHuAgEA7QQAIe8CAQC6BAAh8AIBALoEACHxAgEAugQAIfICAQC6BAAh8wIBALoEACH0AgEAugQAIfUCAQDtBAAh9gIBAO0EACH3AgEAugQAIfgCAQDtBAAh-QIBAO0EACH6AgEA7QQAIfsCAQC6BAAh_AIBAO0EACH9AgEA7QQAIf4CAQDtBAAhKAMAAIAFACAIAAD-BAAgCwAA_wQAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIc4CQADpBAAh2wIBALoEACHcAiAAzAQAId0CAQC6BAAh3gIBALoEACHfAgEAugQAIeACAQC6BAAh4QIBALoEACHiAgEAugQAIeQCAAD6BOQCIuUCAgC8BAAh5gIBALoEACHoAgAA-wToAiLqAgAA_ATqAiPrAgEA7QQAIewCAQDtBAAh7QIBAO0EACHuAgEA7QQAIe8CAQC6BAAh8AIBALoEACHxAgEAugQAIfICAQC6BAAh8wIBALoEACH0AgEAugQAIfUCAQDtBAAh9gIBAO0EACH3AgEAugQAIfgCAQDtBAAh-QIBAO0EACH6AgEA7QQAIfsCAQC6BAAh_AIBAO0EACH9AgEA7QQAIf4CAQDtBAAhKAMAAJAFACAGAACNBQAgCwAAjwUAIK4CAQAAAAGzAkAAAAABtAJAAAAAAc4CQAAAAAHbAgEAAAAB3AIgAAAAAd0CAQAAAAHeAgEAAAAB3wIBAAAAAeACAQAAAAHhAgEAAAAB4gIBAAAAAeQCAAAA5AIC5QICAAAAAeYCAQAAAAHoAgAAAOgCAuoCAAAA6gID6wIBAAAAAewCAQAAAAHtAgEAAAAB7gIBAAAAAe8CAQAAAAHwAgEAAAAB8QIBAAAAAfICAQAAAAHzAgEAAAAB9AIBAAAAAfUCAQAAAAH2AgEAAAAB9wIBAAAAAfgCAQAAAAH5AgEAAAAB-gIBAAAAAfsCAQAAAAH8AgEAAAAB_QIBAAAAAf4CAQAAAAECAAAAFQAgHAAA3AYAIAMAAAAPACAcAADcBgAgHQAA4AYAICoAAAAPACADAACABQAgBgAA_QQAIAsAAP8EACAVAADgBgAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHbAgEAugQAIdwCIADMBAAh3QIBALoEACHeAgEAugQAId8CAQC6BAAh4AIBALoEACHhAgEAugQAIeICAQC6BAAh5AIAAPoE5AIi5QICALwEACHmAgEAugQAIegCAAD7BOgCIuoCAAD8BOoCI-sCAQDtBAAh7AIBAO0EACHtAgEA7QQAIe4CAQDtBAAh7wIBALoEACHwAgEAugQAIfECAQC6BAAh8gIBALoEACHzAgEAugQAIfQCAQC6BAAh9QIBAO0EACH2AgEA7QQAIfcCAQC6BAAh-AIBAO0EACH5AgEA7QQAIfoCAQDtBAAh-wIBALoEACH8AgEA7QQAIf0CAQDtBAAh_gIBAO0EACEoAwAAgAUAIAYAAP0EACALAAD_BAAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHbAgEAugQAIdwCIADMBAAh3QIBALoEACHeAgEAugQAId8CAQC6BAAh4AIBALoEACHhAgEAugQAIeICAQC6BAAh5AIAAPoE5AIi5QICALwEACHmAgEAugQAIegCAAD7BOgCIuoCAAD8BOoCI-sCAQDtBAAh7AIBAO0EACHtAgEA7QQAIe4CAQDtBAAh7wIBALoEACHwAgEAugQAIfECAQC6BAAh8gIBALoEACHzAgEAugQAIfQCAQC6BAAh9QIBAO0EACH2AgEA7QQAIfcCAQC6BAAh-AIBAO0EACH5AgEA7QQAIfoCAQDtBAAh-wIBALoEACH8AgEA7QQAIf0CAQDtBAAh_gIBAO0EACEQBAAArAYAIAUAAK0GACAJAACuBgAgDwAArwYAIK4CAQAAAAGzAkAAAAABtAJAAAAAAcQCAAAAugMCxQIBAAAAAc4CQAAAAAHZAiAAAAABpgMBAAAAAbgDAAAApAMCugMgAAAAAbsDIAAAAAG8AwEAAAABAgAAAAEAIBwAAOEGACAKCQAAwgUAIAwAAMQFACCuAgEAAAABswJAAAAAAbQCQAAAAAHFAgEAAAABzgJAAAAAAdkCIAAAAAGVAwgAAAABlgMBAAAAAQIAAAAgACAcAADjBgAgJQMAAOAFACAOAADiBQAgrgIBAAAAAbMCQAAAAAG0AkAAAAABzgJAAAAAAdwCIAAAAAHdAgEAAAAB3wIBAAAAAeQCAAAA5AIC6AIAAADoAgLqAgAAAOoCAvMCAQAAAAH0AgEAAAAB9QIBAAAAAfYCAQAAAAH7AgEAAAAB_AIBAAAAAf0CAQAAAAH-AgEAAAABgAMBAAAAAYQDAQAAAAGMAwEAAAABlwMBAAAAAZgDAQAAAAGZAwEAAAABmgMIAAAAAZsDAQAAAAGcAwEAAAABnQMBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAaEDAQAAAAGiAwEAAAABpAMAAACkAwKlAwEAAAABAgAAAJ0BACAcAADlBgAgAwAAAAsAIBwAAOUGACAdAADpBgAgJwAAAAsAIAMAAMwFACAOAADOBQAgFQAA6QYAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIc4CQADpBAAh3AIgAMwEACHdAgEAugQAId8CAQC6BAAh5AIAAPoE5AIi6AIAAPsE6AIi6gIAAMoF6gIi8wIBALoEACH0AgEAugQAIfUCAQDtBAAh9gIBAO0EACH7AgEA7QQAIfwCAQDtBAAh_QIBAO0EACH-AgEA7QQAIYADAQC6BAAhhAMBALoEACGMAwEAugQAIZcDAQC6BAAhmAMBALoEACGZAwEA7QQAIZoDCAC7BAAhmwMBAO0EACGcAwEA7QQAIZ0DAQDtBAAhngMBAO0EACGfAwEAugQAIaADAQC6BAAhoQMBAO0EACGiAwEA7QQAIaQDAADLBaQDIqUDAQC6BAAhJQMAAMwFACAOAADOBQAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhzgJAAOkEACHcAiAAzAQAId0CAQC6BAAh3wIBALoEACHkAgAA-gTkAiLoAgAA-wToAiLqAgAAygXqAiLzAgEAugQAIfQCAQC6BAAh9QIBAO0EACH2AgEA7QQAIfsCAQDtBAAh_AIBAO0EACH9AgEA7QQAIf4CAQDtBAAhgAMBALoEACGEAwEAugQAIYwDAQC6BAAhlwMBALoEACGYAwEAugQAIZkDAQDtBAAhmgMIALsEACGbAwEA7QQAIZwDAQDtBAAhnQMBAO0EACGeAwEA7QQAIZ8DAQC6BAAhoAMBALoEACGhAwEA7QQAIaIDAQDtBAAhpAMAAMsFpAMipQMBALoEACEDAAAAKgAgHAAA4QYAIB0AAOwGACASAAAAKgAgBAAA_AUAIAUAAP0FACAJAAD-BQAgDwAA_wUAIBUAAOwGACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHEAgAA-wW6AyLFAgEAugQAIc4CQADpBAAh2QIgAMwEACGmAwEAugQAIbgDAADLBaQDIroDIADMBAAhuwMgAMwEACG8AwEA7QQAIRAEAAD8BQAgBQAA_QUAIAkAAP4FACAPAAD_BQAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxAIAAPsFugMixQIBALoEACHOAkAA6QQAIdkCIADMBAAhpgMBALoEACG4AwAAywWkAyK6AyAAzAQAIbsDIADMBAAhvAMBAO0EACEDAAAAHgAgHAAA4wYAIB0AAO8GACAMAAAAHgAgCQAApwUAIAwAAKkFACAVAADvBgAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxQIBALoEACHOAkAA6QQAIdkCIADMBAAhlQMIALsEACGWAwEAugQAIQoJAACnBQAgDAAAqQUAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIcUCAQC6BAAhzgJAAOkEACHZAiAAzAQAIZUDCAC7BAAhlgMBALoEACEKCQAAwgUAIAoAAMMFACCuAgEAAAABswJAAAAAAbQCQAAAAAHFAgEAAAABzgJAAAAAAdkCIAAAAAGVAwgAAAABlgMBAAAAAQIAAAAgACAcAADwBgAgAwAAAB4AIBwAAPAGACAdAAD0BgAgDAAAAB4AIAkAAKcFACAKAACoBQAgFQAA9AYAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIcUCAQC6BAAhzgJAAOkEACHZAiAAzAQAIZUDCAC7BAAhlgMBALoEACEKCQAApwUAIAoAAKgFACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHFAgEAugQAIc4CQADpBAAh2QIgAMwEACGVAwgAuwQAIZYDAQC6BAAhB64CAQAAAAGzAkAAAAABtAJAAAAAAcACAQAAAAHBAgIAAAABwgICAAAAAcQCAAAAxAICBvoBAADhBAAgrgIBAAAAAbMCQAAAAAG0AkAAAAABxQIBAAAAAcYCIAAAAAECAAAA9gIAIBwAAPYGACADAAAAgAMAIBwAAPYGACAdAAD6BgAgCAAAAIADACAVAAD6BgAg-gEAAM4EACCuAgEAugQAIbMCQAC9BAAhtAJAAL0EACHFAgEAugQAIcYCIADMBAAhBvoBAADOBAAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxQIBALoEACHGAiAAzAQAIQb5AQAA4AQAIK4CAQAAAAGzAkAAAAABtAJAAAAAAcUCAQAAAAHGAiAAAAABAgAAAPYCACAcAAD7BgAgAwAAAIADACAcAAD7BgAgHQAA_wYAIAgAAACAAwAgFQAA_wYAIPkBAADNBAAgrgIBALoEACGzAkAAvQQAIbQCQAC9BAAhxQIBALoEACHGAiAAzAQAIQb5AQAAzQQAIK4CAQC6BAAhswJAAL0EACG0AkAAvQQAIcUCAQC6BAAhxgIgAMwEACEGBAYCBQoDCQwECiUGDQANDyQMAQMAAQEDAAEEAwABBg4FDQALDiEIAgcQBgkdBAQDAAEGEQUIEwcLAAgBBwAGBAkABAoWBgwaCQ0ACgELAAgCChsADBwAAQ4iAAEDAAEDBCYABScACigAAAAAAw0AEiIAEyMAFAAAAAMNABIiABMjABQBAwABAQMAAQMNABkiABojABsAAAADDQAZIgAaIwAbAQMAAQEDAAEDDQAgIgAhIwAiAAAAAw0AICIAISMAIgAAAAMNACgiACkjACoAAAADDQAoIgApIwAqAQMAAQEDAAEDDQAvIgAwIwAxAAAAAw0ALyIAMCMAMQEDAAEBAwABBQ0ANiIAOSMAOnQAN3UAOAAAAAAABQ0ANiIAOSMAOnQAN3UAOAEJAAQBCQAEBQ0APyIAQiMAQ3QAQHUAQQAAAAAABQ0APyIAQiMAQ3QAQHUAQQIH1wEGCdgBBAIH3gEGCd8BBAMNAEgiAEkjAEoAAAADDQBIIgBJIwBKAAAABQ0AUCIAUyMAVHQAUXUAUgAAAAAABQ0AUCIAUyMAVHQAUXUAUgEHAAYBBwAGAw0AWSIAWiMAWwAAAAMNAFkiAFojAFsCAwABCwAIAgMAAQsACAUNAGAiAGMjAGR0AGF1AGIAAAAAAAUNAGAiAGMjAGR0AGF1AGIBCwAIAQsACAUNAGkiAGwjAG10AGp1AGsAAAAAAAUNAGkiAGwjAG10AGp1AGsAAAADDQBzIgB0IwB1AAAAAw0AcyIAdCMAdQAAAAMNAHsiAHwjAH0AAAADDQB7IgB8IwB9Aw0AggH5AfsCgAH6Af0CgQEB-AEAfwH4AQB_AfkB_gIAAAADDQCGASIAhwEjAIgBAAAAAw0AhgEiAIcBIwCIAQH4AQB_AfgBAH8FDQCNASIAkAEjAJEBdACOAXUAjwEAAAAAAAUNAI0BIgCQASMAkQF0AI4BdQCPAQH4AQB_AfgBAH8FDQCWASIAmQEjAJoBdACXAXUAmAEAAAAAAAUNAJYBIgCZASMAmgF0AJcBdQCYARACAREpARIsARMtARQuARYwARcyDhgzDxk1ARo3Dhs4EB45AR86ASA7DiQ-ESU_FSZAAidBAihCAilDAipEAitGAixIDi1JFi5LAi9NDjBOFzFPAjJQAjNRDjRUGDVVHDZWAzdXAzhYAzlZAzpaAztcAzxeDj1fHT5hAz9jDkBkHkFlA0JmA0NnDkRqH0VrI0ZtJEduJEhxJElyJEpzJEt1JEx3Dk14JU56JE98DlB9JlF-JFJ_JFOAAQ5UgwEnVYQBK1aGAQxXhwEMWIkBDFmKAQxaiwEMW40BDFyPAQ5dkAEsXpIBDF-UAQ5glQEtYZYBDGKXAQxjmAEOZJsBLmWcATJmngEEZ58BBGihAQRpogEEaqMBBGulAQRspwEObagBM26qAQRvrAEOcK0BNHGuAQRyrwEEc7ABDnazATV3tAE7eLUBCHm2AQh6twEIe7gBCHy5AQh9uwEIfr0BDn--ATyAAcABCIEBwgEOggHDAT2DAcQBCIQBxQEIhQHGAQ6GAckBPocBygFEiAHMAQWJAc0BBYoBzwEFiwHQAQWMAdEBBY0B0wEFjgHVAQ6PAdYBRZAB2gEFkQHcAQ6SAd0BRpMB4AEFlAHhAQWVAeIBDpYB5QFHlwHmAUuYAegBTJkB6QFMmgHsAUybAe0BTJwB7gFMnQHwAUyeAfIBDp8B8wFNoAH1AUyhAfcBDqIB-AFOowH5AUykAfoBTKUB-wEOpgH-AU-nAf8BVagBgQIHqQGCAgeqAYQCB6sBhQIHrAGGAgetAYgCB64BigIOrwGLAlawAY0CB7EBjwIOsgGQAlezAZECB7QBkgIHtQGTAg62AZYCWLcBlwJcuAGYAga5AZkCBroBmgIGuwGbAga8AZwCBr0BngIGvgGgAg6_AaECXcABowIGwQGlAg7CAaYCXsMBpwIGxAGoAgbFAakCDsYBrAJfxwGtAmXIAa4CCckBrwIJygGwAgnLAbECCcwBsgIJzQG0AgnOAbYCDs8BtwJm0AG5AgnRAbsCDtIBvAJn0wG9AgnUAb4CCdUBvwIO1gHCAmjXAcMCbtgBxQJv2QHGAm_aAckCb9sBygJv3AHLAm_dAc0Cb94BzwIO3wHQAnDgAdICb-EB1AIO4gHVAnHjAdYCb-QB1wJv5QHYAg7mAdsCcucB3AJ26AHeAnfpAd8Cd-oB4gJ36wHjAnfsAeQCd-0B5gJ37gHoAg7vAekCePAB6wJ38QHtAg7yAe4CefMB7wJ39AHwAnf1AfECDvYB9AJ69wH1An77AfcCf_wB_wJ__QGCA3_-AYMDf_8BhAN_gAKGA3-BAogDDoICiQODAYMCiwN_hAKNAw6FAo4DhAGGAo8Df4cCkAN_iAKRAw6JApQDhQGKApUDiQGLApYDgAGMApcDgAGNApgDgAGOApkDgAGPApoDgAGQApwDgAGRAp4DDpICnwOKAZMCoQOAAZQCowMOlQKkA4sBlgKlA4ABlwKmA4ABmAKnAw6ZAqoDjAGaAqsDkgGbAq0DgQGcAq4DgQGdArADgQGeArEDgQGfArIDgQGgArQDgQGhArYDDqICtwOTAaMCuQOBAaQCuwMOpQK8A5QBpgK9A4EBpwK-A4EBqAK_Aw6pAsIDlQGqAsMDmwE"
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
  ClassScalarFieldEnum: () => ClassScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
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
  Subject: "Subject",
  GeneralSettings: "GeneralSettings",
  RulesRegulations: "RulesRegulations",
  GradingConfiguration: "GradingConfiguration",
  GradeScale: "GradeScale",
  FailCriteria: "FailCriteria"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
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
var GeneralSettingsScalarFieldEnum = {
  id: "id",
  schoolName: "schoolName",
  schoolPhone: "schoolPhone",
  schoolEmail: "schoolEmail",
  schoolWebsite: "schoolWebsite",
  schoolAddress: "schoolAddress",
  country: "country",
  instituteLogo: "instituteLogo",
  schoolLogoPublicId: "schoolLogoPublicId",
  schoolLogoName: "schoolLogoName",
  schoolLogoType: "schoolLogoType",
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
import { Router as Router8 } from "express";

// src/app/modules/auth/auth.routes.ts
import { Router } from "express";

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

// src/app/modules/auth/auth.controller.ts
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
import status8 from "http-status";
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status8.FORBIDDEN, "User is blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status8.NOT_FOUND, "User is deleted");
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
    throw new AppError_default(status8.UNAUTHORIZED, "Invalid Session Token");
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
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status8.BAD_REQUEST, "Email not verified!");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
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
    throw new AppError_default(status8.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status8.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
    throw new AppError_default(status8.NOT_FOUND, "User not found");
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
    httpStatusCode: status9.OK,
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
    throw new AppError_default(status9.UNAUTHORIZED, "No session token found");
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
    httpStatusCode: status9.OK,
    success: true,
    message: "Password changed successfully",
    data: result
  });
});
var forgetPassword2 = catchAsync(async (req, res) => {
  const { email } = req.body;
  await AuthService.forgetPassword(email);
  sendResponse(res, {
    httpStatusCode: status9.OK,
    success: true,
    message: "Passwrd reset OTP sent to email successfully"
  });
});
var resetPassword2 = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    httpStatusCode: status9.OK,
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
var router = Router();
router.post("/login", AuthController.loginUser);
router.post(
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
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get(
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
var AuthRoutes = router;

// src/app/modules/classes/classes.routes.ts
import { Router as Router2 } from "express";

// src/app/modules/classes/classes.controller.ts
import status11 from "http-status";

// src/app/modules/classes/classes.services.ts
import status10 from "http-status";

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
    throw new AppError_default(status10.NOT_FOUND, "Class not found");
  }
  if (payload.classTeacher !== void 0) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: payload.classTeacher,
        isdeleted: false
      }
    });
    if (!employee) {
      throw new AppError_default(status10.NOT_FOUND, "Class teacher not found");
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
import z2 from "zod";
var createClassSchema = z2.object({
  className: z2.string({ error: "Class Name is required" }).min(1, "Class Name can't be empty"),
  classTeacher: z2.string({ error: "Class Teacher is required" }).min(1, "Class Teacher can't be empty"),
  tuitionFee: z2.coerce.number({ error: "Tuition Fee is required" }).min(0, "Tuition Fee cannot be negative")
});
var updateClassSchema = z2.object({
  className: z2.string().min(1, "Class Name can't be empty").optional(),
  classTeacher: z2.string().min(1, "Class Teacher can't be empty").optional(),
  tuitionFee: z2.coerce.number().min(0, "Tuition Fee cannot be negative").optional()
});

// src/app/modules/classes/classes.controller.ts
var getAllTeachers2 = async (req, res) => {
  const result = await ClassesService.getAllTeachers();
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Teachers fetched successfully",
    data: result
  });
};
var getAllClass2 = async (req, res) => {
  const query = req.query;
  const result = await ClassesService.getAllClass(query);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Classes fetched successfully",
    data: result.data,
    meta: result.meta
  });
};
var getAllClassForUpdate2 = async (req, res) => {
  const result = await ClassesService.getAllClassForUpdate();
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Class for update fetched successfully",
    data: result
  });
};
var getSingleClass2 = async (req, res) => {
  const { id } = req.params;
  const result = await ClassesService.getSingleClass(id);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Class fetched Successfully",
    data: result
  });
};
var createClass2 = async (req, res) => {
  const payload = createClassSchema.parse(req.body);
  const createdClass = await ClassesService.createClass(payload);
  sendResponse(res, {
    httpStatusCode: status11.OK,
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
    httpStatusCode: status11.OK,
    success: true,
    message: "Class Updated Succssfully",
    data: updatedClass
  });
};
var deleteClass2 = async (req, res) => {
  const { id } = req.params;
  const deletedClass = await ClassesService.deleteClass(id);
  sendResponse(res, {
    httpStatusCode: status11.OK,
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
var router2 = Router2();
router2.get(
  "/teachers",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.getAllTeachers
);
router2.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.getAllClass
);
router2.get(
  "/classes-for-update",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.getAllClassForUpdate
);
router2.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.getSingleClass
);
router2.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.createClass
);
router2.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.udpateClass
);
router2.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.deleteClass
);
var ClassesRoutes = router2;

// src/app/modules/employees/employees.routes.ts
import { Router as Router3 } from "express";

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

// src/app/middleware/upload.ts
import multer from "multer";
var upload = multer({
  storage: multer.memoryStorage()
});

// src/app/modules/employees/employees.controller.ts
import status13 from "http-status";

// src/app/modules/employees/employees.validation.ts
import { z as z3 } from "zod";
var presentAddressSchema = z3.object({
  village: z3.string({ error: "Present address village is required" }).min(1, { error: "Present address village cannot be empty" }),
  postOffice: z3.string({ error: "Present address post office is required" }).min(1, { error: "Present address post office cannot be empty" }),
  postCode: z3.string({ error: "Present address post code is required" }).min(1, { error: "Present address post code cannot be empty" }),
  district: z3.string({ error: "Present address district is required" }).min(1, { error: "Present address district cannot be empty" })
});
var permanentAddressSchema = z3.object({
  village: z3.string({ error: "Permanent address village is required" }).min(1, { error: "Permanent address village cannot be empty" }),
  postOffice: z3.string({ error: "Permanent address post office is required" }).min(1, { error: "Permanent address post office cannot be empty" }),
  postCode: z3.string({ error: "Permanent address post code is required" }).min(1, { error: "Permanent address post code cannot be empty" }),
  district: z3.string({ error: "Permanent address district is required" }).min(1, { error: "Permanent address district cannot be empty" })
});
var createEmployeeSchema = z3.object({
  fullName: z3.string({ error: "Full name is required" }).min(1, { error: "Full name cannot be empty" }),
  fatherName: z3.string({ error: "Father's name is required" }).min(1, { error: "Father's name cannot be empty" }),
  motherName: z3.string({ error: "Mother's name is required" }).min(1, { error: "Mother's name cannot be empty" }),
  phone: z3.string({ error: "Phone number is required" }).min(11, { error: "Phone number must be at least 11 digits" }),
  gender: z3.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }),
  bloodGroup: z3.enum(BloodGroup, {
    error: "Blood group must be one of: " + Object.values(BloodGroup).join(", ")
  }),
  religion: z3.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }),
  employeeRole: z3.enum(UserRole, {
    error: "Employee role must be one of: " + Object.values(UserRole).join(", ")
  }),
  emergencyContact: z3.string().min(11, { error: "Emergency contact must be at least 11 digits" }).optional(),
  dateOfJoining: z3.string().min(1, { error: "Date of joining is required" }),
  monthlySalary: z3.coerce.number({
    error: "Monthly salary must be a valid number"
  }),
  email: z3.email({ error: "Please provide a valid email address" }),
  nid: z3.string({ error: "NID is required" }).min(1, { error: "NID cannot be empty" }),
  birthRegistrationNumber: z3.string().optional(),
  address: z3.object({
    present: presentAddressSchema,
    permanent: permanentAddressSchema
  })
});
var updateEmployeeSchema = z3.object({
  fullName: z3.string().optional(),
  fatherName: z3.string().optional(),
  motherName: z3.string().optional(),
  phone: z3.string().optional(),
  gender: z3.enum(Gender).optional(),
  bloodGroup: z3.enum(BloodGroup).optional(),
  religion: z3.enum(Religion).optional(),
  employeeRole: z3.enum(UserRole).optional(),
  emergencyContact: z3.string().optional(),
  monthlySalary: z3.coerce.number().optional(),
  dateOfJoining: z3.string().optional(),
  nid: z3.string().optional(),
  address: z3.object({
    present: presentAddressSchema.partial().optional(),
    permanent: permanentAddressSchema.partial().optional()
  }).optional()
});

// src/app/modules/employees/employess.service.ts
import status12 from "http-status";

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
    throw new AppError_default(status12.NOT_FOUND, "Employee not found");
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
    throw new AppError_default(status12.NOT_FOUND, "Employee Not found");
  }
  if (!employee?.address) {
    throw new AppError_default(status12.NOT_FOUND, "Employee address not found");
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
      status12.CONFLICT,
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
    throw new AppError_default(status12.NOT_FOUND, "Employee Not found");
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
    throw new AppError_default(status12.NOT_FOUND, "Employee Not found");
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
    httpStatusCode: status13.OK,
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
    httpStatusCode: status13.OK,
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
    httpStatusCode: status13.OK,
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
    httpStatusCode: status13.OK,
    success: true,
    message: "Employee Updated Successfully",
    data: employee
  });
};
var deleteEmployee2 = async (req, res) => {
  const { id } = req.params;
  const result = await EmployeeService.deleteEmployee(id);
  sendResponse(res, {
    httpStatusCode: status13.OK,
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
var router3 = Router3();
router3.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getAllEmployees
);
router3.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getEmployeeById
);
router3.get(
  "/:id/update",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getEmployeeByIdForUpdate
);
router3.post(
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
router3.patch(
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
router3.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.deleteEmployee
);
var EmployeeRoutes = router3;

// src/app/modules/general/general.routes.ts
import { Router as Router4 } from "express";

// src/app/modules/general/general.controller.ts
import status14 from "http-status";

// src/app/modules/general/general.service.ts
var updateGeneralSetting = async (payload, files, id) => {
  const instituteLogoFile = files.instituteLogo?.[0];
  const instituteLogo = instituteLogoFile ? await cloudinary_service_default.upload(instituteLogoFile, {
    folder: CloudinaryFolders.general.instituteLogo
  }) : null;
  const uploadedPublicIds = instituteLogo?.public_id ? [instituteLogo.public_id] : [];
  try {
    const settingData = {
      ...payload.schoolName !== void 0 && {
        schoolName: payload.schoolName
      },
      ...payload.schoolPhone !== void 0 && {
        schoolPhone: payload.schoolPhone
      },
      ...payload.schoolEmail !== void 0 && {
        schoolEmail: payload.schoolEmail
      },
      ...payload.schoolWebsite !== void 0 && {
        schoolWebsite: payload.schoolWebsite
      },
      ...payload.schoolAddress !== void 0 && {
        schoolAddress: payload.schoolAddress
      },
      ...payload.country !== void 0 && {
        country: payload.country
      },
      ...instituteLogo && {
        instituteLogo: instituteLogo.secure_url,
        schoolLogoPublicId: instituteLogo.public_id,
        schoolLogoName: instituteLogoFile.originalname,
        schoolLogoType: instituteLogoFile.mimetype
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
          schoolLogoPublicId: true
        }
      });
      if (!existingSetting) {
        throw new AppError_default(404, "General settings not found");
      }
      result = await prisma.generalSettings.update({
        where: { id },
        data: settingData
      });
      if (instituteLogo && existingSetting.schoolLogoPublicId && existingSetting.schoolLogoPublicId !== instituteLogo.public_id) {
        await cloudinary_service_default.delete(
          existingSetting.schoolLogoPublicId
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
        { field: "schoolName", value: payload.schoolName },
        { field: "schoolPhone", value: payload.schoolPhone },
        { field: "schoolEmail", value: payload.schoolEmail },
        { field: "schoolAddress", value: payload.schoolAddress },
        { field: "country", value: payload.country }
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
          schoolName: payload.schoolName,
          schoolPhone: payload.schoolPhone,
          schoolEmail: payload.schoolEmail,
          schoolAddress: payload.schoolAddress,
          country: payload.country
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
var GeneralService = {
  updateGeneralSetting,
  updateStudentRulesRegulations,
  updateEmployeeRulesRegulations
};

// src/app/modules/general/general.valdation.ts
import { z as z4 } from "zod";
var generalSettingSchema = z4.object({
  id: z4.string().optional(),
  schoolName: z4.string().optional(),
  schoolPhone: z4.string().optional(),
  schoolEmail: z4.string().optional(),
  schoolWebsite: z4.string().trim().url("Invalid school website URL").optional().or(z4.literal("")),
  schoolAddress: z4.string().optional(),
  country: z4.string().trim().optional(),
  instituteLogo: z4.string().optional(),
  schoolLogoPublicId: z4.string().optional(),
  schoolLogoName: z4.string().optional(),
  schoolLogoType: z4.string().optional()
});
var updateGeneralSettingSchema = z4.object({
  body: generalSettingSchema
});
var studentRulesAndRegulationSchema = z4.object({
  studentRules: z4.string().min(1, "Students rules & regulations are required")
});
var employeeRulesAndRegulationSchema = z4.object({
  employeeRules: z4.string().min(1, "Employees rules & regulations are required")
});

// src/app/modules/general/general.controller.ts
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
    httpStatusCode: status14.OK,
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
    httpStatusCode: status14.OK,
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
    httpStatusCode: status14.OK,
    success: true,
    message: "Employee Rules & Regulations Updated Successfully",
    data: result
  });
};
var GeneralController = {
  updateGeneralSetting: updateGeneralSetting2,
  updateStudentRulesRegulations: updateStudentRulesRegulations2,
  updateEmployeeRulesRegulations: updateEmployeeRulesRegulations2
};

// src/app/modules/general/general.routes.ts
var router4 = Router4();
var generalSettingsMiddleware = [
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.fields([
    {
      name: "instituteLogo",
      maxCount: 1
    }
  ])
];
router4.patch(
  "/",
  ...generalSettingsMiddleware,
  GeneralController.updateGeneralSetting
);
router4.patch(
  "/student-rules-regulations",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GeneralController.updateStudentRulesRegulations
);
router4.patch(
  "/employee-rules-regulations",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  GeneralController.updateEmployeeRulesRegulations
);
router4.patch(
  "/:id",
  ...generalSettingsMiddleware,
  GeneralController.updateGeneralSetting
);
var GeneralSettingsRoutes = router4;

// src/app/modules/grades/grades.routes.ts
import { Router as Router5 } from "express";

// src/app/modules/grades/grades.controller.ts
import status16 from "http-status";

// src/app/modules/grades/grades.service.ts
import status15 from "http-status";
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
        status15.NOT_FOUND,
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
import z5 from "zod";
var gradeScaleSchema = z5.object({
  id: z5.string().optional(),
  grade: z5.string().min(1),
  minMarks: z5.number().int().min(0).max(100),
  maxMarks: z5.number().int().min(0).max(100),
  status: z5.enum(["PASS", "FAIL"])
});
var gradingConfigurationSchema = z5.object({
  name: z5.string().optional(),
  grades: z5.array(gradeScaleSchema).optional()
  // failCriteria: z
  //     .object({
  //         overallPercentage: z.number().min(0).max(100),
  //         subjectPercentage: z.number().min(0).max(100),
  //         minFailedSubjects: z.number().int().min(1),
  //     })
  //     .nullable()
  //     .optional(),
});
var failCriteriaSchema = z5.object({
  overall: z5.number({ error: "Overall percentage is required" }).min(0).max(100),
  subject: z5.number({ error: "Subject percentage is required" }).min(0).max(100),
  number: z5.number({ error: "Number of subject is required" }).int().min(1)
});

// src/app/modules/grades/grades.controller.ts
var getGradeData2 = catchAsync(async (req, res) => {
  const result = await gradingConfigurationService.getGradeData();
  sendResponse(res, {
    httpStatusCode: status16.OK,
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
      httpStatusCode: status16.OK,
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
    httpStatusCode: status16.OK,
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
var router5 = Router5();
router5.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  gradesController.getGradeData
);
router5.put(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  gradesController.updateGradingConfiguration
);
router5.put(
  "/fail-criteria",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  gradesController.updateFailCriteria
);
var GradeConfigurationRoutes = router5;

// src/app/modules/student/student.routes.ts
import { Router as Router6 } from "express";

// src/app/modules/student/student.controller.ts
import status18 from "http-status";

// src/app/modules/student/student.service.ts
import status17 from "http-status";

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
    throw new AppError_default(status17.NOT_FOUND, "Student Not found");
  }
  if (!student?.address) {
    throw new AppError_default(status17.NOT_FOUND, "Student address not found");
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
      status17.CONFLICT,
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
    throw new AppError_default(status17.NOT_FOUND, "Student not found");
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
      status17.BAD_REQUEST,
      "Source and target classes cannot be the same"
    );
  }
  const uniqueStudentIds = [...new Set(studentIds)];
  if (uniqueStudentIds.length === 0) {
    throw new AppError_default(
      status17.BAD_REQUEST,
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
        status17.NOT_FOUND,
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
        status17.BAD_REQUEST,
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
        status17.CONFLICT,
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
    throw new AppError_default(status17.NOT_FOUND, "Student Profile not found");
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
import z6 from "zod";
var createStudentSchema = z6.object({
  fullName: z6.string({ error: "Student Name is required" }).min(1, { error: "Student Name can't be empty" }),
  fullNameBangla: z6.string({ error: "Student Name Bangla is required" }).min(1, { error: "Student Name Bangla can't be empty" }),
  dateOfBirth: z6.string({ error: "Date of birth is required" }).min(1, { error: "Date of birth can't be empty" }),
  birthRegistrationNumber: z6.string({ error: "Birth Registration Number is required" }).min(1, { error: "Birth Registration Number can't be empty" }),
  religion: z6.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }),
  gender: z6.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }),
  bloodGroup: z6.enum(BloodGroup, {
    error: "BloodGroup must be one of: " + Object.values(BloodGroup).join(", ")
  }).optional(),
  classId: z6.string({ error: "Class Id is required" }).min(1, { error: "Class Id can't be empty" }),
  fatherName: z6.string({ error: "Father name is required" }).min(1, { error: "Father Name can't be emptry" }),
  fatherNameBangla: z6.string({ error: "Father name Bangla is required" }).min(1, { error: "Father Name Bangla can't be empty" }),
  fatherMobileNumber: z6.string({ error: "Father Mobile Number is required" }),
  whatsappNumber: z6.string({ error: "Whatsapp number is required" }).min(1, { error: "Whatsapp Number can't be empty" }),
  fatherOccupation: z6.string({ error: "Father Occupation is required" }).min(1, { error: "Father Occupation can't be empty" }),
  motherName: z6.string({ error: "Mother Name is required" }).min(1, { error: "Mother Name Bangla can't be empty" }),
  motherNameBangla: z6.string({ error: "Mother Name Bangla is required" }).min(1, { error: "Mother Name Bangla can't be empty" }),
  motherMobileNumber: z6.string({ error: "Mother Mobile Number is required" }),
  motherOccupation: z6.string({ error: "Mother Occupation is required" }).min(1, { error: "Mother Occupation can't be empty" }),
  email: z6.email({ error: "Please provide a valid email address" }),
  guardianName: z6.string({ error: "Guardian Name is required" }).min(1, { error: "Guardian Name can't be empty" }),
  guardianRelationship: z6.string({ error: "Guardian Relationship is required" }).min(1, { error: "Guardian Relationship can't be empty" }),
  guardianMobile: z6.string({ error: "Guardian Mobile number is required" }).min(11, { error: "Guardian Mobile must be minimum 11 digit" }),
  admissionTotalFees: z6.coerce.number({
    error: "Total Fees of Admission and Other Expenses is required "
  }),
  admissionDate: z6.string({ error: "Admission date is required" }).min(1, "Admission date can't be empty"),
  previousInstitute: z6.string().optional(),
  endingClass: z6.string().optional(),
  result: z6.string().optional(),
  testimonialNumber: z6.string().optional(),
  address: z6.object({
    present: presentAddressSchema,
    permanent: permanentAddressSchema
  })
});
var updateStudentSchema = z6.object({
  fullName: z6.string().optional(),
  fullNameBangla: z6.string().optional(),
  dateOfBirth: z6.string().optional(),
  birthRegistrationNumber: z6.string().optional(),
  religion: z6.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }).optional(),
  gender: z6.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }).optional(),
  bloodGroup: z6.enum(BloodGroup, {
    error: "BloodGroup must be one of: " + Object.values(BloodGroup).join(", ")
  }).optional(),
  classId: z6.string().optional(),
  fatherName: z6.string().optional(),
  fatherNameBangla: z6.string().optional(),
  fatherMobileNumber: z6.string().optional(),
  whatsappNumber: z6.string().optional(),
  fatherOccupation: z6.string().optional(),
  motherName: z6.string().optional(),
  motherNameBangla: z6.string().optional(),
  motherMobileNumber: z6.string().optional(),
  motherOccupation: z6.string().optional(),
  email: z6.email({ error: "Please provide a valid email address" }).optional(),
  guardianName: z6.string().optional(),
  guardianRelationship: z6.string().optional(),
  guardianMobile: z6.string().optional(),
  admissionTotalFees: z6.coerce.number().optional(),
  admissionDate: z6.string().optional(),
  previousInstitute: z6.string().optional(),
  endingClass: z6.string().optional(),
  result: z6.string().optional(),
  testimonialNumber: z6.string().optional(),
  address: z6.object({
    present: presentAddressSchema.partial().optional(),
    permanent: permanentAddressSchema.partial().optional()
  }).optional()
});
var promoteStudentsSchema = z6.object({
  sourceClassId: z6.uuid("Invalid source class ID"),
  targetClassId: z6.uuid("Invalid target class ID"),
  studentIds: z6.array(z6.uuid("Invalid student ID")).min(1, "Select at least one student").refine(
    (ids) => new Set(ids).size === ids.length,
    "Duplicate student IDs are not allowed"
  )
});

// src/app/modules/student/student.controller.ts
var getAllStudent2 = async (req, res) => {
  const query = req.query;
  const result = await StudentService.getAllStudent(query);
  sendResponse(res, {
    httpStatusCode: status18.OK,
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
    httpStatusCode: status18.OK,
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
    httpStatusCode: status18.CREATED,
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
    httpStatusCode: status18.OK,
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
    httpStatusCode: status18.OK,
    success: true,
    message: result.message,
    data: result
  });
};
var deleteStudent2 = async (req, res) => {
  const { id } = req.params;
  const result = await StudentService.deleteStudent(id);
  sendResponse(res, {
    httpStatusCode: status18.OK,
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
var router6 = Router6();
router6.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.getAllStudent
);
router6.get(
  "/:id/update",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.getStudentForUpdate
);
router6.post(
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
router6.patch(
  "/promote",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.promoteStudents
);
router6.patch(
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
router6.delete(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  studentController.deleteStudent
);
var StudentRoutes = router6;

// src/app/modules/subjects/subject.routes.ts
import { Router as Router7 } from "express";

// src/app/modules/subjects/subject.controller.ts
import status19 from "http-status";

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
import { z as z7 } from "zod";
var subjectItemSchema = z7.object({
  subjectName: z7.string({ error: "Subject Name is required" }).trim().min(1, { error: "Subject Name cannot be empty" }),
  marks: z7.number({ error: "Total mark is required" }).int({ error: "Total mark must be a whole number" }).positive({ error: "Total mark must be greater than 0" })
});
var createSubjectSchema = z7.object({
  classId: z7.string({ error: "Class is required" }).trim().min(1, { error: "Class cannot be empty" }),
  subjects: z7.array(subjectItemSchema).min(1, { error: "At least one subject is required" })
});
var updateSubjectSchema = z7.object({
  classId: z7.string({ error: "Class is required" }).trim().min(1, { error: "Class cannot be empty" }),
  subjects: z7.array(
    subjectItemSchema.extend({
      id: z7.string().optional()
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
    httpStatusCode: status19.OK,
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
    httpStatusCode: status19.CREATED,
    success: true,
    message: "Subject created successfully",
    data: subject
  });
};
var updateSubject = async (req, res) => {
  const payload = updateSubjectSchema.parse(req.body);
  const subject = await SubjectService.updateSubjects(payload);
  sendResponse(res, {
    httpStatusCode: status19.OK,
    success: true,
    message: "Subjects updated successfully",
    data: subject
  });
};
var deleteSubjects2 = async (req, res) => {
  const { classId } = req.params;
  const result = await SubjectService.deleteSubjects(classId);
  sendResponse(res, {
    httpStatusCode: status19.OK,
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
var router7 = Router7();
router7.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.getAllSubjectsByClassId
);
router7.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.createSubject
);
router7.patch(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.updateSubject
);
router7.delete(
  "/:classId",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  subjectController.deleteSubjects
);
var subjectRoutes = router7;

// src/app/routes/index.ts
var routes = Router8();
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