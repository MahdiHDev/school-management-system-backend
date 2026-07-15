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
  ACCOUNTANT: "ACCOUNTANT",
  LIBRARIAN: "LIBRARIAN"
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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  ACCOUNTANT\n  LIBRARIAN\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone String @unique\n\n  fullName               String\n  picture                String?\n  nid                    String  @unique\n  fatherName             String\n  motherName             String\n  emergencyContactNumber String?\n  monthlySalary          Float\n  experience             String\n  authoritySign          String\n\n  gender                  Gender\n  bloodGroup              BloodGroup\n  religion                Religion\n  employeeRole            EmployeeRole\n  dateOfBirth             DateTime\n  birthRegistrationNumber String?      @unique\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted     Boolean        @default(false)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  deletedAt     DateTime?\n  tutorProfiles TutorProfile[]\n\n  @@map("employee")\n}\n\nmodel TutorProfile {\n  id String @id @default(uuid())\n\n  classId    String\n  employeeId String\n\n  class    Class    @relation(fields: [classId], references: [id], onDelete: Cascade)\n  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n}\n\nmodel Class {\n  id               String @id @default(uuid())\n  name             String\n  monthlyTutionFee Float\n\n  isDeleted     Boolean        @default(false)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  deletedAt     DateTime?\n  tutorProfiles TutorProfile[]\n\n  @@map("class")\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContactNumber","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"experience","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"EmployeeRole"},{"name":"dateOfBirth","kind":"scalar","type":"DateTime"},{"name":"birthRegistrationNumber","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfiles","kind":"object","type":"TutorProfile","relationName":"EmployeeToTutorProfile"}],"dbName":"employee"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToTutorProfile"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToTutorProfile"}],"dbName":null},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTutionFee","kind":"scalar","type":"Float"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfiles","kind":"object","type":"TutorProfile","relationName":"ClassToTutorProfile"}],"dbName":"class"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","tutorProfiles","_count","class","employee","admin","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","_avg","_sum","Employee.groupBy","Employee.aggregate","TutorProfile.findUnique","TutorProfile.findUniqueOrThrow","TutorProfile.findFirst","TutorProfile.findFirstOrThrow","TutorProfile.findMany","TutorProfile.createOne","TutorProfile.createMany","TutorProfile.createManyAndReturn","TutorProfile.updateOne","TutorProfile.updateMany","TutorProfile.updateManyAndReturn","TutorProfile.upsertOne","TutorProfile.deleteOne","TutorProfile.deleteMany","TutorProfile.groupBy","TutorProfile.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","AND","OR","NOT","id","name","monthlyTutionFee","isDeleted","createdAt","updatedAt","deletedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","classId","employeeId","userId","phone","fullName","picture","nid","fatherName","motherName","emergencyContactNumber","monthlySalary","experience","authoritySign","Gender","gender","BloodGroup","bloodGroup","Religion","religion","EmployeeRole","employeeRole","dateOfBirth","birthRegistrationNumber","isdeleted","email","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","UserRole","role","UserStatus","status","needPasswordChange","emailVerified","image","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "vQNIgAETBAAAlAIAIAUAAJUCACAJAACWAgAgCgAAlwIAIJMBAACRAgAwlAEAABkAEJUBAACRAgAwlgEBAAAAAZcBAQDmAQAhmQEgAOgBACGaAUAA6QEAIZsBQADpAQAhnAFAAOoBACHDAQEAAAAB1gEAAJIC1gEi2AEAAJMC2AEi2QEgAOgBACHaASAA6AEAIdsBAQD-AQAhAQAAAAEAIAwDAACDAgAgkwEAAJwCADCUAQAAAwAQlQEAAJwCADCWAQEA5gEAIZoBQADpAQAhmwFAAOkBACGtAQEA5gEAIcgBQADpAQAh0gEBAOYBACHTAQEA_gEAIdQBAQD-AQAhAwMAANUCACDTAQAAnQIAINQBAACdAgAgDAMAAIMCACCTAQAAnAIAMJQBAAADABCVAQAAnAIAMJYBAQAAAAGaAUAA6QEAIZsBQADpAQAhrQEBAOYBACHIAUAA6QEAIdIBAQAAAAHTAQEA_gEAIdQBAQD-AQAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAACDAgAgkwEAAJsCADCUAQAABwAQlQEAAJsCADCWAQEA5gEAIZoBQADpAQAhmwFAAOkBACGtAQEA5gEAIckBAQDmAQAhygEBAOYBACHLAQEA_gEAIcwBAQD-AQAhzQEBAP4BACHOAUAA6gEAIc8BQADqAQAh0AEBAP4BACHRAQEA_gEAIQgDAADVAgAgywEAAJ0CACDMAQAAnQIAIM0BAACdAgAgzgEAAJ0CACDPAQAAnQIAINABAACdAgAg0QEAAJ0CACARAwAAgwIAIJMBAACbAgAwlAEAAAcAEJUBAACbAgAwlgEBAAAAAZoBQADpAQAhmwFAAOkBACGtAQEA5gEAIckBAQDmAQAhygEBAOYBACHLAQEA_gEAIcwBAQD-AQAhzQEBAP4BACHOAUAA6gEAIc8BQADqAQAh0AEBAP4BACHRAQEA_gEAIQMAAAAHACABAAAIADACAAAJACAbAwAAgwIAIAYAAOsBACCTAQAA_QEAMJQBAAALABCVAQAA_QEAMJYBAQDmAQAhmgFAAOkBACGbAUAA6QEAIZwBQADqAQAhrQEBAOYBACGuAQEA5gEAIa8BAQDmAQAhsAEBAP4BACGxAQEA5gEAIbIBAQDmAQAhswEBAOYBACG0AQEA_gEAIbUBCADnAQAhtgEBAOYBACG3AQEA5gEAIbkBAAD_AbkBIrsBAACAArsBIr0BAACBAr0BIr8BAACCAr8BIsABQADpAQAhwQEBAP4BACHCASAA6AEAIQEAAAALACAICAAAmQIAIAkAAJoCACCTAQAAmAIAMJQBAAANABCVAQAAmAIAMJYBAQDmAQAhqwEBAOYBACGsAQEA5gEAIQIIAACbAwAgCQAAmQMAIAgIAACZAgAgCQAAmgIAIJMBAACYAgAwlAEAAA0AEJUBAACYAgAwlgEBAAAAAasBAQDmAQAhrAEBAOYBACEDAAAADQAgAQAADgAwAgAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIAEAAAANACABAAAADQAgDgMAAIMCACCTAQAAhQIAMJQBAAAUABCVAQAAhQIAMJYBAQDmAQAhlwEBAOYBACGZASAA6AEAIZoBQADpAQAhmwFAAOkBACGcAUAA6gEAIa0BAQDmAQAhwwEBAOYBACHEAQEA_gEAIcUBAQD-AQAhAQAAABQAIAEAAAADACABAAAABwAgAQAAAAEAIBMEAACUAgAgBQAAlQIAIAkAAJYCACAKAACXAgAgkwEAAJECADCUAQAAGQAQlQEAAJECADCWAQEA5gEAIZcBAQDmAQAhmQEgAOgBACGaAUAA6QEAIZsBQADpAQAhnAFAAOoBACHDAQEA5gEAIdYBAACSAtYBItgBAACTAtgBItkBIADoAQAh2gEgAOgBACHbAQEA_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_gEAIQEAAAB0ACABAAAAdAAgBAMAANUCACCcAQAAnQIAIMQBAACdAgAgxQEAAJ0CACADAAAAFAAgAQAAdwAwAgAAdAAgAwAAABQAIAEAAHcAMAIAAHQAIAMAAAAUACABAAB3ADACAAB0ACALAwAA2gIAIJYBAQAAAAGXAQEAAAABmQEgAAAAAZoBQAAAAAGbAUAAAAABnAFAAAAAAa0BAQAAAAHDAQEAAAABxAEBAAAAAcUBAQAAAAEBEAAAewAgCpYBAQAAAAGXAQEAAAABmQEgAAAAAZoBQAAAAAGbAUAAAAABnAFAAAAAAa0BAQAAAAHDAQEAAAABxAEBAAAAAcUBAQAAAAEBEAAAfQAwARAAAH0AMAsDAADZAgAglgEBAKMCACGXAQEAowIAIZkBIAClAgAhmgFAAKYCACGbAUAApgIAIZwBQACnAgAhrQEBAKMCACHDAQEAowIAIcQBAQDDAgAhxQEBAMMCACECAAAAdAAgEAAAgAEAIAqWAQEAowIAIZcBAQCjAgAhmQEgAKUCACGaAUAApgIAIZsBQACmAgAhnAFAAKcCACGtAQEAowIAIcMBAQCjAgAhxAEBAMMCACHFAQEAwwIAIQIAAAAUACAQAACCAQAgAgAAABQAIBAAAIIBACADAAAAdAAgFwAAewAgGAAAgAEAIAEAAAB0ACABAAAAFAAgBgcAANYCACAdAADYAgAgHgAA1wIAIJwBAACdAgAgxAEAAJ0CACDFAQAAnQIAIA2TAQAAhAIAMJQBAACJAQAQlQEAAIQCADCWAQEA1AEAIZcBAQDUAQAhmQEgANYBACGaAUAA1wEAIZsBQADXAQAhnAFAANgBACGtAQEA1AEAIcMBAQDUAQAhxAEBAO4BACHFAQEA7gEAIQMAAAAUACABAACIAQAwHAAAiQEAIAMAAAAUACABAAB3ADACAAB0ACAbAwAAgwIAIAYAAOsBACCTAQAA_QEAMJQBAAALABCVAQAA_QEAMJYBAQAAAAGaAUAA6QEAIZsBQADpAQAhnAFAAOoBACGtAQEAAAABrgEBAAAAAa8BAQDmAQAhsAEBAP4BACGxAQEAAAABsgEBAOYBACGzAQEA5gEAIbQBAQD-AQAhtQEIAOcBACG2AQEA5gEAIbcBAQDmAQAhuQEAAP8BuQEiuwEAAIACuwEivQEAAIECvQEivwEAAIICvwEiwAFAAOkBACHBAQEAAAABwgEgAOgBACEBAAAAjAEAIAEAAACMAQAgBgMAANUCACAGAAC4AgAgnAEAAJ0CACCwAQAAnQIAILQBAACdAgAgwQEAAJ0CACADAAAACwAgAQAAjwEAMAIAAIwBACADAAAACwAgAQAAjwEAMAIAAIwBACADAAAACwAgAQAAjwEAMAIAAIwBACAYAwAA0wIAIAYAANQCACCWAQEAAAABmgFAAAAAAZsBQAAAAAGcAUAAAAABrQEBAAAAAa4BAQAAAAGvAQEAAAABsAEBAAAAAbEBAQAAAAGyAQEAAAABswEBAAAAAbQBAQAAAAG1AQgAAAABtgEBAAAAAbcBAQAAAAG5AQAAALkBArsBAAAAuwECvQEAAAC9AQK_AQAAAL8BAsABQAAAAAHBAQEAAAABwgEgAAAAAQEQAACTAQAgFpYBAQAAAAGaAUAAAAABmwFAAAAAAZwBQAAAAAGtAQEAAAABrgEBAAAAAa8BAQAAAAGwAQEAAAABsQEBAAAAAbIBAQAAAAGzAQEAAAABtAEBAAAAAbUBCAAAAAG2AQEAAAABtwEBAAAAAbkBAAAAuQECuwEAAAC7AQK9AQAAAL0BAr8BAAAAvwECwAFAAAAAAcEBAQAAAAHCASAAAAABARAAAJUBADABEAAAlQEAMBgDAADIAgAgBgAAyQIAIJYBAQCjAgAhmgFAAKYCACGbAUAApgIAIZwBQACnAgAhrQEBAKMCACGuAQEAowIAIa8BAQCjAgAhsAEBAMMCACGxAQEAowIAIbIBAQCjAgAhswEBAKMCACG0AQEAwwIAIbUBCACkAgAhtgEBAKMCACG3AQEAowIAIbkBAADEArkBIrsBAADFArsBIr0BAADGAr0BIr8BAADHAr8BIsABQACmAgAhwQEBAMMCACHCASAApQIAIQIAAACMAQAgEAAAmAEAIBaWAQEAowIAIZoBQACmAgAhmwFAAKYCACGcAUAApwIAIa0BAQCjAgAhrgEBAKMCACGvAQEAowIAIbABAQDDAgAhsQEBAKMCACGyAQEAowIAIbMBAQCjAgAhtAEBAMMCACG1AQgApAIAIbYBAQCjAgAhtwEBAKMCACG5AQAAxAK5ASK7AQAAxQK7ASK9AQAAxgK9ASK_AQAAxwK_ASLAAUAApgIAIcEBAQDDAgAhwgEgAKUCACECAAAACwAgEAAAmgEAIAIAAAALACAQAACaAQAgAwAAAIwBACAXAACTAQAgGAAAmAEAIAEAAACMAQAgAQAAAAsAIAkHAAC-AgAgHQAAwQIAIB4AAMACACBvAAC_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_AEAIB4AAPwBACCdAQEAAAABngEBAAAABZ8BAQAAAAWgAQEAAAABoQEBAAAAAaIBAQAAAAGjAQEAAAABpAEBAPsBACGlAQEAAAABpgEBAAAAAacBAQAAAAEHBwAA3QEAIB0AAPoBACAeAAD6AQAgnQEAAAC5AQKeAQAAALkBCJ8BAAAAuQEIpAEAAPkBuQEiBwcAAN0BACAdAAD4AQAgHgAA-AEAIJ0BAAAAuwECngEAAAC7AQifAQAAALsBCKQBAAD3AbsBIgcHAADdAQAgHQAA9gEAIB4AAPYBACCdAQAAAL0BAp4BAAAAvQEInwEAAAC9AQikAQAA9QG9ASIHBwAA3QEAIB0AAPQBACAeAAD0AQAgnQEAAAC_AQKeAQAAAL8BCJ8BAAAAvwEIpAEAAPMBvwEiBwcAAN0BACAdAAD0AQAgHgAA9AEAIJ0BAAAAvwECngEAAAC_AQifAQAAAL8BCKQBAADzAb8BIgSdAQAAAL8BAp4BAAAAvwEInwEAAAC_AQikAQAA9AG_ASIHBwAA3QEAIB0AAPYBACAeAAD2AQAgnQEAAAC9AQKeAQAAAL0BCJ8BAAAAvQEIpAEAAPUBvQEiBJ0BAAAAvQECngEAAAC9AQifAQAAAL0BCKQBAAD2Ab0BIgcHAADdAQAgHQAA-AEAIB4AAPgBACCdAQAAALsBAp4BAAAAuwEInwEAAAC7AQikAQAA9wG7ASIEnQEAAAC7AQKeAQAAALsBCJ8BAAAAuwEIpAEAAPgBuwEiBwcAAN0BACAdAAD6AQAgHgAA-gEAIJ0BAAAAuQECngEAAAC5AQifAQAAALkBCKQBAAD5AbkBIgSdAQAAALkBAp4BAAAAuQEInwEAAAC5AQikAQAA-gG5ASIOBwAA2gEAIB0AAPwBACAeAAD8AQAgnQEBAAAAAZ4BAQAAAAWfAQEAAAAFoAEBAAAAAaEBAQAAAAGiAQEAAAABowEBAAAAAaQBAQD7AQAhpQEBAAAAAaYBAQAAAAGnAQEAAAABC50BAQAAAAGeAQEAAAAFnwEBAAAABaABAQAAAAGhAQEAAAABogEBAAAAAaMBAQAAAAGkAQEA_AEAIaUBAQAAAAGmAQEAAAABpwEBAAAAARsDAACDAgAgBgAA6wEAIJMBAAD9AQAwlAEAAAsAEJUBAAD9AQAwlgEBAOYBACGaAUAA6QEAIZsBQADpAQAhnAFAAOoBACGtAQEA5gEAIa4BAQDmAQAhrwEBAOYBACGwAQEA_gEAIbEBAQDmAQAhsgEBAOYBACGzAQEA5gEAIbQBAQD-AQAhtQEIAOcBACG2AQEA5gEAIbcBAQDmAQAhuQEAAP8BuQEiuwEAAIACuwEivQEAAIECvQEivwEAAIICvwEiwAFAAOkBACHBAQEA_gEAIcIBIADoAQAhC50BAQAAAAGeAQEAAAAFnwEBAAAABaABAQAAAAGhAQEAAAABogEBAAAAAaMBAQAAAAGkAQEA_AEAIaUBAQAAAAGmAQEAAAABpwEBAAAAAQSdAQAAALkBAp4BAAAAuQEInwEAAAC5AQikAQAA-gG5ASIEnQEAAAC7AQKeAQAAALsBCJ8BAAAAuwEIpAEAAPgBuwEiBJ0BAAAAvQECngEAAAC9AQifAQAAAL0BCKQBAAD2Ab0BIgSdAQAAAL8BAp4BAAAAvwEInwEAAAC_AQikAQAA9AG_ASIVBAAAlAIAIAUAAJUCACAJAACWAgAgCgAAlwIAIJMBAACRAgAwlAEAABkAEJUBAACRAgAwlgEBAOYBACGXAQEA5gEAIZkBIADoAQAhmgFAAOkBACGbAUAA6QEAIZwBQADqAQAhwwEBAOYBACHWAQAAkgLWASLYAQAAkwLYASLZASAA6AEAIdoBIADoAQAh2wEBAP4BACHcAQAAGQAg3QEAABkAIA2TAQAAhAIAMJQBAACJAQAQlQEAAIQCADCWAQEA1AEAIZcBAQDUAQAhmQEgANYBACGaAUAA1wEAIZsBQADXAQAhnAFAANgBACGtAQEA1AEAIcMBAQDUAQAhxAEBAO4BACHFAQEA7gEAIQ4DAACDAgAgkwEAAIUCADCUAQAAFAAQlQEAAIUCADCWAQEA5gEAIZcBAQDmAQAhmQEgAOgBACGaAUAA6QEAIZsBQADpAQAhnAFAAOoBACGtAQEA5gEAIcMBAQDmAQAhxAEBAP4BACHFAQEA_gEAIQmTAQAAhgIAMJQBAABxABCVAQAAhgIAMJYBAQDUAQAhmgFAANcBACGbAUAA1wEAIcYBAQDUAQAhxwEBANQBACHIAUAA1wEAIQmTAQAAhwIAMJQBAABeABCVAQAAhwIAMJYBAQDmAQAhmgFAAOkBACGbAUAA6QEAIcYBAQDmAQAhxwEBAOYBACHIAUAA6QEAIRCTAQAAiAIAMJQBAABYABCVAQAAiAIAMJYBAQDUAQAhmgFAANcBACGbAUAA1wEAIa0BAQDUAQAhyQEBANQBACHKAQEA1AEAIcsBAQDuAQAhzAEBAO4BACHNAQEA7gEAIc4BQADYAQAhzwFAANgBACHQAQEA7gEAIdEBAQDuAQAhC5MBAACJAgAwlAEAAEIAEJUBAACJAgAwlgEBANQBACGaAUAA1wEAIZsBQADXAQAhrQEBANQBACHIAUAA1wEAIdIBAQDUAQAh0wEBAO4BACHUAQEA7gEAIQ-TAQAAigIAMJQBAAAsABCVAQAAigIAMJYBAQDUAQAhlwEBANQBACGZASAA1gEAIZoBQADXAQAhmwFAANcBACGcAUAA2AEAIcMBAQDUAQAh1gEAAIsC1gEi2AEAAIwC2AEi2QEgANYBACHaASAA1gEAIdsBAQDuAQAhBwcAAN0BACAdAACQAgAgHgAAkAIAIJ0BAAAA1gECngEAAADWAQifAQAAANYBCKQBAACPAtYBIgcHAADdAQAgHQAAjgIAIB4AAI4CACCdAQAAANgBAp4BAAAA2AEInwEAAADYAQikAQAAjQLYASIHBwAA3QEAIB0AAI4CACAeAACOAgAgnQEAAADYAQKeAQAAANgBCJ8BAAAA2AEIpAEAAI0C2AEiBJ0BAAAA2AECngEAAADYAQifAQAAANgBCKQBAACOAtgBIgcHAADdAQAgHQAAkAIAIB4AAJACACCdAQAAANYBAp4BAAAA1gEInwEAAADWAQikAQAAjwLWASIEnQEAAADWAQKeAQAAANYBCJ8BAAAA1gEIpAEAAJAC1gEiEwQAAJQCACAFAACVAgAgCQAAlgIAIAoAAJcCACCTAQAAkQIAMJQBAAAZABCVAQAAkQIAMJYBAQDmAQAhlwEBAOYBACGZASAA6AEAIZoBQADpAQAhmwFAAOkBACGcAUAA6gEAIcMBAQDmAQAh1gEAAJIC1gEi2AEAAJMC2AEi2QEgAOgBACHaASAA6AEAIdsBAQD-AQAhBJ0BAAAA1gECngEAAADWAQifAQAAANYBCKQBAACQAtYBIgSdAQAAANgBAp4BAAAA2AEInwEAAADYAQikAQAAjgLYASIDqAEAAAMAIKkBAAADACCqAQAAAwAgA6gBAAAHACCpAQAABwAgqgEAAAcAIB0DAACDAgAgBgAA6wEAIJMBAAD9AQAwlAEAAAsAEJUBAAD9AQAwlgEBAOYBACGaAUAA6QEAIZsBQADpAQAhnAFAAOoBACGtAQEA5gEAIa4BAQDmAQAhrwEBAOYBACGwAQEA_gEAIbEBAQDmAQAhsgEBAOYBACGzAQEA5gEAIbQBAQD-AQAhtQEIAOcBACG2AQEA5gEAIbcBAQDmAQAhuQEAAP8BuQEiuwEAAIACuwEivQEAAIECvQEivwEAAIICvwEiwAFAAOkBACHBAQEA_gEAIcIBIADoAQAh3AEAAAsAIN0BAAALACAQAwAAgwIAIJMBAACFAgAwlAEAABQAEJUBAACFAgAwlgEBAOYBACGXAQEA5gEAIZkBIADoAQAhmgFAAOkBACGbAUAA6QEAIZwBQADqAQAhrQEBAOYBACHDAQEA5gEAIcQBAQD-AQAhxQEBAP4BACHcAQAAFAAg3QEAABQAIAgIAACZAgAgCQAAmgIAIJMBAACYAgAwlAEAAA0AEJUBAACYAgAwlgEBAOYBACGrAQEA5gEAIawBAQDmAQAhDQYAAOsBACCTAQAA5QEAMJQBAAC9AQAQlQEAAOUBADCWAQEA5gEAIZcBAQDmAQAhmAEIAOcBACGZASAA6AEAIZoBQADpAQAhmwFAAOkBACGcAUAA6gEAIdwBAAC9AQAg3QEAAL0BACAdAwAAgwIAIAYAAOsBACCTAQAA_QEAMJQBAAALABCVAQAA_QEAMJYBAQDmAQAhmgFAAOkBACGbAUAA6QEAIZwBQADqAQAhrQEBAOYBACGuAQEA5gEAIa8BAQDmAQAhsAEBAP4BACGxAQEA5gEAIbIBAQDmAQAhswEBAOYBACG0AQEA_gEAIbUBCADnAQAhtgEBAOYBACG3AQEA5gEAIbkBAAD_AbkBIrsBAACAArsBIr0BAACBAr0BIr8BAACCAr8BIsABQADpAQAhwQEBAP4BACHCASAA6AEAIdwBAAALACDdAQAACwAgEQMAAIMCACCTAQAAmwIAMJQBAAAHABCVAQAAmwIAMJYBAQDmAQAhmgFAAOkBACGbAUAA6QEAIa0BAQDmAQAhyQEBAOYBACHKAQEA5gEAIcsBAQD-AQAhzAEBAP4BACHNAQEA_gEAIc4BQADqAQAhzwFAAOoBACHQAQEA_gEAIdEBAQD-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_gIAIOEBAAD_AgAw4gEAAP8CADDjAQAA_wIAMOQBAAD_AgAw5QEAAIEDADDmAQAAggMAMAcXAAD2AgAgGAAA-QIAIN4BAAD3AgAg3wEAAPgCACDiAQAACwAg4wEAAAsAIOQBAACMAQAgBxcAAPECACAYAAD0AgAg3gEAAPICACDfAQAA8wIAIOIBAAAUACDjAQAAFAAg5AEAAHQAIAmWAQEAAAABlwEBAAAAAZkBIAAAAAGaAUAAAAABmwFAAAAAAZwBQAAAAAHDAQEAAAABxAEBAAAAAcUBAQAAAAECAAAAdAAgFwAA8QIAIAMAAAAUACAXAADxAgAgGAAA9QIAIAsAAAAUACAQAAD1AgAglgEBAKMCACGXAQEAowIAIZkBIAClAgAhmgFAAKYCACGbAUAApgIAIZwBQACnAgAhwwEBAKMCACHEAQEAwwIAIcUBAQDDAgAhCZYBAQCjAgAhlwEBAKMCACGZASAApQIAIZoBQACmAgAhmwFAAKYCACGcAUAApwIAIcMBAQCjAgAhxAEBAMMCACHFAQEAwwIAIRYGAADUAgAglgEBAAAAAZoBQAAAAAGbAUAAAAABnAFAAAAAAa4BAQAAAAGvAQEAAAABsAEBAAAAAbEBAQAAAAGyAQEAAAABswEBAAAAAbQBAQAAAAG1AQgAAAABtgEBAAAAAbcBAQAAAAG5AQAAALkBArsBAAAAuwECvQEAAAC9AQK_AQAAAL8BAsABQAAAAAHBAQEAAAABwgEgAAAAAQIAAACMAQAgFwAA9gIAIAMAAAALACAXAAD2AgAgGAAA-gIAIBgAAAALACAGAADJAgAgEAAA-gIAIJYBAQCjAgAhmgFAAKYCACGbAUAApgIAIZwBQACnAgAhrgEBAKMCACGvAQEAowIAIbABAQDDAgAhsQEBAKMCACGyAQEAowIAIbMBAQCjAgAhtAEBAMMCACG1AQgApAIAIbYBAQCjAgAhtwEBAKMCACG5AQAAxAK5ASK7AQAAxQK7ASK9AQAAxgK9ASK_AQAAxwK_ASLAAUAApgIAIcEBAQDDAgAhwgEgAKUCACEWBgAAyQIAIJYBAQCjAgAhmgFAAKYCACGbAUAApgIAIZwBQACnAgAhrgEBAKMCACGvAQEAowIAIbABAQDDAgAhsQEBAKMCACGyAQEAowIAIbMBAQCjAgAhtAEBAMMCACG1AQgApAIAIbYBAQCjAgAhtwEBAKMCACG5AQAAxAK5ASK7AQAAxQK7ASK9AQAAxgK9ASK_AQAAxwK_ASLAAUAApgIAIcEBAQDDAgAhwgEgAKUCACEMlgEBAAAAAZoBQAAAAAGbAUAAAAAByQEBAAAAAcoBAQAAAAHLAQEAAAABzAEBAAAAAc0BAQAAAAHOAUAAAAABzwFAAAAAAdABAQAAAAHRAQEAAAABAgAAAAkAIBcAAIYDACADAAAACQAgFwAAhgMAIBgAAIUDACABEAAAnQMAMBEDAACDAgAgkwEAAJsCADCUAQAABwAQlQEAAJsCADCWAQEAAAABmgFAAOkBACGbAUAA6QEAIa0BAQDmAQAhyQEBAOYBACHKAQEA5gEAIcsBAQD-AQAhzAEBAP4BACHNAQEA_gEAIc4BQADqAQAhzwFAAOoBACHQAQEA_gEAIdEBAQD-AQAhAgAAAAkAIBAAAIUDACACAAAAgwMAIBAAAIQDACAQkwEAAIIDADCUAQAAgwMAEJUBAACCAwAwlgEBAOYBACGaAUAA6QEAIZsBQADpAQAhrQEBAOYBACHJAQEA5gEAIcoBAQDmAQAhywEBAP4BACHMAQEA_gEAIc0BAQD-AQAhzgFAAOoBACHPAUAA6gEAIdABAQD-AQAh0QEBAP4BACEQkwEAAIIDADCUAQAAgwMAEJUBAACCAwAwlgEBAOYBACGaAUAA6QEAIZsBQADpAQAhrQEBAOYBACHJAQEA5gEAIcoBAQDmAQAhywEBAP4BACHMAQEA_gEAIc0BAQD-AQAhzgFAAOoBACHPAUAA6gEAIdABAQD-AQAh0QEBAP4BACEMlgEBAKMCACGaAUAApgIAIZsBQACmAgAhyQEBAKMCACHKAQEAowIAIcsBAQDDAgAhzAEBAMMCACHNAQEAwwIAIc4BQACnAgAhzwFAAKcCACHQAQEAwwIAIdEBAQDDAgAhDJYBAQCjAgAhmgFAAKYCACGbAUAApgIAIckBAQCjAgAhygEBAKMCACHLAQEAwwIAIcwBAQDDAgAhzQEBAMMCACHOAUAApwIAIc8BQACnAgAh0AEBAMMCACHRAQEAwwIAIQyWAQEAAAABmgFAAAAAAZsBQAAAAAHJAQEAAAABygEBAAAAAcsBAQAAAAHMAQEAAAABzQEBAAAAAc4BQAAAAAHPAUAAAAAB0AEBAAAAAdEBAQAAAAEHlgEBAAAAAZoBQAAAAAGbAUAAAAAByAFAAAAAAdIBAQAAAAHTAQEAAAAB1AEBAAAAAQIAAAAFACAXAACSAwAgAwAAAAUAIBcAAJIDACAYAACRAwAgARAAAJwDADAMAwAAgwIAIJMBAACcAgAwlAEAAAMAEJUBAACcAgAwlgEBAAAAAZoBQADpAQAhmwFAAOkBACGtAQEA5gEAIcgBQADpAQAh0gEBAAAAAdMBAQD-AQAh1AEBAP4BACECAAAABQAgEAAAkQMAIAIAAACPAwAgEAAAkAMAIAuTAQAAjgMAMJQBAACPAwAQlQEAAI4DADCWAQEA5gEAIZoBQADpAQAhmwFAAOkBACGtAQEA5gEAIcgBQADpAQAh0gEBAOYBACHTAQEA_gEAIdQBAQD-AQAhC5MBAACOAwAwlAEAAI8DABCVAQAAjgMAMJYBAQDmAQAhmgFAAOkBACGbAUAA6QEAIa0BAQDmAQAhyAFAAOkBACHSAQEA5gEAIdMBAQD-AQAh1AEBAP4BACEHlgEBAKMCACGaAUAApgIAIZsBQACmAgAhyAFAAKYCACHSAQEAowIAIdMBAQDDAgAh1AEBAMMCACEHlgEBAKMCACGaAUAApgIAIZsBQACmAgAhyAFAAKYCACHSAQEAowIAIdMBAQDDAgAh1AEBAMMCACEHlgEBAAAAAZoBQAAAAAGbAUAAAAAByAFAAAAAAdIBAQAAAAHTAQEAAAAB1AEBAAAAAQQXAACHAwAw3gEAAIgDADDgAQAAigMAIOQBAACLAwAwBBcAAPsCADDeAQAA_AIAMOABAAD-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_AQLAAUAAAAABwQEBAAAAAcIBIAAAAAECAAAAjAEAIBcAALgDACADAAAACwAgFwAAuAMAIBgAALwDACAZAAAACwAgAwAAyAIAIBAAALwDACCWAQEAowIAIZoBQACmAgAhmwFAAKYCACGcAUAApwIAIa0BAQCjAgAhrgEBAKMCACGvAQEAowIAIbABAQDDAgAhsQEBAKMCACGyAQEAowIAIbMBAQCjAgAhtAEBAMMCACG1AQgApAIAIbYBAQCjAgAhtwEBAKMCACG5AQAAxAK5ASK7AQAAxQK7ASK9AQAAxgK9ASK_AQAAxwK_ASLAAUAApgIAIcEBAQDDAgAhwgEgAKUCACEXAwAAyAIAIJYBAQCjAgAhmgFAAKYCACGbAUAApgIAIZwBQACnAgAhrQEBAKMCACGuAQEAowIAIa8BAQCjAgAhsAEBAMMCACGxAQEAowIAIbIBAQCjAgAhswEBAKMCACG0AQEAwwIAIbUBCACkAgAhtgEBAKMCACG3AQEAowIAIbkBAADEArkBIrsBAADFArsBIr0BAADGAr0BIr8BAADHAr8BIsABQACmAgAhwQEBAMMCACHCASAApQIAIQKWAQEAAAABrAEBAAAAAQUEBgIFCgMHAAoJDAQKFQkBAwABAQMAAQMDAAEGEAUHAAgCCAAGCQAEAgYRBQcABwEGEgABBhMAAQMAAQIEFgAFFwAAAAADBwAPHQAQHgARAAAAAwcADx0AEB4AEQEDAAEBAwABAwcAFh0AFx4AGAAAAAMHABYdABceABgBAwABAQMAAQMHAB0dAB4eAB8AAAADBwAdHQAeHgAfAAAAAwcAJR0AJh4AJwAAAAMHACUdACYeACcBAwABAQMAAQMHACwdAC0eAC4AAAADBwAsHQAtHgAuAQMAAQEDAAEFBwAzHQA2HgA3bwA0cAA1AAAAAAAFBwAzHQA2HgA3bwA0cAA1AggABgkABAIIAAYJAAQDBwA8HQA9HgA-AAAAAwcAPB0APR4APgAABQcAQx0ARh4AR28ARHAARQAAAAAABQcAQx0ARh4AR28ARHAARQsCAQwYAQ0bAQ4cAQ8dAREfARIhCxMiDBQkARUmCxYnDRkoARopARsqCx8tDiAuEiEvAiIwAiMxAiQyAiUzAiY1Aic3Cyg4Eyk6Aio8Cys9FCw-Ai0_Ai5ACy9DFTBEGTFFAzJGAzNHAzRIAzVJAzZLAzdNCzhOGjlQAzpSCztTGzxUAz1VAz5WCz9ZHEBaIEFcIUJdIUNgIURhIUViIUZkIUdmC0hnIklpIUprC0tsI0xtIU1uIU5vC09yJFBzKFF1CVJ2CVN4CVR5CVV6CVZ8CVd-C1h_KVmBAQlagwELW4QBKlyFAQldhgEJXocBC1-KAStgiwEvYY0BBGKOAQRjkAEEZJEBBGWSAQRmlAEEZ5YBC2iXATBpmQEEapsBC2ucATFsnQEEbZ4BBG6fAQtxogEycqMBOHOkAQV0pQEFdaYBBXanAQV3qAEFeKoBBXmsAQt6rQE5e68BBXyxAQt9sgE6frMBBX-0AQWAAbUBC4EBuAE7ggG5AT-DAbsBBoQBvAEGhQG_AQaGAcABBocBwQEGiAHDAQaJAcUBC4oBxgFAiwHIAQaMAcoBC40BywFBjgHMAQaPAc0BBpABzgELkQHRAUKSAdIBSA"
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
  Class: "Class"
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
  picture: "picture",
  nid: "nid",
  fatherName: "fatherName",
  motherName: "motherName",
  emergencyContactNumber: "emergencyContactNumber",
  monthlySalary: "monthlySalary",
  experience: "experience",
  authoritySign: "authoritySign",
  gender: "gender",
  bloodGroup: "bloodGroup",
  religion: "religion",
  employeeRole: "employeeRole",
  dateOfBirth: "dateOfBirth",
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
var AuthController = {
  loginUser: loginUser2,
  changePassword: changePassword2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2
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

// src/app/modules/employees/employees.validation.ts
import { z as z2 } from "zod";
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
    error: "Employee role must be one of: " + Object.values(EmployeeRole).join(", ")
  }),
  emergencyContact: z2.string().min(11, { error: "Emergency contact must be at least 11 digits" }).optional(),
  dateOfBirth: z2.coerce.date({
    error: "Date of birth must be a valid date"
  }),
  monthlySalary: z2.coerce.number({
    error: "Monthly salary must be a valid number"
  }),
  experience: z2.string({ error: "Experience is required" }).min(1, { error: "Experience cannot be empty" }),
  email: z2.email({ error: "Please provide a valid email address" }),
  nid: z2.string({ error: "NID is required" }).min(1, { error: "NID cannot be empty" }),
  birthRegistrationNumber: z2.string().optional()
});

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
    signature: `${ROOT}/employees/signature`
  },
  student: {
    profile: `${ROOT}/students/profile`,
    documents: `${ROOT}/students/documents`
  }
  // add more as your project grows
};

// src/app/modules/employees/employess.service.ts
var createEmployee = async (payload, files) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLocaleLowerCase() },
    select: { id: true }
  });
  console.log("Hitting on Existing User Func \u{1F680}", existingUser);
  if (existingUser) {
    throw new AppError_default(409, "An account with this email already exists");
  }
  const pictureFile = files.picture?.[0];
  const authoritySignFile = files.authoritySign?.[0];
  if (!authoritySignFile) {
    throw new AppError_default(400, "Missing employee upload files");
  }
  const [picture, authoritySign] = await Promise.all([
    pictureFile ? cloudinary_service_default.upload(pictureFile, {
      folder: CloudinaryFolders.employee.profile
    }) : Promise.resolve(null),
    cloudinary_service_default.upload(authoritySignFile, {
      folder: CloudinaryFolders.employee.signature
    })
  ]);
  const uploadedPublicIds = [
    picture?.public_id,
    authoritySign?.public_id
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
      return tx.employee.create({
        data: {
          userId,
          phone: payload.phone,
          fullName: payload.fullName,
          picture: picture?.secure_url ?? null,
          nid: payload.nid,
          fatherName: payload.fatherName,
          motherName: payload.motherName,
          emergencyContactNumber: payload.emergencyContact ?? null,
          monthlySalary: payload.monthlySalary,
          experience: payload.experience,
          authoritySign: authoritySign.secure_url,
          gender: payload.gender,
          bloodGroup: payload.bloodGroup,
          religion: payload.religion,
          employeeRole: payload.employeeRole,
          dateOfBirth: new Date(payload.dateOfBirth),
          birthRegistrationNumber: payload.birthRegistrationNumber ?? null
        }
      });
    });
    return {
      employee,
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
var EmployeeService = {
  createEmployee
};

// src/app/modules/employees/employees.controller.ts
var createEmployee2 = async (req, res) => {
  const payload = createEmployeeSchema.parse(JSON.parse(req.body.data));
  const files = req.files;
  if (!files.picture?.length) {
    throw new AppError_default(400, "Picture is required");
  }
  if (!files.authoritySign?.length) {
    throw new AppError_default(400, "Authority Sign is required");
  }
  const employee = await EmployeeService.createEmployee(payload, files);
  res.status(201).json({
    success: true,
    data: employee
  });
};
var EmployeeController = {
  createEmployee: createEmployee2
};

// src/app/modules/employees/employees.routes.ts
var router2 = Router2();
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
    }
  ]),
  EmployeeController.createEmployee
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