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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone String @unique\n\n  fullName               String\n  nid                    String  @unique\n  fatherName             String\n  motherName             String\n  emergencyContactNumber String?\n  monthlySalary          Float\n  employeeId             String  @unique\n\n  picture         String?\n  picturePublicId String?\n\n  experience         String?\n  experiencePublicId String?\n\n  authoritySign         String\n  authoritySignPublicId String\n\n  EmployeeSign         String\n  EmployeeSignPublicId String\n\n  gender                  Gender\n  bloodGroup              BloodGroup\n  religion                Religion\n  employeeRole            EmployeeRole\n  dateOfJoining           String\n  birthRegistrationNumber String?      @unique\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted     Boolean        @default(false)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  deletedAt     DateTime?\n  tutorProfiles TutorProfile[]\n  address       Address?\n\n  @@map("employee")\n}\n\nmodel TutorProfile {\n  id String @id @default(uuid())\n\n  classId    String\n  employeeId String\n\n  class    Class    @relation(fields: [classId], references: [id], onDelete: Cascade)\n  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n}\n\nmodel Class {\n  id               String @id @default(uuid())\n  name             String\n  monthlyTutionFee Float\n\n  isDeleted     Boolean        @default(false)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  deletedAt     DateTime?\n  tutorProfiles TutorProfile[]\n\n  @@map("class")\n}\n\nmodel Address {\n  id String @id @default(uuid())\n\n  studentId  String? @unique @map("student_id")\n  employeeId String? @unique @map("employee_id")\n\n  permanentAddressVillage    String?\n  permanentAddressPostOffice String?\n  permanentAddressPostCode   String?\n  permanentAddressDistrict   String?\n\n  presentAddressVillage    String?\n  presentAddressPostOffice String?\n  presentAddressPostCode   String?\n  presentAddressDistrict   String?\n\n  isDeleted Boolean @default(false)\n\n  // student  Student?  @relation(fields: [studentId], references: [id])\n  employee Employee? @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now()) @map("created_at")\n  updatedAt DateTime  @updatedAt @map("updated_at")\n  deletedAt DateTime? @map("deleted_at")\n}\n\nmodel Sequence {\n  id      String @id\n  current Int\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContactNumber","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"String"},{"name":"experiencePublicId","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"EmployeeSign","kind":"scalar","type":"String"},{"name":"EmployeeSignPublicId","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"EmployeeRole"},{"name":"dateOfJoining","kind":"scalar","type":"String"},{"name":"birthRegistrationNumber","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfiles","kind":"object","type":"TutorProfile","relationName":"EmployeeToTutorProfile"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToEmployee"}],"dbName":"employee"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToTutorProfile"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToTutorProfile"}],"dbName":null},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTutionFee","kind":"scalar","type":"Float"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfiles","kind":"object","type":"TutorProfile","relationName":"ClassToTutorProfile"}],"dbName":"class"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String","dbName":"student_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"permanentAddressVillage","kind":"scalar","type":"String"},{"name":"permanentAddressPostOffice","kind":"scalar","type":"String"},{"name":"permanentAddressPostCode","kind":"scalar","type":"String"},{"name":"permanentAddressDistrict","kind":"scalar","type":"String"},{"name":"presentAddressVillage","kind":"scalar","type":"String"},{"name":"presentAddressPostOffice","kind":"scalar","type":"String"},{"name":"presentAddressPostCode","kind":"scalar","type":"String"},{"name":"presentAddressDistrict","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"employee","kind":"object","type":"Employee","relationName":"AddressToEmployee"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"}],"dbName":null},"Sequence":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"current","kind":"scalar","type":"Int"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","tutorProfiles","_count","class","employee","address","admin","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","_avg","_sum","Employee.groupBy","Employee.aggregate","TutorProfile.findUnique","TutorProfile.findUniqueOrThrow","TutorProfile.findFirst","TutorProfile.findFirstOrThrow","TutorProfile.findMany","TutorProfile.createOne","TutorProfile.createMany","TutorProfile.createManyAndReturn","TutorProfile.updateOne","TutorProfile.updateMany","TutorProfile.updateManyAndReturn","TutorProfile.upsertOne","TutorProfile.deleteOne","TutorProfile.deleteMany","TutorProfile.groupBy","TutorProfile.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","Sequence.findUnique","Sequence.findUniqueOrThrow","Sequence.findFirst","Sequence.findFirstOrThrow","Sequence.findMany","Sequence.createOne","Sequence.createMany","Sequence.createManyAndReturn","Sequence.updateOne","Sequence.updateMany","Sequence.updateManyAndReturn","Sequence.upsertOne","Sequence.deleteOne","Sequence.deleteMany","Sequence.groupBy","Sequence.aggregate","AND","OR","NOT","id","current","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","studentId","employeeId","permanentAddressVillage","permanentAddressPostOffice","permanentAddressPostCode","permanentAddressDistrict","presentAddressVillage","presentAddressPostOffice","presentAddressPostCode","presentAddressDistrict","isDeleted","createdAt","updatedAt","deletedAt","name","monthlyTutionFee","every","some","none","classId","userId","phone","fullName","nid","fatherName","motherName","emergencyContactNumber","monthlySalary","picture","picturePublicId","experience","experiencePublicId","authoritySign","authoritySignPublicId","EmployeeSign","EmployeeSignPublicId","Gender","gender","BloodGroup","bloodGroup","Religion","religion","EmployeeRole","employeeRole","dateOfJoining","birthRegistrationNumber","isdeleted","email","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","UserRole","role","UserStatus","status","needPasswordChange","emailVerified","image","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "kwRaoAETBAAA0wIAIAUAANQCACAJAACnAgAgCwAA1QIAILQBAADQAgAwtQEAABwAELYBAADQAgAwtwEBAAAAAc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh0gEBAJICACHzAQEAAAABhgIAANEChgIiiAIAANICiAIiiQIgAKQCACGKAiAApAIAIYsCAQCjAgAhAQAAAAEAIAwDAADBAgAgtAEAANoCADC1AQAAAwAQtgEAANoCADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIfgBQAClAgAhggIBAJICACGDAgEAowIAIYQCAQCjAgAhAwMAAKYDACCDAgAA4gIAIIQCAADiAgAgDAMAAMECACC0AQAA2gIAMLUBAAADABC2AQAA2gIAMLcBAQAAAAHPAUAApQIAIdABQAClAgAh2AEBAJICACH4AUAApQIAIYICAQAAAAGDAgEAowIAIYQCAQCjAgAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAADBAgAgtAEAANkCADC1AQAABwAQtgEAANkCADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIfkBAQCSAgAh-gEBAJICACH7AQEAowIAIfwBAQCjAgAh_QEBAKMCACH-AUAApgIAIf8BQACmAgAhgAIBAKMCACGBAgEAowIAIQgDAACmAwAg-wEAAOICACD8AQAA4gIAIP0BAADiAgAg_gEAAOICACD_AQAA4gIAIIACAADiAgAggQIAAOICACARAwAAwQIAILQBAADZAgAwtQEAAAcAELYBAADZAgAwtwEBAAAAAc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIfkBAQCSAgAh-gEBAJICACH7AQEAowIAIfwBAQCjAgAh_QEBAKMCACH-AUAApgIAIf8BQACmAgAhgAIBAKMCACGBAgEAowIAIQMAAAAHACABAAAIADACAAAJACAiAwAAwQIAIAYAAK0CACAKAADCAgAgtAEAALwCADC1AQAACwAQtgEAALwCADC3AQEAkgIAIcUBAQCSAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh2AEBAJICACHZAQEAkgIAIdoBAQCSAgAh2wEBAJICACHcAQEAkgIAId0BAQCSAgAh3gEBAKMCACHfAQgArAIAIeABAQCjAgAh4QEBAKMCACHiAQEAowIAIeMBAQCjAgAh5AEBAJICACHlAQEAkgIAIeYBAQCSAgAh5wEBAJICACHpAQAAvQLpASLrAQAAvgLrASLtAQAAvwLtASLvAQAAwALvASLwAQEAkgIAIfEBAQCjAgAh8gEgAKQCACEBAAAACwAgCAgAANcCACAJAADYAgAgtAEAANYCADC1AQAADQAQtgEAANYCADC3AQEAkgIAIcUBAQCSAgAh1wEBAJICACECCAAA7AMAIAkAAOwCACAICAAA1wIAIAkAANgCACC0AQAA1gIAMLUBAAANABC2AQAA1gIAMLcBAQAAAAHFAQEAkgIAIdcBAQCSAgAhAwAAAA0AIAEAAA4AMAIAAA8AIAMAAAANACABAAAOADACAAAPACABAAAADQAgEwkAAKcCACC0AQAAogIAMLUBAAATABC2AQAAogIAMLcBAQCSAgAhxAEBAKMCACHFAQEAowIAIcYBAQCjAgAhxwEBAKMCACHIAQEAowIAIckBAQCjAgAhygEBAKMCACHLAQEAowIAIcwBAQCjAgAhzQEBAKMCACHOASAApAIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIQEAAAATACABAAAACwAgAQAAAA0AIA4DAADBAgAgtAEAAMQCADC1AQAAFwAQtgEAAMQCADC3AQEAkgIAIc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh0gEBAJICACHYAQEAkgIAIfMBAQCSAgAh9AEBAKMCACH1AQEAowIAIQEAAAAXACABAAAAAwAgAQAAAAcAIAEAAAABACATBAAA0wIAIAUAANQCACAJAACnAgAgCwAA1QIAILQBAADQAgAwtQEAABwAELYBAADQAgAwtwEBAJICACHOASAApAIAIc8BQAClAgAh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-wEBAAAAAfwBAQAAAAH9AQEAAAAB_gFAAAAAAf8BQAAAAAGAAgEAAAABgQIBAAAAAQERAABNACANtwEBAAAAAc8BQAAAAAHQAUAAAAAB2AEBAAAAAfkBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAQAAAAH9AQEAAAAB_gFAAAAAAf8BQAAAAAGAAgEAAAABgQIBAAAAAQERAABPADABEQAATwAwDgMAALMDACC3AQEA4AIAIc8BQADoAgAh0AFAAOgCACHYAQEA4AIAIfkBAQDgAgAh-gEBAOACACH7AQEA5gIAIfwBAQDmAgAh_QEBAOYCACH-AUAA6QIAIf8BQADpAgAhgAIBAOYCACGBAgEA5gIAIQIAAAAJACARAABSACANtwEBAOACACHPAUAA6AIAIdABQADoAgAh2AEBAOACACH5AQEA4AIAIfoBAQDgAgAh-wEBAOYCACH8AQEA5gIAIf0BAQDmAgAh_gFAAOkCACH_AUAA6QIAIYACAQDmAgAhgQIBAOYCACECAAAABwAgEQAAVAAgAgAAAAcAIBEAAFQAIAMAAAAJACAYAABNACAZAABSACABAAAACQAgAQAAAAcAIAoHAACwAwAgHgAAsgMAIB8AALEDACD7AQAA4gIAIPwBAADiAgAg_QEAAOICACD-AQAA4gIAIP8BAADiAgAggAIAAOICACCBAgAA4gIAIBC0AQAAxwIAMLUBAABbABC2AQAAxwIAMLcBAQCKAgAhzwFAAJcCACHQAUAAlwIAIdgBAQCKAgAh-QEBAIoCACH6AQEAigIAIfsBAQCVAgAh_AEBAJUCACH9AQEAlQIAIf4BQACYAgAh_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-kBIusBAACPA-sBIu0BAACQA-0BIu8BAACRA-8BIvABAQDgAgAh8QEBAOYCACHyASAA5wIAIQIAAACPAQAgEQAAmwEAIBy3AQEA4AIAIcUBAQDgAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAh2AEBAOACACHZAQEA4AIAIdoBAQDgAgAh2wEBAOACACHcAQEA4AIAId0BAQDgAgAh3gEBAOYCACHfAQgA8gIAIeABAQDmAgAh4QEBAOYCACHiAQEA5gIAIeMBAQDmAgAh5AEBAOACACHlAQEA4AIAIeYBAQDgAgAh5wEBAOACACHpAQAAjgPpASLrAQAAjwPrASLtAQAAkAPtASLvAQAAkQPvASLwAQEA4AIAIfEBAQDmAgAh8gEgAOcCACECAAAACwAgEQAAnQEAIAIAAAALACARAACdAQAgAwAAAI8BACAYAACWAQAgGQAAmwEAIAEAAACPAQAgAQAAAAsAIAwHAACJAwAgHgAAjAMAIB8AAIsDACBwAACKAwAgcQAAjQMAINEBAADiAgAg3gEAAOICACDgAQAA4gIAIOEBAADiAgAg4gEAAOICACDjAQAA4gIAIPEBAADiAgAgH7QBAACvAgAwtQEAAKQBABC2AQAArwIAMLcBAQCKAgAhxQEBAIoCACHPAUAAlwIAIdABQACXAgAh0QFAAJgCACHYAQEAigIAIdkBAQCKAgAh2gEBAIoCACHbAQEAigIAIdwBAQCKAgAh3QEBAIoCACHeAQEAlQIAId8BCACpAgAh4AEBAJUCACHhAQEAlQIAIeIBAQCVAgAh4wEBAJUCACHkAQEAigIAIeUBAQCKAgAh5gEBAIoCACHnAQEAigIAIekBAACwAukBIusBAACxAusBIu0BAACyAu0BIu8BAACzAu8BIvABAQCKAgAh8QEBAJUCACHyASAAlgIAIQMAAAALACABAACjAQAwHQAApAEAIAMAAAALACABAACSAQAwAgAAjwEAIAEAAAAPACABAAAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIAMAAAANACABAAAOADACAAAPACADAAAADQAgAQAADgAwAgAADwAgBQgAAIgDACAJAACBAwAgtwEBAAAAAcUBAQAAAAHXAQEAAAABAREAAKwBACADtwEBAAAAAcUBAQAAAAHXAQEAAAABAREAAK4BADABEQAArgEAMAUIAACHAwAgCQAA_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_wEAIAIAAADzAQAgEQAA_wEAIAMAAADwAQAgGAAA-AEAIBkAAP0BACABAAAA8AEAIAEAAADzAQAgBQcAANsCACAeAADeAgAgHwAA3QIAIHAAANwCACBxAADfAgAgBbQBAACJAgAwtQEAAIYCABC2AQAAiQIAMLcBAQCKAgAhuAECAIsCACEDAAAA8wEAIAEAAIUCADAdAACGAgAgAwAAAPMBACABAAD0AQAwAgAA8AEAIAW0AQAAiQIAMLUBAACGAgAQtgEAAIkCADC3AQEAigIAIbgBAgCLAgAhDgcAAI0CACAeAACQAgAgHwAAkAIAILkBAQAAAAG6AQEAAAAEuwEBAAAABLwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAjwIAIcEBAQAAAAHCAQEAAAABwwEBAAAAAQ0HAACNAgAgHgAAjQIAIB8AAI0CACBwAACOAgAgcQAAjQIAILkBAgAAAAG6AQIAAAAEuwECAAAABLwBAgAAAAG9AQIAAAABvgECAAAAAb8BAgAAAAHAAQIAjAIAIQ0HAACNAgAgHgAAjQIAIB8AAI0CACBwAACOAgAgcQAAjQIAILkBAgAAAAG6AQIAAAAEuwECAAAABLwBAgAAAAG9AQIAAAABvgECAAAAAb8BAgAAAAHAAQIAjAIAIQi5AQIAAAABugECAAAABLsBAgAAAAS8AQIAAAABvQECAAAAAb4BAgAAAAG_AQIAAAABwAECAI0CACEIuQEIAAAAAboBCAAAAAS7AQgAAAAEvAEIAAAAAb0BCAAAAAG-AQgAAAABvwEIAAAAAcABCACOAgAhDgcAAI0CACAeAACQAgAgHwAAkAIAILkBAQAAAAG6AQEAAAAEuwEBAAAABLwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAjwIAIcEBAQAAAAHCAQEAAAABwwEBAAAAAQu5AQEAAAABugEBAAAABLsBAQAAAAS8AQEAAAABvQEBAAAAAb4BAQAAAAG_AQEAAAABwAEBAJACACHBAQEAAAABwgEBAAAAAcMBAQAAAAEFtAEAAJECADC1AQAA8wEAELYBAACRAgAwtwEBAJICACG4AQIAkwIAIQu5AQEAAAABugEBAAAABLsBAQAAAAS8AQEAAAABvQEBAAAAAb4BAQAAAAG_AQEAAAABwAEBAJACACHBAQEAAAABwgEBAAAAAcMBAQAAAAEIuQECAAAAAboBAgAAAAS7AQIAAAAEvAECAAAAAb0BAgAAAAG-AQIAAAABvwECAAAAAcABAgCNAgAhErQBAACUAgAwtQEAAO0BABC2AQAAlAIAMLcBAQCKAgAhxAEBAJUCACHFAQEAlQIAIcYBAQCVAgAhxwEBAJUCACHIAQEAlQIAIckBAQCVAgAhygEBAJUCACHLAQEAlQIAIcwBAQCVAgAhzQEBAJUCACHOASAAlgIAIc8BQACXAgAh0AFAAJcCACHRAUAAmAIAIQ4HAACaAgAgHgAAoQIAIB8AAKECACC5AQEAAAABugEBAAAABbsBAQAAAAW8AQEAAAABvQEBAAAAAb4BAQAAAAG_AQEAAAABwAEBAKACACHBAQEAAAABwgEBAAAAAcMBAQAAAAEFBwAAjQIAIB4AAJ8CACAfAACfAgAguQEgAAAAAcABIACeAgAhCwcAAI0CACAeAACdAgAgHwAAnQIAILkBQAAAAAG6AUAAAAAEuwFAAAAABLwBQAAAAAG9AUAAAAABvgFAAAAAAb8BQAAAAAHAAUAAnAIAIQsHAACaAgAgHgAAmwIAIB8AAJsCACC5AUAAAAABugFAAAAABbsBQAAAAAW8AUAAAAABvQFAAAAAAb4BQAAAAAG_AUAAAAABwAFAAJkCACELBwAAmgIAIB4AAJsCACAfAACbAgAguQFAAAAAAboBQAAAAAW7AUAAAAAFvAFAAAAAAb0BQAAAAAG-AUAAAAABvwFAAAAAAcABQACZAgAhCLkBAgAAAAG6AQIAAAAFuwECAAAABbwBAgAAAAG9AQIAAAABvgECAAAAAb8BAgAAAAHAAQIAmgIAIQi5AUAAAAABugFAAAAABbsBQAAAAAW8AUAAAAABvQFAAAAAAb4BQAAAAAG_AUAAAAABwAFAAJsCACELBwAAjQIAIB4AAJ0CACAfAACdAgAguQFAAAAAAboBQAAAAAS7AUAAAAAEvAFAAAAAAb0BQAAAAAG-AUAAAAABvwFAAAAAAcABQACcAgAhCLkBQAAAAAG6AUAAAAAEuwFAAAAABLwBQAAAAAG9AUAAAAABvgFAAAAAAb8BQAAAAAHAAUAAnQIAIQUHAACNAgAgHgAAnwIAIB8AAJ8CACC5ASAAAAABwAEgAJ4CACECuQEgAAAAAcABIACfAgAhDgcAAJoCACAeAAChAgAgHwAAoQIAILkBAQAAAAG6AQEAAAAFuwEBAAAABbwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAoAIAIcEBAQAAAAHCAQEAAAABwwEBAAAAAQu5AQEAAAABugEBAAAABbsBAQAAAAW8AQEAAAABvQEBAAAAAb4BAQAAAAG_AQEAAAABwAEBAKECACHBAQEAAAABwgEBAAAAAcMBAQAAAAETCQAApwIAILQBAACiAgAwtQEAABMAELYBAACiAgAwtwEBAJICACHEAQEAowIAIcUBAQCjAgAhxgEBAKMCACHHAQEAowIAIcgBAQCjAgAhyQEBAKMCACHKAQEAowIAIcsBAQCjAgAhzAEBAKMCACHNAQEAowIAIc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAhC7kBAQAAAAG6AQEAAAAFuwEBAAAABbwBAQAAAAG9AQEAAAABvgEBAAAAAb8BAQAAAAHAAQEAoQIAIcEBAQAAAAHCAQEAAAABwwEBAAAAAQK5ASAAAAABwAEgAJ8CACEIuQFAAAAAAboBQAAAAAS7AUAAAAAEvAFAAAAAAb0BQAAAAAG-AUAAAAABvwFAAAAAAcABQACdAgAhCLkBQAAAAAG6AUAAAAAFuwFAAAAABbwBQAAAAAG9AUAAAAABvgFAAAAAAb8BQAAAAAHAAUAAmwIAISQDAADBAgAgBgAArQIAIAoAAMICACC0AQAAvAIAMLUBAAALABC2AQAAvAIAMLcBAQCSAgAhxQEBAJICACHPAUAApQIAIdABQAClAgAh0QFAAKYCACHYAQEAkgIAIdkBAQCSAgAh2gEBAJICACHbAQEAkgIAIdwBAQCSAgAh3QEBAJICACHeAQEAowIAId8BCACsAgAh4AEBAKMCACHhAQEAowIAIeIBAQCjAgAh4wEBAKMCACHkAQEAkgIAIeUBAQCSAgAh5gEBAJICACHnAQEAkgIAIekBAAC9AukBIusBAAC-AusBIu0BAAC_Au0BIu8BAADAAu8BIvABAQCSAgAh8QEBAKMCACHyASAApAIAIYwCAAALACCNAgAACwAgCrQBAACoAgAwtQEAANMBABC2AQAAqAIAMLcBAQCKAgAhzgEgAJYCACHPAUAAlwIAIdABQACXAgAh0QFAAJgCACHSAQEAigIAIdMBCACpAgAhDQcAAI0CACAeAACOAgAgHwAAjgIAIHAAAI4CACBxAACOAgAguQEIAAAAAboBCAAAAAS7AQgAAAAEvAEIAAAAAb0BCAAAAAG-AQgAAAABvwEIAAAAAcABCACqAgAhDQcAAI0CACAeAACOAgAgHwAAjgIAIHAAAI4CACBxAACOAgAguQEIAAAAAboBCAAAAAS7AQgAAAAEvAEIAAAAAb0BCAAAAAG-AQgAAAABvwEIAAAAAcABCACqAgAhCwYAAK0CACC0AQAAqwIAMLUBAADAAQAQtgEAAKsCADC3AQEAkgIAIc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh0gEBAJICACHTAQgArAIAIQi5AQgAAAABugEIAAAABLsBCAAAAAS8AQgAAAABvQEIAAAAAb4BCAAAAAG_AQgAAAABwAEIAI4CACED1AEAAA0AINUBAAANACDWAQAADQAgBrQBAACuAgAwtQEAALoBABC2AQAArgIAMLcBAQCKAgAhxQEBAIoCACHXAQEAigIAIR-0AQAArwIAMLUBAACkAQAQtgEAAK8CADC3AQEAigIAIcUBAQCKAgAhzwFAAJcCACHQAUAAlwIAIdEBQACYAgAh2AEBAIoCACHZAQEAigIAIdoBAQCKAgAh2wEBAIoCACHcAQEAigIAId0BAQCKAgAh3gEBAJUCACHfAQgAqQIAIeABAQCVAgAh4QEBAJUCACHiAQEAlQIAIeMBAQCVAgAh5AEBAIoCACHlAQEAigIAIeYBAQCKAgAh5wEBAIoCACHpAQAAsALpASLrAQAAsQLrASLtAQAAsgLtASLvAQAAswLvASLwAQEAigIAIfEBAQCVAgAh8gEgAJYCACEHBwAAjQIAIB4AALsCACAfAAC7AgAguQEAAADpAQK6AQAAAOkBCLsBAAAA6QEIwAEAALoC6QEiBwcAAI0CACAeAAC5AgAgHwAAuQIAILkBAAAA6wECugEAAADrAQi7AQAAAOsBCMABAAC4AusBIgcHAACNAgAgHgAAtwIAIB8AALcCACC5AQAAAO0BAroBAAAA7QEIuwEAAADtAQjAAQAAtgLtASIHBwAAjQIAIB4AALUCACAfAAC1AgAguQEAAADvAQK6AQAAAO8BCLsBAAAA7wEIwAEAALQC7wEiBwcAAI0CACAeAAC1AgAgHwAAtQIAILkBAAAA7wECugEAAADvAQi7AQAAAO8BCMABAAC0Au8BIgS5AQAAAO8BAroBAAAA7wEIuwEAAADvAQjAAQAAtQLvASIHBwAAjQIAIB4AALcCACAfAAC3AgAguQEAAADtAQK6AQAAAO0BCLsBAAAA7QEIwAEAALYC7QEiBLkBAAAA7QECugEAAADtAQi7AQAAAO0BCMABAAC3Au0BIgcHAACNAgAgHgAAuQIAIB8AALkCACC5AQAAAOsBAroBAAAA6wEIuwEAAADrAQjAAQAAuALrASIEuQEAAADrAQK6AQAAAOsBCLsBAAAA6wEIwAEAALkC6wEiBwcAAI0CACAeAAC7AgAgHwAAuwIAILkBAAAA6QECugEAAADpAQi7AQAAAOkBCMABAAC6AukBIgS5AQAAAOkBAroBAAAA6QEIuwEAAADpAQjAAQAAuwLpASIiAwAAwQIAIAYAAK0CACAKAADCAgAgtAEAALwCADC1AQAACwAQtgEAALwCADC3AQEAkgIAIcUBAQCSAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh2AEBAJICACHZAQEAkgIAIdoBAQCSAgAh2wEBAJICACHcAQEAkgIAId0BAQCSAgAh3gEBAKMCACHfAQgArAIAIeABAQCjAgAh4QEBAKMCACHiAQEAowIAIeMBAQCjAgAh5AEBAJICACHlAQEAkgIAIeYBAQCSAgAh5wEBAJICACHpAQAAvQLpASLrAQAAvgLrASLtAQAAvwLtASLvAQAAwALvASLwAQEAkgIAIfEBAQCjAgAh8gEgAKQCACEEuQEAAADpAQK6AQAAAOkBCLsBAAAA6QEIwAEAALsC6QEiBLkBAAAA6wECugEAAADrAQi7AQAAAOsBCMABAAC5AusBIgS5AQAAAO0BAroBAAAA7QEIuwEAAADtAQjAAQAAtwLtASIEuQEAAADvAQK6AQAAAO8BCLsBAAAA7wEIwAEAALUC7wEiFQQAANMCACAFAADUAgAgCQAApwIAIAsAANUCACC0AQAA0AIAMLUBAAAcABC2AQAA0AIAMLcBAQCSAgAhzgEgAKQCACHPAUAApQIAIdABQAClAgAh0QFAAKYCACHSAQEAkgIAIfMBAQCSAgAhhgIAANEChgIiiAIAANICiAIiiQIgAKQCACGKAiAApAIAIYsCAQCjAgAhjAIAABwAII0CAAAcACAVCQAApwIAILQBAACiAgAwtQEAABMAELYBAACiAgAwtwEBAJICACHEAQEAowIAIcUBAQCjAgAhxgEBAKMCACHHAQEAowIAIcgBAQCjAgAhyQEBAKMCACHKAQEAowIAIcsBAQCjAgAhzAEBAKMCACHNAQEAowIAIc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAhjAIAABMAII0CAAATACANtAEAAMMCADC1AQAAjAEAELYBAADDAgAwtwEBAIoCACHOASAAlgIAIc8BQACXAgAh0AFAAJcCACHRAUAAmAIAIdIBAQCKAgAh2AEBAIoCACHzAQEAigIAIfQBAQCVAgAh9QEBAJUCACEOAwAAwQIAILQBAADEAgAwtQEAABcAELYBAADEAgAwtwEBAJICACHOASAApAIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIdIBAQCSAgAh2AEBAJICACHzAQEAkgIAIfQBAQCjAgAh9QEBAKMCACEJtAEAAMUCADC1AQAAdAAQtgEAAMUCADC3AQEAigIAIc8BQACXAgAh0AFAAJcCACH2AQEAigIAIfcBAQCKAgAh-AFAAJcCACEJtAEAAMYCADC1AQAAYQAQtgEAAMYCADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACH2AQEAkgIAIfcBAQCSAgAh-AFAAKUCACEQtAEAAMcCADC1AQAAWwAQtgEAAMcCADC3AQEAigIAIc8BQACXAgAh0AFAAJcCACHYAQEAigIAIfkBAQCKAgAh-gEBAIoCACH7AQEAlQIAIfwBAQCVAgAh_QEBAJUCACH-AUAAmAIAIf8BQACYAgAhgAIBAJUCACGBAgEAlQIAIQu0AQAAyAIAMLUBAABFABC2AQAAyAIAMLcBAQCKAgAhzwFAAJcCACHQAUAAlwIAIdgBAQCKAgAh-AFAAJcCACGCAgEAigIAIYMCAQCVAgAhhAIBAJUCACEPtAEAAMkCADC1AQAALwAQtgEAAMkCADC3AQEAigIAIc4BIACWAgAhzwFAAJcCACHQAUAAlwIAIdEBQACYAgAh0gEBAIoCACHzAQEAigIAIYYCAADKAoYCIogCAADLAogCIokCIACWAgAhigIgAJYCACGLAgEAlQIAIQcHAACNAgAgHgAAzwIAIB8AAM8CACC5AQAAAIYCAroBAAAAhgIIuwEAAACGAgjAAQAAzgKGAiIHBwAAjQIAIB4AAM0CACAfAADNAgAguQEAAACIAgK6AQAAAIgCCLsBAAAAiAIIwAEAAMwCiAIiBwcAAI0CACAeAADNAgAgHwAAzQIAILkBAAAAiAICugEAAACIAgi7AQAAAIgCCMABAADMAogCIgS5AQAAAIgCAroBAAAAiAIIuwEAAACIAgjAAQAAzQKIAiIHBwAAjQIAIB4AAM8CACAfAADPAgAguQEAAACGAgK6AQAAAIYCCLsBAAAAhgIIwAEAAM4ChgIiBLkBAAAAhgICugEAAACGAgi7AQAAAIYCCMABAADPAoYCIhMEAADTAgAgBQAA1AIAIAkAAKcCACALAADVAgAgtAEAANACADC1AQAAHAAQtgEAANACADC3AQEAkgIAIc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh0gEBAJICACHzAQEAkgIAIYYCAADRAoYCIogCAADSAogCIokCIACkAgAhigIgAKQCACGLAgEAowIAIQS5AQAAAIYCAroBAAAAhgIIuwEAAACGAgjAAQAAzwKGAiIEuQEAAACIAgK6AQAAAIgCCLsBAAAAiAIIwAEAAM0CiAIiA9QBAAADACDVAQAAAwAg1gEAAAMAIAPUAQAABwAg1QEAAAcAINYBAAAHACAQAwAAwQIAILQBAADEAgAwtQEAABcAELYBAADEAgAwtwEBAJICACHOASAApAIAIc8BQAClAgAh0AFAAKUCACHRAUAApgIAIdIBAQCSAgAh2AEBAJICACHzAQEAkgIAIfQBAQCjAgAh9QEBAKMCACGMAgAAFwAgjQIAABcAIAgIAADXAgAgCQAA2AIAILQBAADWAgAwtQEAAA0AELYBAADWAgAwtwEBAJICACHFAQEAkgIAIdcBAQCSAgAhDQYAAK0CACC0AQAAqwIAMLUBAADAAQAQtgEAAKsCADC3AQEAkgIAIc4BIACkAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh0gEBAJICACHTAQgArAIAIYwCAADAAQAgjQIAAMABACAkAwAAwQIAIAYAAK0CACAKAADCAgAgtAEAALwCADC1AQAACwAQtgEAALwCADC3AQEAkgIAIcUBAQCSAgAhzwFAAKUCACHQAUAApQIAIdEBQACmAgAh2AEBAJICACHZAQEAkgIAIdoBAQCSAgAh2wEBAJICACHcAQEAkgIAId0BAQCSAgAh3gEBAKMCACHfAQgArAIAIeABAQCjAgAh4QEBAKMCACHiAQEAowIAIeMBAQCjAgAh5AEBAJICACHlAQEAkgIAIeYBAQCSAgAh5wEBAJICACHpAQAAvQLpASLrAQAAvgLrASLtAQAAvwLtASLvAQAAwALvASLwAQEAkgIAIfEBAQCjAgAh8gEgAKQCACGMAgAACwAgjQIAAAsAIBEDAADBAgAgtAEAANkCADC1AQAABwAQtgEAANkCADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIfkBAQCSAgAh-gEBAJICACH7AQEAowIAIfwBAQCjAgAh_QEBAKMCACH-AUAApgIAIf8BQACmAgAhgAIBAKMCACGBAgEAowIAIQwDAADBAgAgtAEAANoCADC1AQAAAwAQtgEAANoCADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIfgBQAClAgAhggIBAJICACGDAgEAowIAIYQCAQCjAgAhAAAAAAABkQIBAAAAAQWRAgIAAAABlwICAAAAAZgCAgAAAAGZAgIAAAABmgICAAAAAQAAAAABkQIBAAAAAQGRAiAAAAABAZECQAAAAAEBkQJAAAAAAQcYAACPBAAgGQAAkgQAII4CAACQBAAgjwIAAJEEACCSAgAACwAgkwIAAAsAIJQCAACPAQAgAxgAAI8EACCOAgAAkAQAIJQCAACPAQAgCgMAAKYDACAGAACDAwAgCgAApwMAINEBAADiAgAg3gEAAOICACDgAQAA4gIAIOEBAADiAgAg4gEAAOICACDjAQAA4gIAIPEBAADiAgAgAAAAAAAFkQIIAAAAAZcCCAAAAAGYAggAAAABmQIIAAAAAZoCCAAAAAELGAAA9AIAMBkAAPkCADCOAgAA9QIAMI8CAAD2AgAwkAIAAPcCACCRAgAA-AIAMJICAAD4AgAwkwIAAPgCADCUAgAA-AIAMJUCAAD6AgAwlgIAAPsCADADCQAAgQMAILcBAQAAAAHFAQEAAAABAgAAAA8AIBgAAIADACADAAAADwAgGAAAgAMAIBkAAP4CACABEQAAjgQAMAgIAADXAgAgCQAA2AIAILQBAADWAgAwtQEAAA0AELYBAADWAgAwtwEBAAAAAcUBAQCSAgAh1wEBAJICACECAAAADwAgEQAA_gIAIAIAAAD8AgAgEQAA_QIAIAa0AQAA-wIAMLUBAAD8AgAQtgEAAPsCADC3AQEAkgIAIcUBAQCSAgAh1wEBAJICACEGtAEAAPsCADC1AQAA_AIAELYBAAD7AgAwtwEBAJICACHFAQEAkgIAIdcBAQCSAgAhArcBAQDgAgAhxQEBAOACACEDCQAA_wIAILcBAQDgAgAhxQEBAOACACEFGAAAiQQAIBkAAIwEACCOAgAAigQAII8CAACLBAAglAIAAI8BACADCQAAgQMAILcBAQAAAAHFAQEAAAABAxgAAIkEACCOAgAAigQAIJQCAACPAQAgBBgAAPQCADCOAgAA9QIAMJACAAD3AgAglAIAAPgCADAAAAAABRgAAIQEACAZAACHBAAgjgIAAIUEACCPAgAAhgQAIJQCAAC9AQAgAxgAAIQEACCOAgAAhQQAIJQCAAC9AQAgAAAAAAABkQIAAADpAQIBkQIAAADrAQIBkQIAAADtAQIBkQIAAADvAQIFGAAA_gMAIBkAAIIEACCOAgAA_wMAII8CAACBBAAglAIAAAEAIAsYAACaAwAwGQAAngMAMI4CAACbAwAwjwIAAJwDADCQAgAAnQMAIJECAAD4AgAwkgIAAPgCADCTAgAA-AIAMJQCAAD4AgAwlQIAAJ8DADCWAgAA-wIAMAcYAACVAwAgGQAAmAMAII4CAACWAwAgjwIAAJcDACCSAgAAEwAgkwIAABMAIJQCAADWAQAgDrcBAQAAAAHEAQEAAAABxgEBAAAAAccBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQAAAAHLAQEAAAABzAEBAAAAAc0BAQAAAAHOASAAAAABzwFAAAAAAdABQAAAAAHRAUAAAAABAgAAANYBACAYAACVAwAgAwAAABMAIBgAAJUDACAZAACZAwAgEAAAABMAIBEAAJkDACC3AQEA4AIAIcQBAQDmAgAhxgEBAOYCACHHAQEA5gIAIcgBAQDmAgAhyQEBAOYCACHKAQEA5gIAIcsBAQDmAgAhzAEBAOYCACHNAQEA5gIAIc4BIADnAgAhzwFAAOgCACHQAUAA6AIAIdEBQADpAgAhDrcBAQDgAgAhxAEBAOYCACHGAQEA5gIAIccBAQDmAgAhyAEBAOYCACHJAQEA5gIAIcoBAQDmAgAhywEBAOYCACHMAQEA5gIAIc0BAQDmAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACEDCAAAiAMAILcBAQAAAAHXAQEAAAABAgAAAA8AIBgAAKIDACADAAAADwAgGAAAogMAIBkAAKEDACABEQAAgAQAMAIAAAAPACARAAChAwAgAgAAAPwCACARAACgAwAgArcBAQDgAgAh1wEBAOACACEDCAAAhwMAILcBAQDgAgAh1wEBAOACACEDCAAAiAMAILcBAQAAAAHXAQEAAAABAxgAAP4DACCOAgAA_wMAIJQCAAABACAEGAAAmgMAMI4CAACbAwAwkAIAAJ0DACCUAgAA-AIAMAMYAACVAwAgjgIAAJYDACCUAgAA1gEAIAYEAADpAwAgBQAA6gMAIAkAAOwCACALAADrAwAg0QEAAOICACCLAgAA4gIAIAwJAADsAgAgxAEAAOICACDFAQAA4gIAIMYBAADiAgAgxwEAAOICACDIAQAA4gIAIMkBAADiAgAgygEAAOICACDLAQAA4gIAIMwBAADiAgAgzQEAAOICACDRAQAA4gIAIAAAAAUYAAD5AwAgGQAA_AMAII4CAAD6AwAgjwIAAPsDACCUAgAAAQAgAxgAAPkDACCOAgAA-gMAIJQCAAABACAAAAAAAAAFGAAA9AMAIBkAAPcDACCOAgAA9QMAII8CAAD2AwAglAIAAAEAIAMYAAD0AwAgjgIAAPUDACCUAgAAAQAgAAAABRgAAO8DACAZAADyAwAgjgIAAPADACCPAgAA8QMAIJQCAAABACADGAAA7wMAII4CAADwAwAglAIAAAEAIAAAAAGRAgAAAIYCAgGRAgAAAIgCAgsYAADZAwAwGQAA3gMAMI4CAADaAwAwjwIAANsDADCQAgAA3AMAIJECAADdAwAwkgIAAN0DADCTAgAA3QMAMJQCAADdAwAwlQIAAN8DADCWAgAA4AMAMAsYAADNAwAwGQAA0gMAMI4CAADOAwAwjwIAAM8DADCQAgAA0AMAIJECAADRAwAwkgIAANEDADCTAgAA0QMAMJQCAADRAwAwlQIAANMDADCWAgAA1AMAMAcYAADIAwAgGQAAywMAII4CAADJAwAgjwIAAMoDACCSAgAACwAgkwIAAAsAIJQCAACPAQAgBxgAAMMDACAZAADGAwAgjgIAAMQDACCPAgAAxQMAIJICAAAXACCTAgAAFwAglAIAAHcAIAm3AQEAAAABzgEgAAAAAc8BQAAAAAHQAUAAAAAB0QFAAAAAAdIBAQAAAAHzAQEAAAAB9AEBAAAAAfUBAQAAAAECAAAAdwAgGAAAwwMAIAMAAAAXACAYAADDAwAgGQAAxwMAIAsAAAAXACARAADHAwAgtwEBAOACACHOASAA5wIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdIBAQDgAgAh8wEBAOACACH0AQEA5gIAIfUBAQDmAgAhCbcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIfMBAQDgAgAh9AEBAOYCACH1AQEA5gIAIR0GAACkAwAgCgAApQMAILcBAQAAAAHFAQEAAAABzwFAAAAAAdABQAAAAAHRAUAAAAAB2QEBAAAAAdoBAQAAAAHbAQEAAAAB3AEBAAAAAd0BAQAAAAHeAQEAAAAB3wEIAAAAAeABAQAAAAHhAQEAAAAB4gEBAAAAAeMBAQAAAAHkAQEAAAAB5QEBAAAAAeYBAQAAAAHnAQEAAAAB6QEAAADpAQLrAQAAAOsBAu0BAAAA7QEC7wEAAADvAQLwAQEAAAAB8QEBAAAAAfIBIAAAAAECAAAAjwEAIBgAAMgDACADAAAACwAgGAAAyAMAIBkAAMwDACAfAAAACwAgBgAAkwMAIAoAAJQDACARAADMAwAgtwEBAOACACHFAQEA4AIAIc8BQADoAgAh0AFAAOgCACHRAUAA6QIAIdkBAQDgAgAh2gEBAOACACHbAQEA4AIAIdwBAQDgAgAh3QEBAOACACHeAQEA5gIAId8BCADyAgAh4AEBAOYCACHhAQEA5gIAIeIBAQDmAgAh4wEBAOYCACHkAQEA4AIAIeUBAQDgAgAh5gEBAOACACHnAQEA4AIAIekBAACOA-kBIusBAACPA-sBIu0BAACQA-0BIu8BAACRA-8BIvABAQDgAgAh8QEBAOYCACHyASAA5wIAIR0GAACTAwAgCgAAlAMAILcBAQDgAgAhxQEBAOACACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHZAQEA4AIAIdoBAQDgAgAh2wEBAOACACHcAQEA4AIAId0BAQDgAgAh3gEBAOYCACHfAQgA8gIAIeABAQDmAgAh4QEBAOYCACHiAQEA5gIAIeMBAQDmAgAh5AEBAOACACHlAQEA4AIAIeYBAQDgAgAh5wEBAOACACHpAQAAjgPpASLrAQAAjwPrASLtAQAAkAPtASLvAQAAkQPvASLwAQEA4AIAIfEBAQDmAgAh8gEgAOcCACEMtwEBAAAAAc8BQAAAAAHQAUAAAAAB-QEBAAAAAfoBAQAAAAH7AQEAAAAB_AEBAAAAAf0BAQAAAAH-AUAAAAAB_wFAAAAAAYACAQAAAAGBAgEAAAABAgAAAAkAIBgAANgDACADAAAACQAgGAAA2AMAIBkAANcDACABEQAA7gMAMBEDAADBAgAgtAEAANkCADC1AQAABwAQtgEAANkCADC3AQEAAAABzwFAAKUCACHQAUAApQIAIdgBAQCSAgAh-QEBAJICACH6AQEAkgIAIfsBAQCjAgAh_AEBAKMCACH9AQEAowIAIf4BQACmAgAh_wFAAKYCACGAAgEAowIAIYECAQCjAgAhAgAAAAkAIBEAANcDACACAAAA1QMAIBEAANYDACAQtAEAANQDADC1AQAA1QMAELYBAADUAwAwtwEBAJICACHPAUAApQIAIdABQAClAgAh2AEBAJICACH5AQEAkgIAIfoBAQCSAgAh-wEBAKMCACH8AQEAowIAIf0BAQCjAgAh_gFAAKYCACH_AUAApgIAIYACAQCjAgAhgQIBAKMCACEQtAEAANQDADC1AQAA1QMAELYBAADUAwAwtwEBAJICACHPAUAApQIAIdABQAClAgAh2AEBAJICACH5AQEAkgIAIfoBAQCSAgAh-wEBAKMCACH8AQEAowIAIf0BAQCjAgAh_gFAAKYCACH_AUAApgIAIYACAQCjAgAhgQIBAKMCACEMtwEBAOACACHPAUAA6AIAIdABQADoAgAh-QEBAOACACH6AQEA4AIAIfsBAQDmAgAh_AEBAOYCACH9AQEA5gIAIf4BQADpAgAh_wFAAOkCACGAAgEA5gIAIYECAQDmAgAhDLcBAQDgAgAhzwFAAOgCACHQAUAA6AIAIfkBAQDgAgAh-gEBAOACACH7AQEA5gIAIfwBAQDmAgAh_QEBAOYCACH-AUAA6QIAIf8BQADpAgAhgAIBAOYCACGBAgEA5gIAIQy3AQEAAAABzwFAAAAAAdABQAAAAAH5AQEAAAAB-gEBAAAAAfsBAQAAAAH8AQEAAAAB_QEBAAAAAf4BQAAAAAH_AUAAAAABgAIBAAAAAYECAQAAAAEHtwEBAAAAAc8BQAAAAAHQAUAAAAAB-AFAAAAAAYICAQAAAAGDAgEAAAABhAIBAAAAAQIAAAAFACAYAADkAwAgAwAAAAUAIBgAAOQDACAZAADjAwAgAREAAO0DADAMAwAAwQIAILQBAADaAgAwtQEAAAMAELYBAADaAgAwtwEBAAAAAc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIfgBQAClAgAhggIBAAAAAYMCAQCjAgAhhAIBAKMCACECAAAABQAgEQAA4wMAIAIAAADhAwAgEQAA4gMAIAu0AQAA4AMAMLUBAADhAwAQtgEAAOADADC3AQEAkgIAIc8BQAClAgAh0AFAAKUCACHYAQEAkgIAIfgBQAClAgAhggIBAJICACGDAgEAowIAIYQCAQCjAgAhC7QBAADgAwAwtQEAAOEDABC2AQAA4AMAMLcBAQCSAgAhzwFAAKUCACHQAUAApQIAIdgBAQCSAgAh-AFAAKUCACGCAgEAkgIAIYMCAQCjAgAhhAIBAKMCACEHtwEBAOACACHPAUAA6AIAIdABQADoAgAh-AFAAOgCACGCAgEA4AIAIYMCAQDmAgAhhAIBAOYCACEHtwEBAOACACHPAUAA6AIAIdABQADoAgAh-AFAAOgCACGCAgEA4AIAIYMCAQDmAgAhhAIBAOYCACEHtwEBAAAAAc8BQAAAAAHQAUAAAAAB-AFAAAAAAYICAQAAAAGDAgEAAAABhAIBAAAAAQQYAADZAwAwjgIAANoDADCQAgAA3AMAIJQCAADdAwAwBBgAAM0DADCOAgAAzgMAMJACAADQAwAglAIAANEDADADGAAAyAMAII4CAADJAwAglAIAAI8BACADGAAAwwMAII4CAADEAwAglAIAAHcAIAAABAMAAKYDACDRAQAA4gIAIPQBAADiAgAg9QEAAOICACACBgAAgwMAINEBAADiAgAgB7cBAQAAAAHPAUAAAAAB0AFAAAAAAfgBQAAAAAGCAgEAAAABgwIBAAAAAYQCAQAAAAEMtwEBAAAAAc8BQAAAAAHQAUAAAAAB-QEBAAAAAfoBAQAAAAH7AQEAAAAB_AEBAAAAAf0BAQAAAAH-AUAAAAAB_wFAAAAAAYACAQAAAAGBAgEAAAABDwUAAOYDACAJAADnAwAgCwAA6AMAILcBAQAAAAHOASAAAAABzwFAAAAAAdABQAAAAAHRAUAAAAAB0gEBAAAAAfMBAQAAAAGGAgAAAIYCAogCAAAAiAICiQIgAAAAAYoCIAAAAAGLAgEAAAABAgAAAAEAIBgAAO8DACADAAAAHAAgGAAA7wMAIBkAAPMDACARAAAAHAAgBQAAwAMAIAkAAMEDACALAADCAwAgEQAA8wMAILcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIfMBAQDgAgAhhgIAAL0DhgIiiAIAAL4DiAIiiQIgAOcCACGKAiAA5wIAIYsCAQDmAgAhDwUAAMADACAJAADBAwAgCwAAwgMAILcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIfMBAQDgAgAhhgIAAL0DhgIiiAIAAL4DiAIiiQIgAOcCACGKAiAA5wIAIYsCAQDmAgAhDwQAAOUDACAJAADnAwAgCwAA6AMAILcBAQAAAAHOASAAAAABzwFAAAAAAdABQAAAAAHRAUAAAAAB0gEBAAAAAfMBAQAAAAGGAgAAAIYCAogCAAAAiAICiQIgAAAAAYoCIAAAAAGLAgEAAAABAgAAAAEAIBgAAPQDACADAAAAHAAgGAAA9AMAIBkAAPgDACARAAAAHAAgBAAAvwMAIAkAAMEDACALAADCAwAgEQAA-AMAILcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIfMBAQDgAgAhhgIAAL0DhgIiiAIAAL4DiAIiiQIgAOcCACGKAiAA5wIAIYsCAQDmAgAhDwQAAL8DACAJAADBAwAgCwAAwgMAILcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIfMBAQDgAgAhhgIAAL0DhgIiiAIAAL4DiAIiiQIgAOcCACGKAiAA5wIAIYsCAQDmAgAhDwQAAOUDACAFAADmAwAgCQAA5wMAILcBAQAAAAHOASAAAAABzwFAAAAAAdABQAAAAAHRAUAAAAAB0gEBAAAAAfMBAQAAAAGGAgAAAIYCAogCAAAAiAICiQIgAAAAAYoCIAAAAAGLAgEAAAABAgAAAAEAIBgAAPkDACADAAAAHAAgGAAA-QMAIBkAAP0DACARAAAAHAAgBAAAvwMAIAUAAMADACAJAADBAwAgEQAA_QMAILcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIfMBAQDgAgAhhgIAAL0DhgIiiAIAAL4DiAIiiQIgAOcCACGKAiAA5wIAIYsCAQDmAgAhDwQAAL8DACAFAADAAwAgCQAAwQMAILcBAQDgAgAhzgEgAOcCACHPAUAA6AIAIdABQADoAgAh0QFAAOkCACHSAQEA4AIAIfMBAQDgAgAhhgIAAL0DhgIiiAIAAL4DiAIiiQIgAOcCACGKAiAA5wIAIYsCAQDmAgAhDwQAAOUDACAFAADmAwAgCwAA6AMAILcBAQAAAAHOASAAAAABzwFAAAAAAdABQAAAAAHRAUAAAAAB0gEBAAAAAfMBAQAAAAGGAgAAAIYCAogCAAAAiAICiQIgAAAAAYoCIAAAAAGLAgEAAAABAgAAAAEAIBgAAP4DACACtwEBAAAAAdcBAQAAAAEDAAAAHAAgGAAA_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-HwA_AAAFBwBEHgBHHwBIcABFcQBGAAAAAAAFBwBEHgBHHwBIcABFcQBGAQniAQQBCegBBAMHAE0eAE4fAE8AAAADBwBNHgBOHwBPAAAABQcAVR4AWB8AWXAAVnEAVwAAAAAABQcAVR4AWB8AWXAAVnEAVwwCAQ0bAQ4eAQ8fARAgARIiARMkDBQlDRUnARYpDBcqDhorARssARwtDCAwDyExEyIyAiMzAiQ0AiU1AiY2Aic4Aig6DCk7FCo9Ais_DCxAFS1BAi5CAi9DDDBGFjFHGjJIAzNJAzRKAzVLAzZMAzdOAzhQDDlRGzpTAztVDDxWHD1XAz5YAz9ZDEBcHUFdIUJfIkNgIkRjIkVkIkZlIkdnIkhpDElqI0psIktuDExvJE1wIk5xIk9yDFB1JVF2KVJ4ClN5ClR7ClV8ClZ9Cld_CliBAQxZggEqWoQBCluGAQxchwErXYgBCl6JAQpfigEMYI0BLGGOATBikAEEY5EBBGSTAQRllAEEZpUBBGeXAQRomQEMaZoBMWqcAQRrngEMbJ8BMm2gAQRuoQEEb6IBDHKlATNzpgE5dKcBBXWoAQV2qQEFd6oBBXirAQV5rQEFeq8BDHuwATp8sgEFfbQBDH61ATt_tgEFgAG3AQWBAbgBDIIBuwE8gwG8AUCEAb4BBoUBvwEGhgHCAQaHAcMBBogBxAEGiQHGAQaKAcgBDIsByQFBjAHLAQaNAc0BDI4BzgFCjwHPAQaQAdABBpEB0QEMkgHUAUOTAdUBSZQB1wEIlQHYAQiWAdoBCJcB2wEImAHcAQiZAd4BCJoB4AEMmwHhAUqcAeQBCJ0B5gEMngHnAUufAekBCKAB6gEIoQHrAQyiAe4BTKMB7wFQpAHxAVGlAfIBUaYB9QFRpwH2AVGoAfcBUakB-QFRqgH7AQyrAfwBUqwB_gFRrQGAAgyuAYECU68BggJRsAGDAlGxAYQCDLIBhwJUswGIAlo"
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
  emergencyContactNumber: "emergencyContactNumber",
  monthlySalary: "monthlySalary",
  employeeId: "employeeId",
  picture: "picture",
  picturePublicId: "picturePublicId",
  experience: "experience",
  experiencePublicId: "experiencePublicId",
  authoritySign: "authoritySign",
  authoritySignPublicId: "authoritySignPublicId",
  EmployeeSign: "EmployeeSign",
  EmployeeSignPublicId: "EmployeeSignPublicId",
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
            const stringFilter2 = {
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
  return employee;
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
          EmployeeSign: employeeSign.secure_url,
          EmployeeSignPublicId: employeeSign.public_id,
          nid: payload.nid,
          fatherName: payload.fatherName,
          motherName: payload.motherName,
          emergencyContactNumber: payload.emergencyContact ?? null,
          monthlySalary: payload.monthlySalary,
          authoritySign: authoritySign.secure_url,
          authoritySignPublicId: authoritySign.public_id ?? null,
          experience: experience?.secure_url ?? null,
          experiencePublicId: experience?.public_id ?? null,
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
          uri: picture.secure_url,
          name: pictureFile?.originalname,
          type: pictureFile?.mimetype
        } : void 0,
        experience: experience ? {
          uri: experience.secure_url,
          name: experienceFile?.originalname,
          type: experienceFile?.mimetype
        } : null,
        authoritySign: {
          uri: authoritySign.secure_url,
          name: authoritySignFile.originalname,
          type: authoritySignFile.mimetype
        },
        employeeSign: {
          uri: employeeSign.secure_url,
          name: employeeSignFile.originalname,
          type: employeeSignFile.mimetype
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
  const isEmployeeExists = await prisma.employee.findUnique({
    where: { id },
    select: { id: true }
  });
  if (!isEmployeeExists) {
    throw new AppError_default(status10.NOT_FOUND, "Employee Not found");
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
      EmployeeSignPublicId: true,
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
    employee.EmployeeSignPublicId ? cloudinary_service_default.delete(employee.EmployeeSignPublicId) : Promise.resolve(),
    employee.experiencePublicId ? cloudinary_service_default.delete(employee.experiencePublicId) : Promise.resolve()
  ]);
  return { message: "Employee deleted successfully" };
};
var EmployeeService = {
  getAllEmployees,
  getEmployeeById,
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
  deleteEmployee: deleteEmployee2
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