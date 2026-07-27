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
  LIBRARIAN: "LIBRARIAN",
  STORE_MANAGER: "STORE_MANAGER",
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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  ACCOUNTANT\n  LIBRARIAN\n  STORE_MANAGER\n  OTHER\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone String @unique\n\n  fullName               String\n  picture                String?\n  nid                    String  @unique\n  fatherName             String\n  motherName             String\n  emergencyContactNumber String?\n  monthlySalary          Float\n  experience             String?\n  authoritySign          String\n  EmployeeSign           String\n\n  gender                  Gender\n  bloodGroup              BloodGroup\n  religion                Religion\n  employeeRole            EmployeeRole\n  dateOfJoining           String\n  birthRegistrationNumber String?      @unique\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted     Boolean        @default(false)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  deletedAt     DateTime?\n  tutorProfiles TutorProfile[]\n  address       Address?\n\n  @@map("employee")\n}\n\nmodel TutorProfile {\n  id String @id @default(uuid())\n\n  classId    String\n  employeeId String\n\n  class    Class    @relation(fields: [classId], references: [id], onDelete: Cascade)\n  employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n}\n\nmodel Class {\n  id               String @id @default(uuid())\n  name             String\n  monthlyTutionFee Float\n\n  isDeleted     Boolean        @default(false)\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  deletedAt     DateTime?\n  tutorProfiles TutorProfile[]\n\n  @@map("class")\n}\n\nmodel Address {\n  id String @id @default(uuid())\n\n  studentId  String? @unique @map("student_id")\n  employeeId String? @unique @map("employee_id")\n\n  permanentAddressVillage    String?\n  permanentAddressPostOffice String?\n  permanentAddressPostCode   String?\n  permanentAddressDistrict   String?\n\n  presentAddressVillage    String?\n  presentAddressPostOffice String?\n  presentAddressPostCode   String?\n  presentAddressDistrict   String?\n\n  isDeleted Boolean @default(false)\n\n  // student  Student?  @relation(fields: [studentId], references: [id])\n  employee Employee? @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now()) @map("created_at")\n  updatedAt DateTime  @updatedAt @map("updated_at")\n  deletedAt DateTime? @map("deleted_at")\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContactNumber","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"experience","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"EmployeeSign","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"EmployeeRole"},{"name":"dateOfJoining","kind":"scalar","type":"String"},{"name":"birthRegistrationNumber","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfiles","kind":"object","type":"TutorProfile","relationName":"EmployeeToTutorProfile"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToEmployee"}],"dbName":"employee"},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"classId","kind":"scalar","type":"String"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"class","kind":"object","type":"Class","relationName":"ClassToTutorProfile"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToTutorProfile"}],"dbName":null},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTutionFee","kind":"scalar","type":"Float"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"tutorProfiles","kind":"object","type":"TutorProfile","relationName":"ClassToTutorProfile"}],"dbName":"class"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String","dbName":"student_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"permanentAddressVillage","kind":"scalar","type":"String"},{"name":"permanentAddressPostOffice","kind":"scalar","type":"String"},{"name":"permanentAddressPostCode","kind":"scalar","type":"String"},{"name":"permanentAddressDistrict","kind":"scalar","type":"String"},{"name":"presentAddressVillage","kind":"scalar","type":"String"},{"name":"presentAddressPostOffice","kind":"scalar","type":"String"},{"name":"presentAddressPostCode","kind":"scalar","type":"String"},{"name":"presentAddressDistrict","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"employee","kind":"object","type":"Employee","relationName":"AddressToEmployee"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","tutorProfiles","_count","class","employee","address","admin","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","_avg","_sum","Employee.groupBy","Employee.aggregate","TutorProfile.findUnique","TutorProfile.findUniqueOrThrow","TutorProfile.findFirst","TutorProfile.findFirstOrThrow","TutorProfile.findMany","TutorProfile.createOne","TutorProfile.createMany","TutorProfile.createManyAndReturn","TutorProfile.updateOne","TutorProfile.updateMany","TutorProfile.updateManyAndReturn","TutorProfile.upsertOne","TutorProfile.deleteOne","TutorProfile.deleteMany","TutorProfile.groupBy","TutorProfile.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","AND","OR","NOT","id","studentId","employeeId","permanentAddressVillage","permanentAddressPostOffice","permanentAddressPostCode","permanentAddressDistrict","presentAddressVillage","presentAddressPostOffice","presentAddressPostCode","presentAddressDistrict","isDeleted","createdAt","updatedAt","deletedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","name","monthlyTutionFee","every","some","none","classId","userId","phone","fullName","picture","nid","fatherName","motherName","emergencyContactNumber","monthlySalary","experience","authoritySign","EmployeeSign","Gender","gender","BloodGroup","bloodGroup","Religion","religion","EmployeeRole","employeeRole","dateOfJoining","birthRegistrationNumber","isdeleted","email","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","UserRole","role","UserStatus","status","needPasswordChange","emailVerified","image","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "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_EBIvMBAACaA_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_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_AQAgtgEBAAAAAbcBAQAAAAW4AQEAAAAFuQEBAAAAAboBAQAAAAG7AQEAAAABvAEBAAAAAb0BAQD-AQAhvgEBAAAAAb8BAQAAAAHAAQEAAAABBQcAAPoBACAeAAD9AQAgHwAA_QEAILYBIAAAAAG9ASAA_AEAIQsHAAD6AQAgHgAA-wEAIB8AAPsBACC2AUAAAAABtwFAAAAABLgBQAAAAAS5AUAAAAABugFAAAAAAbsBQAAAAAG8AUAAAAABvQFAAPkBACELBwAA9wEAIB4AAPgBACAfAAD4AQAgtgFAAAAAAbcBQAAAAAW4AUAAAAAFuQFAAAAAAboBQAAAAAG7AUAAAAABvAFAAAAAAb0BQAD2AQAhCwcAAPcBACAeAAD4AQAgHwAA-AEAILYBQAAAAAG3AUAAAAAFuAFAAAAABbkBQAAAAAG6AUAAAAABuwFAAAAAAbwBQAAAAAG9AUAA9gEAIQi2AQIAAAABtwECAAAABbgBAgAAAAW5AQIAAAABugECAAAAAbsBAgAAAAG8AQIAAAABvQECAPcBACEItgFAAAAAAbcBQAAAAAW4AUAAAAAFuQFAAAAAAboBQAAAAAG7AUAAAAABvAFAAAAAAb0BQAD4AQAhCwcAAPoBACAeAAD7AQAgHwAA-wEAILYBQAAAAAG3AUAAAAAEuAFAAAAABLkBQAAAAAG6AUAAAAABuwFAAAAAAbwBQAAAAAG9AUAA-QEAIQi2AQIAAAABtwECAAAABLgBAgAAAAS5AQIAAAABugECAAAAAbsBAgAAAAG8AQIAAAABvQECAPoBACEItgFAAAAAAbcBQAAAAAS4AUAAAAAEuQFAAAAAAboBQAAAAAG7AUAAAAABvAFAAAAAAb0BQAD7AQAhBQcAAPoBACAeAAD9AQAgHwAA_QEAILYBIAAAAAG9ASAA_AEAIQK2ASAAAAABvQEgAP0BACEOBwAA9wEAIB4AAP8BACAfAAD_AQAgtgEBAAAAAbcBAQAAAAW4AQEAAAAFuQEBAAAAAboBAQAAAAG7AQEAAAABvAEBAAAAAb0BAQD-AQAhvgEBAAAAAb8BAQAAAAHAAQEAAAABC7YBAQAAAAG3AQEAAAAFuAEBAAAABbkBAQAAAAG6AQEAAAABuwEBAAAAAbwBAQAAAAG9AQEA_wEAIb4BAQAAAAG_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_AEBAAAAAQH8ASAAAAABAfwBQAAAAAEB_AFAAAAAAQcYAADrAwAgGQAA7gMAIPkBAADsAwAg-gEAAO0DACD9AQAACwAg_gEAAAsAIP8BAACPAQAgAxgAAOsDACD5AQAA7AMAIP8BAACPAQAgCAMAAIIDACAGAADfAgAgCgAAgwMAILUBAAC9AgAgygEAAL0CACDOAQAAvQIAINABAAC9AgAg3AEAAL0CACAAAAAAAAX8AQgAAAABggIIAAAAAYMCCAAAAAGEAggAAAABhQIIAAAAAQsYAADQAgAwGQAA1QIAMPkBAADRAgAw-gEAANICADD7AQAA0wIAIPwBAADUAgAw_QEAANQCADD-AQAA1AIAMP8BAADUAgAwgAIAANYCADCBAgAA1wIAMAMJAADdAgAgpwEBAAAAAakBAQAAAAECAAAADwAgGAAA3AIAIAMAAAAPACAYAADcAgAgGQAA2gIAIAERAADqAwAwCAgAALkCACAJAAC6AgAgpAEAALgCADClAQAADQAQpgEAALgCADCnAQEAAAABqQEBAI0CACHGAQEAjQIAIQIAAAAPACARAADaAgAgAgAAANgCACARAADZAgAgBqQBAADXAgAwpQEAANgCABCmAQAA1wIAMKcBAQCNAgAhqQEBAI0CACHGAQEAjQIAIQakAQAA1wIAMKUBAADYAgAQpgEAANcCADCnAQEAjQIAIakBAQCNAgAhxgEBAI0CACECpwEBAMECACGpAQEAwQIAIQMJAADbAgAgpwEBAMECACGpAQEAwQIAIQUYAADlAwAgGQAA6AMAIPkBAADmAwAg-gEAAOcDACD_AQAAjwEAIAMJAADdAgAgpwEBAAAAAakBAQAAAAEDGAAA5QMAIPkBAADmAwAg_wEAAI8BACAEGAAA0AIAMPkBAADRAgAw-wEAANMCACD_AQAA1AIAMAAAAAAFGAAA4AMAIBkAAOMDACD5AQAA4QMAIPoBAADiAwAg_wEAAL0BACADGAAA4AMAIPkBAADhAwAg_wEAAL0BACAAAAAAAAH8AQAAANQBAgH8AQAAANYBAgH8AQAAANgBAgH8AQAAANoBAgUYAADaAwAgGQAA3gMAIPkBAADbAwAg-gEAAN0DACD_AQAAAQAgCxgAAPYCADAZAAD6AgAw-QEAAPcCADD6AQAA-AIAMPsBAAD5AgAg_AEAANQCADD9AQAA1AIAMP4BAADUAgAw_wEAANQCADCAAgAA-wIAMIECAADXAgAwBxgAAPECACAZAAD0AgAg-QEAAPICACD6AQAA8wIAIP0BAAATACD-AQAAEwAg_wEAANYBACAOpwEBAAAAAagBAQAAAAGqAQEAAAABqwEBAAAAAawBAQAAAAGtAQEAAAABrgEBAAAAAa8BAQAAAAGwAQEAAAABsQEBAAAAAbIBIAAAAAGzAUAAAAABtAFAAAAAAbUBQAAAAAECAAAA1gEAIBgAAPECACADAAAAEwAgGAAA8QIAIBkAAPUCACAQAAAAEwAgEQAA9QIAIKcBAQDBAgAhqAEBAMICACGqAQEAwgIAIasBAQDCAgAhrAEBAMICACGtAQEAwgIAIa4BAQDCAgAhrwEBAMICACGwAQEAwgIAIbEBAQDCAgAhsgEgAMMCACGzAUAAxAIAIbQBQADEAgAhtQFAAMUCACEOpwEBAMECACGoAQEAwgIAIaoBAQDCAgAhqwEBAMICACGsAQEAwgIAIa0BAQDCAgAhrgEBAMICACGvAQEAwgIAIbABAQDCAgAhsQEBAMICACGyASAAwwIAIbMBQADEAgAhtAFAAMQCACG1AUAAxQIAIQMIAADkAgAgpwEBAAAAAcYBAQAAAAECAAAADwAgGAAA_gIAIAMAAAAPACAYAAD-AgAgGQAA_QIAIAERAADcAwAwAgAAAA8AIBEAAP0CACACAAAA2AIAIBEAAPwCACACpwEBAMECACHGAQEAwQIAIQMIAADjAgAgpwEBAMECACHGAQEAwQIAIQMIAADkAgAgpwEBAAAAAcYBAQAAAAEDGAAA2gMAIPkBAADbAwAg_wEAAAEAIAQYAAD2AgAw-QEAAPcCADD7AQAA-QIAIP8BAADUAgAwAxgAAPECACD5AQAA8gIAIP8BAADWAQAgBgQAAMUDACAFAADGAwAgCQAAyAIAIAsAAMcDACC1AQAAvQIAIPYBAAC9AgAgDAkAAMgCACCoAQAAvQIAIKkBAAC9AgAgqgEAAL0CACCrAQAAvQIAIKwBAAC9AgAgrQEAAL0CACCuAQAAvQIAIK8BAAC9AgAgsAEAAL0CACCxAQAAvQIAILUBAAC9AgAgAAAABRgAANUDACAZAADYAwAg-QEAANYDACD6AQAA1wMAIP8BAAABACADGAAA1QMAIPkBAADWAwAg_wEAAAEAIAAAAAAAAAUYAADQAwAgGQAA0wMAIPkBAADRAwAg-gEAANIDACD_AQAAAQAgAxgAANADACD5AQAA0QMAIP8BAAABACAAAAAFGAAAywMAIBkAAM4DACD5AQAAzAMAIPoBAADNAwAg_wEAAAEAIAMYAADLAwAg-QEAAMwDACD_AQAAAQAgAAAAAfwBAAAA8QECAfwBAAAA8wECCxgAALUDADAZAAC6AwAw-QEAALYDADD6AQAAtwMAMPsBAAC4AwAg_AEAALkDADD9AQAAuQMAMP4BAAC5AwAw_wEAALkDADCAAgAAuwMAMIECAAC8AwAwCxgAAKkDADAZAACuAwAw-QEAAKoDADD6AQAAqwMAMPsBAACsAwAg_AEAAK0DADD9AQAArQMAMP4BAACtAwAw_wEAAK0DADCAAgAArwMAMIECAACwAwAwBxgAAKQDACAZAACnAwAg-QEAAKUDACD6AQAApgMAIP0BAAALACD-AQAACwAg_wEAAI8BACAHGAAAnwMAIBkAAKIDACD5AQAAoAMAIPoBAAChAwAg_QEAABcAIP4BAAAXACD_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-wEAALgDACD_AQAAuQMAMAQYAACpAwAw-QEAAKoDADD7AQAArAMAIP8BAACtAwAwAxgAAKQDACD5AQAApQMAIP8BAACPAQAgAxgAAJ8DACD5AQAAoAMAIP8BAAB3ACAAAAQDAACCAwAgtQEAAL0CACDfAQAAvQIAIOABAAC9AgAgAgYAAN8CACC1AQAAvQIAIAenAQEAAAABswFAAAAAAbQBQAAAAAHjAUAAAAAB7QEBAAAAAe4BAQAAAAHvAQEAAAABDKcBAQAAAAGzAUAAAAABtAFAAAAAAeQBAQAAAAHlAQEAAAAB5gEBAAAAAecBAQAAAAHoAQEAAAAB6QFAAAAAAeoBQAAAAAHrAQEAAAAB7AEBAAAAAQ8FAADCAwAgCQAAwwMAIAsAAMQDACCnAQEAAAABsgEgAAAAAbMBQAAAAAG0AUAAAAABtQFAAAAAAcEBAQAAAAHeAQEAAAAB8QEAAADxAQLzAQAAAPMBAvQBIAAAAAH1ASAAAAAB9gEBAAAAAQIAAAABACAYAADLAwAgAwAAABwAIBgAAMsDACAZAADPAwAgEQAAABwAIAUAAJwDACAJAACdAwAgCwAAngMAIBEAAM8DACCnAQEAwQIAIbIBIADDAgAhswFAAMQCACG0AUAAxAIAIbUBQADFAgAhwQEBAMECACHeAQEAwQIAIfEBAACZA_EBIvMBAACaA_MBIvQBIADDAgAh9QEgAMMCACH2AQEAwgIAIQ8FAACcAwAgCQAAnQMAIAsAAJ4DACCnAQEAwQIAIbIBIADDAgAhswFAAMQCACG0AUAAxAIAIbUBQADFAgAhwQEBAMECACHeAQEAwQIAIfEBAACZA_EBIvMBAACaA_MBIvQBIADDAgAh9QEgAMMCACH2AQEAwgIAIQ8EAADBAwAgCQAAwwMAIAsAAMQDACCnAQEAAAABsgEgAAAAAbMBQAAAAAG0AUAAAAABtQFAAAAAAcEBAQAAAAHeAQEAAAAB8QEAAADxAQLzAQAAAPMBAvQBIAAAAAH1ASAAAAAB9gEBAAAAAQIAAAABACAYAADQAwAgAwAAABwAIBgAANADACAZAADUAwAgEQAAABwAIAQAAJsDACAJAACdAwAgCwAAngMAIBEAANQDACCnAQEAwQIAIbIBIADDAgAhswFAAMQCACG0AUAAxAIAIbUBQADFAgAhwQEBAMECACHeAQEAwQIAIfEBAACZA_EBIvMBAACaA_MBIvQBIADDAgAh9QEgAMMCACH2AQEAwgIAIQ8EAACbAwAgCQAAnQMAIAsAAJ4DACCnAQEAwQIAIbIBIADDAgAhswFAAMQCACG0AUAAxAIAIbUBQADFAgAhwQEBAMECACHeAQEAwQIAIfEBAACZA_EBIvMBAACaA_MBIvQBIADDAgAh9QEgAMMCACH2AQEAwgIAIQ8EAADBAwAgBQAAwgMAIAkAAMMDACCnAQEAAAABsgEgAAAAAbMBQAAAAAG0AUAAAAABtQFAAAAAAcEBAQAAAAHeAQEAAAAB8QEAAADxAQLzAQAAAPMBAvQBIAAAAAH1ASAAAAAB9gEBAAAAAQIAAAABACAYAADVAwAgAwAAABwAIBgAANUDACAZAADZAwAgEQAAABwAIAQAAJsDACAFAACcAwAgCQAAnQMAIBEAANkDACCnAQEAwQIAIbIBIADDAgAhswFAAMQCACG0AUAAxAIAIbUBQADFAgAhwQEBAMECACHeAQEAwQIAIfEBAACZA_EBIvMBAACaA_MBIvQBIADDAgAh9QEgAMMCACH2AQEAwgIAIQ8EAACbAwAgBQAAnAMAIAkAAJ0DACCnAQEAwQIAIbIBIADDAgAhswFAAMQCACG0AUAAxAIAIbUBQADFAgAhwQEBAMECACHeAQEAwQIAIfEBAACZA_EBIvMBAACaA_MBIvQBIADDAgAh9QEgAMMCACH2AQEAwgIAIQ8EAADBAwAgBQAAwgMAIAsAAMQDACCnAQEAAAABsgEgAAAAAbMBQAAAAAG0AUAAAAABtQFAAAAAAcEBAQAAAAHeAQEAAAAB8QEAAADxAQLzAQAAAPMBAvQBIAAAAAH1ASAAAAAB9gEBAAAAAQIAAAABACAYAADaAwAgAqcBAQAAAAHGAQEAAAABAwAAABwAIBgAANoDACAZAADfAwAgEQAAABwAIAQAAJsDACAFAACcAwAgCwAAngMAIBEAAN8DACCnAQEAwQIAIbIBIADDAgAhswFAAMQCACG0AUAAxAIAIbUBQADFAgAhwQEBAMECACHeAQEAwQIAIfEBAACZA_EBIvMBAACaA_MBIvQBIADDAgAh9QEgAMMCACH2AQEAwgIAIQ8EAACbAwAgBQAAnAMAIAsAAJ4DACCnAQEAwQIAIbIBIADDAgAhswFAAMQCACG0AUAAxAIAIbUBQADFAgAhwQEBAMECACHeAQEAwQIAIfEBAACZA_EBIvMBAACaA_MBIvQBIADDAgAh9QEgAMMCACH2AQEAwgIAIQenAQEAAAABsgEgAAAAAbMBQAAAAAG0AUAAAAABtQFAAAAAAcEBAQAAAAHCAQgAAAABAgAAAL0BACAYAADgAwAgAwAAAMABACAYAADgAwAgGQAA5AMAIAkAAADAAQAgEQAA5AMAIKcBAQDBAgAhsgEgAMMCACGzAUAAxAIAIbQBQADEAgAhtQFAAMUCACHBAQEAwQIAIcIBCADOAgAhB6cBAQDBAgAhsgEgAMMCACGzAUAAxAIAIbQBQADEAgAhtQFAAMUCACHBAQEAwQIAIcIBCADOAgAhGQMAAP8CACAKAACBAwAgpwEBAAAAAbMBQAAAAAG0AUAAAAABtQFAAAAAAccBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQAAAAHLAQEAAAABzAEBAAAAAc0BAQAAAAHOAQEAAAABzwEIAAAAAdABAQAAAAHRAQEAAAAB0gEBAAAAAdQBAAAA1AEC1gEAAADWAQLYAQAAANgBAtoBAAAA2gEC2wEBAAAAAdwBAQAAAAHdASAAAAABAgAAAI8BACAYAADlAwAgAwAAAAsAIBgAAOUDACAZAADpAwAgGwAAAAsAIAMAAO4CACAKAADwAgAgEQAA6QMAIKcBAQDBAgAhswFAAMQCACG0AUAAxAIAIbUBQADFAgAhxwEBAMECACHIAQEAwQIAIckBAQDBAgAhygEBAMICACHLAQEAwQIAIcwBAQDBAgAhzQEBAMECACHOAQEAwgIAIc8BCADOAgAh0AEBAMICACHRAQEAwQIAIdIBAQDBAgAh1AEAAOoC1AEi1gEAAOsC1gEi2AEAAOwC2AEi2gEAAO0C2gEi2wEBAMECACHcAQEAwgIAId0BIADDAgAhGQMAAO4CACAKAADwAgAgpwEBAMECACGzAUAAxAIAIbQBQADEAgAhtQFAAMUCACHHAQEAwQIAIcgBAQDBAgAhyQEBAMECACHKAQEAwgIAIcsBAQDBAgAhzAEBAMECACHNAQEAwQIAIc4BAQDCAgAhzwEIAM4CACHQAQEAwgIAIdEBAQDBAgAh0gEBAMECACHUAQAA6gLUASLWAQAA6wLWASLYAQAA7ALYASLaAQAA7QLaASLbAQEAwQIAIdwBAQDCAgAh3QEgAMMCACECpwEBAAAAAakBAQAAAAEZAwAA_wIAIAYAAIADACCnAQEAAAABswFAAAAAAbQBQAAAAAG1AUAAAAABxwEBAAAAAcgBAQAAAAHJAQEAAAABygEBAAAAAcsBAQAAAAHMAQEAAAABzQEBAAAAAc4BAQAAAAHPAQgAAAAB0AEBAAAAAdEBAQAAAAHSAQEAAAAB1AEAAADUAQLWAQAAANYBAtgBAAAA2AEC2gEAAADaAQLbAQEAAAAB3AEBAAAAAd0BIAAAAAECAAAAjwEAIBgAAOsDACADAAAACwAgGAAA6wMAIBkAAO8DACAbAAAACwAgAwAA7gIAIAYAAO8CACARAADvAwAgpwEBAMECACGzAUAAxAIAIbQBQADEAgAhtQFAAMUCACHHAQEAwQIAIcgBAQDBAgAhyQEBAMECACHKAQEAwgIAIcsBAQDBAgAhzAEBAMECACHNAQEAwQIAIc4BAQDCAgAhzwEIAM4CACHQAQEAwgIAIdEBAQDBAgAh0gEBAMECACHUAQAA6gLUASLWAQAA6wLWASLYAQAA7ALYASLaAQAA7QLaASLbAQEAwQIAIdwBAQDCAgAh3QEgAMMCACEZAwAA7gIAIAYAAO8CACCnAQEAwQIAIbMBQADEAgAhtAFAAMQCACG1AUAAxQIAIccBAQDBAgAhyAEBAMECACHJAQEAwQIAIcoBAQDCAgAhywEBAMECACHMAQEAwQIAIc0BAQDBAgAhzgEBAMICACHPAQgAzgIAIdABAQDCAgAh0QEBAMECACHSAQEAwQIAIdQBAADqAtQBItYBAADrAtYBItgBAADsAtgBItoBAADtAtoBItsBAQDBAgAh3AEBAMICACHdASAAwwIAIQUEBgIFCgMHAAsJDAQLGAoBAwABAQMAAQQDAAEGEAUHAAkKFAgCCAAGCQAEAgYRBQcABwEGEgABCRUEAQYWAAEDAAECBBkABRoAAAAAAwcAEB4AER8AEgAAAAMHABAeABEfABIBAwABAQMAAQMHABceABgfABkAAAADBwAXHgAYHwAZAQMAAQEDAAEDBwAeHgAfHwAgAAAAAwcAHh4AHx8AIAAAAAMHACYeACcfACgAAAADBwAmHgAnHwAoAQMAAQEDAAEDBwAtHgAuHwAvAAAAAwcALR4ALh8ALwEDAAEBAwABBQcANB4ANx8AOHAANXEANgAAAAAABQcANB4ANx8AOHAANXEANgIIAAYJAAQCCAAGCQAEAwcAPR4APh8APwAAAAMHAD0eAD4fAD8AAAUHAEQeAEcfAEhwAEVxAEYAAAAAAAUHAEQeAEcfAEhwAEVxAEYBCeIBBAEJ6AEEAwcATR4ATh8ATwAAAAMHAE0eAE4fAE8MAgENGwEOHgEPHwEQIAESIgETJAwUJQ0VJwEWKQwXKg4aKwEbLAEcLQwgMA8hMRMiMgIjMwIkNAIlNQImNgInOAIoOgwpOxQqPQIrPwwsQBUtQQIuQgIvQwwwRhYxRxoySAMzSQM0SgM1SwM2TAM3TgM4UAw5URs6UwM7VQw8Vhw9VwM-WAM_WQxAXB1BXSFCXyJDYCJEYyJFZCJGZSJHZyJIaQxJaiNKbCJLbgxMbyRNcCJOcSJPcgxQdSVRdilSeApTeQpUewpVfApWfQpXfwpYgQEMWYIBKlqEAQpbhgEMXIcBK12IAQpeiQEKX4oBDGCNASxhjgEwYpABBGORAQRkkwEEZZQBBGaVAQRnlwEEaJkBDGmaATFqnAEEa54BDGyfATJtoAEEbqEBBG-iAQxypQEzc6YBOXSnAQV1qAEFdqkBBXeqAQV4qwEFea0BBXqvAQx7sAE6fLIBBX20AQx-tQE7f7YBBYABtwEFgQG4AQyCAbsBPIMBvAFAhAG-AQaFAb8BBoYBwgEGhwHDAQaIAcQBBokBxgEGigHIAQyLAckBQYwBywEGjQHNAQyOAc4BQo8BzwEGkAHQAQaRAdEBDJIB1AFDkwHVAUmUAdcBCJUB2AEIlgHaAQiXAdsBCJgB3AEImQHeAQiaAeABDJsB4QFKnAHkAQidAeYBDJ4B5wFLnwHpAQigAeoBCKEB6wEMogHuAUyjAe8BUA"
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
  Address: "Address"
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
  EmployeeSign: "EmployeeSign",
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
    error: "Employee role must be one of: " + Object.values(EmployeeRole).join(", ")
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
var employeeSearchableFields = ["fullName", "email"];
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
  const result = await queryBuilder.search().filter().where({ isdeleted: false }).paginate().sort().execute();
  return result;
};
var createEmployee = async (payload, files) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLocaleLowerCase() },
    select: { id: true }
  });
  console.log("Hitting on Existing User Func \u{1F680}", existingUser);
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
      return await tx.employee.create({
        data: {
          userId,
          phone: payload.phone,
          fullName: payload.fullName,
          picture: picture?.secure_url ?? null,
          EmployeeSign: employeeSign.secure_url,
          nid: payload.nid,
          fatherName: payload.fatherName,
          motherName: payload.motherName,
          emergencyContactNumber: payload.emergencyContact ?? null,
          monthlySalary: payload.monthlySalary,
          authoritySign: authoritySign.secure_url,
          experience: experience?.secure_url ?? null,
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
var EmployeeService = {
  getAllEmployees,
  createEmployee
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
var EmployeeController = {
  getAllEmployees: getAllEmployees2,
  createEmployee: createEmployee2
};

// src/app/modules/employees/employees.routes.ts
var router2 = Router2();
router2.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EmployeeController.getAllEmployees
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