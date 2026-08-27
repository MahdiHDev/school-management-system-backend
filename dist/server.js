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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n  students           Student[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone String\n\n  fullName         String\n  nid              String\n  fatherName       String\n  motherName       String\n  emergencyContact String?\n  monthlySalary    Float\n  employeeId       String  @unique\n\n  picture         String?\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  experience         String?\n  experiencePublicId String?\n  experienceName     String?\n  experienceType     String?\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  employeeSign         String\n  employeeSignPublicId String\n  employeeSignName     String?\n  employeeSignType     String?\n\n  gender        Gender\n  bloodGroup    BloodGroup\n  religion      Religion\n  employeeRole  UserRole   @default(OTHER)\n  dateOfJoining String\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  address Address?\n  classes Class[]\n\n  @@map("employee")\n}\n\n// model TutorProfile {\n//     id String @id @default(uuid())\n\n//     classId    String\n\n//     class    Class    @relation(fields: [classId], references: [id], onDelete: Cascade)\n//     employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n// }\n\nmodel Class {\n  id                String @id @default(uuid())\n  name              String\n  monthlyTuitionFee Float\n  classTeacher      String\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  employee Employee  @relation(fields: [classTeacher], references: [id], onDelete: Cascade)\n  students Student[]\n\n  @@map("class")\n}\n\nmodel Address {\n  id String @id @default(uuid())\n\n  studentId  String? @unique @map("student_id")\n  employeeId String? @unique @map("employee_id")\n\n  permanentAddressVillage    String?\n  permanentAddressPostOffice String?\n  permanentAddressPostCode   String?\n  permanentAddressDistrict   String?\n\n  presentAddressVillage    String?\n  presentAddressPostOffice String?\n  presentAddressPostCode   String?\n  presentAddressDistrict   String?\n\n  isDeleted Boolean @default(false)\n\n  student  Student?  @relation(fields: [studentId], references: [id])\n  employee Employee? @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now()) @map("created_at")\n  updatedAt DateTime  @updatedAt @map("updated_at")\n  deletedAt DateTime? @map("deleted_at")\n}\n\nmodel Sequence {\n  id      String @id\n  current Int\n}\n\nmodel GuardianInfo {\n  id             String @id @default(uuid())\n  studentId      String @unique\n  whatsappNumber String\n\n  fatherName         String\n  fatherNameBangla   String\n  fatherMobileNumber String\n  fatherOccupation   String\n\n  motherName         String\n  motherNameBangla   String\n  motherMobileNumber String\n  motherOccupation   String\n\n  nameOfLocalGuardian   String\n  relationShipOfStudent String\n  GuardianMobileNumber  String\n\n  student Student @relation(fields: [studentId], references: [id])\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n\nmodel Student {\n  id                      String      @id @default(uuid())\n  userId                  String\n  classId                 String\n  studentId               String      @unique\n  fullName                String\n  fullNameBangla          String\n  dateOfBirth             String\n  birthRegistrationNumber String      @unique\n  religion                Religion\n  admissionTotalFees      Int\n  admissionDate           String\n  gender                  Gender\n  bloodGroup              BloodGroup?\n  previousInstituteName   String?\n  endingClass             String?\n  result                  String?\n  testimonialNumber       String?\n\n  studentSign         String\n  studentSignPublicId String\n  studentsignName     String\n  studentSignType     String\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  guardianSign         String\n  guardianSignPublicId String?\n  guardianSignName     String?\n  guardianSignType     String?\n\n  picture         String\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  address      Address?\n  guardianInfo GuardianInfo?\n  class        Class         @relation(fields: [classId], references: [id])\n  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"},{"name":"students","kind":"object","type":"Student","relationName":"StudentToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContact","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"String"},{"name":"experiencePublicId","kind":"scalar","type":"String"},{"name":"experienceName","kind":"scalar","type":"String"},{"name":"experienceType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"employeeSign","kind":"scalar","type":"String"},{"name":"employeeSignPublicId","kind":"scalar","type":"String"},{"name":"employeeSignName","kind":"scalar","type":"String"},{"name":"employeeSignType","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"UserRole"},{"name":"dateOfJoining","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToEmployee"},{"name":"classes","kind":"object","type":"Class","relationName":"ClassToEmployee"}],"dbName":"employee"},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTuitionFee","kind":"scalar","type":"Float"},{"name":"classTeacher","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"employee","kind":"object","type":"Employee","relationName":"ClassToEmployee"},{"name":"students","kind":"object","type":"Student","relationName":"ClassToStudent"}],"dbName":"class"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String","dbName":"student_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"permanentAddressVillage","kind":"scalar","type":"String"},{"name":"permanentAddressPostOffice","kind":"scalar","type":"String"},{"name":"permanentAddressPostCode","kind":"scalar","type":"String"},{"name":"permanentAddressDistrict","kind":"scalar","type":"String"},{"name":"presentAddressVillage","kind":"scalar","type":"String"},{"name":"presentAddressPostOffice","kind":"scalar","type":"String"},{"name":"presentAddressPostCode","kind":"scalar","type":"String"},{"name":"presentAddressDistrict","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"student","kind":"object","type":"Student","relationName":"AddressToStudent"},{"name":"employee","kind":"object","type":"Employee","relationName":"AddressToEmployee"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"}],"dbName":null},"Sequence":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"current","kind":"scalar","type":"Int"}],"dbName":null},"GuardianInfo":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"whatsappNumber","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"fatherNameBangla","kind":"scalar","type":"String"},{"name":"fatherMobileNumber","kind":"scalar","type":"String"},{"name":"fatherOccupation","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"motherNameBangla","kind":"scalar","type":"String"},{"name":"motherMobileNumber","kind":"scalar","type":"String"},{"name":"motherOccupation","kind":"scalar","type":"String"},{"name":"nameOfLocalGuardian","kind":"scalar","type":"String"},{"name":"relationShipOfStudent","kind":"scalar","type":"String"},{"name":"GuardianMobileNumber","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"Student","relationName":"GuardianInfoToStudent"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Student":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"fullNameBangla","kind":"scalar","type":"String"},{"name":"dateOfBirth","kind":"scalar","type":"String"},{"name":"birthRegistrationNumber","kind":"scalar","type":"String"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"admissionTotalFees","kind":"scalar","type":"Int"},{"name":"admissionDate","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"previousInstituteName","kind":"scalar","type":"String"},{"name":"endingClass","kind":"scalar","type":"String"},{"name":"result","kind":"scalar","type":"String"},{"name":"testimonialNumber","kind":"scalar","type":"String"},{"name":"studentSign","kind":"scalar","type":"String"},{"name":"studentSignPublicId","kind":"scalar","type":"String"},{"name":"studentsignName","kind":"scalar","type":"String"},{"name":"studentSignType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"guardianSign","kind":"scalar","type":"String"},{"name":"guardianSignPublicId","kind":"scalar","type":"String"},{"name":"guardianSignName","kind":"scalar","type":"String"},{"name":"guardianSignType","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToStudent"},{"name":"guardianInfo","kind":"object","type":"GuardianInfo","relationName":"GuardianInfoToStudent"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToStudent"},{"name":"user","kind":"object","type":"User","relationName":"StudentToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","address","student","guardianInfo","employee","students","_count","class","classes","admin","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","_avg","_sum","Employee.groupBy","Employee.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","Sequence.findUnique","Sequence.findUniqueOrThrow","Sequence.findFirst","Sequence.findFirstOrThrow","Sequence.findMany","Sequence.createOne","Sequence.createMany","Sequence.createManyAndReturn","Sequence.updateOne","Sequence.updateMany","Sequence.updateManyAndReturn","Sequence.upsertOne","Sequence.deleteOne","Sequence.deleteMany","Sequence.groupBy","Sequence.aggregate","GuardianInfo.findUnique","GuardianInfo.findUniqueOrThrow","GuardianInfo.findFirst","GuardianInfo.findFirstOrThrow","GuardianInfo.findMany","GuardianInfo.createOne","GuardianInfo.createMany","GuardianInfo.createManyAndReturn","GuardianInfo.updateOne","GuardianInfo.updateMany","GuardianInfo.updateManyAndReturn","GuardianInfo.upsertOne","GuardianInfo.deleteOne","GuardianInfo.deleteMany","GuardianInfo.groupBy","GuardianInfo.aggregate","Student.findUnique","Student.findUniqueOrThrow","Student.findFirst","Student.findFirstOrThrow","Student.findMany","Student.createOne","Student.createMany","Student.createManyAndReturn","Student.updateOne","Student.updateMany","Student.updateManyAndReturn","Student.upsertOne","Student.deleteOne","Student.deleteMany","Student.groupBy","Student.aggregate","AND","OR","NOT","id","userId","classId","studentId","fullName","fullNameBangla","dateOfBirth","birthRegistrationNumber","Religion","religion","admissionTotalFees","admissionDate","Gender","gender","BloodGroup","bloodGroup","previousInstituteName","endingClass","result","testimonialNumber","studentSign","studentSignPublicId","studentsignName","studentSignType","authoritySign","authoritySignPublicId","authoritySignName","authoritySignType","guardianSign","guardianSignPublicId","guardianSignName","guardianSignType","picture","picturePublicId","pictureName","pictureType","isdeleted","createdAt","updatedAt","deletedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","whatsappNumber","fatherName","fatherNameBangla","fatherMobileNumber","fatherOccupation","motherName","motherNameBangla","motherMobileNumber","motherOccupation","nameOfLocalGuardian","relationShipOfStudent","GuardianMobileNumber","current","employeeId","permanentAddressVillage","permanentAddressPostOffice","permanentAddressPostCode","permanentAddressDistrict","presentAddressVillage","presentAddressPostOffice","presentAddressPostCode","presentAddressDistrict","isDeleted","name","monthlyTuitionFee","classTeacher","phone","nid","emergencyContact","monthlySalary","experience","experiencePublicId","experienceName","experienceType","employeeSign","employeeSignPublicId","employeeSignName","employeeSignType","UserRole","employeeRole","dateOfJoining","every","some","none","email","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","role","UserStatus","status","needPasswordChange","emailVerified","image","is","isNot","connectOrCreate","upsert","disconnect","delete","connect","createMany","set","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "8wRksAEUBAAA9QIAIAUAAPYCACAJAADVAgAgCgAA-AIAIA4AAPcCACDHAQAA8wIAMMgBAAAlABDJAQAA8wIAMMoBAQAAAAHvAUAAywIAIfABQADLAgAh8QFAAMwCACGTAiAAygIAIZQCAQDJAgAhqQIBAAAAAbsCAADlAqQCIr0CAAD0Ar0CIr4CIADKAgAhvwIgAMoCACHAAgEA0wIAIQEAAAABACAMAwAA5gIAIMcBAACAAwAwyAEAAAMAEMkBAACAAwAwygEBAMkCACHLAQEAyQIAIe8BQADLAgAh8AFAAMsCACGuAkAAywIAIbgCAQDJAgAhuQIBANMCACG6AgEA0wIAIQMDAADpAwAguQIAAIEDACC6AgAAgQMAIAwDAADmAgAgxwEAAIADADDIAQAAAwAQyQEAAIADADDKAQEAAAABywEBAMkCACHvAUAAywIAIfABQADLAgAhrgJAAMsCACG4AgEAAAABuQIBANMCACG6AgEA0wIAIQMAAAADACABAAAEADACAAAFACARAwAA5gIAIMcBAAD_AgAwyAEAAAcAEMkBAAD_AgAwygEBAMkCACHLAQEAyQIAIe8BQADLAgAh8AFAAMsCACGvAgEAyQIAIbACAQDJAgAhsQIBANMCACGyAgEA0wIAIbMCAQDTAgAhtAJAAMwCACG1AkAAzAIAIbYCAQDTAgAhtwIBANMCACEIAwAA6QMAILECAACBAwAgsgIAAIEDACCzAgAAgQMAILQCAACBAwAgtQIAAIEDACC2AgAAgQMAILcCAACBAwAgEQMAAOYCACDHAQAA_wIAMMgBAAAHABDJAQAA_wIAMMoBAQAAAAHLAQEAyQIAIe8BQADLAgAh8AFAAMsCACGvAgEAyQIAIbACAQDJAgAhsQIBANMCACGyAgEA0wIAIbMCAQDTAgAhtAJAAMwCACG1AkAAzAIAIbYCAQDTAgAhtwIBANMCACEDAAAABwAgAQAACAAwAgAACQAgKQMAAOYCACAGAADnAgAgDQAA6AIAIMcBAADgAgAwyAEAAAsAEMkBAADgAgAwygEBAMkCACHLAQEAyQIAIc4BAQDJAgAh0wEAAOQC0wEi1wEAAOIC1wEi2QEAAOMC2QEi4gEBAMkCACHjAQEAyQIAIeQBAQDTAgAh5QEBANMCACHqAQEA0wIAIesBAQDTAgAh7AEBANMCACHtAQEA0wIAIe4BIADKAgAh7wFAAMsCACHwAUAAywIAIfEBQADMAgAh_gEBAMkCACGCAgEAyQIAIYoCAQDJAgAhlwIBAMkCACGYAgEAyQIAIZkCAQDTAgAhmgIIAOECACGbAgEA0wIAIZwCAQDTAgAhnQIBANMCACGeAgEA0wIAIZ8CAQDJAgAhoAIBAMkCACGhAgEA0wIAIaICAQDTAgAhpAIAAOUCpAIipQIBAMkCACEBAAAACwAgFAcAANQCACAJAADVAgAgxwEAANICADDIAQAADQAQyQEAANICADDKAQEAyQIAIc0BAQDTAgAh7wFAAMsCACHwAUAAywIAIfEBQADMAgAhigIBANMCACGLAgEA0wIAIYwCAQDTAgAhjQIBANMCACGOAgEA0wIAIY8CAQDTAgAhkAIBANMCACGRAgEA0wIAIZICAQDTAgAhkwIgAMoCACEBAAAADQAgLAMAAOYCACAGAADnAgAgCAAA_QIAIAwAAP4CACDHAQAA-wIAMMgBAAAPABDJAQAA-wIAMMoBAQDJAgAhywEBAMkCACHMAQEAyQIAIc0BAQDJAgAhzgEBAMkCACHPAQEAyQIAIdABAQDJAgAh0QEBAMkCACHTAQAA5ALTASLUAQIA0AIAIdUBAQDJAgAh1wEAAOIC1wEi2QEAAPwC2QEj2gEBANMCACHbAQEA0wIAIdwBAQDTAgAh3QEBANMCACHeAQEAyQIAId8BAQDJAgAh4AEBAMkCACHhAQEAyQIAIeIBAQDJAgAh4wEBAMkCACHkAQEA0wIAIeUBAQDTAgAh5gEBAMkCACHnAQEA0wIAIegBAQDTAgAh6QEBANMCACHqAQEAyQIAIesBAQDTAgAh7AEBANMCACHtAQEA0wIAIe4BIADKAgAh7wFAAMsCACHwAUAAywIAIfEBQADMAgAhAQAAAA8AIAEAAAANACAWBwAAzQIAIMcBAADIAgAwyAEAABIAEMkBAADIAgAwygEBAMkCACHNAQEAyQIAIe4BIADKAgAh7wFAAMsCACHwAUAAywIAIfEBQADMAgAh_QEBAMkCACH-AQEAyQIAIf8BAQDJAgAhgAIBAMkCACGBAgEAyQIAIYICAQDJAgAhgwIBAMkCACGEAgEAyQIAIYUCAQDJAgAhhgIBAMkCACGHAgEAyQIAIYgCAQDJAgAhAQAAABIAIBIDAADpAwAgBgAA6gMAIAgAALsEACAMAAC8BAAg2QEAAIEDACDaAQAAgQMAINsBAACBAwAg3AEAAIEDACDdAQAAgQMAIOQBAACBAwAg5QEAAIEDACDnAQAAgQMAIOgBAACBAwAg6QEAAIEDACDrAQAAgQMAIOwBAACBAwAg7QEAAIEDACDxAQAAgQMAICwDAADmAgAgBgAA5wIAIAgAAP0CACAMAAD-AgAgxwEAAPsCADDIAQAADwAQyQEAAPsCADDKAQEAAAABywEBAMkCACHMAQEAyQIAIc0BAQAAAAHOAQEAyQIAIc8BAQDJAgAh0AEBAMkCACHRAQEAAAAB0wEAAOQC0wEi1AECANACACHVAQEAyQIAIdcBAADiAtcBItkBAAD8AtkBI9oBAQDTAgAh2wEBANMCACHcAQEA0wIAId0BAQDTAgAh3gEBAMkCACHfAQEAyQIAIeABAQDJAgAh4QEBAMkCACHiAQEAyQIAIeMBAQDJAgAh5AEBANMCACHlAQEA0wIAIeYBAQDJAgAh5wEBANMCACHoAQEA0wIAIekBAQDTAgAh6gEBAMkCACHrAQEA0wIAIewBAQDTAgAh7QEBANMCACHuASAAygIAIe8BQADLAgAh8AFAAMsCACHxAUAAzAIAIQMAAAAPACABAAAUADACAAAVACABAAAADwAgAQAAAAsAIA0JAAD6AgAgCgAA-AIAIMcBAAD5AgAwyAEAABkAEMkBAAD5AgAwygEBAMkCACHvAUAAywIAIfABQADLAgAh8QFAAMwCACGTAiAAygIAIZQCAQDJAgAhlQIIAOECACGWAgEAyQIAIQMJAAC0AwAgCgAAugQAIPEBAACBAwAgDQkAAPoCACAKAAD4AgAgxwEAAPkCADDIAQAAGQAQyQEAAPkCADDKAQEAAAAB7wFAAMsCACHwAUAAywIAIfEBQADMAgAhkwIgAMoCACGUAgEAyQIAIZUCCADhAgAhlgIBAMkCACEDAAAAGQAgAQAAGgAwAgAAGwAgAQAAABkAIA4DAADmAgAgxwEAAOoCADDIAQAAHgAQyQEAAOoCADDKAQEAyQIAIcsBAQDJAgAh7wFAAMsCACHwAUAAywIAIfEBQADMAgAhkwIgAMoCACGUAgEAyQIAIakCAQDJAgAhqgIBANMCACGrAgEA0wIAIQEAAAAeACADAAAADwAgAQAAFAAwAgAAFQAgAQAAAAMAIAEAAAAHACABAAAADwAgAQAAAAEAIBQEAAD1AgAgBQAA9gIAIAkAANUCACAKAAD4AgAgDgAA9wIAIMcBAADzAgAwyAEAACUAEMkBAADzAgAwygEBAMkCACHvAUAAywIAIfABQADLAgAh8QFAAMwCACGTAiAAygIAIZQCAQDJAgAhqQIBAMkCACG7AgAA5QKkAiK9AgAA9AK9AiK-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_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_gEBAMkCACH_AQEAyQIAIYACAQDJAgAhgQIBAMkCACGCAgEAyQIAIYMCAQDJAgAhhAIBAMkCACGFAgEAyQIAIYYCAQDJAgAhhwIBAMkCACGIAgEAyQIAIQEAAAD7AQAgAQAAAPsBACACBwAAqQMAIPEBAACBAwAgAwAAABIAIAEAAP4BADACAAD7AQAgAwAAABIAIAEAAP4BADACAAD7AQAgAwAAABIAIAEAAP4BADACAAD7AQAgEwcAAKgDACDKAQEAAAABzQEBAAAAAe4BIAAAAAHvAUAAAAAB8AFAAAAAAfEBQAAAAAH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQIBAAAAAYICAQAAAAGDAgEAAAABhAIBAAAAAYUCAQAAAAGGAgEAAAABhwIBAAAAAYgCAQAAAAEBFAAAggIAIBLKAQEAAAABzQEBAAAAAe4BIAAAAAHvAUAAAAAB8AFAAAAAAfEBQAAAAAH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQIBAAAAAYICAQAAAAGDAgEAAAABhAIBAAAAAYUCAQAAAAGGAgEAAAABhwIBAAAAAYgCAQAAAAEBFAAAhAIAMAEUAACEAgAwEwcAAKcDACDKAQEAhwMAIc0BAQCHAwAh7gEgAI0DACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACH9AQEAhwMAIf4BAQCHAwAh_wEBAIcDACGAAgEAhwMAIYECAQCHAwAhggIBAIcDACGDAgEAhwMAIYQCAQCHAwAhhQIBAIcDACGGAgEAhwMAIYcCAQCHAwAhiAIBAIcDACECAAAA-wEAIBQAAIcCACASygEBAIcDACHNAQEAhwMAIe4BIACNAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAh_QEBAIcDACH-AQEAhwMAIf8BAQCHAwAhgAIBAIcDACGBAgEAhwMAIYICAQCHAwAhgwIBAIcDACGEAgEAhwMAIYUCAQCHAwAhhgIBAIcDACGHAgEAhwMAIYgCAQCHAwAhAgAAABIAIBQAAIkCACACAAAAEgAgFAAAiQIAIAMAAAD7AQAgGwAAggIAIBwAAIcCACABAAAA-wEAIAEAAAASACAECwAApAMAICEAAKYDACAiAAClAwAg8QEAAIEDACAVxwEAAMcCADDIAQAAkAIAEMkBAADHAgAwygEBAKoCACHNAQEAqgIAIe4BIACwAgAh7wFAALECACHwAUAAsQIAIfEBQACyAgAh_QEBAKoCACH-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_AEBAAAAAQcLAAC3AgAgIQAAxAIAICIAAMQCACDyAQAAANMBAvMBAAAA0wEI9AEAAADTAQj5AQAAwwLTASINCwAAtwIAICEAALcCACAiAAC3AgAgcwAAwgIAIHQAALcCACDyAQIAAAAB8wECAAAABPQBAgAAAAT1AQIAAAAB9gECAAAAAfcBAgAAAAH4AQIAAAAB-QECAMECACEHCwAAtwIAICEAAMACACAiAADAAgAg8gEAAADXAQLzAQAAANcBCPQBAAAA1wEI-QEAAL8C1wEiBwsAALQCACAhAAC-AgAgIgAAvgIAIPIBAAAA2QED8wEAAADZAQn0AQAAANkBCfkBAAC9AtkBIw4LAAC0AgAgIQAAvAIAICIAALwCACDyAQEAAAAB8wEBAAAABfQBAQAAAAX1AQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBALsCACH6AQEAAAAB-wEBAAAAAfwBAQAAAAEFCwAAtwIAICEAALoCACAiAAC6AgAg8gEgAAAAAfkBIAC5AgAhCwsAALcCACAhAAC4AgAgIgAAuAIAIPIBQAAAAAHzAUAAAAAE9AFAAAAABPUBQAAAAAH2AUAAAAAB9wFAAAAAAfgBQAAAAAH5AUAAtgIAIQsLAAC0AgAgIQAAtQIAICIAALUCACDyAUAAAAAB8wFAAAAABfQBQAAAAAX1AUAAAAAB9gFAAAAAAfcBQAAAAAH4AUAAAAAB-QFAALMCACELCwAAtAIAICEAALUCACAiAAC1AgAg8gFAAAAAAfMBQAAAAAX0AUAAAAAF9QFAAAAAAfYBQAAAAAH3AUAAAAAB-AFAAAAAAfkBQACzAgAhCPIBAgAAAAHzAQIAAAAF9AECAAAABfUBAgAAAAH2AQIAAAAB9wECAAAAAfgBAgAAAAH5AQIAtAIAIQjyAUAAAAAB8wFAAAAABfQBQAAAAAX1AUAAAAAB9gFAAAAAAfcBQAAAAAH4AUAAAAAB-QFAALUCACELCwAAtwIAICEAALgCACAiAAC4AgAg8gFAAAAAAfMBQAAAAAT0AUAAAAAE9QFAAAAAAfYBQAAAAAH3AUAAAAAB-AFAAAAAAfkBQAC2AgAhCPIBAgAAAAHzAQIAAAAE9AECAAAABPUBAgAAAAH2AQIAAAAB9wECAAAAAfgBAgAAAAH5AQIAtwIAIQjyAUAAAAAB8wFAAAAABPQBQAAAAAT1AUAAAAAB9gFAAAAAAfcBQAAAAAH4AUAAAAAB-QFAALgCACEFCwAAtwIAICEAALoCACAiAAC6AgAg8gEgAAAAAfkBIAC5AgAhAvIBIAAAAAH5ASAAugIAIQ4LAAC0AgAgIQAAvAIAICIAALwCACDyAQEAAAAB8wEBAAAABfQBAQAAAAX1AQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBALsCACH6AQEAAAAB-wEBAAAAAfwBAQAAAAEL8gEBAAAAAfMBAQAAAAX0AQEAAAAF9QEBAAAAAfYBAQAAAAH3AQEAAAAB-AEBAAAAAfkBAQC8AgAh-gEBAAAAAfsBAQAAAAH8AQEAAAABBwsAALQCACAhAAC-AgAgIgAAvgIAIPIBAAAA2QED8wEAAADZAQn0AQAAANkBCfkBAAC9AtkBIwTyAQAAANkBA_MBAAAA2QEJ9AEAAADZAQn5AQAAvgLZASMHCwAAtwIAICEAAMACACAiAADAAgAg8gEAAADXAQLzAQAAANcBCPQBAAAA1wEI-QEAAL8C1wEiBPIBAAAA1wEC8wEAAADXAQj0AQAAANcBCPkBAADAAtcBIg0LAAC3AgAgIQAAtwIAICIAALcCACBzAADCAgAgdAAAtwIAIPIBAgAAAAHzAQIAAAAE9AECAAAABPUBAgAAAAH2AQIAAAAB9wECAAAAAfgBAgAAAAH5AQIAwQIAIQjyAQgAAAAB8wEIAAAABPQBCAAAAAT1AQgAAAAB9gEIAAAAAfcBCAAAAAH4AQgAAAAB-QEIAMICACEHCwAAtwIAICEAAMQCACAiAADEAgAg8gEAAADTAQLzAQAAANMBCPQBAAAA0wEI-QEAAMMC0wEiBPIBAAAA0wEC8wEAAADTAQj0AQAAANMBCPkBAADEAtMBIg4LAAC3AgAgIQAAxgIAICIAAMYCACDyAQEAAAAB8wEBAAAABPQBAQAAAAT1AQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBAMUCACH6AQEAAAAB-wEBAAAAAfwBAQAAAAEL8gEBAAAAAfMBAQAAAAT0AQEAAAAE9QEBAAAAAfYBAQAAAAH3AQEAAAAB-AEBAAAAAfkBAQDGAgAh-gEBAAAAAfsBAQAAAAH8AQEAAAABFccBAADHAgAwyAEAAJACABDJAQAAxwIAMMoBAQCqAgAhzQEBAKoCACHuASAAsAIAIe8BQACxAgAh8AFAALECACHxAUAAsgIAIf0BAQCqAgAh_gEBAKoCACH_AQEAqgIAIYACAQCqAgAhgQIBAKoCACGCAgEAqgIAIYMCAQCqAgAhhAIBAKoCACGFAgEAqgIAIYYCAQCqAgAhhwIBAKoCACGIAgEAqgIAIRYHAADNAgAgxwEAAMgCADDIAQAAEgAQyQEAAMgCADDKAQEAyQIAIc0BAQDJAgAh7gEgAMoCACHvAUAAywIAIfABQADLAgAh8QFAAMwCACH9AQEAyQIAIf4BAQDJAgAh_wEBAMkCACGAAgEAyQIAIYECAQDJAgAhggIBAMkCACGDAgEAyQIAIYQCAQDJAgAhhQIBAMkCACGGAgEAyQIAIYcCAQDJAgAhiAIBAMkCACEL8gEBAAAAAfMBAQAAAAT0AQEAAAAE9QEBAAAAAfYBAQAAAAH3AQEAAAAB-AEBAAAAAfkBAQDGAgAh-gEBAAAAAfsBAQAAAAH8AQEAAAABAvIBIAAAAAH5ASAAugIAIQjyAUAAAAAB8wFAAAAABPQBQAAAAAT1AUAAAAAB9gFAAAAAAfcBQAAAAAH4AUAAAAAB-QFAALgCACEI8gFAAAAAAfMBQAAAAAX0AUAAAAAF9QFAAAAAAfYBQAAAAAH3AUAAAAAB-AFAAAAAAfkBQAC1AgAhLgMAAOYCACAGAADnAgAgCAAA_QIAIAwAAP4CACDHAQAA-wIAMMgBAAAPABDJAQAA-wIAMMoBAQDJAgAhywEBAMkCACHMAQEAyQIAIc0BAQDJAgAhzgEBAMkCACHPAQEAyQIAIdABAQDJAgAh0QEBAMkCACHTAQAA5ALTASLUAQIA0AIAIdUBAQDJAgAh1wEAAOIC1wEi2QEAAPwC2QEj2gEBANMCACHbAQEA0wIAIdwBAQDTAgAh3QEBANMCACHeAQEAyQIAId8BAQDJAgAh4AEBAMkCACHhAQEAyQIAIeIBAQDJAgAh4wEBAMkCACHkAQEA0wIAIeUBAQDTAgAh5gEBAMkCACHnAQEA0wIAIegBAQDTAgAh6QEBANMCACHqAQEAyQIAIesBAQDTAgAh7AEBANMCACHtAQEA0wIAIe4BIADKAgAh7wFAAMsCACHwAUAAywIAIfEBQADMAgAhwQIAAA8AIMICAAAPACAFxwEAAM4CADDIAQAA-AEAEMkBAADOAgAwygEBAKoCACGJAgIArAIAIQXHAQAAzwIAMMgBAADlAQAQyQEAAM8CADDKAQEAyQIAIYkCAgDQAgAhCPIBAgAAAAHzAQIAAAAE9AECAAAABPUBAgAAAAH2AQIAAAAB9wECAAAAAfgBAgAAAAH5AQIAtwIAIRLHAQAA0QIAMMgBAADfAQAQyQEAANECADDKAQEAqgIAIc0BAQCvAgAh7wFAALECACHwAUAAsQIAIfEBQACyAgAhigIBAK8CACGLAgEArwIAIYwCAQCvAgAhjQIBAK8CACGOAgEArwIAIY8CAQCvAgAhkAIBAK8CACGRAgEArwIAIZICAQCvAgAhkwIgALACACEUBwAA1AIAIAkAANUCACDHAQAA0gIAMMgBAAANABDJAQAA0gIAMMoBAQDJAgAhzQEBANMCACHvAUAAywIAIfABQADLAgAh8QFAAMwCACGKAgEA0wIAIYsCAQDTAgAhjAIBANMCACGNAgEA0wIAIY4CAQDTAgAhjwIBANMCACGQAgEA0wIAIZECAQDTAgAhkgIBANMCACGTAiAAygIAIQvyAQEAAAAB8wEBAAAABfQBAQAAAAX1AQEAAAAB9gEBAAAAAfcBAQAAAAH4AQEAAAAB-QEBALwCACH6AQEAAAAB-wEBAAAAAfwBAQAAAAEuAwAA5gIAIAYAAOcCACAIAAD9AgAgDAAA_gIAIMcBAAD7AgAwyAEAAA8AEMkBAAD7AgAwygEBAMkCACHLAQEAyQIAIcwBAQDJAgAhzQEBAMkCACHOAQEAyQIAIc8BAQDJAgAh0AEBAMkCACHRAQEAyQIAIdMBAADkAtMBItQBAgDQAgAh1QEBAMkCACHXAQAA4gLXASLZAQAA_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_AiAAygIAIcACAQDTAgAhwQIAACUAIMICAAAlACAWBwAA1AIAIAkAANUCACDHAQAA0gIAMMgBAAANABDJAQAA0gIAMMoBAQDJAgAhzQEBANMCACHvAUAAywIAIfABQADLAgAh8QFAAMwCACGKAgEA0wIAIYsCAQDTAgAhjAIBANMCACGNAgEA0wIAIY4CAQDTAgAhjwIBANMCACGQAgEA0wIAIZECAQDTAgAhkgIBANMCACGTAiAAygIAIcECAAANACDCAgAADQAgA6YCAAAZACCnAgAAGQAgqAIAABkAIA3HAQAA6QIAMMgBAACVAQAQyQEAAOkCADDKAQEAqgIAIcsBAQCqAgAh7wFAALECACHwAUAAsQIAIfEBQACyAgAhkwIgALACACGUAgEAqgIAIakCAQCqAgAhqgIBAK8CACGrAgEArwIAIQ4DAADmAgAgxwEAAOoCADDIAQAAHgAQyQEAAOoCADDKAQEAyQIAIcsBAQDJAgAh7wFAAMsCACHwAUAAywIAIfEBQADMAgAhkwIgAMoCACGUAgEAyQIAIakCAQDJAgAhqgIBANMCACGrAgEA0wIAIQnHAQAA6wIAMMgBAAB9ABDJAQAA6wIAMMoBAQCqAgAh7wFAALECACHwAUAAsQIAIawCAQCqAgAhrQIBAKoCACGuAkAAsQIAIQnHAQAA7AIAMMgBAABqABDJAQAA7AIAMMoBAQDJAgAh7wFAAMsCACHwAUAAywIAIawCAQDJAgAhrQIBAMkCACGuAkAAywIAIRDHAQAA7QIAMMgBAABkABDJAQAA7QIAMMoBAQCqAgAhywEBAKoCACHvAUAAsQIAIfABQACxAgAhrwIBAKoCACGwAgEAqgIAIbECAQCvAgAhsgIBAK8CACGzAgEArwIAIbQCQACyAgAhtQJAALICACG2AgEArwIAIbcCAQCvAgAhC8cBAADuAgAwyAEAAE4AEMkBAADuAgAwygEBAKoCACHLAQEAqgIAIe8BQACxAgAh8AFAALECACGuAkAAsQIAIbgCAQCqAgAhuQIBAK8CACG6AgEArwIAIQ_HAQAA7wIAMMgBAAA4ABDJAQAA7wIAMMoBAQCqAgAh7wFAALECACHwAUAAsQIAIfEBQACyAgAhkwIgALACACGUAgEAqgIAIakCAQCqAgAhuwIAANsCpAIivQIAAPACvQIivgIgALACACG_AiAAsAIAIcACAQCvAgAhBwsAALcCACAhAADyAgAgIgAA8gIAIPIBAAAAvQIC8wEAAAC9Agj0AQAAAL0CCPkBAADxAr0CIgcLAAC3AgAgIQAA8gIAICIAAPICACDyAQAAAL0CAvMBAAAAvQII9AEAAAC9Agj5AQAA8QK9AiIE8gEAAAC9AgLzAQAAAL0CCPQBAAAAvQII-QEAAPICvQIiFAQAAPUCACAFAAD2AgAgCQAA1QIAIAoAAPgCACAOAAD3AgAgxwEAAPMCADDIAQAAJQAQyQEAAPMCADDKAQEAyQIAIe8BQADLAgAh8AFAAMsCACHxAUAAzAIAIZMCIADKAgAhlAIBAMkCACGpAgEAyQIAIbsCAADlAqQCIr0CAAD0Ar0CIr4CIADKAgAhvwIgAMoCACHAAgEA0wIAIQTyAQAAAL0CAvMBAAAAvQII9AEAAAC9Agj5AQAA8gK9AiIDpgIAAAMAIKcCAAADACCoAgAAAwAgA6YCAAAHACCnAgAABwAgqAIAAAcAIBADAADmAgAgxwEAAOoCADDIAQAAHgAQyQEAAOoCADDKAQEAyQIAIcsBAQDJAgAh7wFAAMsCACHwAUAAywIAIfEBQADMAgAhkwIgAMoCACGUAgEAyQIAIakCAQDJAgAhqgIBANMCACGrAgEA0wIAIcECAAAeACDCAgAAHgAgA6YCAAAPACCnAgAADwAgqAIAAA8AIA0JAAD6AgAgCgAA-AIAIMcBAAD5AgAwyAEAABkAEMkBAAD5AgAwygEBAMkCACHvAUAAywIAIfABQADLAgAh8QFAAMwCACGTAiAAygIAIZQCAQDJAgAhlQIIAOECACGWAgEAyQIAISsDAADmAgAgBgAA5wIAIA0AAOgCACDHAQAA4AIAMMgBAAALABDJAQAA4AIAMMoBAQDJAgAhywEBAMkCACHOAQEAyQIAIdMBAADkAtMBItcBAADiAtcBItkBAADjAtkBIuIBAQDJAgAh4wEBAMkCACHkAQEA0wIAIeUBAQDTAgAh6gEBANMCACHrAQEA0wIAIewBAQDTAgAh7QEBANMCACHuASAAygIAIe8BQADLAgAh8AFAAMsCACHxAUAAzAIAIf4BAQDJAgAhggIBAMkCACGKAgEAyQIAIZcCAQDJAgAhmAIBAMkCACGZAgEA0wIAIZoCCADhAgAhmwIBANMCACGcAgEA0wIAIZ0CAQDTAgAhngIBANMCACGfAgEAyQIAIaACAQDJAgAhoQIBANMCACGiAgEA0wIAIaQCAADlAqQCIqUCAQDJAgAhwQIAAAsAIMICAAALACAsAwAA5gIAIAYAAOcCACAIAAD9AgAgDAAA_gIAIMcBAAD7AgAwyAEAAA8AEMkBAAD7AgAwygEBAMkCACHLAQEAyQIAIcwBAQDJAgAhzQEBAMkCACHOAQEAyQIAIc8BAQDJAgAh0AEBAMkCACHRAQEAyQIAIdMBAADkAtMBItQBAgDQAgAh1QEBAMkCACHXAQAA4gLXASLZAQAA_ALZASPaAQEA0wIAIdsBAQDTAgAh3AEBANMCACHdAQEA0wIAId4BAQDJAgAh3wEBAMkCACHgAQEAyQIAIeEBAQDJAgAh4gEBAMkCACHjAQEAyQIAIeQBAQDTAgAh5QEBANMCACHmAQEAyQIAIecBAQDTAgAh6AEBANMCACHpAQEA0wIAIeoBAQDJAgAh6wEBANMCACHsAQEA0wIAIe0BAQDTAgAh7gEgAMoCACHvAUAAywIAIfABQADLAgAh8QFAAMwCACEE8gEAAADZAQPzAQAAANkBCfQBAAAA2QEJ-QEAAL4C2QEjGAcAAM0CACDHAQAAyAIAMMgBAAASABDJAQAAyAIAMMoBAQDJAgAhzQEBAMkCACHuASAAygIAIe8BQADLAgAh8AFAAMsCACHxAUAAzAIAIf0BAQDJAgAh_gEBAMkCACH_AQEAyQIAIYACAQDJAgAhgQIBAMkCACGCAgEAyQIAIYMCAQDJAgAhhAIBAMkCACGFAgEAyQIAIYYCAQDJAgAhhwIBAMkCACGIAgEAyQIAIcECAAASACDCAgAAEgAgDwkAAPoCACAKAAD4AgAgxwEAAPkCADDIAQAAGQAQyQEAAPkCADDKAQEAyQIAIe8BQADLAgAh8AFAAMsCACHxAUAAzAIAIZMCIADKAgAhlAIBAMkCACGVAggA4QIAIZYCAQDJAgAhwQIAABkAIMICAAAZACARAwAA5gIAIMcBAAD_AgAwyAEAAAcAEMkBAAD_AgAwygEBAMkCACHLAQEAyQIAIe8BQADLAgAh8AFAAMsCACGvAgEAyQIAIbACAQDJAgAhsQIBANMCACGyAgEA0wIAIbMCAQDTAgAhtAJAAMwCACG1AkAAzAIAIbYCAQDTAgAhtwIBANMCACEMAwAA5gIAIMcBAACAAwAwyAEAAAMAEMkBAACAAwAwygEBAMkCACHLAQEAyQIAIe8BQADLAgAh8AFAAMsCACGuAkAAywIAIbgCAQDJAgAhuQIBANMCACG6AgEA0wIAIQAAAAAAAAHJAgEAAAABAckCAAAA0wECBckCAgAAAAHMAgIAAAABzQICAAAAAc4CAgAAAAHPAgIAAAABAckCAAAA1wECAckCAAAA2QEDAckCAQAAAAEByQIgAAAAAQHJAkAAAAABAckCQAAAAAEHGwAAmQMAIBwAAJwDACDDAgAAmgMAIMQCAACbAwAgxQIAAA0AIMYCAAANACDHAgAAxgEAIAcbAACUAwAgHAAAlwMAIMMCAACVAwAgxAIAAJYDACDFAgAAEgAgxgIAABIAIMcCAAD7AQAgBRsAAOcEACAcAADyBAAgwwIAAOgEACDEAgAA8QQAIMcCAAAbACAFGwAA5QQAIBwAAO8EACDDAgAA5gQAIMQCAADuBAAgxwIAAAEAIBHKAQEAAAAB7gEgAAAAAe8BQAAAAAHwAUAAAAAB8QFAAAAAAf0BAQAAAAH-AQEAAAAB_wEBAAAAAYACAQAAAAGBAgEAAAABggIBAAAAAYMCAQAAAAGEAgEAAAABhQIBAAAAAYYCAQAAAAGHAgEAAAABiAIBAAAAAQIAAAD7AQAgGwAAlAMAIAMAAAASACAbAACUAwAgHAAAmAMAIBMAAAASACAUAACYAwAgygEBAIcDACHuASAAjQMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAIf0BAQCHAwAh_gEBAIcDACH_AQEAhwMAIYACAQCHAwAhgQIBAIcDACGCAgEAhwMAIYMCAQCHAwAhhAIBAIcDACGFAgEAhwMAIYYCAQCHAwAhhwIBAIcDACGIAgEAhwMAIRHKAQEAhwMAIe4BIACNAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAh_QEBAIcDACH-AQEAhwMAIf8BAQCHAwAhgAIBAIcDACGBAgEAhwMAIYICAQCHAwAhgwIBAIcDACGEAgEAhwMAIYUCAQCHAwAhhgIBAIcDACGHAgEAhwMAIYgCAQCHAwAhDwkAAJ8DACDKAQEAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABigIBAAAAAYsCAQAAAAGMAgEAAAABjQIBAAAAAY4CAQAAAAGPAgEAAAABkAIBAAAAAZECAQAAAAGSAgEAAAABkwIgAAAAAQIAAADGAQAgGwAAmQMAIAMAAAANACAbAACZAwAgHAAAnQMAIBEAAAANACAJAACeAwAgFAAAnQMAIMoBAQCHAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhigIBAIwDACGLAgEAjAMAIYwCAQCMAwAhjQIBAIwDACGOAgEAjAMAIY8CAQCMAwAhkAIBAIwDACGRAgEAjAMAIZICAQCMAwAhkwIgAI0DACEPCQAAngMAIMoBAQCHAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhigIBAIwDACGLAgEAjAMAIYwCAQCMAwAhjQIBAIwDACGOAgEAjAMAIY8CAQCMAwAhkAIBAIwDACGRAgEAjAMAIZICAQCMAwAhkwIgAI0DACEHGwAA6QQAIBwAAOwEACDDAgAA6gQAIMQCAADrBAAgxQIAAAsAIMYCAAALACDHAgAAmAEAIAMbAADpBAAgwwIAAOoEACDHAgAAmAEAIAMbAACZAwAgwwIAAJoDACDHAgAAxgEAIAMbAACUAwAgwwIAAJUDACDHAgAA-wEAIAMbAADnBAAgwwIAAOgEACDHAgAAGwAgAxsAAOUEACDDAgAA5gQAIMcCAAABACAAAAAFGwAA4AQAIBwAAOMEACDDAgAA4QQAIMQCAADiBAAgxwIAABUAIAMbAADgBAAgwwIAAOEEACDHAgAAFQAgEgMAAOkDACAGAADqAwAgCAAAuwQAIAwAALwEACDZAQAAgQMAINoBAACBAwAg2wEAAIEDACDcAQAAgQMAIN0BAACBAwAg5AEAAIEDACDlAQAAgQMAIOcBAACBAwAg6AEAAIEDACDpAQAAgQMAIOsBAACBAwAg7AEAAIEDACDtAQAAgQMAIPEBAACBAwAgAAAAAAAAAAAHGwAA2wQAIBwAAN4EACDDAgAA3AQAIMQCAADdBAAgxQIAAA8AIMYCAAAPACDHAgAAFQAgAxsAANsEACDDAgAA3AQAIMcCAAAVACARAwAA6QMAIAYAAOoDACANAADrAwAg5AEAAIEDACDlAQAAgQMAIOoBAACBAwAg6wEAAIEDACDsAQAAgQMAIO0BAACBAwAg8QEAAIEDACCZAgAAgQMAIJsCAACBAwAgnAIAAIEDACCdAgAAgQMAIJ4CAACBAwAgoQIAAIEDACCiAgAAgQMAIAAAAAAABckCCAAAAAHMAggAAAABzQIIAAAAAc4CCAAAAAHPAggAAAABBRsAANUEACAcAADZBAAgwwIAANYEACDEAgAA2AQAIMcCAACYAQAgCxsAAL0DADAcAADCAwAwwwIAAL4DADDEAgAAvwMAMMUCAADBAwAwxgIAAMEDADDHAgAAwQMAMMgCAADAAwAgyQIAAMEDADDKAgAAwwMAMMsCAADEAwAwJwMAAKMDACAGAACgAwAgCAAAoQMAIMoBAQAAAAHLAQEAAAABzQEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQAAAAHTAQAAANMBAtQBAgAAAAHVAQEAAAAB1wEAAADXAQLZAQAAANkBA9oBAQAAAAHbAQEAAAAB3AEBAAAAAd0BAQAAAAHeAQEAAAAB3wEBAAAAAeABAQAAAAHhAQEAAAAB4gEBAAAAAeMBAQAAAAHkAQEAAAAB5QEBAAAAAeYBAQAAAAHnAQEAAAAB6AEBAAAAAekBAQAAAAHqAQEAAAAB6wEBAAAAAewBAQAAAAHtAQEAAAAB7gEgAAAAAe8BQAAAAAHwAUAAAAAB8QFAAAAAAQIAAAAVACAbAADIAwAgAwAAABUAIBsAAMgDACAcAADHAwAgARQAANcEADAsAwAA5gIAIAYAAOcCACAIAAD9AgAgDAAA_gIAIMcBAAD7AgAwyAEAAA8AEMkBAAD7AgAwygEBAAAAAcsBAQDJAgAhzAEBAMkCACHNAQEAAAABzgEBAMkCACHPAQEAyQIAIdABAQDJAgAh0QEBAAAAAdMBAADkAtMBItQBAgDQAgAh1QEBAMkCACHXAQAA4gLXASLZAQAA_ALZASPaAQEA0wIAIdsBAQDTAgAh3AEBANMCACHdAQEA0wIAId4BAQDJAgAh3wEBAMkCACHgAQEAyQIAIeEBAQDJAgAh4gEBAMkCACHjAQEAyQIAIeQBAQDTAgAh5QEBANMCACHmAQEAyQIAIecBAQDTAgAh6AEBANMCACHpAQEA0wIAIeoBAQDJAgAh6wEBANMCACHsAQEA0wIAIe0BAQDTAgAh7gEgAMoCACHvAUAAywIAIfABQADLAgAh8QFAAMwCACECAAAAFQAgFAAAxwMAIAIAAADFAwAgFAAAxgMAICjHAQAAxAMAMMgBAADFAwAQyQEAAMQDADDKAQEAyQIAIcsBAQDJAgAhzAEBAMkCACHNAQEAyQIAIc4BAQDJAgAhzwEBAMkCACHQAQEAyQIAIdEBAQDJAgAh0wEAAOQC0wEi1AECANACACHVAQEAyQIAIdcBAADiAtcBItkBAAD8AtkBI9oBAQDTAgAh2wEBANMCACHcAQEA0wIAId0BAQDTAgAh3gEBAMkCACHfAQEAyQIAIeABAQDJAgAh4QEBAMkCACHiAQEAyQIAIeMBAQDJAgAh5AEBANMCACHlAQEA0wIAIeYBAQDJAgAh5wEBANMCACHoAQEA0wIAIekBAQDTAgAh6gEBAMkCACHrAQEA0wIAIewBAQDTAgAh7QEBANMCACHuASAAygIAIe8BQADLAgAh8AFAAMsCACHxAUAAzAIAISjHAQAAxAMAMMgBAADFAwAQyQEAAMQDADDKAQEAyQIAIcsBAQDJAgAhzAEBAMkCACHNAQEAyQIAIc4BAQDJAgAhzwEBAMkCACHQAQEAyQIAIdEBAQDJAgAh0wEAAOQC0wEi1AECANACACHVAQEAyQIAIdcBAADiAtcBItkBAAD8AtkBI9oBAQDTAgAh2wEBANMCACHcAQEA0wIAId0BAQDTAgAh3gEBAMkCACHfAQEAyQIAIeABAQDJAgAh4QEBAMkCACHiAQEAyQIAIeMBAQDJAgAh5AEBANMCACHlAQEA0wIAIeYBAQDJAgAh5wEBANMCACHoAQEA0wIAIekBAQDTAgAh6gEBAMkCACHrAQEA0wIAIewBAQDTAgAh7QEBANMCACHuASAAygIAIe8BQADLAgAh8AFAAMsCACHxAUAAzAIAISTKAQEAhwMAIcsBAQCHAwAhzQEBAIcDACHOAQEAhwMAIc8BAQCHAwAh0AEBAIcDACHRAQEAhwMAIdMBAACIA9MBItQBAgCJAwAh1QEBAIcDACHXAQAAigPXASLZAQAAiwPZASPaAQEAjAMAIdsBAQCMAwAh3AEBAIwDACHdAQEAjAMAId4BAQCHAwAh3wEBAIcDACHgAQEAhwMAIeEBAQCHAwAh4gEBAIcDACHjAQEAhwMAIeQBAQCMAwAh5QEBAIwDACHmAQEAhwMAIecBAQCMAwAh6AEBAIwDACHpAQEAjAMAIeoBAQCHAwAh6wEBAIwDACHsAQEAjAMAIe0BAQCMAwAh7gEgAI0DACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACEnAwAAkwMAIAYAAJADACAIAACRAwAgygEBAIcDACHLAQEAhwMAIc0BAQCHAwAhzgEBAIcDACHPAQEAhwMAIdABAQCHAwAh0QEBAIcDACHTAQAAiAPTASLUAQIAiQMAIdUBAQCHAwAh1wEAAIoD1wEi2QEAAIsD2QEj2gEBAIwDACHbAQEAjAMAIdwBAQCMAwAh3QEBAIwDACHeAQEAhwMAId8BAQCHAwAh4AEBAIcDACHhAQEAhwMAIeIBAQCHAwAh4wEBAIcDACHkAQEAjAMAIeUBAQCMAwAh5gEBAIcDACHnAQEAjAMAIegBAQCMAwAh6QEBAIwDACHqAQEAhwMAIesBAQCMAwAh7AEBAIwDACHtAQEAjAMAIe4BIACNAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhJwMAAKMDACAGAACgAwAgCAAAoQMAIMoBAQAAAAHLAQEAAAABzQEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQAAAAHTAQAAANMBAtQBAgAAAAHVAQEAAAAB1wEAAADXAQLZAQAAANkBA9oBAQAAAAHbAQEAAAAB3AEBAAAAAd0BAQAAAAHeAQEAAAAB3wEBAAAAAeABAQAAAAHhAQEAAAAB4gEBAAAAAeMBAQAAAAHkAQEAAAAB5QEBAAAAAeYBAQAAAAHnAQEAAAAB6AEBAAAAAekBAQAAAAHqAQEAAAAB6wEBAAAAAewBAQAAAAHtAQEAAAAB7gEgAAAAAe8BQAAAAAHwAUAAAAAB8QFAAAAAAQMbAADVBAAgwwIAANYEACDHAgAAmAEAIAQbAAC9AwAwwwIAAL4DADDHAgAAwQMAMMgCAADAAwAgAAAAAAAByQIAAADZAQIByQIAAACkAgIFGwAAzwQAIBwAANMEACDDAgAA0AQAIMQCAADSBAAgxwIAAAEAIAcbAADhAwAgHAAA5AMAIMMCAADiAwAgxAIAAOMDACDFAgAADQAgxgIAAA0AIMcCAADGAQAgCxsAANUDADAcAADaAwAwwwIAANYDADDEAgAA1wMAMMUCAADZAwAwxgIAANkDADDHAgAA2QMAMMgCAADYAwAgyQIAANkDADDKAgAA2wMAMMsCAADcAwAwCAoAAMoDACDKAQEAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABkwIgAAAAAZQCAQAAAAGVAggAAAABAgAAABsAIBsAAOADACADAAAAGwAgGwAA4AMAIBwAAN8DACABFAAA0QQAMA0JAAD6AgAgCgAA-AIAIMcBAAD5AgAwyAEAABkAEMkBAAD5AgAwygEBAAAAAe8BQADLAgAh8AFAAMsCACHxAUAAzAIAIZMCIADKAgAhlAIBAMkCACGVAggA4QIAIZYCAQDJAgAhAgAAABsAIBQAAN8DACACAAAA3QMAIBQAAN4DACALxwEAANwDADDIAQAA3QMAEMkBAADcAwAwygEBAMkCACHvAUAAywIAIfABQADLAgAh8QFAAMwCACGTAiAAygIAIZQCAQDJAgAhlQIIAOECACGWAgEAyQIAIQvHAQAA3AMAMMgBAADdAwAQyQEAANwDADDKAQEAyQIAIe8BQADLAgAh8AFAAMsCACHxAUAAzAIAIZMCIADKAgAhlAIBAMkCACGVAggA4QIAIZYCAQDJAgAhB8oBAQCHAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhkwIgAI0DACGUAgEAhwMAIZUCCAC6AwAhCAoAALwDACDKAQEAhwMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAIZMCIACNAwAhlAIBAIcDACGVAggAugMAIQgKAADKAwAgygEBAAAAAe8BQAAAAAHwAUAAAAAB8QFAAAAAAZMCIAAAAAGUAgEAAAABlQIIAAAAAQ8HAACzAwAgygEBAAAAAc0BAQAAAAHvAUAAAAAB8AFAAAAAAfEBQAAAAAGLAgEAAAABjAIBAAAAAY0CAQAAAAGOAgEAAAABjwIBAAAAAZACAQAAAAGRAgEAAAABkgIBAAAAAZMCIAAAAAECAAAAxgEAIBsAAOEDACADAAAADQAgGwAA4QMAIBwAAOUDACARAAAADQAgBwAAsgMAIBQAAOUDACDKAQEAhwMAIc0BAQCMAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhiwIBAIwDACGMAgEAjAMAIY0CAQCMAwAhjgIBAIwDACGPAgEAjAMAIZACAQCMAwAhkQIBAIwDACGSAgEAjAMAIZMCIACNAwAhDwcAALIDACDKAQEAhwMAIc0BAQCMAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhiwIBAIwDACGMAgEAjAMAIY0CAQCMAwAhjgIBAIwDACGPAgEAjAMAIZACAQCMAwAhkQIBAIwDACGSAgEAjAMAIZMCIACNAwAhAxsAAM8EACDDAgAA0AQAIMcCAAABACADGwAA4QMAIMMCAADiAwAgxwIAAMYBACAEGwAA1QMAMMMCAADWAwAwxwIAANkDADDIAgAA2AMAIAcEAAC3BAAgBQAAuAQAIAkAALQDACAKAAC6BAAgDgAAuQQAIPEBAACBAwAgwAIAAIEDACANBwAAqQMAIAkAALQDACDNAQAAgQMAIPEBAACBAwAgigIAAIEDACCLAgAAgQMAIIwCAACBAwAgjQIAAIEDACCOAgAAgQMAII8CAACBAwAgkAIAAIEDACCRAgAAgQMAIJICAACBAwAgAAAAAAUbAADKBAAgHAAAzQQAIMMCAADLBAAgxAIAAMwEACDHAgAAAQAgAxsAAMoEACDDAgAAywQAIMcCAAABACAAAAAAAAAFGwAAxQQAIBwAAMgEACDDAgAAxgQAIMQCAADHBAAgxwIAAAEAIAMbAADFBAAgwwIAAMYEACDHAgAAAQAgAAAABRsAAMAEACAcAADDBAAgwwIAAMEEACDEAgAAwgQAIMcCAAABACADGwAAwAQAIMMCAADBBAAgxwIAAAEAIAAAAAHJAgAAAL0CAgsbAACmBAAwHAAAqwQAMMMCAACnBAAwxAIAAKgEADDFAgAAqgQAMMYCAACqBAAwxwIAAKoEADDIAgAAqQQAIMkCAACqBAAwygIAAKwEADDLAgAArQQAMAsbAACaBAAwHAAAnwQAMMMCAACbBAAwxAIAAJwEADDFAgAAngQAMMYCAACeBAAwxwIAAJ4EADDIAgAAnQQAIMkCAACeBAAwygIAAKAEADDLAgAAoQQAMAcbAACVBAAgHAAAmAQAIMMCAACWBAAgxAIAAJcEACDFAgAACwAgxgIAAAsAIMcCAACYAQAgBxsAAJAEACAcAACTBAAgwwIAAJEEACDEAgAAkgQAIMUCAAAeACDGAgAAHgAgxwIAAIABACALGwAAhwQAMBwAAIsEADDDAgAAiAQAMMQCAACJBAAwxQIAAMEDADDGAgAAwQMAMMcCAADBAwAwyAIAAIoEACDJAgAAwQMAMMoCAACMBAAwywIAAMQDADAnBgAAoAMAIAgAAKEDACAMAACiAwAgygEBAAAAAcwBAQAAAAHNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdMBAAAA0wEC1AECAAAAAdUBAQAAAAHXAQAAANcBAtkBAAAA2QED2gEBAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB5gEBAAAAAecBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuASAAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABAgAAABUAIBsAAI8EACADAAAAFQAgGwAAjwQAIBwAAI4EACABFAAAvwQAMAIAAAAVACAUAACOBAAgAgAAAMUDACAUAACNBAAgJMoBAQCHAwAhzAEBAIcDACHNAQEAhwMAIc4BAQCHAwAhzwEBAIcDACHQAQEAhwMAIdEBAQCHAwAh0wEAAIgD0wEi1AECAIkDACHVAQEAhwMAIdcBAACKA9cBItkBAACLA9kBI9oBAQCMAwAh2wEBAIwDACHcAQEAjAMAId0BAQCMAwAh3gEBAIcDACHfAQEAhwMAIeABAQCHAwAh4QEBAIcDACHiAQEAhwMAIeMBAQCHAwAh5AEBAIwDACHlAQEAjAMAIeYBAQCHAwAh5wEBAIwDACHoAQEAjAMAIekBAQCMAwAh6gEBAIcDACHrAQEAjAMAIewBAQCMAwAh7QEBAIwDACHuASAAjQMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAIScGAACQAwAgCAAAkQMAIAwAAJIDACDKAQEAhwMAIcwBAQCHAwAhzQEBAIcDACHOAQEAhwMAIc8BAQCHAwAh0AEBAIcDACHRAQEAhwMAIdMBAACIA9MBItQBAgCJAwAh1QEBAIcDACHXAQAAigPXASLZAQAAiwPZASPaAQEAjAMAIdsBAQCMAwAh3AEBAIwDACHdAQEAjAMAId4BAQCHAwAh3wEBAIcDACHgAQEAhwMAIeEBAQCHAwAh4gEBAIcDACHjAQEAhwMAIeQBAQCMAwAh5QEBAIwDACHmAQEAhwMAIecBAQCMAwAh6AEBAIwDACHpAQEAjAMAIeoBAQCHAwAh6wEBAIwDACHsAQEAjAMAIe0BAQCMAwAh7gEgAI0DACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACEnBgAAoAMAIAgAAKEDACAMAACiAwAgygEBAAAAAcwBAQAAAAHNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdMBAAAA0wEC1AECAAAAAdUBAQAAAAHXAQAAANcBAtkBAAAA2QED2gEBAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB5gEBAAAAAecBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuASAAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABCcoBAQAAAAHvAUAAAAAB8AFAAAAAAfEBQAAAAAGTAiAAAAABlAIBAAAAAakCAQAAAAGqAgEAAAABqwIBAAAAAQIAAACAAQAgGwAAkAQAIAMAAAAeACAbAACQBAAgHAAAlAQAIAsAAAAeACAUAACUBAAgygEBAIcDACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACGTAiAAjQMAIZQCAQCHAwAhqQIBAIcDACGqAgEAjAMAIasCAQCMAwAhCcoBAQCHAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhkwIgAI0DACGUAgEAhwMAIakCAQCHAwAhqgIBAIwDACGrAgEAjAMAISQGAADnAwAgDQAA6AMAIMoBAQAAAAHOAQEAAAAB0wEAAADTAQLXAQAAANcBAtkBAAAA2QEC4gEBAAAAAeMBAQAAAAHkAQEAAAAB5QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuASAAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAAB_gEBAAAAAYICAQAAAAGKAgEAAAABlwIBAAAAAZgCAQAAAAGZAgEAAAABmgIIAAAAAZsCAQAAAAGcAgEAAAABnQIBAAAAAZ4CAQAAAAGfAgEAAAABoAIBAAAAAaECAQAAAAGiAgEAAAABpAIAAACkAgKlAgEAAAABAgAAAJgBACAbAACVBAAgAwAAAAsAIBsAAJUEACAcAACZBAAgJgAAAAsAIAYAANMDACANAADUAwAgFAAAmQQAIMoBAQCHAwAhzgEBAIcDACHTAQAAiAPTASLXAQAAigPXASLZAQAA0APZASLiAQEAhwMAIeMBAQCHAwAh5AEBAIwDACHlAQEAjAMAIeoBAQCMAwAh6wEBAIwDACHsAQEAjAMAIe0BAQCMAwAh7gEgAI0DACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACH-AQEAhwMAIYICAQCHAwAhigIBAIcDACGXAgEAhwMAIZgCAQCHAwAhmQIBAIwDACGaAggAugMAIZsCAQCMAwAhnAIBAIwDACGdAgEAjAMAIZ4CAQCMAwAhnwIBAIcDACGgAgEAhwMAIaECAQCMAwAhogIBAIwDACGkAgAA0QOkAiKlAgEAhwMAISQGAADTAwAgDQAA1AMAIMoBAQCHAwAhzgEBAIcDACHTAQAAiAPTASLXAQAAigPXASLZAQAA0APZASLiAQEAhwMAIeMBAQCHAwAh5AEBAIwDACHlAQEAjAMAIeoBAQCMAwAh6wEBAIwDACHsAQEAjAMAIe0BAQCMAwAh7gEgAI0DACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACH-AQEAhwMAIYICAQCHAwAhigIBAIcDACGXAgEAhwMAIZgCAQCHAwAhmQIBAIwDACGaAggAugMAIZsCAQCMAwAhnAIBAIwDACGdAgEAjAMAIZ4CAQCMAwAhnwIBAIcDACGgAgEAhwMAIaECAQCMAwAhogIBAIwDACGkAgAA0QOkAiKlAgEAhwMAIQzKAQEAAAAB7wFAAAAAAfABQAAAAAGvAgEAAAABsAIBAAAAAbECAQAAAAGyAgEAAAABswIBAAAAAbQCQAAAAAG1AkAAAAABtgIBAAAAAbcCAQAAAAECAAAACQAgGwAApQQAIAMAAAAJACAbAAClBAAgHAAApAQAIAEUAAC-BAAwEQMAAOYCACDHAQAA_wIAMMgBAAAHABDJAQAA_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_AiAAAAABwAIBAAAAAQIAAAABACAbAADABAAgAwAAACUAIBsAAMAEACAcAADEBAAgEgAAACUAIAUAAIMEACAJAACEBAAgCgAAhgQAIA4AAIUEACAUAADEBAAgygEBAIcDACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACGTAiAAjQMAIZQCAQCHAwAhqQIBAIcDACG7AgAA0QOkAiK9AgAAgQS9AiK-AiAAjQMAIb8CIACNAwAhwAIBAIwDACEQBQAAgwQAIAkAAIQEACAKAACGBAAgDgAAhQQAIMoBAQCHAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhkwIgAI0DACGUAgEAhwMAIakCAQCHAwAhuwIAANEDpAIivQIAAIEEvQIivgIgAI0DACG_AiAAjQMAIcACAQCMAwAhEAQAALIEACAJAAC0BAAgCgAAtgQAIA4AALUEACDKAQEAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABkwIgAAAAAZQCAQAAAAGpAgEAAAABuwIAAACkAgK9AgAAAL0CAr4CIAAAAAG_AiAAAAABwAIBAAAAAQIAAAABACAbAADFBAAgAwAAACUAIBsAAMUEACAcAADJBAAgEgAAACUAIAQAAIIEACAJAACEBAAgCgAAhgQAIA4AAIUEACAUAADJBAAgygEBAIcDACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACGTAiAAjQMAIZQCAQCHAwAhqQIBAIcDACG7AgAA0QOkAiK9AgAAgQS9AiK-AiAAjQMAIb8CIACNAwAhwAIBAIwDACEQBAAAggQAIAkAAIQEACAKAACGBAAgDgAAhQQAIMoBAQCHAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhkwIgAI0DACGUAgEAhwMAIakCAQCHAwAhuwIAANEDpAIivQIAAIEEvQIivgIgAI0DACG_AiAAjQMAIcACAQCMAwAhEAQAALIEACAFAACzBAAgCQAAtAQAIAoAALYEACDKAQEAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABkwIgAAAAAZQCAQAAAAGpAgEAAAABuwIAAACkAgK9AgAAAL0CAr4CIAAAAAG_AiAAAAABwAIBAAAAAQIAAAABACAbAADKBAAgAwAAACUAIBsAAMoEACAcAADOBAAgEgAAACUAIAQAAIIEACAFAACDBAAgCQAAhAQAIAoAAIYEACAUAADOBAAgygEBAIcDACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACGTAiAAjQMAIZQCAQCHAwAhqQIBAIcDACG7AgAA0QOkAiK9AgAAgQS9AiK-AiAAjQMAIb8CIACNAwAhwAIBAIwDACEQBAAAggQAIAUAAIMEACAJAACEBAAgCgAAhgQAIMoBAQCHAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhkwIgAI0DACGUAgEAhwMAIakCAQCHAwAhuwIAANEDpAIivQIAAIEEvQIivgIgAI0DACG_AiAAjQMAIcACAQCMAwAhEAQAALIEACAFAACzBAAgCgAAtgQAIA4AALUEACDKAQEAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABkwIgAAAAAZQCAQAAAAGpAgEAAAABuwIAAACkAgK9AgAAAL0CAr4CIAAAAAG_AiAAAAABwAIBAAAAAQIAAAABACAbAADPBAAgB8oBAQAAAAHvAUAAAAAB8AFAAAAAAfEBQAAAAAGTAiAAAAABlAIBAAAAAZUCCAAAAAEDAAAAJQAgGwAAzwQAIBwAANQEACASAAAAJQAgBAAAggQAIAUAAIMEACAKAACGBAAgDgAAhQQAIBQAANQEACDKAQEAhwMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAIZMCIACNAwAhlAIBAIcDACGpAgEAhwMAIbsCAADRA6QCIr0CAACBBL0CIr4CIACNAwAhvwIgAI0DACHAAgEAjAMAIRAEAACCBAAgBQAAgwQAIAoAAIYEACAOAACFBAAgygEBAIcDACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACGTAiAAjQMAIZQCAQCHAwAhqQIBAIcDACG7AgAA0QOkAiK9AgAAgQS9AiK-AiAAjQMAIb8CIACNAwAhwAIBAIwDACElAwAA5gMAIAYAAOcDACDKAQEAAAABywEBAAAAAc4BAQAAAAHTAQAAANMBAtcBAAAA1wEC2QEAAADZAQLiAQEAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB6gEBAAAAAesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BIAAAAAHvAUAAAAAB8AFAAAAAAfEBQAAAAAH-AQEAAAABggIBAAAAAYoCAQAAAAGXAgEAAAABmAIBAAAAAZkCAQAAAAGaAggAAAABmwIBAAAAAZwCAQAAAAGdAgEAAAABngIBAAAAAZ8CAQAAAAGgAgEAAAABoQIBAAAAAaICAQAAAAGkAgAAAKQCAqUCAQAAAAECAAAAmAEAIBsAANUEACAkygEBAAAAAcsBAQAAAAHNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdMBAAAA0wEC1AECAAAAAdUBAQAAAAHXAQAAANcBAtkBAAAA2QED2gEBAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB5gEBAAAAAecBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuASAAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABAwAAAAsAIBsAANUEACAcAADaBAAgJwAAAAsAIAMAANIDACAGAADTAwAgFAAA2gQAIMoBAQCHAwAhywEBAIcDACHOAQEAhwMAIdMBAACIA9MBItcBAACKA9cBItkBAADQA9kBIuIBAQCHAwAh4wEBAIcDACHkAQEAjAMAIeUBAQCMAwAh6gEBAIwDACHrAQEAjAMAIewBAQCMAwAh7QEBAIwDACHuASAAjQMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAIf4BAQCHAwAhggIBAIcDACGKAgEAhwMAIZcCAQCHAwAhmAIBAIcDACGZAgEAjAMAIZoCCAC6AwAhmwIBAIwDACGcAgEAjAMAIZ0CAQCMAwAhngIBAIwDACGfAgEAhwMAIaACAQCHAwAhoQIBAIwDACGiAgEAjAMAIaQCAADRA6QCIqUCAQCHAwAhJQMAANIDACAGAADTAwAgygEBAIcDACHLAQEAhwMAIc4BAQCHAwAh0wEAAIgD0wEi1wEAAIoD1wEi2QEAANAD2QEi4gEBAIcDACHjAQEAhwMAIeQBAQCMAwAh5QEBAIwDACHqAQEAjAMAIesBAQCMAwAh7AEBAIwDACHtAQEAjAMAIe4BIACNAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAh_gEBAIcDACGCAgEAhwMAIYoCAQCHAwAhlwIBAIcDACGYAgEAhwMAIZkCAQCMAwAhmgIIALoDACGbAgEAjAMAIZwCAQCMAwAhnQIBAIwDACGeAgEAjAMAIZ8CAQCHAwAhoAIBAIcDACGhAgEAjAMAIaICAQCMAwAhpAIAANEDpAIipQIBAIcDACEoAwAAowMAIAgAAKEDACAMAACiAwAgygEBAAAAAcsBAQAAAAHMAQEAAAABzQEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQAAAAHTAQAAANMBAtQBAgAAAAHVAQEAAAAB1wEAAADXAQLZAQAAANkBA9oBAQAAAAHbAQEAAAAB3AEBAAAAAd0BAQAAAAHeAQEAAAAB3wEBAAAAAeABAQAAAAHhAQEAAAAB4gEBAAAAAeMBAQAAAAHkAQEAAAAB5QEBAAAAAeYBAQAAAAHnAQEAAAAB6AEBAAAAAekBAQAAAAHqAQEAAAAB6wEBAAAAAewBAQAAAAHtAQEAAAAB7gEgAAAAAe8BQAAAAAHwAUAAAAAB8QFAAAAAAQIAAAAVACAbAADbBAAgAwAAAA8AIBsAANsEACAcAADfBAAgKgAAAA8AIAMAAJMDACAIAACRAwAgDAAAkgMAIBQAAN8EACDKAQEAhwMAIcsBAQCHAwAhzAEBAIcDACHNAQEAhwMAIc4BAQCHAwAhzwEBAIcDACHQAQEAhwMAIdEBAQCHAwAh0wEAAIgD0wEi1AECAIkDACHVAQEAhwMAIdcBAACKA9cBItkBAACLA9kBI9oBAQCMAwAh2wEBAIwDACHcAQEAjAMAId0BAQCMAwAh3gEBAIcDACHfAQEAhwMAIeABAQCHAwAh4QEBAIcDACHiAQEAhwMAIeMBAQCHAwAh5AEBAIwDACHlAQEAjAMAIeYBAQCHAwAh5wEBAIwDACHoAQEAjAMAIekBAQCMAwAh6gEBAIcDACHrAQEAjAMAIewBAQCMAwAh7QEBAIwDACHuASAAjQMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAISgDAACTAwAgCAAAkQMAIAwAAJIDACDKAQEAhwMAIcsBAQCHAwAhzAEBAIcDACHNAQEAhwMAIc4BAQCHAwAhzwEBAIcDACHQAQEAhwMAIdEBAQCHAwAh0wEAAIgD0wEi1AECAIkDACHVAQEAhwMAIdcBAACKA9cBItkBAACLA9kBI9oBAQCMAwAh2wEBAIwDACHcAQEAjAMAId0BAQCMAwAh3gEBAIcDACHfAQEAhwMAIeABAQCHAwAh4QEBAIcDACHiAQEAhwMAIeMBAQCHAwAh5AEBAIwDACHlAQEAjAMAIeYBAQCHAwAh5wEBAIwDACHoAQEAjAMAIekBAQCMAwAh6gEBAIcDACHrAQEAjAMAIewBAQCMAwAh7QEBAIwDACHuASAAjQMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAISgDAACjAwAgBgAAoAMAIAwAAKIDACDKAQEAAAABywEBAAAAAcwBAQAAAAHNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdMBAAAA0wEC1AECAAAAAdUBAQAAAAHXAQAAANcBAtkBAAAA2QED2gEBAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAQEAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB5gEBAAAAAecBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuASAAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABAgAAABUAIBsAAOAEACADAAAADwAgGwAA4AQAIBwAAOQEACAqAAAADwAgAwAAkwMAIAYAAJADACAMAACSAwAgFAAA5AQAIMoBAQCHAwAhywEBAIcDACHMAQEAhwMAIc0BAQCHAwAhzgEBAIcDACHPAQEAhwMAIdABAQCHAwAh0QEBAIcDACHTAQAAiAPTASLUAQIAiQMAIdUBAQCHAwAh1wEAAIoD1wEi2QEAAIsD2QEj2gEBAIwDACHbAQEAjAMAIdwBAQCMAwAh3QEBAIwDACHeAQEAhwMAId8BAQCHAwAh4AEBAIcDACHhAQEAhwMAIeIBAQCHAwAh4wEBAIcDACHkAQEAjAMAIeUBAQCMAwAh5gEBAIcDACHnAQEAjAMAIegBAQCMAwAh6QEBAIwDACHqAQEAhwMAIesBAQCMAwAh7AEBAIwDACHtAQEAjAMAIe4BIACNAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhKAMAAJMDACAGAACQAwAgDAAAkgMAIMoBAQCHAwAhywEBAIcDACHMAQEAhwMAIc0BAQCHAwAhzgEBAIcDACHPAQEAhwMAIdABAQCHAwAh0QEBAIcDACHTAQAAiAPTASLUAQIAiQMAIdUBAQCHAwAh1wEAAIoD1wEi2QEAAIsD2QEj2gEBAIwDACHbAQEAjAMAIdwBAQCMAwAh3QEBAIwDACHeAQEAhwMAId8BAQCHAwAh4AEBAIcDACHhAQEAhwMAIeIBAQCHAwAh4wEBAIcDACHkAQEAjAMAIeUBAQCMAwAh5gEBAIcDACHnAQEAjAMAIegBAQCMAwAh6QEBAIwDACHqAQEAhwMAIesBAQCMAwAh7AEBAIwDACHtAQEAjAMAIe4BIACNAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAhEAQAALIEACAFAACzBAAgCQAAtAQAIA4AALUEACDKAQEAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABkwIgAAAAAZQCAQAAAAGpAgEAAAABuwIAAACkAgK9AgAAAL0CAr4CIAAAAAG_AiAAAAABwAIBAAAAAQIAAAABACAbAADlBAAgCQkAAMkDACDKAQEAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAABkwIgAAAAAZQCAQAAAAGVAggAAAABlgIBAAAAAQIAAAAbACAbAADnBAAgJQMAAOYDACANAADoAwAgygEBAAAAAcsBAQAAAAHOAQEAAAAB0wEAAADTAQLXAQAAANcBAtkBAAAA2QEC4gEBAAAAAeMBAQAAAAHkAQEAAAAB5QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuASAAAAAB7wFAAAAAAfABQAAAAAHxAUAAAAAB_gEBAAAAAYICAQAAAAGKAgEAAAABlwIBAAAAAZgCAQAAAAGZAgEAAAABmgIIAAAAAZsCAQAAAAGcAgEAAAABnQIBAAAAAZ4CAQAAAAGfAgEAAAABoAIBAAAAAaECAQAAAAGiAgEAAAABpAIAAACkAgKlAgEAAAABAgAAAJgBACAbAADpBAAgAwAAAAsAIBsAAOkEACAcAADtBAAgJwAAAAsAIAMAANIDACANAADUAwAgFAAA7QQAIMoBAQCHAwAhywEBAIcDACHOAQEAhwMAIdMBAACIA9MBItcBAACKA9cBItkBAADQA9kBIuIBAQCHAwAh4wEBAIcDACHkAQEAjAMAIeUBAQCMAwAh6gEBAIwDACHrAQEAjAMAIewBAQCMAwAh7QEBAIwDACHuASAAjQMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAIf4BAQCHAwAhggIBAIcDACGKAgEAhwMAIZcCAQCHAwAhmAIBAIcDACGZAgEAjAMAIZoCCAC6AwAhmwIBAIwDACGcAgEAjAMAIZ0CAQCMAwAhngIBAIwDACGfAgEAhwMAIaACAQCHAwAhoQIBAIwDACGiAgEAjAMAIaQCAADRA6QCIqUCAQCHAwAhJQMAANIDACANAADUAwAgygEBAIcDACHLAQEAhwMAIc4BAQCHAwAh0wEAAIgD0wEi1wEAAIoD1wEi2QEAANAD2QEi4gEBAIcDACHjAQEAhwMAIeQBAQCMAwAh5QEBAIwDACHqAQEAjAMAIesBAQCMAwAh7AEBAIwDACHtAQEAjAMAIe4BIACNAwAh7wFAAI4DACHwAUAAjgMAIfEBQACPAwAh_gEBAIcDACGCAgEAhwMAIYoCAQCHAwAhlwIBAIcDACGYAgEAhwMAIZkCAQCMAwAhmgIIALoDACGbAgEAjAMAIZwCAQCMAwAhnQIBAIwDACGeAgEAjAMAIZ8CAQCHAwAhoAIBAIcDACGhAgEAjAMAIaICAQCMAwAhpAIAANEDpAIipQIBAIcDACEDAAAAJQAgGwAA5QQAIBwAAPAEACASAAAAJQAgBAAAggQAIAUAAIMEACAJAACEBAAgDgAAhQQAIBQAAPAEACDKAQEAhwMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAIZMCIACNAwAhlAIBAIcDACGpAgEAhwMAIbsCAADRA6QCIr0CAACBBL0CIr4CIACNAwAhvwIgAI0DACHAAgEAjAMAIRAEAACCBAAgBQAAgwQAIAkAAIQEACAOAACFBAAgygEBAIcDACHvAUAAjgMAIfABQACOAwAh8QFAAI8DACGTAiAAjQMAIZQCAQCHAwAhqQIBAIcDACG7AgAA0QOkAiK9AgAAgQS9AiK-AiAAjQMAIb8CIACNAwAhwAIBAIwDACEDAAAAGQAgGwAA5wQAIBwAAPMEACALAAAAGQAgCQAAuwMAIBQAAPMEACDKAQEAhwMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAIZMCIACNAwAhlAIBAIcDACGVAggAugMAIZYCAQCHAwAhCQkAALsDACDKAQEAhwMAIe8BQACOAwAh8AFAAI4DACHxAUAAjwMAIZMCIACNAwAhlAIBAIcDACGVAggAugMAIZYCAQCHAwAhBgQGAgUKAwkMBAogBgsADA4fCwEDAAEBAwABBAMAAQYOBQsACg0cCAIHEAYJGAQEAwABBhEFCBMHDAAIAQcABgMJAAQKFgYLAAkBChcAAQ0dAAEDAAEDBCEABSIACiMAAAAAAwsAESEAEiIAEwAAAAMLABEhABIiABMBAwABAQMAAQMLABghABkiABoAAAADCwAYIQAZIgAaAQMAAQEDAAEDCwAfIQAgIgAhAAAAAwsAHyEAICIAIQAAAAMLACchACgiACkAAAADCwAnIQAoIgApAQMAAQEDAAEDCwAuIQAvIgAwAAAAAwsALiEALyIAMAEDAAEBAwABBQsANSEAOCIAOXMANnQANwAAAAAABQsANSEAOCIAOXMANnQANwEJAAQBCQAEBQsAPiEAQSIAQnMAP3QAQAAAAAAABQsAPiEAQSIAQnMAP3QAQAIH0gEGCdMBBAIH2QEGCdoBBAMLAEchAEgiAEkAAAADCwBHIQBIIgBJAAAABQsATyEAUiIAU3MAUHQAUQAAAAAABQsATyEAUiIAU3MAUHQAUQEHAAYBBwAGAwsAWCEAWSIAWgAAAAMLAFghAFkiAFoCAwABDAAIAgMAAQwACAULAF8hAGIiAGNzAGB0AGEAAAAAAAULAF8hAGIiAGNzAGB0AGEPAgEQJAERJwESKAETKQEVKwEWLQ0XLg4YMAEZMg0aMw8dNAEeNQEfNg0jORAkOhQlOwImPAInPQIoPgIpPwIqQQIrQw0sRBUtRgIuSA0vSRYwSgIxSwIyTA0zTxc0UBs1UQM2UgM3UwM4VAM5VQM6VwM7WQ08Whw9XAM-Xg0_Xx1AYANBYQNCYg1DZR5EZiJFaCNGaSNHbCNIbSNJbiNKcCNLcg1McyRNdSNOdw1PeCVQeSNReiNSew1TfiZUfypVgQELVoIBC1eEAQtYhQELWYYBC1qIAQtbigENXIsBK12NAQtejwENX5ABLGCRAQthkgELYpMBDWOWAS1klwExZZkBBGaaAQRnnAEEaJ0BBGmeAQRqoAEEa6IBDWyjATJtpQEEbqcBDW-oATNwqQEEcaoBBHKrAQ11rgE0dq8BOnewAQh4sQEIebIBCHqzAQh7tAEIfLYBCH24AQ1-uQE7f7sBCIABvQENgQG-ATyCAb8BCIMBwAEIhAHBAQ2FAcQBPYYBxQFDhwHHAQWIAcgBBYkBygEFigHLAQWLAcwBBYwBzgEFjQHQAQ2OAdEBRI8B1QEFkAHXAQ2RAdgBRZIB2wEFkwHcAQWUAd0BDZUB4AFGlgHhAUqXAeMBS5gB5AFLmQHnAUuaAegBS5sB6QFLnAHrAUudAe0BDZ4B7gFMnwHwAUugAfIBDaEB8wFNogH0AUujAfUBS6QB9gENpQH5AU6mAfoBVKcB_AEHqAH9AQepAf8BB6oBgAIHqwGBAgesAYMCB60BhQINrgGGAlWvAYgCB7ABigINsQGLAlayAYwCB7MBjQIHtAGOAg21AZECV7YBkgJbtwGTAga4AZQCBrkBlQIGugGWAga7AZcCBrwBmQIGvQGbAg2-AZwCXL8BngIGwAGgAg3BAaECXcIBogIGwwGjAgbEAaQCDcUBpwJexgGoAmQ"
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
  SequenceScalarFieldEnum: () => SequenceScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  StudentScalarFieldEnum: () => StudentScalarFieldEnum,
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
  Student: "Student"
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
import { Router as Router5 } from "express";

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
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam?.split(",").map((field) => field.trim());
      this.selectFields = {};
      fieldsArray?.forEach((field) => {
        if (this.selectFields) {
          this.selectFields[field] = true;
        }
      });
      this.query.select = this.selectFields;
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
  const data = result.data.map((classItem) => {
    const totalStudents = 25;
    const boys = Math.floor(Math.random() * (totalStudents + 1));
    const girls = totalStudents - boys;
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

// src/app/modules/student/student.routes.ts
import { Router as Router4 } from "express";

// src/app/modules/student/student.controller.ts
import status15 from "http-status";

// src/app/modules/student/student.service.ts
import status14 from "http-status";

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
    filterableFields: studentFilterableFields
  });
  const result = await queryBuilder.search().filter().where({ isdeleted: false }).select({
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
  }).paginate().sort().execute();
  const data = result.data;
  return {
    ...result,
    data: data.map(({ user, ...student }) => ({
      ...student,
      email: user.email
    }))
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
    throw new AppError_default(status14.NOT_FOUND, "Student Not found");
  }
  if (!student?.address) {
    throw new AppError_default(status14.NOT_FOUND, "Student address not found");
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
    user: { email },
    ...studenData
  } = student;
  const formattedStudent = {
    ...studenData,
    ...guardianInfo,
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
      status14.CONFLICT,
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
    throw new AppError_default(status14.NOT_FOUND, "Student not found");
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
    throw new AppError_default(status14.NOT_FOUND, "Student Profile not found");
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
  deleteStudent
};

// src/app/modules/student/student.validation.ts
import z4 from "zod";
var createStudentSchema = z4.object({
  fullName: z4.string({ error: "Student Name is required" }).min(1, { error: "Student Name can't be empty" }),
  fullNameBangla: z4.string({ error: "Student Name Bangla is required" }).min(1, { error: "Student Name Bangla can't be empty" }),
  dateOfBirth: z4.string({ error: "Date of birth is required" }).min(1, { error: "Date of birth can't be empty" }),
  birthRegistrationNumber: z4.string({ error: "Birth Registration Number is required" }).min(1, { error: "Birth Registration Number can't be empty" }),
  religion: z4.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }),
  gender: z4.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }),
  bloodGroup: z4.enum(BloodGroup, {
    error: "BloodGroup must be one of: " + Object.values(BloodGroup).join(", ")
  }).optional(),
  classId: z4.string({ error: "Class Id is required" }).min(1, { error: "Class Id can't be empty" }),
  fatherName: z4.string({ error: "Father name is required" }).min(1, { error: "Father Name can't be emptry" }),
  fatherNameBangla: z4.string({ error: "Father name Bangla is required" }).min(1, { error: "Father Name Bangla can't be empty" }),
  fatherMobileNumber: z4.string({ error: "Father Mobile Number is required" }),
  whatsappNumber: z4.string({ error: "Whatsapp number is required" }).min(1, { error: "Whatsapp Number can't be empty" }),
  fatherOccupation: z4.string({ error: "Father Occupation is required" }).min(1, { error: "Father Occupation can't be empty" }),
  motherName: z4.string({ error: "Mother Name is required" }).min(1, { error: "Mother Name Bangla can't be empty" }),
  motherNameBangla: z4.string({ error: "Mother Name Bangla is required" }).min(1, { error: "Mother Name Bangla can't be empty" }),
  motherMobileNumber: z4.string({ error: "Mother Mobile Number is required" }),
  motherOccupation: z4.string({ error: "Mother Occupation is required" }).min(1, { error: "Mother Occupation can't be empty" }),
  email: z4.email({ error: "Please provide a valid email address" }),
  guardianName: z4.string({ error: "Guardian Name is required" }).min(1, { error: "Guardian Name can't be empty" }),
  guardianRelationship: z4.string({ error: "Guardian Relationship is required" }).min(1, { error: "Guardian Relationship can't be empty" }),
  guardianMobile: z4.string({ error: "Guardian Mobile number is required" }).min(11, { error: "Guardian Mobile must be minimum 11 digit" }),
  admissionTotalFees: z4.coerce.number({
    error: "Total Fees of Admission and Other Expenses is required "
  }),
  admissionDate: z4.string({ error: "Admission date is required" }).min(1, "Admission date can't be empty"),
  previousInstitute: z4.string().optional(),
  endingClass: z4.string().optional(),
  result: z4.string().optional(),
  testimonialNumber: z4.string().optional(),
  address: z4.object({
    present: presentAddressSchema,
    permanent: permanentAddressSchema
  })
});
var updateStudentSchema = z4.object({
  fullName: z4.string().optional(),
  fullNameBangla: z4.string().optional(),
  dateOfBirth: z4.string().optional(),
  birthRegistrationNumber: z4.string().optional(),
  religion: z4.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }).optional(),
  gender: z4.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }).optional(),
  bloodGroup: z4.enum(BloodGroup, {
    error: "BloodGroup must be one of: " + Object.values(BloodGroup).join(", ")
  }).optional(),
  classId: z4.string().optional(),
  fatherName: z4.string().optional(),
  fatherNameBangla: z4.string().optional(),
  fatherMobileNumber: z4.string().optional(),
  whatsappNumber: z4.string().optional(),
  fatherOccupation: z4.string().optional(),
  motherName: z4.string().optional(),
  motherNameBangla: z4.string().optional(),
  motherMobileNumber: z4.string().optional(),
  motherOccupation: z4.string().optional(),
  email: z4.email({ error: "Please provide a valid email address" }).optional(),
  guardianName: z4.string().optional(),
  guardianRelationship: z4.string().optional(),
  guardianMobile: z4.string().optional(),
  admissionTotalFees: z4.coerce.number().optional(),
  admissionDate: z4.string().optional(),
  previousInstitute: z4.string().optional(),
  endingClass: z4.string().optional(),
  result: z4.string().optional(),
  testimonialNumber: z4.string().optional(),
  address: z4.object({
    present: presentAddressSchema.partial().optional(),
    permanent: permanentAddressSchema.partial().optional()
  }).optional()
});

// src/app/modules/student/student.controller.ts
var getAllStudent2 = async (req, res) => {
  const query = req.query;
  const result = await StudentService.getAllStudent(query);
  sendResponse(res, {
    httpStatusCode: status15.OK,
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
    httpStatusCode: status15.OK,
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
    httpStatusCode: status15.CREATED,
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
    httpStatusCode: status15.OK,
    success: true,
    message: "Student Updated Successfully",
    data: student
  });
};
var deleteStudent2 = async (req, res) => {
  const { id } = req.params;
  const result = await StudentService.deleteStudent(id);
  sendResponse(res, {
    httpStatusCode: status15.OK,
    success: true,
    message: result.message || "Student Profile Deleted Successfully"
  });
};
var studentController = {
  getAllStudent: getAllStudent2,
  getStudentForUpdate: getStudentForUpdate2,
  createStudent: createStudent2,
  updateStudent: updateStudent2,
  deleteStudent: deleteStudent2
};

// src/app/modules/student/student.routes.ts
var router4 = Router4();
router4.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.getAllStudent
);
router4.get(
  "/:id/update",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  studentController.getStudentForUpdate
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
router4.delete(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  studentController.deleteStudent
);
var StudentRoutes = router4;

// src/app/routes/index.ts
var routes = Router5();
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