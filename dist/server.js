var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
import { emailOTP } from "better-auth/plugins/email-otp";

// src/generated/enums.ts
var UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  ACCOUNTANT: "ACCOUNTANT",
  LIBRARIAN: "LIBRARIAN"
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
    "SUPER_ADMIN_PASSWORD"
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
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD
  };
};
var envVars = loadEnvVariables();

// src/app/utils/email.ts
import ejs from "ejs";
import status2 from "http-status";
import nodemailer from "nodemailer";
import path from "path";
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
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
    throw new AppError_default(status2.INTERNAL_SERVER_ERROR, "Failed to send email");
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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  ACCOUNTANT\n  LIBRARIAN\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  email String @unique\n  phone String @unique\n\n  fullName               String\n  picture                String?\n  nid                    String  @unique\n  fatherName             String\n  motherName             String\n  emergencyContactNumber String?\n  monthlySalary          Float\n  experience             String\n  authoritySign          String\n\n  gender       Gender\n  bloodGroup   BloodGroup\n  religion     Religion\n  employeeRole EmployeeRole\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@map("employee")\n}\n\nmodel TutorProfile {\n  id         String @id @default(uuid())\n  classId    String\n  employeeId String\n\n  fullNameBangla          String\n  dateOfBirth             DateTime\n  birthRegistrationNumber String   @unique\n}\n\nmodel Class {\n  id               String @id @default(uuid())\n  name             String\n  monthlyTutionFee Float\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  @@map("class")\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContactNumber","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"experience","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"EmployeeRole"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"employee"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"fullNameBangla","kind":"scalar","type":"String"},{"name":"dateOfBirth","kind":"scalar","type":"DateTime"},{"name":"birthRegistrationNumber","kind":"scalar","type":"String"}],"dbName":null},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTutionFee","kind":"scalar","type":"Float"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"}],"dbName":"class"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","employee","admin","_count","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","_avg","_sum","Employee.groupBy","Employee.aggregate","TutorProfile.findUnique","TutorProfile.findUniqueOrThrow","TutorProfile.findFirst","TutorProfile.findFirstOrThrow","TutorProfile.findMany","TutorProfile.createOne","TutorProfile.createMany","TutorProfile.createManyAndReturn","TutorProfile.updateOne","TutorProfile.updateMany","TutorProfile.updateManyAndReturn","TutorProfile.upsertOne","TutorProfile.deleteOne","TutorProfile.deleteMany","TutorProfile.groupBy","TutorProfile.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","AND","OR","NOT","id","name","monthlyTutionFee","isDeleted","createdAt","updatedAt","deletedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","classId","employeeId","fullNameBangla","dateOfBirth","birthRegistrationNumber","userId","email","phone","fullName","picture","nid","fatherName","motherName","emergencyContactNumber","monthlySalary","experience","authoritySign","Gender","gender","BloodGroup","bloodGroup","Religion","religion","EmployeeRole","employeeRole","isdeleted","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","UserRole","role","UserStatus","status","needPasswordChange","emailVerified","image","every","some","none","is","isNot","connectOrCreate","upsert","disconnect","delete","connect","createMany","set","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "iwNGgAETBAAAkAIAIAUAAJECACAGAACSAgAgBwAAkwIAIJEBAACNAgAwkgEAABIAEJMBAACNAgAwlAEBAAAAAZUBAQDiAQAhlwEgAOQBACGYAUAA5QEAIZkBQADlAQAhmgFAAOYBACGsAQEAAAAB0gEAAI4C0gEi1AEAAI8C1AEi1QEgAOQBACHWASAA5AEAIdcBAQD6AQAhAQAAAAEAIAwDAAD_AQAgkQEAAJUCADCSAQAAAwAQkwEAAJUCADCUAQEA4gEAIZgBQADlAQAhmQFAAOUBACGrAQEA4gEAIcQBQADlAQAhzgEBAOIBACHPAQEA-gEAIdABAQD6AQAhAwMAALACACDPAQAAlgIAINABAACWAgAgDAMAAP8BACCRAQAAlQIAMJIBAAADABCTAQAAlQIAMJQBAQAAAAGYAUAA5QEAIZkBQADlAQAhqwEBAOIBACHEAUAA5QEAIc4BAQAAAAHPAQEA-gEAIdABAQD6AQAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAAD_AQAgkQEAAJQCADCSAQAABwAQkwEAAJQCADCUAQEA4gEAIZgBQADlAQAhmQFAAOUBACGrAQEA4gEAIcUBAQDiAQAhxgEBAOIBACHHAQEA-gEAIcgBAQD6AQAhyQEBAPoBACHKAUAA5gEAIcsBQADmAQAhzAEBAPoBACHNAQEA-gEAIQgDAACwAgAgxwEAAJYCACDIAQAAlgIAIMkBAACWAgAgygEAAJYCACDLAQAAlgIAIMwBAACWAgAgzQEAAJYCACARAwAA_wEAIJEBAACUAgAwkgEAAAcAEJMBAACUAgAwlAEBAAAAAZgBQADlAQAhmQFAAOUBACGrAQEA4gEAIcUBAQDiAQAhxgEBAOIBACHHAQEA-gEAIcgBAQD6AQAhyQEBAPoBACHKAUAA5gEAIcsBQADmAQAhzAEBAPoBACHNAQEA-gEAIQMAAAAHACABAAAIADACAAAJACAZAwAA_wEAIJEBAAD5AQAwkgEAAAsAEJMBAAD5AQAwlAEBAOIBACGYAUAA5QEAIZkBQADlAQAhmgFAAOYBACGrAQEA4gEAIawBAQDiAQAhrQEBAOIBACGuAQEA4gEAIa8BAQD6AQAhsAEBAOIBACGxAQEA4gEAIbIBAQDiAQAhswEBAPoBACG0AQgA4wEAIbUBAQDiAQAhtgEBAOIBACG4AQAA-wG4ASK6AQAA_AG6ASK8AQAA_QG8ASK-AQAA_gG-ASK_ASAA5AEAIQEAAAALACAOAwAA_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-QEAMJIBAAALABCTAQAA-QEAMJQBAQAAAAGYAUAA5QEAIZkBQADlAQAhmgFAAOYBACGrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEA4gEAIa8BAQD6AQAhsAEBAAAAAbEBAQDiAQAhsgEBAOIBACGzAQEA-gEAIbQBCADjAQAhtQEBAOIBACG2AQEA4gEAIbgBAAD7AbgBIroBAAD8AboBIrwBAAD9AbwBIr4BAAD-Ab4BIr8BIADkAQAhAQAAAIUBACABAAAAhQEAIAQDAACwAgAgmgEAAJYCACCvAQAAlgIAILMBAACWAgAgAwAAAAsAIAEAAIgBADACAACFAQAgAwAAAAsAIAEAAIgBADACAACFAQAgAwAAAAsAIAEAAIgBADACAACFAQAgFgMAAK8CACCUAQEAAAABmAFAAAAAAZkBQAAAAAGaAUAAAAABqwEBAAAAAawBAQAAAAGtAQEAAAABrgEBAAAAAa8BAQAAAAGwAQEAAAABsQEBAAAAAbIBAQAAAAGzAQEAAAABtAEIAAAAAbUBAQAAAAG2AQEAAAABuAEAAAC4AQK6AQAAALoBArwBAAAAvAECvgEAAAC-AQK_ASAAAAABAQ4AAIwBACAVlAEBAAAAAZgBQAAAAAGZAUAAAAABmgFAAAAAAasBAQAAAAGsAQEAAAABrQEBAAAAAa4BAQAAAAGvAQEAAAABsAEBAAAAAbEBAQAAAAGyAQEAAAABswEBAAAAAbQBCAAAAAG1AQEAAAABtgEBAAAAAbgBAAAAuAECugEAAAC6AQK8AQAAALwBAr4BAAAAvgECvwEgAAAAAQEOAACOAQAwAQ4AAI4BADAWAwAArgIAIJQBAQCcAgAhmAFAAJ8CACGZAUAAnwIAIZoBQACgAgAhqwEBAJwCACGsAQEAnAIAIa0BAQCcAgAhrgEBAJwCACGvAQEAqQIAIbABAQCcAgAhsQEBAJwCACGyAQEAnAIAIbMBAQCpAgAhtAEIAJ0CACG1AQEAnAIAIbYBAQCcAgAhuAEAAKoCuAEiugEAAKsCugEivAEAAKwCvAEivgEAAK0CvgEivwEgAJ4CACECAAAAhQEAIA4AAJEBACAVlAEBAJwCACGYAUAAnwIAIZkBQACfAgAhmgFAAKACACGrAQEAnAIAIawBAQCcAgAhrQEBAJwCACGuAQEAnAIAIa8BAQCpAgAhsAEBAJwCACGxAQEAnAIAIbIBAQCcAgAhswEBAKkCACG0AQgAnQIAIbUBAQCcAgAhtgEBAJwCACG4AQAAqgK4ASK6AQAAqwK6ASK8AQAArAK8ASK-AQAArQK-ASK_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-AQiiAQAA7wG-ASIHCAAA2QEAIBsAAPABACAcAADwAQAgmwEAAAC-AQKcAQAAAL4BCJ0BAAAAvgEIogEAAO8BvgEiBJsBAAAAvgECnAEAAAC-AQidAQAAAL4BCKIBAADwAb4BIgcIAADZAQAgGwAA8gEAIBwAAPIBACCbAQAAALwBApwBAAAAvAEInQEAAAC8AQiiAQAA8QG8ASIEmwEAAAC8AQKcAQAAALwBCJ0BAAAAvAEIogEAAPIBvAEiBwgAANkBACAbAAD0AQAgHAAA9AEAIJsBAAAAugECnAEAAAC6AQidAQAAALoBCKIBAADzAboBIgSbAQAAALoBApwBAAAAugEInQEAAAC6AQiiAQAA9AG6ASIHCAAA2QEAIBsAAPYBACAcAAD2AQAgmwEAAAC4AQKcAQAAALgBCJ0BAAAAuAEIogEAAPUBuAEiBJsBAAAAuAECnAEAAAC4AQidAQAAALgBCKIBAAD2AbgBIg4IAADWAQAgGwAA-AEAIBwAAPgBACCbAQEAAAABnAEBAAAABZ0BAQAAAAWeAQEAAAABnwEBAAAAAaABAQAAAAGhAQEAAAABogEBAPcBACGjAQEAAAABpAEBAAAAAaUBAQAAAAELmwEBAAAAAZwBAQAAAAWdAQEAAAAFngEBAAAAAZ8BAQAAAAGgAQEAAAABoQEBAAAAAaIBAQD4AQAhowEBAAAAAaQBAQAAAAGlAQEAAAABGQMAAP8BACCRAQAA-QEAMJIBAAALABCTAQAA-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-QEAMJIBAAALABCTAQAA-QEAMJQBAQDiAQAhmAFAAOUBACGZAUAA5QEAIZoBQADmAQAhqwEBAOIBACGsAQEA4gEAIa0BAQDiAQAhrgEBAOIBACGvAQEA-gEAIbABAQDiAQAhsQEBAOIBACGyAQEA4gEAIbMBAQD6AQAhtAEIAOMBACG1AQEA4gEAIbYBAQDiAQAhuAEAAPsBuAEiugEAAPwBugEivAEAAP0BvAEivgEAAP4BvgEivwEgAOQBACHbAQAACwAg3AEAAAsAIBADAAD_AQAgkQEAAIECADCSAQAADQAQkwEAAIECADCUAQEA4gEAIZUBAQDiAQAhlwEgAOQBACGYAUAA5QEAIZkBQADlAQAhmgFAAOYBACGrAQEA4gEAIawBAQDiAQAhwAEBAPoBACHBAQEA-gEAIdsBAAANACDcAQAADQAgEQMAAP8BACCRAQAAlAIAMJIBAAAHABCTAQAAlAIAMJQBAQDiAQAhmAFAAOUBACGZAUAA5QEAIasBAQDiAQAhxQEBAOIBACHGAQEA4gEAIccBAQD6AQAhyAEBAPoBACHJAQEA-gEAIcoBQADmAQAhywFAAOYBACHMAQEA-gEAIc0BAQD6AQAhDAMAAP8BACCRAQAAlQIAMJIBAAADABCTAQAAlQIAMJQBAQDiAQAhmAFAAOUBACGZAUAA5QEAIasBAQDiAQAhxAFAAOUBACHOAQEA4gEAIc8BAQD6AQAh0AEBAPoBACEAAAAAAAAB4wEBAAAAAQXjAQgAAAAB5gEIAAAAAecBCAAAAAHoAQgAAAAB6QEIAAAAAQHjASAAAAABAeMBQAAAAAEB4wFAAAAAAQAAAAAAAAAAAeMBAQAAAAEB4wEAAAC4AQIB4wEAAAC6AQIB4wEAAAC8AQIB4wEAAAC-AQIFFQAAhwMAIBYAAIoDACDdAQAAiAMAIN4BAACJAwAg4QEAAAEAIAMVAACHAwAg3QEAAIgDACDhAQAAAQAgBgQAAPICACAFAADzAgAgBgAA9AIAIAcAAPUCACCaAQAAlgIAINcBAACWAgAgAAAABRUAAIIDACAWAACFAwAg3QEAAIMDACDeAQAAhAMAIOEBAAABACADFQAAggMAIN0BAACDAwAg4QEAAAEAIAAAAAAAAAUVAAD9AgAgFgAAgAMAIN0BAAD-AgAg3gEAAP8CACDhAQAAAQAgAxUAAP0CACDdAQAA_gIAIOEBAAABACAAAAAFFQAA-AIAIBYAAPsCACDdAQAA-QIAIN4BAAD6AgAg4QEAAAEAIAMVAAD4AgAg3QEAAPkCACDhAQAAAQAgAAAAAeMBAAAA0gECAeMBAAAA1AECCxUAAOICADAWAADnAgAw3QEAAOMCADDeAQAA5AIAMN8BAADmAgAw4AEAAOYCADDhAQAA5gIAMOIBAADlAgAg4wEAAOYCADDkAQAA6AIAMOUBAADpAgAwCxUAANYCADAWAADbAgAw3QEAANcCADDeAQAA2AIAMN8BAADaAgAw4AEAANoCADDhAQAA2gIAMOIBAADZAgAg4wEAANoCADDkAQAA3AIAMOUBAADdAgAwBxUAANECACAWAADUAgAg3QEAANICACDeAQAA0wIAIN8BAAALACDgAQAACwAg4QEAAIUBACAHFQAAzAIAIBYAAM8CACDdAQAAzQIAIN4BAADOAgAg3wEAAA0AIOABAAANACDhAQAAbQAgCZQBAQAAAAGVAQEAAAABlwEgAAAAAZgBQAAAAAGZAUAAAAABmgFAAAAAAawBAQAAAAHAAQEAAAABwQEBAAAAAQIAAABtACAVAADMAgAgAwAAAA0AIBUAAMwCACAWAADQAgAgCwAAAA0AIA4AANACACCUAQEAnAIAIZUBAQCcAgAhlwEgAJ4CACGYAUAAnwIAIZkBQACfAgAhmgFAAKACACGsAQEAnAIAIcABAQCpAgAhwQEBAKkCACEJlAEBAJwCACGVAQEAnAIAIZcBIACeAgAhmAFAAJ8CACGZAUAAnwIAIZoBQACgAgAhrAEBAJwCACHAAQEAqQIAIcEBAQCpAgAhFJQBAQAAAAGYAUAAAAABmQFAAAAAAZoBQAAAAAGsAQEAAAABrQEBAAAAAa4BAQAAAAGvAQEAAAABsAEBAAAAAbEBAQAAAAGyAQEAAAABswEBAAAAAbQBCAAAAAG1AQEAAAABtgEBAAAAAbgBAAAAuAECugEAAAC6AQK8AQAAALwBAr4BAAAAvgECvwEgAAAAAQIAAACFAQAgFQAA0QIAIAMAAAALACAVAADRAgAgFgAA1QIAIBYAAAALACAOAADVAgAglAEBAJwCACGYAUAAnwIAIZkBQACfAgAhmgFAAKACACGsAQEAnAIAIa0BAQCcAgAhrgEBAJwCACGvAQEAqQIAIbABAQCcAgAhsQEBAJwCACGyAQEAnAIAIbMBAQCpAgAhtAEIAJ0CACG1AQEAnAIAIbYBAQCcAgAhuAEAAKoCuAEiugEAAKsCugEivAEAAKwCvAEivgEAAK0CvgEivwEgAJ4CACEUlAEBAJwCACGYAUAAnwIAIZkBQACfAgAhmgFAAKACACGsAQEAnAIAIa0BAQCcAgAhrgEBAJwCACGvAQEAqQIAIbABAQCcAgAhsQEBAJwCACGyAQEAnAIAIbMBAQCpAgAhtAEIAJ0CACG1AQEAnAIAIbYBAQCcAgAhuAEAAKoCuAEiugEAAKsCugEivAEAAKwCvAEivgEAAK0CvgEivwEgAJ4CACEMlAEBAAAAAZgBQAAAAAGZAUAAAAABxQEBAAAAAcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAUAAAAABywFAAAAAAcwBAQAAAAHNAQEAAAABAgAAAAkAIBUAAOECACADAAAACQAgFQAA4QIAIBYAAOACACABDgAA9wIAMBEDAAD_AQAgkQEAAJQCADCSAQAABwAQkwEAAJQCADCUAQEAAAABmAFAAOUBACGZAUAA5QEAIasBAQDiAQAhxQEBAOIBACHGAQEA4gEAIccBAQD6AQAhyAEBAPoBACHJAQEA-gEAIcoBQADmAQAhywFAAOYBACHMAQEA-gEAIc0BAQD6AQAhAgAAAAkAIA4AAOACACACAAAA3gIAIA4AAN8CACAQkQEAAN0CADCSAQAA3gIAEJMBAADdAgAwlAEBAOIBACGYAUAA5QEAIZkBQADlAQAhqwEBAOIBACHFAQEA4gEAIcYBAQDiAQAhxwEBAPoBACHIAQEA-gEAIckBAQD6AQAhygFAAOYBACHLAUAA5gEAIcwBAQD6AQAhzQEBAPoBACEQkQEAAN0CADCSAQAA3gIAEJMBAADdAgAwlAEBAOIBACGYAUAA5QEAIZkBQADlAQAhqwEBAOIBACHFAQEA4gEAIcYBAQDiAQAhxwEBAPoBACHIAQEA-gEAIckBAQD6AQAhygFAAOYBACHLAUAA5gEAIcwBAQD6AQAhzQEBAPoBACEMlAEBAJwCACGYAUAAnwIAIZkBQACfAgAhxQEBAJwCACHGAQEAnAIAIccBAQCpAgAhyAEBAKkCACHJAQEAqQIAIcoBQACgAgAhywFAAKACACHMAQEAqQIAIc0BAQCpAgAhDJQBAQCcAgAhmAFAAJ8CACGZAUAAnwIAIcUBAQCcAgAhxgEBAJwCACHHAQEAqQIAIcgBAQCpAgAhyQEBAKkCACHKAUAAoAIAIcsBQACgAgAhzAEBAKkCACHNAQEAqQIAIQyUAQEAAAABmAFAAAAAAZkBQAAAAAHFAQEAAAABxgEBAAAAAccBAQAAAAHIAQEAAAAByQEBAAAAAcoBQAAAAAHLAUAAAAABzAEBAAAAAc0BAQAAAAEHlAEBAAAAAZgBQAAAAAGZAUAAAAABxAFAAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAQIAAAAFACAVAADtAgAgAwAAAAUAIBUAAO0CACAWAADsAgAgAQ4AAPYCADAMAwAA_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-Uxw_VR1AVh1BWR1CWh1DWx1EXR1FXwdGYB5HYh1IZAdJZR9KZh1LZx1MaAdNayBObCRPbgVQbwVRcQVScgVTcwVUdQVVdwdWeCVXegVYfAdZfSZafgVbfwVcgAEHXYMBJ16EAStfhgEEYIcBBGGJAQRiigEEY4sBBGSNAQRljwEHZpABLGeSAQRolAEHaZUBLWqWAQRrlwEEbJgBB2-bAS5wnAE0cZ4BNXKfATVzogE1dKMBNXWkATV2pgE1d6gBB3ipATZ5qwE1eq0BB3uuATd8rwE1fbABNX6xAQd_tAE4gAG1ATyBAbcBPYIBuAE9gwG7AT2EAbwBPYUBvQE9hgG_AT2HAcEBB4gBwgE-iQHEAT2KAcYBB4sBxwE_jAHIAT2NAckBPY4BygEHjwHNAUCQAc4BRg"
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
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
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
import status4 from "http-status";
import z from "zod";

// src/app/errorHelpers/handleZodError.ts
import status3 from "http-status";
var handelZodError = (err) => {
  const statusCode = status3.BAD_REQUEST;
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
  let statusCode = status4.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let stack = void 0;
  if (err instanceof z.ZodError) {
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
    statusCode = status4.INTERNAL_SERVER_ERROR;
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
import status5 from "http-status";
var notFound = (req, res) => {
  res.status(status5.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app/routes/index.ts
import { Router as Router2 } from "express";

// src/app/modules/auth/auth.routes.ts
import { Router } from "express";

// src/app/middleware/auth.ts
import status6 from "http-status";

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
      throw new AppError_default(status6.UNAUTHORIZED, "Unauthorized access!");
    }
    const verifiedToken = jwtUtils.verifyToken(
      token,
      envVars.ACCESS_TOKEN_SECRET
    );
    if (!verifiedToken.success) {
      throw new AppError_default(
        status6.UNAUTHORIZED,
        "Invalid access token."
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        id: verifiedToken.data.userId
      }
    });
    if (!user) {
      throw new AppError_default(status6.UNAUTHORIZED, "User not found.");
    }
    if (user.isDeleted) {
      throw new AppError_default(status6.UNAUTHORIZED, "User deleted.");
    }
    if (user.status === "BLOCKED" || user.status === "DELETED") {
      throw new AppError_default(status6.UNAUTHORIZED, "User inactive.");
    }
    if (authRoles.length && !authRoles.includes(user.role)) {
      throw new AppError_default(status6.FORBIDDEN, "Forbidden access.");
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
import status8 from "http-status";

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
import status7 from "http-status";
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new AppError_default(status7.FORBIDDEN, "User is blocked");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new AppError_default(status7.NOT_FOUND, "User is deleted");
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
    throw new AppError_default(status7.UNAUTHORIZED, "Invalid Session Token");
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
var AuthService = {
  loginUser,
  changePassword
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
    httpStatusCode: status8.OK,
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
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  const result = await AuthService.changePassword(
    payload,
    betterAuthSessionToken
  );
  const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status8.OK,
    success: true,
    message: "Password changed successfully",
    data: result
  });
});
var AuthController = {
  loginUser: loginUser2,
  changePassword: changePassword2
};

// src/app/modules/auth/auth.routes.ts
var router = Router();
router.post("/login", AuthController.loginUser);
router.post("/test", checkAuth(UserRole.SUPER_ADMIN), (req, res) => {
  res.json({
    message: "Test route is working!"
  });
});
router.get("/ping", (req, res) => {
  res.send("pong");
});
var AuthRoutes = router;

// src/app/routes/index.ts
var routes = Router2();
var moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
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
      console.log("Super admin already exists. Skipping seeding super admin.");
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

// src/server.ts
var bootstrap = async () => {
  try {
    await seedSuperAdmin();
    await prisma.$connect();
    app_default.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
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