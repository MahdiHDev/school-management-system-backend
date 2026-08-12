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
var EmployeeRole = {
  PRINCIPAL: "PRINCIPAL",
  MANAGEMENT_STAFF: "MANAGEMENT_STAFF",
  TEACHER: "TEACHER",
  ACCOUNTANT: "ACCOUNTANT",
  STORE_MANAGER: "STORE_MANAGER",
  LIBRARIAN: "LIBRARIAN",
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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone String @unique\n\n  fullName         String\n  nid              String  @unique\n  fatherName       String\n  motherName       String\n  emergencyContact String?\n  monthlySalary    Float\n  employeeId       String  @unique\n\n  picture         String?\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  experience         String?\n  experiencePublicId String?\n  experienceName     String?\n  experienceType     String?\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  employeeSign         String\n  employeeSignPublicId String\n  employeeSignName     String?\n  employeeSignType     String?\n\n  gender                  Gender\n  bloodGroup              BloodGroup\n  religion                Religion\n  employeeRole            EmployeeRole\n  dateOfJoining           String\n  birthRegistrationNumber String?      @unique\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted     Boolean        @default(false)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  deletedAt     DateTime?\n  tutorProfiles TutorProfile[]\n  address       Address?\n\n  @@map("employee")\n}\n\nmodel TutorProfile {\n  id String @id @default(uuid())\n\n  classId    String\n  employeeId String\n\n  class    Class    @relation(fields: [classId], references: [id], onDelete: Cascade)\n  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n}\n\nmodel Class {\n  id               String @id @default(uuid())\n  name             String\n  monthlyTutionFee Float\n\n  isDeleted     Boolean        @default(false)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  deletedAt     DateTime?\n  tutorProfiles TutorProfile[]\n\n  @@map("class")\n}\n\nmodel Address {\n  id String @id @default(uuid())\n\n  studentId  String? @unique @map("student_id")\n  employeeId String? @unique @map("employee_id")\n\n  permanentAddressVillage    String?\n  permanentAddressPostOffice String?\n  permanentAddressPostCode   String?\n  permanentAddressDistrict   String?\n\n  presentAddressVillage    String?\n  presentAddressPostOffice String?\n  presentAddressPostCode   String?\n  presentAddressDistrict   String?\n\n  isDeleted Boolean @default(false)\n\n  // student  Student?  @relation(fields: [studentId], references: [id])\n  employee Employee? @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now()) @map("created_at")\n  updatedAt DateTime  @updatedAt @map("updated_at")\n  deletedAt DateTime? @map("deleted_at")\n}\n\nmodel Sequence {\n  id      String @id\n  current Int\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContact","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"String"},{"name":"experiencePublicId","kind":"scalar","type":"String"},{"name":"experienceName","kind":"scalar","type":"String"},{"name":"experienceType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"employeeSign","kind":"scalar","type":"String"},{"name":"employeeSignPublicId","kind":"scalar","type":"String"},{"name":"employeeSignName","kind":"scalar","type":"String"},{"name":"employeeSignType","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"EmployeeRole"},{"name":"dateOfJoining","kind":"scalar","type":"String"},{"name":"birthRegistrationNumber","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfiles","kind":"object","type":"TutorProfile","relationName":"EmployeeToTutorProfile"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToEmployee"}],"dbName":"employee"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToTutorProfile"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToTutorProfile"}],"dbName":null},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTutionFee","kind":"scalar","type":"Float"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfiles","kind":"object","type":"TutorProfile","relationName":"ClassToTutorProfile"}],"dbName":"class"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String","dbName":"student_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"permanentAddressVillage","kind":"scalar","type":"String"},{"name":"permanentAddressPostOffice","kind":"scalar","type":"String"},{"name":"permanentAddressPostCode","kind":"scalar","type":"String"},{"name":"permanentAddressDistrict","kind":"scalar","type":"String"},{"name":"presentAddressVillage","kind":"scalar","type":"String"},{"name":"presentAddressPostOffice","kind":"scalar","type":"String"},{"name":"presentAddressPostCode","kind":"scalar","type":"String"},{"name":"presentAddressDistrict","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"employee","kind":"object","type":"Employee","relationName":"AddressToEmployee"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"}],"dbName":null},"Sequence":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"current","kind":"scalar","type":"Int"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","tutorProfiles","_count","class","employee","address","admin","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","_avg","_sum","Employee.groupBy","Employee.aggregate","TutorProfile.findUnique","TutorProfile.findUniqueOrThrow","TutorProfile.findFirst","TutorProfile.findFirstOrThrow","TutorProfile.findMany","TutorProfile.createOne","TutorProfile.createMany","TutorProfile.createManyAndReturn","TutorProfile.updateOne","TutorProfile.updateMany","TutorProfile.updateManyAndReturn","TutorProfile.upsertOne","TutorProfile.deleteOne","TutorProfile.deleteMany","TutorProfile.groupBy","TutorProfile.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","Sequence.findUnique","Sequence.findUniqueOrThrow","Sequence.findFirst","Sequence.findFirstOrThrow","Sequence.findMany","Sequence.createOne","Sequence.createMany","Sequence.createManyAndReturn","Sequence.updateOne","Sequence.updateMany","Sequence.updateManyAndReturn","Sequence.upsertOne","Sequence.deleteOne","Sequence.deleteMany","Sequence.groupBy","Sequence.aggregate","AND","OR","NOT","id","current","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","studentId","employeeId","permanentAddressVillage","permanentAddressPostOffice","permanentAddressPostCode","permanentAddressDistrict","presentAddressVillage","presentAddressPostOffice","presentAddressPostCode","presentAddressDistrict","isDeleted","createdAt","updatedAt","deletedAt","name","monthlyTutionFee","every","some","none","classId","userId","phone","fullName","nid","fatherName","motherName","emergencyContact","monthlySalary","picture","picturePublicId","pictureName","pictureType","experience","experiencePublicId","experienceName","experienceType","authoritySign","authoritySignPublicId","authoritySignName","authoritySignType","employeeSign","employeeSignPublicId","employeeSignName","employeeSignType","Gender","gender","BloodGroup","bloodGroup","Religion","religion","EmployeeRole","employeeRole","dateOfJoining","birthRegistrationNumber","isdeleted","email","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","UserRole","role","UserStatus","status","needPasswordChange","emailVerified","image","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "kwRaoAETBAAA0wIAIAUAANQCACAJAACnAgAgCwAA1QIAILQBAADQAgAwtQEAABwAELYBAADQAgAwtwEBAAAAAc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh0gEBAJICACH7AQEAAAABjgIAANECjgIikAIAANICkAIikQIgAKQCACGSAiAApAIAIZMCAQCjAgAhAQAAAAEAIAwDAADBAgAgtAEAANoCADC1AQAAAwAQtgEAANoCADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIYACQAClAgAhigIBAJICACGLAgEAowIAIYwCAQCjAgAhAwMAAKYDACCLAgAA4gIAIIwCAADiAgAgDAMAAMECACC0AQAA2gIAMLUBAAADABC2AQAA2gIAMLcBAQAAAAHPAUAApQIAIdABQAClAgAh2AEBAJICACGAAkAApQIAIYoCAQAAAAGLAgEAowIAIYwCAQCjAgAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAADBAgAgtAEAANkCADC1AQAABwAQtgEAANkCADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIYECAQCSAgAhggIBAJICACGDAgEAowIAIYQCAQCjAgAhhQIBAKMCACGGAkAApgIAIYcCQACmAgAhiAIBAKMCACGJAgEAowIAIQgDAACmAwAggwIAAOICACCEAgAA4gIAIIUCAADiAgAghgIAAOICACCHAgAA4gIAIIgCAADiAgAgiQIAAOICACARAwAAwQIAILQBAADZAgAwtQEAAAcAELYBAADZAgAwtwEBAAAAAc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIYECAQCSAgAhggIBAJICACGDAgEAowIAIYQCAQCjAgAhhQIBAKMCACGGAkAApgIAIYcCQACmAgAhiAIBAKMCACGJAgEAowIAIQMAAAAHACABAAAIADACAAAJACAqAwAAwQIAIAYAAK0CACAKAADCAgAgtAEAALwCADC1AQAACwAQtgEAALwCADC3AQEAkgIAIcUBAQCSAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh2AEBAJICACHZAQEAkgIAIdoBAQCSAgAh2wEBAJICACHcAQEAkgIAId0BAQCSAgAh3gEBAKMCACHfAQgArAIAIeABAQCjAgAh4QEBAKMCACHiAQEAowIAIeMBAQCjAgAh5AEBAKMCACHlAQEAowIAIeYBAQCjAgAh5wEBAKMCACHoAQEAkgIAIekBAQCSAgAh6gEBAKMCACHrAQEAowIAIewBAQCSAgAh7QEBAJICACHuAQEAowIAIe8BAQCjAgAh8QEAAL0C8QEi8wEAAL4C8wEi9QEAAL8C9QEi9wEAAMAC9wEi-AEBAJICACH5AQEAowIAIfoBIACkAgAhAQAAAAsAIAgIAADXAgAgCQAA2AIAILQBAADWAgAwtQEAAA0AELYBAADWAgAwtwEBAJICACHFAQEAkgIAIdcBAQCSAgAhAggAAOwDACAJAADsAgAgCAgAANcCACAJAADYAgAgtAEAANYCADC1AQAADQAQtgEAANYCADC3AQEAAAABxQEBAJICACHXAQEAkgIAIQMAAAANACABAAAOADACAAAPACADAAAADQAgAQAADgAwAgAADwAgAQAAAA0AIBMJAACnAgAgtAEAAKICADC1AQAAEwAQtgEAAKICADC3AQEAkgIAIcQBAQCjAgAhxQEBAKMCACHGAQEAowIAIccBAQCjAgAhyAEBAKMCACHJAQEAowIAIcoBAQCjAgAhywEBAKMCACHMAQEAowIAIc0BAQCjAgAhzgEgAKQCACHPAUAApQIAIdABQAClAgAh0QFAAKYCACEBAAAAEwAgAQAAAAsAIAEAAAANACAOAwAAwQIAILQBAADEAgAwtQEAABcAELYBAADEAgAwtwEBAJICACHOASAApAIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIdIBAQCSAgAh2AEBAJICACH7AQEAkgIAIfwBAQCjAgAh_QEBAKMCACEBAAAAFwAgAQAAAAMAIAEAAAAHACABAAAAAQAgEwQAANMCACAFAADUAgAgCQAApwIAIAsAANUCACC0AQAA0AIAMLUBAAAcABC2AQAA0AIAMLcBAQCSAgAhzgEgAKQCACHPAUAApQIAIdABQAClAgAh0QFAAKYCACHSAQEAkgIAIfsBAQCSAgAhjgIAANECjgIikAIAANICkAIikQIgAKQCACGSAiAApAIAIZMCAQCjAgAhBgQAAOkDACAFAADqAwAgCQAA7AIAIAsAAOsDACDRAQAA4gIAIJMCAADiAgAgAwAAABwAIAEAAB0AMAIAAAEAIAMAAAAcACABAAAdADACAAABACADAAAAHAAgAQAAHQAwAgAAAQAgEAQAAOUDACAFAADmAwAgCQAA5wMAIAsAAOgDACC3AQEAAAABzgEgAAAAAc8BQAAAAAHQAUAAAAAB0QFAAAAAAdIBAQAAAAH7AQEAAAABjgIAAACOAgKQAgAAAJACApECIAAAAAGSAiAAAAABkwIBAAAAAQERAAAhACAMtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB-wEBAAAAAY4CAAAAjgICkAIAAACQAgKRAiAAAAABkgIgAAAAAZMCAQAAAAEBEQAAIwAwAREAACMAMBAEAAC_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_wEBAJICACGAAkAApQIAIQADAAAAYQAgAQAAYgAwAgAAXgAgAwAAAGEAIAEAAGIAMAIAAF4AIAMAAABhACABAABiADACAABeACAGtwEBAAAAAc8BQAAAAAHQAUAAAAAB_gEBAAAAAf8BAQAAAAGAAkAAAAABAREAAGYAIAa3AQEAAAABzwFAAAAAAdABQAAAAAH-AQEAAAAB_wEBAAAAAYACQAAAAAEBEQAAaAAwAREAAGgAMAa3AQEA4AIAIc8BQADoAgAh0AFAAOgCACH-AQEA4AIAIf8BAQDgAgAhgAJAAOgCACECAAAAXgAgEQAAawAgBrcBAQDgAgAhzwFAAOgCACHQAUAA6AIAIf4BAQDgAgAh_wEBAOACACGAAkAA6AIAIQIAAABhACARAABtACACAAAAYQAgEQAAbQAgAwAAAF4AIBgAAGYAIBkAAGsAIAEAAABeACABAAAAYQAgAwcAAK0DACAeAACvAwAgHwAArgMAIAm0AQAAxQIAMLUBAAB0ABC2AQAAxQIAMLcBAQCKAgAhzwFAAJcCACHQAUAAlwIAIf4BAQCKAgAh_wEBAIoCACGAAkAAlwIAIQMAAABhACABAABzADAdAAB0ACADAAAAYQAgAQAAYgAwAgAAXgAgDgMAAMECACC0AQAAxAIAMLUBAAAXABC2AQAAxAIAMLcBAQAAAAHOASAApAIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIdIBAQCSAgAh2AEBAAAAAfsBAQAAAAH8AQEAowIAIf0BAQCjAgAhAQAAAHcAIAEAAAB3ACAEAwAApgMAINEBAADiAgAg_AEAAOICACD9AQAA4gIAIAMAAAAXACABAAB6ADACAAB3ACADAAAAFwAgAQAAegAwAgAAdwAgAwAAABcAIAEAAHoAMAIAAHcAIAsDAACsAwAgtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB2AEBAAAAAfsBAQAAAAH8AQEAAAAB_QEBAAAAAQERAAB-ACAKtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB2AEBAAAAAfsBAQAAAAH8AQEAAAAB_QEBAAAAAQERAACAAQAwAREAAIABADALAwAAqwMAILcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIdgBAQDgAgAh-wEBAOACACH8AQEA5gIAIf0BAQDmAgAhAgAAAHcAIBEAAIMBACAKtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh2AEBAOACACH7AQEA4AIAIfwBAQDmAgAh_QEBAOYCACECAAAAFwAgEQAAhQEAIAIAAAAXACARAACFAQAgAwAAAHcAIBgAAH4AIBkAAIMBACABAAAAdwAgAQAAABcAIAYHAACoAwAgHgAAqgMAIB8AAKkDACDRAQAA4gIAIPwBAADiAgAg_QEAAOICACANtAEAAMMCADC1AQAAjAEAELYBAADDAgAwtwEBAIoCACHOASAAlgIAIc8BQACXAgAh0AFAAJcCACHRAUAAmAIAIdIBAQCKAgAh2AEBAIoCACH7AQEAigIAIfwBAQCVAgAh_QEBAJUCACEDAAAAFwAgAQAAiwEAMB0AAIwBACADAAAAFwAgAQAAegAwAgAAdwAgKgMAAMECACAGAACtAgAgCgAAwgIAILQBAAC8AgAwtQEAAAsAELYBAAC8AgAwtwEBAAAAAcUBAQAAAAHPAUAApQIAIdABQAClAgAh0QFAAKYCACHYAQEAAAAB2QEBAAAAAdoBAQCSAgAh2wEBAAAAAdwBAQCSAgAh3QEBAJICACHeAQEAowIAId8BCACsAgAh4AEBAKMCACHhAQEAowIAIeIBAQCjAgAh4wEBAKMCACHkAQEAowIAIeUBAQCjAgAh5gEBAKMCACHnAQEAowIAIegBAQCSAgAh6QEBAJICACHqAQEAowIAIesBAQCjAgAh7AEBAJICACHtAQEAkgIAIe4BAQCjAgAh7wEBAKMCACHxAQAAvQLxASLzAQAAvgLzASL1AQAAvwL1ASL3AQAAwAL3ASL4AQEAkgIAIfkBAQAAAAH6ASAApAIAIQEAAACPAQAgAQAAAI8BACASAwAApgMAIAYAAIMDACAKAACnAwAg0QEAAOICACDeAQAA4gIAIOABAADiAgAg4QEAAOICACDiAQAA4gIAIOMBAADiAgAg5AEAAOICACDlAQAA4gIAIOYBAADiAgAg5wEAAOICACDqAQAA4gIAIOsBAADiAgAg7gEAAOICACDvAQAA4gIAIPkBAADiAgAgAwAAAAsAIAEAAJIBADACAACPAQAgAwAAAAsAIAEAAJIBADACAACPAQAgAwAAAAsAIAEAAJIBADACAACPAQAgJwMAAKMDACAGAACkAwAgCgAApQMAILcBAQAAAAHFAQEAAAABzwFAAAAAAdABQAAAAAHRAUAAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAdwBAQAAAAHdAQEAAAAB3gEBAAAAAd8BCAAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQEAAAAB5AEBAAAAAeUBAQAAAAHmAQEAAAAB5wEBAAAAAegBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BAQAAAAHvAQEAAAAB8QEAAADxAQLzAQAAAPMBAvUBAAAA9QEC9wEAAAD3AQL4AQEAAAAB-QEBAAAAAfoBIAAAAAEBEQAAlgEAICS3AQEAAAABxQEBAAAAAc8BQAAAAAHQAUAAAAAB0QFAAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAQgAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB5gEBAAAAAecBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuAQEAAAAB7wEBAAAAAfEBAAAA8QEC8wEAAADzAQL1AQAAAPUBAvcBAAAA9wEC-AEBAAAAAfkBAQAAAAH6ASAAAAABAREAAJgBADABEQAAmAEAMCcDAACSAwAgBgAAkwMAIAoAAJQDACC3AQEA4AIAIcUBAQDgAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAh2AEBAOACACHZAQEA4AIAIdoBAQDgAgAh2wEBAOACACHcAQEA4AIAId0BAQDgAgAh3gEBAOYCACHfAQgA8gIAIeABAQDmAgAh4QEBAOYCACHiAQEA5gIAIeMBAQDmAgAh5AEBAOYCACHlAQEA5gIAIeYBAQDmAgAh5wEBAOYCACHoAQEA4AIAIekBAQDgAgAh6gEBAOYCACHrAQEA5gIAIewBAQDgAgAh7QEBAOACACHuAQEA5gIAIe8BAQDmAgAh8QEAAI4D8QEi8wEAAI8D8wEi9QEAAJAD9QEi9wEAAJED9wEi-AEBAOACACH5AQEA5gIAIfoBIADnAgAhAgAAAI8BACARAACbAQAgJLcBAQDgAgAhxQEBAOACACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHYAQEA4AIAIdkBAQDgAgAh2gEBAOACACHbAQEA4AIAIdwBAQDgAgAh3QEBAOACACHeAQEA5gIAId8BCADyAgAh4AEBAOYCACHhAQEA5gIAIeIBAQDmAgAh4wEBAOYCACHkAQEA5gIAIeUBAQDmAgAh5gEBAOYCACHnAQEA5gIAIegBAQDgAgAh6QEBAOACACHqAQEA5gIAIesBAQDmAgAh7AEBAOACACHtAQEA4AIAIe4BAQDmAgAh7wEBAOYCACHxAQAAjgPxASLzAQAAjwPzASL1AQAAkAP1ASL3AQAAkQP3ASL4AQEA4AIAIfkBAQDmAgAh-gEgAOcCACECAAAACwAgEQAAnQEAIAIAAAALACARAACdAQAgAwAAAI8BACAYAACWAQAgGQAAmwEAIAEAAACPAQAgAQAAAAsAIBQHAACJAwAgHgAAjAMAIB8AAIsDACBwAACKAwAgcQAAjQMAINEBAADiAgAg3gEAAOICACDgAQAA4gIAIOEBAADiAgAg4gEAAOICACDjAQAA4gIAIOQBAADiAgAg5QEAAOICACDmAQAA4gIAIOcBAADiAgAg6gEAAOICACDrAQAA4gIAIO4BAADiAgAg7wEAAOICACD5AQAA4gIAICe0AQAArwIAMLUBAACkAQAQtgEAAK8CADC3AQEAigIAIcUBAQCKAgAhzwFAAJcCACHQAUAAlwIAIdEBQACYAgAh2AEBAIoCACHZAQEAigIAIdoBAQCKAgAh2wEBAIoCACHcAQEAigIAId0BAQCKAgAh3gEBAJUCACHfAQgAqQIAIeABAQCVAgAh4QEBAJUCACHiAQEAlQIAIeMBAQCVAgAh5AEBAJUCACHlAQEAlQIAIeYBAQCVAgAh5wEBAJUCACHoAQEAigIAIekBAQCKAgAh6gEBAJUCACHrAQEAlQIAIewBAQCKAgAh7QEBAIoCACHuAQEAlQIAIe8BAQCVAgAh8QEAALAC8QEi8wEAALEC8wEi9QEAALIC9QEi9wEAALMC9wEi-AEBAIoCACH5AQEAlQIAIfoBIACWAgAhAwAAAAsAIAEAAKMBADAdAACkAQAgAwAAAAsAIAEAAJIBADACAACPAQAgAQAAAA8AIAEAAAAPACADAAAADQAgAQAADgAwAgAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIAMAAAANACABAAAOADACAAAPACAFCAAAiAMAIAkAAIEDACC3AQEAAAABxQEBAAAAAdcBAQAAAAEBEQAArAEAIAO3AQEAAAABxQEBAAAAAdcBAQAAAAEBEQAArgEAMAERAACuAQAwBQgAAIcDACAJAAD_AgAgtwEBAOACACHFAQEA4AIAIdcBAQDgAgAhAgAAAA8AIBEAALEBACADtwEBAOACACHFAQEA4AIAIdcBAQDgAgAhAgAAAA0AIBEAALMBACACAAAADQAgEQAAswEAIAMAAAAPACAYAACsAQAgGQAAsQEAIAEAAAAPACABAAAADQAgAwcAAIQDACAeAACGAwAgHwAAhQMAIAa0AQAArgIAMLUBAAC6AQAQtgEAAK4CADC3AQEAigIAIcUBAQCKAgAh1wEBAIoCACEDAAAADQAgAQAAuQEAMB0AALoBACADAAAADQAgAQAADgAwAgAADwAgCwYAAK0CACC0AQAAqwIAMLUBAADAAQAQtgEAAKsCADC3AQEAAAABzgEgAKQCACHPAUAApQIAIdABQAClAgAh0QFAAKYCACHSAQEAkgIAIdMBCACsAgAhAQAAAL0BACABAAAAvQEAIAsGAACtAgAgtAEAAKsCADC1AQAAwAEAELYBAACrAgAwtwEBAJICACHOASAApAIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIdIBAQCSAgAh0wEIAKwCACECBgAAgwMAINEBAADiAgAgAwAAAMABACABAADBAQAwAgAAvQEAIAMAAADAAQAgAQAAwQEAMAIAAL0BACADAAAAwAEAIAEAAMEBADACAAC9AQAgCAYAAIIDACC3AQEAAAABzgEgAAAAAc8BQAAAAAHQAUAAAAAB0QFAAAAAAdIBAQAAAAHTAQgAAAABAREAAMUBACAHtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB0wEIAAAAAQERAADHAQAwAREAAMcBADAIBgAA8wIAILcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIdMBCADyAgAhAgAAAL0BACARAADKAQAgB7cBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIdMBCADyAgAhAgAAAMABACARAADMAQAgAgAAAMABACARAADMAQAgAwAAAL0BACAYAADFAQAgGQAAygEAIAEAAAC9AQAgAQAAAMABACAGBwAA7QIAIB4AAPACACAfAADvAgAgcAAA7gIAIHEAAPECACDRAQAA4gIAIAq0AQAAqAIAMLUBAADTAQAQtgEAAKgCADC3AQEAigIAIc4BIACWAgAhzwFAAJcCACHQAUAAlwIAIdEBQACYAgAh0gEBAIoCACHTAQgAqQIAIQMAAADAAQAgAQAA0gEAMB0AANMBACADAAAAwAEAIAEAAMEBADACAAC9AQAgEwkAAKcCACC0AQAAogIAMLUBAAATABC2AQAAogIAMLcBAQAAAAHEAQEAAAABxQEBAAAAAcYBAQCjAgAhxwEBAKMCACHIAQEAowIAIckBAQCjAgAhygEBAKMCACHLAQEAowIAIcwBAQCjAgAhzQEBAKMCACHOASAApAIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIQEAAADWAQAgAQAAANYBACAMCQAA7AIAIMQBAADiAgAgxQEAAOICACDGAQAA4gIAIMcBAADiAgAgyAEAAOICACDJAQAA4gIAIMoBAADiAgAgywEAAOICACDMAQAA4gIAIM0BAADiAgAg0QEAAOICACADAAAAEwAgAQAA2QEAMAIAANYBACADAAAAEwAgAQAA2QEAMAIAANYBACADAAAAEwAgAQAA2QEAMAIAANYBACAQCQAA6wIAILcBAQAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAAAABywEBAAAAAcwBAQAAAAHNAQEAAAABzgEgAAAAAc8BQAAAAAHQAUAAAAAB0QFAAAAAAQERAADdAQAgD7cBAQAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAAAABywEBAAAAAcwBAQAAAAHNAQEAAAABzgEgAAAAAc8BQAAAAAHQAUAAAAAB0QFAAAAAAQERAADfAQAwAREAAN8BADABAAAACwAgEAkAAOoCACC3AQEA4AIAIcQBAQDmAgAhxQEBAOYCACHGAQEA5gIAIccBAQDmAgAhyAEBAOYCACHJAQEA5gIAIcoBAQDmAgAhywEBAOYCACHMAQEA5gIAIc0BAQDmAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACECAAAA1gEAIBEAAOMBACAPtwEBAOACACHEAQEA5gIAIcUBAQDmAgAhxgEBAOYCACHHAQEA5gIAIcgBAQDmAgAhyQEBAOYCACHKAQEA5gIAIcsBAQDmAgAhzAEBAOYCACHNAQEA5gIAIc4BIADnAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAhAgAAABMAIBEAAOUBACACAAAAEwAgEQAA5QEAIAEAAAALACADAAAA1gEAIBgAAN0BACAZAADjAQAgAQAAANYBACABAAAAEwAgDgcAAOMCACAeAADlAgAgHwAA5AIAIMQBAADiAgAgxQEAAOICACDGAQAA4gIAIMcBAADiAgAgyAEAAOICACDJAQAA4gIAIMoBAADiAgAgywEAAOICACDMAQAA4gIAIM0BAADiAgAg0QEAAOICACAStAEAAJQCADC1AQAA7QEAELYBAACUAgAwtwEBAIoCACHEAQEAlQIAIcUBAQCVAgAhxgEBAJUCACHHAQEAlQIAIcgBAQCVAgAhyQEBAJUCACHKAQEAlQIAIcsBAQCVAgAhzAEBAJUCACHNAQEAlQIAIc4BIACWAgAhzwFAAJcCACHQAUAAlwIAIdEBQACYAgAhAwAAABMAIAEAAOwBADAdAADtAQAgAwAAABMAIAEAANkBADACAADWAQAgBbQBAACRAgAwtQEAAPMBABC2AQAAkQIAMLcBAQAAAAG4AQIAkwIAIQEAAADwAQAgAQAAAPABACAFtAEAAJECADC1AQAA8wEAELYBAACRAgAwtwEBAJICACG4AQIAkwIAIQADAAAA8wEAIAEAAPQBADACAADwAQAgAwAAAPMBACABAAD0AQAwAgAA8AEAIAMAAADzAQAgAQAA9AEAMAIAAPABACACtwEBAAAAAbgBAgAAAAEBEQAA-AEAIAK3AQEAAAABuAECAAAAAQERAAD6AQAwAREAAPoBADACtwEBAOACACG4AQIA4QIAIQIAAADwAQAgEQAA_QEAIAK3AQEA4AIAIbgBAgDhAgAhAgAAAPMBACARAAD_AQAgAgAAAPMBACARAAD_AQAgAwAAAPABACAYAAD4AQAgGQAA_QEAIAEAAADwAQAgAQAAAPMBACAFBwAA2wIAIB4AAN4CACAfAADdAgAgcAAA3AIAIHEAAN8CACAFtAEAAIkCADC1AQAAhgIAELYBAACJAgAwtwEBAIoCACG4AQIAiwIAIQMAAADzAQAgAQAAhQIAMB0AAIYCACADAAAA8wEAIAEAAPQBADACAADwAQAgBbQBAACJAgAwtQEAAIYCABC2AQAAiQIAMLcBAQCKAgAhuAECAIsCACEOBwAAjQIAIB4AAJACACAfAACQAgAguQEBAAAAAboBAQAAAAS7AQEAAAAEvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAQCPAgAhwQEBAAAAAcIBAQAAAAHDAQEAAAABDQcAAI0CACAeAACNAgAgHwAAjQIAIHAAAI4CACBxAACNAgAguQECAAAAAboBAgAAAAS7AQIAAAAEvAECAAAAAb0BAgAAAAG-AQIAAAABvwECAAAAAcABAgCMAgAhDQcAAI0CACAeAACNAgAgHwAAjQIAIHAAAI4CACBxAACNAgAguQECAAAAAboBAgAAAAS7AQIAAAAEvAECAAAAAb0BAgAAAAG-AQIAAAABvwECAAAAAcABAgCMAgAhCLkBAgAAAAG6AQIAAAAEuwECAAAABLwBAgAAAAG9AQIAAAABvgECAAAAAb8BAgAAAAHAAQIAjQIAIQi5AQgAAAABugEIAAAABLsBCAAAAAS8AQgAAAABvQEIAAAAAb4BCAAAAAG_AQgAAAABwAEIAI4CACEOBwAAjQIAIB4AAJACACAfAACQAgAguQEBAAAAAboBAQAAAAS7AQEAAAAEvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAQCPAgAhwQEBAAAAAcIBAQAAAAHDAQEAAAABC7kBAQAAAAG6AQEAAAAEuwEBAAAABLwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAkAIAIcEBAQAAAAHCAQEAAAABwwEBAAAAAQW0AQAAkQIAMLUBAADzAQAQtgEAAJECADC3AQEAkgIAIbgBAgCTAgAhC7kBAQAAAAG6AQEAAAAEuwEBAAAABLwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAkAIAIcEBAQAAAAHCAQEAAAABwwEBAAAAAQi5AQIAAAABugECAAAABLsBAgAAAAS8AQIAAAABvQECAAAAAb4BAgAAAAG_AQIAAAABwAECAI0CACEStAEAAJQCADC1AQAA7QEAELYBAACUAgAwtwEBAIoCACHEAQEAlQIAIcUBAQCVAgAhxgEBAJUCACHHAQEAlQIAIcgBAQCVAgAhyQEBAJUCACHKAQEAlQIAIcsBAQCVAgAhzAEBAJUCACHNAQEAlQIAIc4BIACWAgAhzwFAAJcCACHQAUAAlwIAIdEBQACYAgAhDgcAAJoCACAeAAChAgAgHwAAoQIAILkBAQAAAAG6AQEAAAAFuwEBAAAABbwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAoAIAIcEBAQAAAAHCAQEAAAABwwEBAAAAAQUHAACNAgAgHgAAnwIAIB8AAJ8CACC5ASAAAAABwAEgAJ4CACELBwAAjQIAIB4AAJ0CACAfAACdAgAguQFAAAAAAboBQAAAAAS7AUAAAAAEvAFAAAAAAb0BQAAAAAG-AUAAAAABvwFAAAAAAcABQACcAgAhCwcAAJoCACAeAACbAgAgHwAAmwIAILkBQAAAAAG6AUAAAAAFuwFAAAAABbwBQAAAAAG9AUAAAAABvgFAAAAAAb8BQAAAAAHAAUAAmQIAIQsHAACaAgAgHgAAmwIAIB8AAJsCACC5AUAAAAABugFAAAAABbsBQAAAAAW8AUAAAAABvQFAAAAAAb4BQAAAAAG_AUAAAAABwAFAAJkCACEIuQECAAAAAboBAgAAAAW7AQIAAAAFvAECAAAAAb0BAgAAAAG-AQIAAAABvwECAAAAAcABAgCaAgAhCLkBQAAAAAG6AUAAAAAFuwFAAAAABbwBQAAAAAG9AUAAAAABvgFAAAAAAb8BQAAAAAHAAUAAmwIAIQsHAACNAgAgHgAAnQIAIB8AAJ0CACC5AUAAAAABugFAAAAABLsBQAAAAAS8AUAAAAABvQFAAAAAAb4BQAAAAAG_AUAAAAABwAFAAJwCACEIuQFAAAAAAboBQAAAAAS7AUAAAAAEvAFAAAAAAb0BQAAAAAG-AUAAAAABvwFAAAAAAcABQACdAgAhBQcAAI0CACAeAACfAgAgHwAAnwIAILkBIAAAAAHAASAAngIAIQK5ASAAAAABwAEgAJ8CACEOBwAAmgIAIB4AAKECACAfAAChAgAguQEBAAAAAboBAQAAAAW7AQEAAAAFvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAQCgAgAhwQEBAAAAAcIBAQAAAAHDAQEAAAABC7kBAQAAAAG6AQEAAAAFuwEBAAAABbwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAoQIAIcEBAQAAAAHCAQEAAAABwwEBAAAAARMJAACnAgAgtAEAAKICADC1AQAAEwAQtgEAAKICADC3AQEAkgIAIcQBAQCjAgAhxQEBAKMCACHGAQEAowIAIccBAQCjAgAhyAEBAKMCACHJAQEAowIAIcoBAQCjAgAhywEBAKMCACHMAQEAowIAIc0BAQCjAgAhzgEgAKQCACHPAUAApQIAIdABQAClAgAh0QFAAKYCACELuQEBAAAAAboBAQAAAAW7AQEAAAAFvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEBAAAAAcABAQChAgAhwQEBAAAAAcIBAQAAAAHDAQEAAAABArkBIAAAAAHAASAAnwIAIQi5AUAAAAABugFAAAAABLsBQAAAAAS8AUAAAAABvQFAAAAAAb4BQAAAAAG_AUAAAAABwAFAAJ0CACEIuQFAAAAAAboBQAAAAAW7AUAAAAAFvAFAAAAAAb0BQAAAAAG-AUAAAAABvwFAAAAAAcABQACbAgAhLAMAAMECACAGAACtAgAgCgAAwgIAILQBAAC8AgAwtQEAAAsAELYBAAC8AgAwtwEBAJICACHFAQEAkgIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIdgBAQCSAgAh2QEBAJICACHaAQEAkgIAIdsBAQCSAgAh3AEBAJICACHdAQEAkgIAId4BAQCjAgAh3wEIAKwCACHgAQEAowIAIeEBAQCjAgAh4gEBAKMCACHjAQEAowIAIeQBAQCjAgAh5QEBAKMCACHmAQEAowIAIecBAQCjAgAh6AEBAJICACHpAQEAkgIAIeoBAQCjAgAh6wEBAKMCACHsAQEAkgIAIe0BAQCSAgAh7gEBAKMCACHvAQEAowIAIfEBAAC9AvEBIvMBAAC-AvMBIvUBAAC_AvUBIvcBAADAAvcBIvgBAQCSAgAh-QEBAKMCACH6ASAApAIAIZQCAAALACCVAgAACwAgCrQBAACoAgAwtQEAANMBABC2AQAAqAIAMLcBAQCKAgAhzgEgAJYCACHPAUAAlwIAIdABQACXAgAh0QFAAJgCACHSAQEAigIAIdMBCACpAgAhDQcAAI0CACAeAACOAgAgHwAAjgIAIHAAAI4CACBxAACOAgAguQEIAAAAAboBCAAAAAS7AQgAAAAEvAEIAAAAAb0BCAAAAAG-AQgAAAABvwEIAAAAAcABCACqAgAhDQcAAI0CACAeAACOAgAgHwAAjgIAIHAAAI4CACBxAACOAgAguQEIAAAAAboBCAAAAAS7AQgAAAAEvAEIAAAAAb0BCAAAAAG-AQgAAAABvwEIAAAAAcABCACqAgAhCwYAAK0CACC0AQAAqwIAMLUBAADAAQAQtgEAAKsCADC3AQEAkgIAIc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh0gEBAJICACHTAQgArAIAIQi5AQgAAAABugEIAAAABLsBCAAAAAS8AQgAAAABvQEIAAAAAb4BCAAAAAG_AQgAAAABwAEIAI4CACED1AEAAA0AINUBAAANACDWAQAADQAgBrQBAACuAgAwtQEAALoBABC2AQAArgIAMLcBAQCKAgAhxQEBAIoCACHXAQEAigIAISe0AQAArwIAMLUBAACkAQAQtgEAAK8CADC3AQEAigIAIcUBAQCKAgAhzwFAAJcCACHQAUAAlwIAIdEBQACYAgAh2AEBAIoCACHZAQEAigIAIdoBAQCKAgAh2wEBAIoCACHcAQEAigIAId0BAQCKAgAh3gEBAJUCACHfAQgAqQIAIeABAQCVAgAh4QEBAJUCACHiAQEAlQIAIeMBAQCVAgAh5AEBAJUCACHlAQEAlQIAIeYBAQCVAgAh5wEBAJUCACHoAQEAigIAIekBAQCKAgAh6gEBAJUCACHrAQEAlQIAIewBAQCKAgAh7QEBAIoCACHuAQEAlQIAIe8BAQCVAgAh8QEAALAC8QEi8wEAALEC8wEi9QEAALIC9QEi9wEAALMC9wEi-AEBAIoCACH5AQEAlQIAIfoBIACWAgAhBwcAAI0CACAeAAC7AgAgHwAAuwIAILkBAAAA8QECugEAAADxAQi7AQAAAPEBCMABAAC6AvEBIgcHAACNAgAgHgAAuQIAIB8AALkCACC5AQAAAPMBAroBAAAA8wEIuwEAAADzAQjAAQAAuALzASIHBwAAjQIAIB4AALcCACAfAAC3AgAguQEAAAD1AQK6AQAAAPUBCLsBAAAA9QEIwAEAALYC9QEiBwcAAI0CACAeAAC1AgAgHwAAtQIAILkBAAAA9wECugEAAAD3AQi7AQAAAPcBCMABAAC0AvcBIgcHAACNAgAgHgAAtQIAIB8AALUCACC5AQAAAPcBAroBAAAA9wEIuwEAAAD3AQjAAQAAtAL3ASIEuQEAAAD3AQK6AQAAAPcBCLsBAAAA9wEIwAEAALUC9wEiBwcAAI0CACAeAAC3AgAgHwAAtwIAILkBAAAA9QECugEAAAD1AQi7AQAAAPUBCMABAAC2AvUBIgS5AQAAAPUBAroBAAAA9QEIuwEAAAD1AQjAAQAAtwL1ASIHBwAAjQIAIB4AALkCACAfAAC5AgAguQEAAADzAQK6AQAAAPMBCLsBAAAA8wEIwAEAALgC8wEiBLkBAAAA8wECugEAAADzAQi7AQAAAPMBCMABAAC5AvMBIgcHAACNAgAgHgAAuwIAIB8AALsCACC5AQAAAPEBAroBAAAA8QEIuwEAAADxAQjAAQAAugLxASIEuQEAAADxAQK6AQAAAPEBCLsBAAAA8QEIwAEAALsC8QEiKgMAAMECACAGAACtAgAgCgAAwgIAILQBAAC8AgAwtQEAAAsAELYBAAC8AgAwtwEBAJICACHFAQEAkgIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIdgBAQCSAgAh2QEBAJICACHaAQEAkgIAIdsBAQCSAgAh3AEBAJICACHdAQEAkgIAId4BAQCjAgAh3wEIAKwCACHgAQEAowIAIeEBAQCjAgAh4gEBAKMCACHjAQEAowIAIeQBAQCjAgAh5QEBAKMCACHmAQEAowIAIecBAQCjAgAh6AEBAJICACHpAQEAkgIAIeoBAQCjAgAh6wEBAKMCACHsAQEAkgIAIe0BAQCSAgAh7gEBAKMCACHvAQEAowIAIfEBAAC9AvEBIvMBAAC-AvMBIvUBAAC_AvUBIvcBAADAAvcBIvgBAQCSAgAh-QEBAKMCACH6ASAApAIAIQS5AQAAAPEBAroBAAAA8QEIuwEAAADxAQjAAQAAuwLxASIEuQEAAADzAQK6AQAAAPMBCLsBAAAA8wEIwAEAALkC8wEiBLkBAAAA9QECugEAAAD1AQi7AQAAAPUBCMABAAC3AvUBIgS5AQAAAPcBAroBAAAA9wEIuwEAAAD3AQjAAQAAtQL3ASIVBAAA0wIAIAUAANQCACAJAACnAgAgCwAA1QIAILQBAADQAgAwtQEAABwAELYBAADQAgAwtwEBAJICACHOASAApAIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIdIBAQCSAgAh-wEBAJICACGOAgAA0QKOAiKQAgAA0gKQAiKRAiAApAIAIZICIACkAgAhkwIBAKMCACGUAgAAHAAglQIAABwAIBUJAACnAgAgtAEAAKICADC1AQAAEwAQtgEAAKICADC3AQEAkgIAIcQBAQCjAgAhxQEBAKMCACHGAQEAowIAIccBAQCjAgAhyAEBAKMCACHJAQEAowIAIcoBAQCjAgAhywEBAKMCACHMAQEAowIAIc0BAQCjAgAhzgEgAKQCACHPAUAApQIAIdABQAClAgAh0QFAAKYCACGUAgAAEwAglQIAABMAIA20AQAAwwIAMLUBAACMAQAQtgEAAMMCADC3AQEAigIAIc4BIACWAgAhzwFAAJcCACHQAUAAlwIAIdEBQACYAgAh0gEBAIoCACHYAQEAigIAIfsBAQCKAgAh_AEBAJUCACH9AQEAlQIAIQ4DAADBAgAgtAEAAMQCADC1AQAAFwAQtgEAAMQCADC3AQEAkgIAIc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh0gEBAJICACHYAQEAkgIAIfsBAQCSAgAh_AEBAKMCACH9AQEAowIAIQm0AQAAxQIAMLUBAAB0ABC2AQAAxQIAMLcBAQCKAgAhzwFAAJcCACHQAUAAlwIAIf4BAQCKAgAh_wEBAIoCACGAAkAAlwIAIQm0AQAAxgIAMLUBAABhABC2AQAAxgIAMLcBAQCSAgAhzwFAAKUCACHQAUAApQIAIf4BAQCSAgAh_wEBAJICACGAAkAApQIAIRC0AQAAxwIAMLUBAABbABC2AQAAxwIAMLcBAQCKAgAhzwFAAJcCACHQAUAAlwIAIdgBAQCKAgAhgQIBAIoCACGCAgEAigIAIYMCAQCVAgAhhAIBAJUCACGFAgEAlQIAIYYCQACYAgAhhwJAAJgCACGIAgEAlQIAIYkCAQCVAgAhC7QBAADIAgAwtQEAAEUAELYBAADIAgAwtwEBAIoCACHPAUAAlwIAIdABQACXAgAh2AEBAIoCACGAAkAAlwIAIYoCAQCKAgAhiwIBAJUCACGMAgEAlQIAIQ-0AQAAyQIAMLUBAAAvABC2AQAAyQIAMLcBAQCKAgAhzgEgAJYCACHPAUAAlwIAIdABQACXAgAh0QFAAJgCACHSAQEAigIAIfsBAQCKAgAhjgIAAMoCjgIikAIAAMsCkAIikQIgAJYCACGSAiAAlgIAIZMCAQCVAgAhBwcAAI0CACAeAADPAgAgHwAAzwIAILkBAAAAjgICugEAAACOAgi7AQAAAI4CCMABAADOAo4CIgcHAACNAgAgHgAAzQIAIB8AAM0CACC5AQAAAJACAroBAAAAkAIIuwEAAACQAgjAAQAAzAKQAiIHBwAAjQIAIB4AAM0CACAfAADNAgAguQEAAACQAgK6AQAAAJACCLsBAAAAkAIIwAEAAMwCkAIiBLkBAAAAkAICugEAAACQAgi7AQAAAJACCMABAADNApACIgcHAACNAgAgHgAAzwIAIB8AAM8CACC5AQAAAI4CAroBAAAAjgIIuwEAAACOAgjAAQAAzgKOAiIEuQEAAACOAgK6AQAAAI4CCLsBAAAAjgIIwAEAAM8CjgIiEwQAANMCACAFAADUAgAgCQAApwIAIAsAANUCACC0AQAA0AIAMLUBAAAcABC2AQAA0AIAMLcBAQCSAgAhzgEgAKQCACHPAUAApQIAIdABQAClAgAh0QFAAKYCACHSAQEAkgIAIfsBAQCSAgAhjgIAANECjgIikAIAANICkAIikQIgAKQCACGSAiAApAIAIZMCAQCjAgAhBLkBAAAAjgICugEAAACOAgi7AQAAAI4CCMABAADPAo4CIgS5AQAAAJACAroBAAAAkAIIuwEAAACQAgjAAQAAzQKQAiID1AEAAAMAINUBAAADACDWAQAAAwAgA9QBAAAHACDVAQAABwAg1gEAAAcAIBADAADBAgAgtAEAAMQCADC1AQAAFwAQtgEAAMQCADC3AQEAkgIAIc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh0gEBAJICACHYAQEAkgIAIfsBAQCSAgAh_AEBAKMCACH9AQEAowIAIZQCAAAXACCVAgAAFwAgCAgAANcCACAJAADYAgAgtAEAANYCADC1AQAADQAQtgEAANYCADC3AQEAkgIAIcUBAQCSAgAh1wEBAJICACENBgAArQIAILQBAACrAgAwtQEAAMABABC2AQAAqwIAMLcBAQCSAgAhzgEgAKQCACHPAUAApQIAIdABQAClAgAh0QFAAKYCACHSAQEAkgIAIdMBCACsAgAhlAIAAMABACCVAgAAwAEAICwDAADBAgAgBgAArQIAIAoAAMICACC0AQAAvAIAMLUBAAALABC2AQAAvAIAMLcBAQCSAgAhxQEBAJICACHPAUAApQIAIdABQAClAgAh0QFAAKYCACHYAQEAkgIAIdkBAQCSAgAh2gEBAJICACHbAQEAkgIAIdwBAQCSAgAh3QEBAJICACHeAQEAowIAId8BCACsAgAh4AEBAKMCACHhAQEAowIAIeIBAQCjAgAh4wEBAKMCACHkAQEAowIAIeUBAQCjAgAh5gEBAKMCACHnAQEAowIAIegBAQCSAgAh6QEBAJICACHqAQEAowIAIesBAQCjAgAh7AEBAJICACHtAQEAkgIAIe4BAQCjAgAh7wEBAKMCACHxAQAAvQLxASLzAQAAvgLzASL1AQAAvwL1ASL3AQAAwAL3ASL4AQEAkgIAIfkBAQCjAgAh-gEgAKQCACGUAgAACwAglQIAAAsAIBEDAADBAgAgtAEAANkCADC1AQAABwAQtgEAANkCADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIYECAQCSAgAhggIBAJICACGDAgEAowIAIYQCAQCjAgAhhQIBAKMCACGGAkAApgIAIYcCQACmAgAhiAIBAKMCACGJAgEAowIAIQwDAADBAgAgtAEAANoCADC1AQAAAwAQtgEAANoCADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIYACQAClAgAhigIBAJICACGLAgEAowIAIYwCAQCjAgAhAAAAAAABmQIBAAAAAQWZAgIAAAABnwICAAAAAaACAgAAAAGhAgIAAAABogICAAAAAQAAAAABmQIBAAAAAQGZAiAAAAABAZkCQAAAAAEBmQJAAAAAAQcYAACPBAAgGQAAkgQAIJYCAACQBAAglwIAAJEEACCaAgAACwAgmwIAAAsAIJwCAACPAQAgAxgAAI8EACCWAgAAkAQAIJwCAACPAQAgEgMAAKYDACAGAACDAwAgCgAApwMAINEBAADiAgAg3gEAAOICACDgAQAA4gIAIOEBAADiAgAg4gEAAOICACDjAQAA4gIAIOQBAADiAgAg5QEAAOICACDmAQAA4gIAIOcBAADiAgAg6gEAAOICACDrAQAA4gIAIO4BAADiAgAg7wEAAOICACD5AQAA4gIAIAAAAAAABZkCCAAAAAGfAggAAAABoAIIAAAAAaECCAAAAAGiAggAAAABCxgAAPQCADAZAAD5AgAwlgIAAPUCADCXAgAA9gIAMJgCAAD3AgAgmQIAAPgCADCaAgAA-AIAMJsCAAD4AgAwnAIAAPgCADCdAgAA-gIAMJ4CAAD7AgAwAwkAAIEDACC3AQEAAAABxQEBAAAAAQIAAAAPACAYAACAAwAgAwAAAA8AIBgAAIADACAZAAD-AgAgAREAAI4EADAICAAA1wIAIAkAANgCACC0AQAA1gIAMLUBAAANABC2AQAA1gIAMLcBAQAAAAHFAQEAkgIAIdcBAQCSAgAhAgAAAA8AIBEAAP4CACACAAAA_AIAIBEAAP0CACAGtAEAAPsCADC1AQAA_AIAELYBAAD7AgAwtwEBAJICACHFAQEAkgIAIdcBAQCSAgAhBrQBAAD7AgAwtQEAAPwCABC2AQAA-wIAMLcBAQCSAgAhxQEBAJICACHXAQEAkgIAIQK3AQEA4AIAIcUBAQDgAgAhAwkAAP8CACC3AQEA4AIAIcUBAQDgAgAhBRgAAIkEACAZAACMBAAglgIAAIoEACCXAgAAiwQAIJwCAACPAQAgAwkAAIEDACC3AQEAAAABxQEBAAAAAQMYAACJBAAglgIAAIoEACCcAgAAjwEAIAQYAAD0AgAwlgIAAPUCADCYAgAA9wIAIJwCAAD4AgAwAAAAAAUYAACEBAAgGQAAhwQAIJYCAACFBAAglwIAAIYEACCcAgAAvQEAIAMYAACEBAAglgIAAIUEACCcAgAAvQEAIAAAAAAAAZkCAAAA8QECAZkCAAAA8wECAZkCAAAA9QECAZkCAAAA9wECBRgAAP4DACAZAACCBAAglgIAAP8DACCXAgAAgQQAIJwCAAABACALGAAAmgMAMBkAAJ4DADCWAgAAmwMAMJcCAACcAwAwmAIAAJ0DACCZAgAA-AIAMJoCAAD4AgAwmwIAAPgCADCcAgAA-AIAMJ0CAACfAwAwngIAAPsCADAHGAAAlQMAIBkAAJgDACCWAgAAlgMAIJcCAACXAwAgmgIAABMAIJsCAAATACCcAgAA1gEAIA63AQEAAAABxAEBAAAAAcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAAAABywEBAAAAAcwBAQAAAAHNAQEAAAABzgEgAAAAAc8BQAAAAAHQAUAAAAAB0QFAAAAAAQIAAADWAQAgGAAAlQMAIAMAAAATACAYAACVAwAgGQAAmQMAIBAAAAATACARAACZAwAgtwEBAOACACHEAQEA5gIAIcYBAQDmAgAhxwEBAOYCACHIAQEA5gIAIckBAQDmAgAhygEBAOYCACHLAQEA5gIAIcwBAQDmAgAhzQEBAOYCACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIQ63AQEA4AIAIcQBAQDmAgAhxgEBAOYCACHHAQEA5gIAIcgBAQDmAgAhyQEBAOYCACHKAQEA5gIAIcsBAQDmAgAhzAEBAOYCACHNAQEA5gIAIc4BIADnAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAhAwgAAIgDACC3AQEAAAAB1wEBAAAAAQIAAAAPACAYAACiAwAgAwAAAA8AIBgAAKIDACAZAAChAwAgAREAAIAEADACAAAADwAgEQAAoQMAIAIAAAD8AgAgEQAAoAMAIAK3AQEA4AIAIdcBAQDgAgAhAwgAAIcDACC3AQEA4AIAIdcBAQDgAgAhAwgAAIgDACC3AQEAAAAB1wEBAAAAAQMYAAD-AwAglgIAAP8DACCcAgAAAQAgBBgAAJoDADCWAgAAmwMAMJgCAACdAwAgnAIAAPgCADADGAAAlQMAIJYCAACWAwAgnAIAANYBACAGBAAA6QMAIAUAAOoDACAJAADsAgAgCwAA6wMAINEBAADiAgAgkwIAAOICACAMCQAA7AIAIMQBAADiAgAgxQEAAOICACDGAQAA4gIAIMcBAADiAgAgyAEAAOICACDJAQAA4gIAIMoBAADiAgAgywEAAOICACDMAQAA4gIAIM0BAADiAgAg0QEAAOICACAAAAAFGAAA-QMAIBkAAPwDACCWAgAA-gMAIJcCAAD7AwAgnAIAAAEAIAMYAAD5AwAglgIAAPoDACCcAgAAAQAgAAAAAAAABRgAAPQDACAZAAD3AwAglgIAAPUDACCXAgAA9gMAIJwCAAABACADGAAA9AMAIJYCAAD1AwAgnAIAAAEAIAAAAAUYAADvAwAgGQAA8gMAIJYCAADwAwAglwIAAPEDACCcAgAAAQAgAxgAAO8DACCWAgAA8AMAIJwCAAABACAAAAABmQIAAACOAgIBmQIAAACQAgILGAAA2QMAMBkAAN4DADCWAgAA2gMAMJcCAADbAwAwmAIAANwDACCZAgAA3QMAMJoCAADdAwAwmwIAAN0DADCcAgAA3QMAMJ0CAADfAwAwngIAAOADADALGAAAzQMAMBkAANIDADCWAgAAzgMAMJcCAADPAwAwmAIAANADACCZAgAA0QMAMJoCAADRAwAwmwIAANEDADCcAgAA0QMAMJ0CAADTAwAwngIAANQDADAHGAAAyAMAIBkAAMsDACCWAgAAyQMAIJcCAADKAwAgmgIAAAsAIJsCAAALACCcAgAAjwEAIAcYAADDAwAgGQAAxgMAIJYCAADEAwAglwIAAMUDACCaAgAAFwAgmwIAABcAIJwCAAB3ACAJtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB-wEBAAAAAfwBAQAAAAH9AQEAAAABAgAAAHcAIBgAAMMDACADAAAAFwAgGAAAwwMAIBkAAMcDACALAAAAFwAgEQAAxwMAILcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIfsBAQDgAgAh_AEBAOYCACH9AQEA5gIAIQm3AQEA4AIAIc4BIADnAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAh0gEBAOACACH7AQEA4AIAIfwBAQDmAgAh_QEBAOYCACElBgAApAMAIAoAAKUDACC3AQEAAAABxQEBAAAAAc8BQAAAAAHQAUAAAAAB0QFAAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAdwBAQAAAAHdAQEAAAAB3gEBAAAAAd8BCAAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQEAAAAB5AEBAAAAAeUBAQAAAAHmAQEAAAAB5wEBAAAAAegBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BAQAAAAHvAQEAAAAB8QEAAADxAQLzAQAAAPMBAvUBAAAA9QEC9wEAAAD3AQL4AQEAAAAB-QEBAAAAAfoBIAAAAAECAAAAjwEAIBgAAMgDACADAAAACwAgGAAAyAMAIBkAAMwDACAnAAAACwAgBgAAkwMAIAoAAJQDACARAADMAwAgtwEBAOACACHFAQEA4AIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdkBAQDgAgAh2gEBAOACACHbAQEA4AIAIdwBAQDgAgAh3QEBAOACACHeAQEA5gIAId8BCADyAgAh4AEBAOYCACHhAQEA5gIAIeIBAQDmAgAh4wEBAOYCACHkAQEA5gIAIeUBAQDmAgAh5gEBAOYCACHnAQEA5gIAIegBAQDgAgAh6QEBAOACACHqAQEA5gIAIesBAQDmAgAh7AEBAOACACHtAQEA4AIAIe4BAQDmAgAh7wEBAOYCACHxAQAAjgPxASLzAQAAjwPzASL1AQAAkAP1ASL3AQAAkQP3ASL4AQEA4AIAIfkBAQDmAgAh-gEgAOcCACElBgAAkwMAIAoAAJQDACC3AQEA4AIAIcUBAQDgAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAh2QEBAOACACHaAQEA4AIAIdsBAQDgAgAh3AEBAOACACHdAQEA4AIAId4BAQDmAgAh3wEIAPICACHgAQEA5gIAIeEBAQDmAgAh4gEBAOYCACHjAQEA5gIAIeQBAQDmAgAh5QEBAOYCACHmAQEA5gIAIecBAQDmAgAh6AEBAOACACHpAQEA4AIAIeoBAQDmAgAh6wEBAOYCACHsAQEA4AIAIe0BAQDgAgAh7gEBAOYCACHvAQEA5gIAIfEBAACOA_EBIvMBAACPA_MBIvUBAACQA_UBIvcBAACRA_cBIvgBAQDgAgAh-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_AEAAOICACD9AQAA4gIAIAIGAACDAwAg0QEAAOICACAHtwEBAAAAAc8BQAAAAAHQAUAAAAABgAJAAAAAAYoCAQAAAAGLAgEAAAABjAIBAAAAAQy3AQEAAAABzwFAAAAAAdABQAAAAAGBAgEAAAABggIBAAAAAYMCAQAAAAGEAgEAAAABhQIBAAAAAYYCQAAAAAGHAkAAAAABiAIBAAAAAYkCAQAAAAEPBQAA5gMAIAkAAOcDACALAADoAwAgtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB-wEBAAAAAY4CAAAAjgICkAIAAACQAgKRAiAAAAABkgIgAAAAAZMCAQAAAAECAAAAAQAgGAAA7wMAIAMAAAAcACAYAADvAwAgGQAA8wMAIBEAAAAcACAFAADAAwAgCQAAwQMAIAsAAMIDACARAADzAwAgtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh-wEBAOACACGOAgAAvQOOAiKQAgAAvgOQAiKRAiAA5wIAIZICIADnAgAhkwIBAOYCACEPBQAAwAMAIAkAAMEDACALAADCAwAgtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh-wEBAOACACGOAgAAvQOOAiKQAgAAvgOQAiKRAiAA5wIAIZICIADnAgAhkwIBAOYCACEPBAAA5QMAIAkAAOcDACALAADoAwAgtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB-wEBAAAAAY4CAAAAjgICkAIAAACQAgKRAiAAAAABkgIgAAAAAZMCAQAAAAECAAAAAQAgGAAA9AMAIAMAAAAcACAYAAD0AwAgGQAA-AMAIBEAAAAcACAEAAC_AwAgCQAAwQMAIAsAAMIDACARAAD4AwAgtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh-wEBAOACACGOAgAAvQOOAiKQAgAAvgOQAiKRAiAA5wIAIZICIADnAgAhkwIBAOYCACEPBAAAvwMAIAkAAMEDACALAADCAwAgtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh-wEBAOACACGOAgAAvQOOAiKQAgAAvgOQAiKRAiAA5wIAIZICIADnAgAhkwIBAOYCACEPBAAA5QMAIAUAAOYDACAJAADnAwAgtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB-wEBAAAAAY4CAAAAjgICkAIAAACQAgKRAiAAAAABkgIgAAAAAZMCAQAAAAECAAAAAQAgGAAA-QMAIAMAAAAcACAYAAD5AwAgGQAA_QMAIBEAAAAcACAEAAC_AwAgBQAAwAMAIAkAAMEDACARAAD9AwAgtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh-wEBAOACACGOAgAAvQOOAiKQAgAAvgOQAiKRAiAA5wIAIZICIADnAgAhkwIBAOYCACEPBAAAvwMAIAUAAMADACAJAADBAwAgtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh-wEBAOACACGOAgAAvQOOAiKQAgAAvgOQAiKRAiAA5wIAIZICIADnAgAhkwIBAOYCACEPBAAA5QMAIAUAAOYDACALAADoAwAgtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB-wEBAAAAAY4CAAAAjgICkAIAAACQAgKRAiAAAAABkgIgAAAAAZMCAQAAAAECAAAAAQAgGAAA_gMAIAK3AQEAAAAB1wEBAAAAAQMAAAAcACAYAAD-AwAgGQAAgwQAIBEAAAAcACAEAAC_AwAgBQAAwAMAIAsAAMIDACARAACDBAAgtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh-wEBAOACACGOAgAAvQOOAiKQAgAAvgOQAiKRAiAA5wIAIZICIADnAgAhkwIBAOYCACEPBAAAvwMAIAUAAMADACALAADCAwAgtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh-wEBAOACACGOAgAAvQOOAiKQAgAAvgOQAiKRAiAA5wIAIZICIADnAgAhkwIBAOYCACEHtwEBAAAAAc4BIAAAAAHPAUAAAAAB0AFAAAAAAdEBQAAAAAHSAQEAAAAB0wEIAAAAAQIAAAC9AQAgGAAAhAQAIAMAAADAAQAgGAAAhAQAIBkAAIgEACAJAAAAwAEAIBEAAIgEACC3AQEA4AIAIc4BIADnAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAh0gEBAOACACHTAQgA8gIAIQe3AQEA4AIAIc4BIADnAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAh0gEBAOACACHTAQgA8gIAISYDAACjAwAgCgAApQMAILcBAQAAAAHFAQEAAAABzwFAAAAAAdABQAAAAAHRAUAAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAdwBAQAAAAHdAQEAAAAB3gEBAAAAAd8BCAAAAAHgAQEAAAAB4QEBAAAAAeIBAQAAAAHjAQEAAAAB5AEBAAAAAeUBAQAAAAHmAQEAAAAB5wEBAAAAAegBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BAQAAAAHvAQEAAAAB8QEAAADxAQLzAQAAAPMBAvUBAAAA9QEC9wEAAAD3AQL4AQEAAAAB-QEBAAAAAfoBIAAAAAECAAAAjwEAIBgAAIkEACADAAAACwAgGAAAiQQAIBkAAI0EACAoAAAACwAgAwAAkgMAIAoAAJQDACARAACNBAAgtwEBAOACACHFAQEA4AIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdgBAQDgAgAh2QEBAOACACHaAQEA4AIAIdsBAQDgAgAh3AEBAOACACHdAQEA4AIAId4BAQDmAgAh3wEIAPICACHgAQEA5gIAIeEBAQDmAgAh4gEBAOYCACHjAQEA5gIAIeQBAQDmAgAh5QEBAOYCACHmAQEA5gIAIecBAQDmAgAh6AEBAOACACHpAQEA4AIAIeoBAQDmAgAh6wEBAOYCACHsAQEA4AIAIe0BAQDgAgAh7gEBAOYCACHvAQEA5gIAIfEBAACOA_EBIvMBAACPA_MBIvUBAACQA_UBIvcBAACRA_cBIvgBAQDgAgAh-QEBAOYCACH6ASAA5wIAISYDAACSAwAgCgAAlAMAILcBAQDgAgAhxQEBAOACACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHYAQEA4AIAIdkBAQDgAgAh2gEBAOACACHbAQEA4AIAIdwBAQDgAgAh3QEBAOACACHeAQEA5gIAId8BCADyAgAh4AEBAOYCACHhAQEA5gIAIeIBAQDmAgAh4wEBAOYCACHkAQEA5gIAIeUBAQDmAgAh5gEBAOYCACHnAQEA5gIAIegBAQDgAgAh6QEBAOACACHqAQEA5gIAIesBAQDmAgAh7AEBAOACACHtAQEA4AIAIe4BAQDmAgAh7wEBAOYCACHxAQAAjgPxASLzAQAAjwPzASL1AQAAkAP1ASL3AQAAkQP3ASL4AQEA4AIAIfkBAQDmAgAh-gEgAOcCACECtwEBAAAAAcUBAQAAAAEmAwAAowMAIAYAAKQDACC3AQEAAAABxQEBAAAAAc8BQAAAAAHQAUAAAAAB0QFAAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHcAQEAAAAB3QEBAAAAAd4BAQAAAAHfAQgAAAAB4AEBAAAAAeEBAQAAAAHiAQEAAAAB4wEBAAAAAeQBAQAAAAHlAQEAAAAB5gEBAAAAAecBAQAAAAHoAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuAQEAAAAB7wEBAAAAAfEBAAAA8QEC8wEAAADzAQL1AQAAAPUBAvcBAAAA9wEC-AEBAAAAAfkBAQAAAAH6ASAAAAABAgAAAI8BACAYAACPBAAgAwAAAAsAIBgAAI8EACAZAACTBAAgKAAAAAsAIAMAAJIDACAGAACTAwAgEQAAkwQAILcBAQDgAgAhxQEBAOACACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHYAQEA4AIAIdkBAQDgAgAh2gEBAOACACHbAQEA4AIAIdwBAQDgAgAh3QEBAOACACHeAQEA5gIAId8BCADyAgAh4AEBAOYCACHhAQEA5gIAIeIBAQDmAgAh4wEBAOYCACHkAQEA5gIAIeUBAQDmAgAh5gEBAOYCACHnAQEA5gIAIegBAQDgAgAh6QEBAOACACHqAQEA5gIAIesBAQDmAgAh7AEBAOACACHtAQEA4AIAIe4BAQDmAgAh7wEBAOYCACHxAQAAjgPxASLzAQAAjwPzASL1AQAAkAP1ASL3AQAAkQP3ASL4AQEA4AIAIfkBAQDmAgAh-gEgAOcCACEmAwAAkgMAIAYAAJMDACC3AQEA4AIAIcUBAQDgAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAh2AEBAOACACHZAQEA4AIAIdoBAQDgAgAh2wEBAOACACHcAQEA4AIAId0BAQDgAgAh3gEBAOYCACHfAQgA8gIAIeABAQDmAgAh4QEBAOYCACHiAQEA5gIAIeMBAQDmAgAh5AEBAOYCACHlAQEA5gIAIeYBAQDmAgAh5wEBAOYCACHoAQEA4AIAIekBAQDgAgAh6gEBAOYCACHrAQEA5gIAIewBAQDgAgAh7QEBAOACACHuAQEA5gIAIe8BAQDmAgAh8QEAAI4D8QEi8wEAAI8D8wEi9QEAAJAD9QEi9wEAAJED9wEi-AEBAOACACH5AQEA5gIAIfoBIADnAgAhBQQGAgUKAwcACwkMBAsYCgEDAAEBAwABBAMAAQYQBQcACQoUCAIIAAYJAAQCBhEFBwAHAQYSAAEJFQQBBhYAAQMAAQIEGQAFGgAAAAADBwAQHgARHwASAAAAAwcAEB4AER8AEgEDAAEBAwABAwcAFx4AGB8AGQAAAAMHABceABgfABkBAwABAQMAAQMHAB4eAB8fACAAAAADBwAeHgAfHwAgAAAAAwcAJh4AJx8AKAAAAAMHACYeACcfACgBAwABAQMAAQMHAC0eAC4fAC8AAAADBwAtHgAuHwAvAQMAAQEDAAEFBwA0HgA3HwA4cAA1cQA2AAAAAAAFBwA0HgA3HwA4cAA1cQA2AggABgkABAIIAAYJAAQDBwA9HgA-HwA_AAAAAwcAPR4APh8APwAABQcARB4ARx8ASHAARXEARgAAAAAABQcARB4ARx8ASHAARXEARgEJ4gEEAQnoAQQDBwBNHgBOHwBPAAAAAwcATR4ATh8ATwAAAAUHAFUeAFgfAFlwAFZxAFcAAAAAAAUHAFUeAFgfAFlwAFZxAFcMAgENGwEOHgEPHwEQIAESIgETJAwUJQ0VJwEWKQwXKg4aKwEbLAEcLQwgMA8hMRMiMgIjMwIkNAIlNQImNgInOAIoOgwpOxQqPQIrPwwsQBUtQQIuQgIvQwwwRhYxRxoySAMzSQM0SgM1SwM2TAM3TgM4UAw5URs6UwM7VQw8Vhw9VwM-WAM_WQxAXB1BXSFCXyJDYCJEYyJFZCJGZSJHZyJIaQxJaiNKbCJLbgxMbyRNcCJOcSJPcgxQdSVRdilSeApTeQpUewpVfApWfQpXfwpYgQEMWYIBKlqEAQpbhgEMXIcBK12IAQpeiQEKX4oBDGCNASxhjgEwYpABBGORAQRkkwEEZZQBBGaVAQRnlwEEaJkBDGmaATFqnAEEa54BDGyfATJtoAEEbqEBBG-iAQxypQEzc6YBOXSnAQV1qAEFdqkBBXeqAQV4qwEFea0BBXqvAQx7sAE6fLIBBX20AQx-tQE7f7YBBYABtwEFgQG4AQyCAbsBPIMBvAFAhAG-AQaFAb8BBoYBwgEGhwHDAQaIAcQBBokBxgEGigHIAQyLAckBQYwBywEGjQHNAQyOAc4BQo8BzwEGkAHQAQaRAdEBDJIB1AFDkwHVAUmUAdcBCJUB2AEIlgHaAQiXAdsBCJgB3AEImQHeAQiaAeABDJsB4QFKnAHkAQidAeYBDJ4B5wFLnwHpAQigAeoBCKEB6wEMogHuAUyjAe8BUKQB8QFRpQHyAVGmAfUBUacB9gFRqAH3AVGpAfkBUaoB-wEMqwH8AVKsAf4BUa0BgAIMrgGBAlOvAYICUbABgwJRsQGEAgyyAYcCVLMBiAJa"
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
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorProfileScalarFieldEnum: () => TutorProfileScalarFieldEnum,
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
  TutorProfile: "TutorProfile",
  Class: "Class",
  Address: "Address",
  Sequence: "Sequence"
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
  birthRegistrationNumber: "birthRegistrationNumber",
  isdeleted: "isdeleted",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt"
};
var TutorProfileScalarFieldEnum = {
  id: "id",
  classId: "classId",
  employeeId: "employeeId"
};
var ClassScalarFieldEnum = {
  id: "id",
  name: "name",
  monthlyTutionFee: "monthlyTutionFee",
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
import { Router as Router3 } from "express";

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

// src/app/modules/employees/employees.routes.ts
import { Router as Router2 } from "express";

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
import status11 from "http-status";

// src/app/modules/employees/employees.validation.ts
import { z as z2 } from "zod";
var presentAddressSchema = z2.object({
  village: z2.string({ error: "Present address village is required" }).min(1, { error: "Present address village cannot be empty" }),
  postOffice: z2.string({ error: "Present address post office is required" }).min(1, { error: "Present address post office cannot be empty" }),
  postCode: z2.string({ error: "Present address post code is required" }).min(1, { error: "Present address post code cannot be empty" }),
  district: z2.string({ error: "Present address district is required" }).min(1, { error: "Present address district cannot be empty" })
});
var permanentAddressSchema = z2.object({
  village: z2.string({ error: "Permanent address village is required" }).min(1, { error: "Permanent address village cannot be empty" }),
  postOffice: z2.string({ error: "Permanent address post office is required" }).min(1, { error: "Permanent address post office cannot be empty" }),
  postCode: z2.string({ error: "Permanent address post code is required" }).min(1, { error: "Permanent address post code cannot be empty" }),
  district: z2.string({ error: "Permanent address district is required" }).min(1, { error: "Permanent address district cannot be empty" })
});
var createEmployeeSchema = z2.object({
  fullName: z2.string({ error: "Full name is required" }).min(1, { error: "Full name cannot be empty" }),
  fatherName: z2.string({ error: "Father's name is required" }).min(1, { error: "Father's name cannot be empty" }),
  motherName: z2.string({ error: "Mother's name is required" }).min(1, { error: "Mother's name cannot be empty" }),
  phone: z2.string({ error: "Phone number is required" }).min(11, { error: "Phone number must be at least 11 digits" }),
  gender: z2.enum(Gender, {
    error: "Gender must be one of: " + Object.values(Gender).join(", ")
  }),
  bloodGroup: z2.enum(BloodGroup, {
    error: "Blood group must be one of: " + Object.values(BloodGroup).join(", ")
  }),
  religion: z2.enum(Religion, {
    error: "Religion must be one of: " + Object.values(Religion).join(", ")
  }),
  employeeRole: z2.enum(EmployeeRole, {
    error: "Employee role must be one of: " + Object.values(UserRole).join(", ")
  }),
  emergencyContact: z2.string().min(11, { error: "Emergency contact must be at least 11 digits" }).optional(),
  dateOfJoining: z2.string().min(1, { error: "Date of joining is required" }),
  monthlySalary: z2.coerce.number({
    error: "Monthly salary must be a valid number"
  }),
  email: z2.email({ error: "Please provide a valid email address" }),
  nid: z2.string({ error: "NID is required" }).min(1, { error: "NID cannot be empty" }),
  birthRegistrationNumber: z2.string().optional(),
  address: z2.object({
    present: presentAddressSchema,
    permanent: permanentAddressSchema
  })
});
var updateEmployeeSchema = z2.object({
  fullName: z2.string().optional(),
  fatherName: z2.string().optional(),
  motherName: z2.string().optional(),
  phone: z2.string().optional(),
  gender: z2.enum(Gender).optional(),
  bloodGroup: z2.enum(BloodGroup).optional(),
  religion: z2.enum(Religion).optional(),
  employeeRole: z2.enum(EmployeeRole).optional(),
  emergencyContact: z2.string().optional(),
  monthlySalary: z2.coerce.number().optional(),
  dateOfJoining: z2.string().optional(),
  nid: z2.string().optional(),
  address: z2.object({
    present: presentAddressSchema.partial().optional(),
    permanent: permanentAddressSchema.partial().optional()
  }).optional()
});

// src/app/modules/employees/employess.service.ts
import status10 from "http-status";

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
    documents: `${ROOT}/students/documents`
  }
  // add more as your project grows
};

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
    throw new AppError_default(status10.NOT_FOUND, "Employee not found");
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
    throw new AppError_default(status10.NOT_FOUND, "Employee Not found");
  }
  if (!employee?.address) {
    throw new AppError_default(status10.NOT_FOUND, "Employee address not found");
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
      status10.CONFLICT,
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
    throw new AppError_default(status10.NOT_FOUND, "Employee Not found");
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
    throw new AppError_default(status10.NOT_FOUND, "Employee Not found");
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
    httpStatusCode: status11.OK,
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
    httpStatusCode: status11.OK,
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
    httpStatusCode: status11.OK,
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
    httpStatusCode: status11.OK,
    success: true,
    message: "Employee Updated Successfully",
    data: employee
  });
};
var deleteEmployee2 = async (req, res) => {
  const { id } = req.params;
  const result = await EmployeeService.deleteEmployee(id);
  sendResponse(res, {
    httpStatusCode: status11.OK,
    success: true,
    message: "Employee Deleted Successfully",
    data: result
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
var router2 = Router2();
router2.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getAllEmployees
);
router2.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getEmployeeById
);
router2.get(
  "/:id/update",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getEmployeeByIdForUpdate
);
router2.post(
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
router2.patch(
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
router2.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.deleteEmployee
);
var EmployeeRoutes = router2;

// src/app/routes/index.ts
var routes = Router3();
var moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/employees",
    route: EmployeeRoutes
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

// src/server.ts
var bootstrap = async () => {
  try {
    await seedSuperAdmin();
    await seedEmployeeSequence();
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