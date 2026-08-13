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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  // output   = "../generated/prisma"\n  output   = "../src/generated"\n  // moduleFormat = "cjs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// Enums \nenum UserRole {\n  SUPER_ADMIN\n  ADMIN\n  TEACHER\n  STUDENT\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum Gender {\n  MALE\n  FEMALE\n  OTHER\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum Religion {\n  ISLAM\n  HINDUISM\n  CHRISTIANITY\n  BUDDHISM\n  OTHER\n}\n\nenum AddressType {\n  PRESENT\n  PERMANENT\n}\n\nenum EmployeeRole {\n  PRINCIPAL\n  MANAGEMENT_STAFF\n  TEACHER\n  ACCOUNTANT\n  STORE_MANAGER\n  LIBRARIAN\n  OTHER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  DELETED\n}\n\nmodel User {\n  id                 String     @id\n  name               String\n  email              String\n  role               UserRole   @default(STUDENT)\n  status             UserStatus @default(ACTIVE)\n  needPasswordChange Boolean    @default(false)\n  isDeleted          Boolean    @default(false)\n  deletedAt          DateTime?\n  emailVerified      Boolean    @default(false)\n  image              String?\n  createdAt          DateTime   @default(now())\n  updatedAt          DateTime   @updatedAt\n  sessions           Session[]\n  accounts           Account[]\n  employee           Employee?\n  admin              Admin?\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Admin {\n  id            String    @id @default(uuid())\n  name          String\n  email         String    @unique\n  profilePhoto  String?\n  contactNumber String?\n  isDeleted     Boolean   @default(false)\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  deletedAt     DateTime?\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([email])\n  @@index([isDeleted])\n  @@map("admins")\n}\n\nmodel Employee {\n  id     String @id @default(uuid())\n  userId String @unique\n\n  phone String\n\n  fullName         String\n  nid              String\n  fatherName       String\n  motherName       String\n  emergencyContact String?\n  monthlySalary    Float\n  employeeId       String  @unique\n\n  picture         String?\n  picturePublicId String?\n  pictureName     String?\n  pictureType     String?\n\n  experience         String?\n  experiencePublicId String?\n  experienceName     String?\n  experienceType     String?\n\n  authoritySign         String\n  authoritySignPublicId String\n  authoritySignName     String?\n  authoritySignType     String?\n\n  employeeSign         String\n  employeeSignPublicId String\n  employeeSignName     String?\n  employeeSignType     String?\n\n  gender        Gender\n  bloodGroup    BloodGroup\n  religion      Religion\n  employeeRole  EmployeeRole\n  dateOfJoining String\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  isdeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  address Address?\n  classes Class[]\n\n  @@map("employee")\n}\n\n// model TutorProfile {\n//     id String @id @default(uuid())\n\n//     classId    String\n\n//     class    Class    @relation(fields: [classId], references: [id], onDelete: Cascade)\n//     employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n// }\n\nmodel Class {\n  id                String @id @default(uuid())\n  name              String @unique\n  monthlyTuitionFee Float\n  classTeacher      String\n\n  isDeleted Boolean   @default(false)\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime?\n\n  employee Employee @relation(fields: [classTeacher], references: [id], onDelete: Cascade)\n\n  @@map("class")\n}\n\nmodel Address {\n  id String @id @default(uuid())\n\n  studentId  String? @unique @map("student_id")\n  employeeId String? @unique @map("employee_id")\n\n  permanentAddressVillage    String?\n  permanentAddressPostOffice String?\n  permanentAddressPostCode   String?\n  permanentAddressDistrict   String?\n\n  presentAddressVillage    String?\n  presentAddressPostOffice String?\n  presentAddressPostCode   String?\n  presentAddressDistrict   String?\n\n  isDeleted Boolean @default(false)\n\n  // student  Student?  @relation(fields: [studentId], references: [id])\n  employee Employee? @relation(fields: [employeeId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime  @default(now()) @map("created_at")\n  updatedAt DateTime  @updatedAt @map("updated_at")\n  deletedAt DateTime? @map("deleted_at")\n}\n\nmodel Sequence {\n  id      String @id\n  current Int\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"employee","kind":"object","type":"Employee","relationName":"EmployeeToUser"},{"name":"admin","kind":"object","type":"Admin","relationName":"AdminToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Admin":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"profilePhoto","kind":"scalar","type":"String"},{"name":"contactNumber","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AdminToUser"}],"dbName":"admins"},"Employee":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"fullName","kind":"scalar","type":"String"},{"name":"nid","kind":"scalar","type":"String"},{"name":"fatherName","kind":"scalar","type":"String"},{"name":"motherName","kind":"scalar","type":"String"},{"name":"emergencyContact","kind":"scalar","type":"String"},{"name":"monthlySalary","kind":"scalar","type":"Float"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"picture","kind":"scalar","type":"String"},{"name":"picturePublicId","kind":"scalar","type":"String"},{"name":"pictureName","kind":"scalar","type":"String"},{"name":"pictureType","kind":"scalar","type":"String"},{"name":"experience","kind":"scalar","type":"String"},{"name":"experiencePublicId","kind":"scalar","type":"String"},{"name":"experienceName","kind":"scalar","type":"String"},{"name":"experienceType","kind":"scalar","type":"String"},{"name":"authoritySign","kind":"scalar","type":"String"},{"name":"authoritySignPublicId","kind":"scalar","type":"String"},{"name":"authoritySignName","kind":"scalar","type":"String"},{"name":"authoritySignType","kind":"scalar","type":"String"},{"name":"employeeSign","kind":"scalar","type":"String"},{"name":"employeeSignPublicId","kind":"scalar","type":"String"},{"name":"employeeSignName","kind":"scalar","type":"String"},{"name":"employeeSignType","kind":"scalar","type":"String"},{"name":"gender","kind":"enum","type":"Gender"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"religion","kind":"enum","type":"Religion"},{"name":"employeeRole","kind":"enum","type":"EmployeeRole"},{"name":"dateOfJoining","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"EmployeeToUser"},{"name":"isdeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"address","kind":"object","type":"Address","relationName":"AddressToEmployee"},{"name":"classes","kind":"object","type":"Class","relationName":"ClassToEmployee"}],"dbName":"employee"},"Class":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"monthlyTuitionFee","kind":"scalar","type":"Float"},{"name":"classTeacher","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"employee","kind":"object","type":"Employee","relationName":"ClassToEmployee"}],"dbName":"class"},"Address":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String","dbName":"student_id"},{"name":"employeeId","kind":"scalar","type":"String","dbName":"employee_id"},{"name":"permanentAddressVillage","kind":"scalar","type":"String"},{"name":"permanentAddressPostOffice","kind":"scalar","type":"String"},{"name":"permanentAddressPostCode","kind":"scalar","type":"String"},{"name":"permanentAddressDistrict","kind":"scalar","type":"String"},{"name":"presentAddressVillage","kind":"scalar","type":"String"},{"name":"presentAddressPostOffice","kind":"scalar","type":"String"},{"name":"presentAddressPostCode","kind":"scalar","type":"String"},{"name":"presentAddressDistrict","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"employee","kind":"object","type":"Employee","relationName":"AddressToEmployee"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"}],"dbName":null},"Sequence":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"current","kind":"scalar","type":"Int"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","employee","address","classes","_count","admin","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Admin.findUnique","Admin.findUniqueOrThrow","Admin.findFirst","Admin.findFirstOrThrow","Admin.findMany","Admin.createOne","Admin.createMany","Admin.createManyAndReturn","Admin.updateOne","Admin.updateMany","Admin.updateManyAndReturn","Admin.upsertOne","Admin.deleteOne","Admin.deleteMany","Admin.groupBy","Admin.aggregate","Employee.findUnique","Employee.findUniqueOrThrow","Employee.findFirst","Employee.findFirstOrThrow","Employee.findMany","Employee.createOne","Employee.createMany","Employee.createManyAndReturn","Employee.updateOne","Employee.updateMany","Employee.updateManyAndReturn","Employee.upsertOne","Employee.deleteOne","Employee.deleteMany","_avg","_sum","Employee.groupBy","Employee.aggregate","Class.findUnique","Class.findUniqueOrThrow","Class.findFirst","Class.findFirstOrThrow","Class.findMany","Class.createOne","Class.createMany","Class.createManyAndReturn","Class.updateOne","Class.updateMany","Class.updateManyAndReturn","Class.upsertOne","Class.deleteOne","Class.deleteMany","Class.groupBy","Class.aggregate","Address.findUnique","Address.findUniqueOrThrow","Address.findFirst","Address.findFirstOrThrow","Address.findMany","Address.createOne","Address.createMany","Address.createManyAndReturn","Address.updateOne","Address.updateMany","Address.updateManyAndReturn","Address.upsertOne","Address.deleteOne","Address.deleteMany","Address.groupBy","Address.aggregate","Sequence.findUnique","Sequence.findUniqueOrThrow","Sequence.findFirst","Sequence.findFirstOrThrow","Sequence.findMany","Sequence.createOne","Sequence.createMany","Sequence.createManyAndReturn","Sequence.updateOne","Sequence.updateMany","Sequence.updateManyAndReturn","Sequence.upsertOne","Sequence.deleteOne","Sequence.deleteMany","Sequence.groupBy","Sequence.aggregate","AND","OR","NOT","id","current","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","studentId","employeeId","permanentAddressVillage","permanentAddressPostOffice","permanentAddressPostCode","permanentAddressDistrict","presentAddressVillage","presentAddressPostOffice","presentAddressPostCode","presentAddressDistrict","isDeleted","createdAt","updatedAt","deletedAt","name","monthlyTuitionFee","classTeacher","userId","phone","fullName","nid","fatherName","motherName","emergencyContact","monthlySalary","picture","picturePublicId","pictureName","pictureType","experience","experiencePublicId","experienceName","experienceType","authoritySign","authoritySignPublicId","authoritySignName","authoritySignType","employeeSign","employeeSignPublicId","employeeSignName","employeeSignType","Gender","gender","BloodGroup","bloodGroup","Religion","religion","EmployeeRole","employeeRole","dateOfJoining","isdeleted","every","some","none","email","profilePhoto","contactNumber","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","UserRole","role","UserStatus","status","needPasswordChange","emailVerified","image","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "3gNRkAETBAAAtgIAIAUAALcCACAGAACMAgAgCgAAuAIAIKMBAACzAgAwpAEAABoAEKUBAACzAgAwpgEBAAAAAb0BIACJAgAhvgFAAIoCACG_AUAAigIAIcABQACLAgAhwQEBAPcBACHpAQEAAAAB_AEAALQC_AEi_gEAALUC_gEi_wEgAIkCACGAAiAAiQIAIYECAQCIAgAhAQAAAAEAIAwDAACjAgAgowEAALwCADCkAQAAAwAQpQEAALwCADCmAQEA9wEAIb4BQACKAgAhvwFAAIoCACHEAQEA9wEAIe4BQACKAgAh-AEBAPcBACH5AQEAiAIAIfoBAQCIAgAhAwMAAPcCACD5AQAAxAIAIPoBAADEAgAgDAMAAKMCACCjAQAAvAIAMKQBAAADABClAQAAvAIAMKYBAQAAAAG-AUAAigIAIb8BQACKAgAhxAEBAPcBACHuAUAAigIAIfgBAQAAAAH5AQEAiAIAIfoBAQCIAgAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAACjAgAgowEAALsCADCkAQAABwAQpQEAALsCADCmAQEA9wEAIb4BQACKAgAhvwFAAIoCACHEAQEA9wEAIe8BAQD3AQAh8AEBAPcBACHxAQEAiAIAIfIBAQCIAgAh8wEBAIgCACH0AUAAiwIAIfUBQACLAgAh9gEBAIgCACH3AQEAiAIAIQgDAAD3AgAg8QEAAMQCACDyAQAAxAIAIPMBAADEAgAg9AEAAMQCACD1AQAAxAIAIPYBAADEAgAg9wEAAMQCACARAwAAowIAIKMBAAC7AgAwpAEAAAcAEKUBAAC7AgAwpgEBAAAAAb4BQACKAgAhvwFAAIoCACHEAQEA9wEAIe8BAQD3AQAh8AEBAPcBACHxAQEAiAIAIfIBAQCIAgAh8wEBAIgCACH0AUAAiwIAIfUBQACLAgAh9gEBAIgCACH3AQEAiAIAIQMAAAAHACABAAAIADACAAAJACApAwAAowIAIAcAAKQCACAIAAClAgAgowEAAJ0CADCkAQAACwAQpQEAAJ0CADCmAQEA9wEAIbQBAQD3AQAhvgFAAIoCACG_AUAAigIAIcABQACLAgAhxAEBAPcBACHFAQEA9wEAIcYBAQD3AQAhxwEBAPcBACHIAQEA9wEAIckBAQD3AQAhygEBAIgCACHLAQgAngIAIcwBAQCIAgAhzQEBAIgCACHOAQEAiAIAIc8BAQCIAgAh0AEBAIgCACHRAQEAiAIAIdIBAQCIAgAh0wEBAIgCACHUAQEA9wEAIdUBAQD3AQAh1gEBAIgCACHXAQEAiAIAIdgBAQD3AQAh2QEBAPcBACHaAQEAiAIAIdsBAQCIAgAh3QEAAJ8C3QEi3wEAAKAC3wEi4QEAAKEC4QEi4wEAAKIC4wEi5AEBAPcBACHlASAAiQIAIQEAAAALACATBgAAjAIAIKMBAACHAgAwpAEAAA0AEKUBAACHAgAwpgEBAPcBACGzAQEAiAIAIbQBAQCIAgAhtQEBAIgCACG2AQEAiAIAIbcBAQCIAgAhuAEBAIgCACG5AQEAiAIAIboBAQCIAgAhuwEBAIgCACG8AQEAiAIAIb0BIACJAgAhvgFAAIoCACG_AUAAigIAIcABQACLAgAhAQAAAA0AIAEAAAALACAMBgAAugIAIKMBAAC5AgAwpAEAABAAEKUBAAC5AgAwpgEBAPcBACG9ASAAiQIAIb4BQACKAgAhvwFAAIoCACHAAUAAiwIAIcEBAQD3AQAhwgEIAJ4CACHDAQEA9wEAIQIGAADOAgAgwAEAAMQCACAMBgAAugIAIKMBAAC5AgAwpAEAABAAEKUBAAC5AgAwpgEBAAAAAb0BIACJAgAhvgFAAIoCACG_AUAAigIAIcABQACLAgAhwQEBAAAAAcIBCACeAgAhwwEBAPcBACEDAAAAEAAgAQAAEQAwAgAAEgAgAQAAABAAIA4DAACjAgAgowEAAKcCADCkAQAAFQAQpQEAAKcCADCmAQEA9wEAIb0BIACJAgAhvgFAAIoCACG_AUAAigIAIcABQACLAgAhwQEBAPcBACHEAQEA9wEAIekBAQD3AQAh6gEBAIgCACHrAQEAiAIAIQEAAAAVACABAAAAAwAgAQAAAAcAIAEAAAABACATBAAAtgIAIAUAALcCACAGAACMAgAgCgAAuAIAIKMBAACzAgAwpAEAABoAEKUBAACzAgAwpgEBAPcBACG9ASAAiQIAIb4BQACKAgAhvwFAAIoCACHAAUAAiwIAIcEBAQD3AQAh6QEBAPcBACH8AQAAtAL8ASL-AQAAtQL-ASL_ASAAiQIAIYACIACJAgAhgQIBAIgCACEGBAAAuwMAIAUAALwDACAGAADOAgAgCgAAvQMAIMABAADEAgAggQIAAMQCACADAAAAGgAgAQAAGwAwAgAAAQAgAwAAABoAIAEAABsAMAIAAAEAIAMAAAAaACABAAAbADACAAABACAQBAAAtwMAIAUAALgDACAGAAC5AwAgCgAAugMAIKYBAQAAAAG9ASAAAAABvgFAAAAAAb8BQAAAAAHAAUAAAAABwQEBAAAAAekBAQAAAAH8AQAAAPwBAv4BAAAA_gEC_wEgAAAAAYACIAAAAAGBAgEAAAABARAAAB8AIAymAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHpAQEAAAAB_AEAAAD8AQL-AQAAAP4BAv8BIAAAAAGAAiAAAAABgQIBAAAAAQEQAAAhADABEAAAIQAwEAQAAJEDACAFAACSAwAgBgAAkwMAIAoAAJQDACCmAQEAwgIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhwQEBAMICACHpAQEAwgIAIfwBAACPA_wBIv4BAACQA_4BIv8BIADJAgAhgAIgAMkCACGBAgEAyAIAIQIAAAABACAQAAAkACAMpgEBAMICACG9ASAAyQIAIb4BQADKAgAhvwFAAMoCACHAAUAAywIAIcEBAQDCAgAh6QEBAMICACH8AQAAjwP8ASL-AQAAkAP-ASL_ASAAyQIAIYACIADJAgAhgQIBAMgCACECAAAAGgAgEAAAJgAgAgAAABoAIBAAACYAIAMAAAABACAXAAAfACAYAAAkACABAAAAAQAgAQAAABoAIAUJAACMAwAgHQAAjgMAIB4AAI0DACDAAQAAxAIAIIECAADEAgAgD6MBAACsAgAwpAEAAC0AEKUBAACsAgAwpgEBAO8BACG9ASAA-wEAIb4BQAD8AQAhvwFAAPwBACHAAUAA_QEAIcEBAQDvAQAh6QEBAO8BACH8AQAArQL8ASL-AQAArgL-ASL_ASAA-wEAIYACIAD7AQAhgQIBAPoBACEDAAAAGgAgAQAALAAwHAAALQAgAwAAABoAIAEAABsAMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCQMAAIsDACCmAQEAAAABvgFAAAAAAb8BQAAAAAHEAQEAAAAB7gFAAAAAAfgBAQAAAAH5AQEAAAAB-gEBAAAAAQEQAAA1ACAIpgEBAAAAAb4BQAAAAAG_AUAAAAABxAEBAAAAAe4BQAAAAAH4AQEAAAAB-QEBAAAAAfoBAQAAAAEBEAAANwAwARAAADcAMAkDAACKAwAgpgEBAMICACG-AUAAygIAIb8BQADKAgAhxAEBAMICACHuAUAAygIAIfgBAQDCAgAh-QEBAMgCACH6AQEAyAIAIQIAAAAFACAQAAA6ACAIpgEBAMICACG-AUAAygIAIb8BQADKAgAhxAEBAMICACHuAUAAygIAIfgBAQDCAgAh-QEBAMgCACH6AQEAyAIAIQIAAAADACAQAAA8ACACAAAAAwAgEAAAPAAgAwAAAAUAIBcAADUAIBgAADoAIAEAAAAFACABAAAAAwAgBQkAAIcDACAdAACJAwAgHgAAiAMAIPkBAADEAgAg-gEAAMQCACALowEAAKsCADCkAQAAQwAQpQEAAKsCADCmAQEA7wEAIb4BQAD8AQAhvwFAAPwBACHEAQEA7wEAIe4BQAD8AQAh-AEBAO8BACH5AQEA-gEAIfoBAQD6AQAhAwAAAAMAIAEAAEIAMBwAAEMAIAMAAAADACABAAAEADACAAAFACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIA4DAACGAwAgpgEBAAAAAb4BQAAAAAG_AUAAAAABxAEBAAAAAe8BAQAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAHzAQEAAAAB9AFAAAAAAfUBQAAAAAH2AQEAAAAB9wEBAAAAAQEQAABLACANpgEBAAAAAb4BQAAAAAG_AUAAAAABxAEBAAAAAe8BAQAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAHzAQEAAAAB9AFAAAAAAfUBQAAAAAH2AQEAAAAB9wEBAAAAAQEQAABNADABEAAATQAwDgMAAIUDACCmAQEAwgIAIb4BQADKAgAhvwFAAMoCACHEAQEAwgIAIe8BAQDCAgAh8AEBAMICACHxAQEAyAIAIfIBAQDIAgAh8wEBAMgCACH0AUAAywIAIfUBQADLAgAh9gEBAMgCACH3AQEAyAIAIQIAAAAJACAQAABQACANpgEBAMICACG-AUAAygIAIb8BQADKAgAhxAEBAMICACHvAQEAwgIAIfABAQDCAgAh8QEBAMgCACHyAQEAyAIAIfMBAQDIAgAh9AFAAMsCACH1AUAAywIAIfYBAQDIAgAh9wEBAMgCACECAAAABwAgEAAAUgAgAgAAAAcAIBAAAFIAIAMAAAAJACAXAABLACAYAABQACABAAAACQAgAQAAAAcAIAoJAACCAwAgHQAAhAMAIB4AAIMDACDxAQAAxAIAIPIBAADEAgAg8wEAAMQCACD0AQAAxAIAIPUBAADEAgAg9gEAAMQCACD3AQAAxAIAIBCjAQAAqgIAMKQBAABZABClAQAAqgIAMKYBAQDvAQAhvgFAAPwBACG_AUAA_AEAIcQBAQDvAQAh7wEBAO8BACHwAQEA7wEAIfEBAQD6AQAh8gEBAPoBACHzAQEA-gEAIfQBQAD9AQAh9QFAAP0BACH2AQEA-gEAIfcBAQD6AQAhAwAAAAcAIAEAAFgAMBwAAFkAIAMAAAAHACABAAAIADACAAAJACAJowEAAKkCADCkAQAAXwAQpQEAAKkCADCmAQEAAAABvgFAAIoCACG_AUAAigIAIewBAQD3AQAh7QEBAPcBACHuAUAAigIAIQEAAABcACABAAAAXAAgCaMBAACpAgAwpAEAAF8AEKUBAACpAgAwpgEBAPcBACG-AUAAigIAIb8BQACKAgAh7AEBAPcBACHtAQEA9wEAIe4BQACKAgAhAAMAAABfACABAABgADACAABcACADAAAAXwAgAQAAYAAwAgAAXAAgAwAAAF8AIAEAAGAAMAIAAFwAIAamAQEAAAABvgFAAAAAAb8BQAAAAAHsAQEAAAAB7QEBAAAAAe4BQAAAAAEBEAAAZAAgBqYBAQAAAAG-AUAAAAABvwFAAAAAAewBAQAAAAHtAQEAAAAB7gFAAAAAAQEQAABmADABEAAAZgAwBqYBAQDCAgAhvgFAAMoCACG_AUAAygIAIewBAQDCAgAh7QEBAMICACHuAUAAygIAIQIAAABcACAQAABpACAGpgEBAMICACG-AUAAygIAIb8BQADKAgAh7AEBAMICACHtAQEAwgIAIe4BQADKAgAhAgAAAF8AIBAAAGsAIAIAAABfACAQAABrACADAAAAXAAgFwAAZAAgGAAAaQAgAQAAAFwAIAEAAABfACADCQAA_wIAIB0AAIEDACAeAACAAwAgCaMBAACoAgAwpAEAAHIAEKUBAACoAgAwpgEBAO8BACG-AUAA_AEAIb8BQAD8AQAh7AEBAO8BACHtAQEA7wEAIe4BQAD8AQAhAwAAAF8AIAEAAHEAMBwAAHIAIAMAAABfACABAABgADACAABcACAOAwAAowIAIKMBAACnAgAwpAEAABUAEKUBAACnAgAwpgEBAAAAAb0BIACJAgAhvgFAAIoCACG_AUAAigIAIcABQACLAgAhwQEBAPcBACHEAQEAAAAB6QEBAAAAAeoBAQCIAgAh6wEBAIgCACEBAAAAdQAgAQAAAHUAIAQDAAD3AgAgwAEAAMQCACDqAQAAxAIAIOsBAADEAgAgAwAAABUAIAEAAHgAMAIAAHUAIAMAAAAVACABAAB4ADACAAB1ACADAAAAFQAgAQAAeAAwAgAAdQAgCwMAAP4CACCmAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHEAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAABARAAAHwAIAqmAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHEAQEAAAAB6QEBAAAAAeoBAQAAAAHrAQEAAAABARAAAH4AMAEQAAB-ADALAwAA_QIAIKYBAQDCAgAhvQEgAMkCACG-AUAAygIAIb8BQADKAgAhwAFAAMsCACHBAQEAwgIAIcQBAQDCAgAh6QEBAMICACHqAQEAyAIAIesBAQDIAgAhAgAAAHUAIBAAAIEBACAKpgEBAMICACG9ASAAyQIAIb4BQADKAgAhvwFAAMoCACHAAUAAywIAIcEBAQDCAgAhxAEBAMICACHpAQEAwgIAIeoBAQDIAgAh6wEBAMgCACECAAAAFQAgEAAAgwEAIAIAAAAVACAQAACDAQAgAwAAAHUAIBcAAHwAIBgAAIEBACABAAAAdQAgAQAAABUAIAYJAAD6AgAgHQAA_AIAIB4AAPsCACDAAQAAxAIAIOoBAADEAgAg6wEAAMQCACANowEAAKYCADCkAQAAigEAEKUBAACmAgAwpgEBAO8BACG9ASAA-wEAIb4BQAD8AQAhvwFAAPwBACHAAUAA_QEAIcEBAQDvAQAhxAEBAO8BACHpAQEA7wEAIeoBAQD6AQAh6wEBAPoBACEDAAAAFQAgAQAAiQEAMBwAAIoBACADAAAAFQAgAQAAeAAwAgAAdQAgKQMAAKMCACAHAACkAgAgCAAApQIAIKMBAACdAgAwpAEAAAsAEKUBAACdAgAwpgEBAAAAAbQBAQAAAAG-AUAAigIAIb8BQACKAgAhwAFAAIsCACHEAQEAAAABxQEBAPcBACHGAQEA9wEAIccBAQD3AQAhyAEBAPcBACHJAQEA9wEAIcoBAQCIAgAhywEIAJ4CACHMAQEAiAIAIc0BAQCIAgAhzgEBAIgCACHPAQEAiAIAIdABAQCIAgAh0QEBAIgCACHSAQEAiAIAIdMBAQCIAgAh1AEBAPcBACHVAQEA9wEAIdYBAQCIAgAh1wEBAIgCACHYAQEA9wEAIdkBAQD3AQAh2gEBAIgCACHbAQEAiAIAId0BAACfAt0BIt8BAACgAt8BIuEBAAChAuEBIuMBAACiAuMBIuQBAQD3AQAh5QEgAIkCACEBAAAAjQEAIAEAAACNAQAgEQMAAPcCACAHAAD4AgAgCAAA-QIAIMABAADEAgAgygEAAMQCACDMAQAAxAIAIM0BAADEAgAgzgEAAMQCACDPAQAAxAIAINABAADEAgAg0QEAAMQCACDSAQAAxAIAINMBAADEAgAg1gEAAMQCACDXAQAAxAIAINoBAADEAgAg2wEAAMQCACADAAAACwAgAQAAkAEAMAIAAI0BACADAAAACwAgAQAAkAEAMAIAAI0BACADAAAACwAgAQAAkAEAMAIAAI0BACAmAwAA9AIAIAcAAPUCACAIAAD2AgAgpgEBAAAAAbQBAQAAAAG-AUAAAAABvwFAAAAAAcABQAAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAAAABywEIAAAAAcwBAQAAAAHNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHTAQEAAAAB1AEBAAAAAdUBAQAAAAHWAQEAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHdAQAAAN0BAt8BAAAA3wEC4QEAAADhAQLjAQAAAOMBAuQBAQAAAAHlASAAAAABARAAAJQBACAjpgEBAAAAAbQBAQAAAAG-AUAAAAABvwFAAAAAAcABQAAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAAAABywEIAAAAAcwBAQAAAAHNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHTAQEAAAAB1AEBAAAAAdUBAQAAAAHWAQEAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHdAQAAAN0BAt8BAAAA3wEC4QEAAADhAQLjAQAAAOMBAuQBAQAAAAHlASAAAAABARAAAJYBADABEAAAlgEAMCYDAADgAgAgBwAA4QIAIAgAAOICACCmAQEAwgIAIbQBAQDCAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhxAEBAMICACHFAQEAwgIAIcYBAQDCAgAhxwEBAMICACHIAQEAwgIAIckBAQDCAgAhygEBAMgCACHLAQgA1AIAIcwBAQDIAgAhzQEBAMgCACHOAQEAyAIAIc8BAQDIAgAh0AEBAMgCACHRAQEAyAIAIdIBAQDIAgAh0wEBAMgCACHUAQEAwgIAIdUBAQDCAgAh1gEBAMgCACHXAQEAyAIAIdgBAQDCAgAh2QEBAMICACHaAQEAyAIAIdsBAQDIAgAh3QEAANwC3QEi3wEAAN0C3wEi4QEAAN4C4QEi4wEAAN8C4wEi5AEBAMICACHlASAAyQIAIQIAAACNAQAgEAAAmQEAICOmAQEAwgIAIbQBAQDCAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhxAEBAMICACHFAQEAwgIAIcYBAQDCAgAhxwEBAMICACHIAQEAwgIAIckBAQDCAgAhygEBAMgCACHLAQgA1AIAIcwBAQDIAgAhzQEBAMgCACHOAQEAyAIAIc8BAQDIAgAh0AEBAMgCACHRAQEAyAIAIdIBAQDIAgAh0wEBAMgCACHUAQEAwgIAIdUBAQDCAgAh1gEBAMgCACHXAQEAyAIAIdgBAQDCAgAh2QEBAMICACHaAQEAyAIAIdsBAQDIAgAh3QEAANwC3QEi3wEAAN0C3wEi4QEAAN4C4QEi4wEAAN8C4wEi5AEBAMICACHlASAAyQIAIQIAAAALACAQAACbAQAgAgAAAAsAIBAAAJsBACADAAAAjQEAIBcAAJQBACAYAACZAQAgAQAAAI0BACABAAAACwAgEwkAANcCACAdAADaAgAgHgAA2QIAIG8AANgCACBwAADbAgAgwAEAAMQCACDKAQAAxAIAIMwBAADEAgAgzQEAAMQCACDOAQAAxAIAIM8BAADEAgAg0AEAAMQCACDRAQAAxAIAINIBAADEAgAg0wEAAMQCACDWAQAAxAIAINcBAADEAgAg2gEAAMQCACDbAQAAxAIAICajAQAAkAIAMKQBAACiAQAQpQEAAJACADCmAQEA7wEAIbQBAQDvAQAhvgFAAPwBACG_AUAA_AEAIcABQAD9AQAhxAEBAO8BACHFAQEA7wEAIcYBAQDvAQAhxwEBAO8BACHIAQEA7wEAIckBAQDvAQAhygEBAPoBACHLAQgAjgIAIcwBAQD6AQAhzQEBAPoBACHOAQEA-gEAIc8BAQD6AQAh0AEBAPoBACHRAQEA-gEAIdIBAQD6AQAh0wEBAPoBACHUAQEA7wEAIdUBAQDvAQAh1gEBAPoBACHXAQEA-gEAIdgBAQDvAQAh2QEBAO8BACHaAQEA-gEAIdsBAQD6AQAh3QEAAJEC3QEi3wEAAJIC3wEi4QEAAJMC4QEi4wEAAJQC4wEi5AEBAO8BACHlASAA-wEAIQMAAAALACABAAChAQAwHAAAogEAIAMAAAALACABAACQAQAwAgAAjQEAIAEAAAASACABAAAAEgAgAwAAABAAIAEAABEAMAIAABIAIAMAAAAQACABAAARADACAAASACADAAAAEAAgAQAAEQAwAgAAEgAgCQYAANYCACCmAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHCAQgAAAABwwEBAAAAAQEQAACqAQAgCKYBAQAAAAG9ASAAAAABvgFAAAAAAb8BQAAAAAHAAUAAAAABwQEBAAAAAcIBCAAAAAHDAQEAAAABARAAAKwBADABEAAArAEAMAkGAADVAgAgpgEBAMICACG9ASAAyQIAIb4BQADKAgAhvwFAAMoCACHAAUAAywIAIcEBAQDCAgAhwgEIANQCACHDAQEAwgIAIQIAAAASACAQAACvAQAgCKYBAQDCAgAhvQEgAMkCACG-AUAAygIAIb8BQADKAgAhwAFAAMsCACHBAQEAwgIAIcIBCADUAgAhwwEBAMICACECAAAAEAAgEAAAsQEAIAIAAAAQACAQAACxAQAgAwAAABIAIBcAAKoBACAYAACvAQAgAQAAABIAIAEAAAAQACAGCQAAzwIAIB0AANICACAeAADRAgAgbwAA0AIAIHAAANMCACDAAQAAxAIAIAujAQAAjQIAMKQBAAC4AQAQpQEAAI0CADCmAQEA7wEAIb0BIAD7AQAhvgFAAPwBACG_AUAA_AEAIcABQAD9AQAhwQEBAO8BACHCAQgAjgIAIcMBAQDvAQAhAwAAABAAIAEAALcBADAcAAC4AQAgAwAAABAAIAEAABEAMAIAABIAIBMGAACMAgAgowEAAIcCADCkAQAADQAQpQEAAIcCADCmAQEAAAABswEBAAAAAbQBAQAAAAG1AQEAiAIAIbYBAQCIAgAhtwEBAIgCACG4AQEAiAIAIbkBAQCIAgAhugEBAIgCACG7AQEAiAIAIbwBAQCIAgAhvQEgAIkCACG-AUAAigIAIb8BQACKAgAhwAFAAIsCACEBAAAAuwEAIAEAAAC7AQAgDAYAAM4CACCzAQAAxAIAILQBAADEAgAgtQEAAMQCACC2AQAAxAIAILcBAADEAgAguAEAAMQCACC5AQAAxAIAILoBAADEAgAguwEAAMQCACC8AQAAxAIAIMABAADEAgAgAwAAAA0AIAEAAL4BADACAAC7AQAgAwAAAA0AIAEAAL4BADACAAC7AQAgAwAAAA0AIAEAAL4BADACAAC7AQAgEAYAAM0CACCmAQEAAAABswEBAAAAAbQBAQAAAAG1AQEAAAABtgEBAAAAAbcBAQAAAAG4AQEAAAABuQEBAAAAAboBAQAAAAG7AQEAAAABvAEBAAAAAb0BIAAAAAG-AUAAAAABvwFAAAAAAcABQAAAAAEBEAAAwgEAIA-mAQEAAAABswEBAAAAAbQBAQAAAAG1AQEAAAABtgEBAAAAAbcBAQAAAAG4AQEAAAABuQEBAAAAAboBAQAAAAG7AQEAAAABvAEBAAAAAb0BIAAAAAG-AUAAAAABvwFAAAAAAcABQAAAAAEBEAAAxAEAMAEQAADEAQAwAQAAAAsAIBAGAADMAgAgpgEBAMICACGzAQEAyAIAIbQBAQDIAgAhtQEBAMgCACG2AQEAyAIAIbcBAQDIAgAhuAEBAMgCACG5AQEAyAIAIboBAQDIAgAhuwEBAMgCACG8AQEAyAIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhAgAAALsBACAQAADIAQAgD6YBAQDCAgAhswEBAMgCACG0AQEAyAIAIbUBAQDIAgAhtgEBAMgCACG3AQEAyAIAIbgBAQDIAgAhuQEBAMgCACG6AQEAyAIAIbsBAQDIAgAhvAEBAMgCACG9ASAAyQIAIb4BQADKAgAhvwFAAMoCACHAAUAAywIAIQIAAAANACAQAADKAQAgAgAAAA0AIBAAAMoBACABAAAACwAgAwAAALsBACAXAADCAQAgGAAAyAEAIAEAAAC7AQAgAQAAAA0AIA4JAADFAgAgHQAAxwIAIB4AAMYCACCzAQAAxAIAILQBAADEAgAgtQEAAMQCACC2AQAAxAIAILcBAADEAgAguAEAAMQCACC5AQAAxAIAILoBAADEAgAguwEAAMQCACC8AQAAxAIAIMABAADEAgAgEqMBAAD5AQAwpAEAANIBABClAQAA-QEAMKYBAQDvAQAhswEBAPoBACG0AQEA-gEAIbUBAQD6AQAhtgEBAPoBACG3AQEA-gEAIbgBAQD6AQAhuQEBAPoBACG6AQEA-gEAIbsBAQD6AQAhvAEBAPoBACG9ASAA-wEAIb4BQAD8AQAhvwFAAPwBACHAAUAA_QEAIQMAAAANACABAADRAQAwHAAA0gEAIAMAAAANACABAAC-AQAwAgAAuwEAIAWjAQAA9gEAMKQBAADYAQAQpQEAAPYBADCmAQEAAAABpwECAPgBACEBAAAA1QEAIAEAAADVAQAgBaMBAAD2AQAwpAEAANgBABClAQAA9gEAMKYBAQD3AQAhpwECAPgBACEAAwAAANgBACABAADZAQAwAgAA1QEAIAMAAADYAQAgAQAA2QEAMAIAANUBACADAAAA2AEAIAEAANkBADACAADVAQAgAqYBAQAAAAGnAQIAAAABARAAAN0BACACpgEBAAAAAacBAgAAAAEBEAAA3wEAMAEQAADfAQAwAqYBAQDCAgAhpwECAMMCACECAAAA1QEAIBAAAOIBACACpgEBAMICACGnAQIAwwIAIQIAAADYAQAgEAAA5AEAIAIAAADYAQAgEAAA5AEAIAMAAADVAQAgFwAA3QEAIBgAAOIBACABAAAA1QEAIAEAAADYAQAgBQkAAL0CACAdAADAAgAgHgAAvwIAIG8AAL4CACBwAADBAgAgBaMBAADuAQAwpAEAAOsBABClAQAA7gEAMKYBAQDvAQAhpwECAPABACEDAAAA2AEAIAEAAOoBADAcAADrAQAgAwAAANgBACABAADZAQAwAgAA1QEAIAWjAQAA7gEAMKQBAADrAQAQpQEAAO4BADCmAQEA7wEAIacBAgDwAQAhDgkAAPIBACAdAAD1AQAgHgAA9QEAIKgBAQAAAAGpAQEAAAAEqgEBAAAABKsBAQAAAAGsAQEAAAABrQEBAAAAAa4BAQAAAAGvAQEA9AEAIbABAQAAAAGxAQEAAAABsgEBAAAAAQ0JAADyAQAgHQAA8gEAIB4AAPIBACBvAADzAQAgcAAA8gEAIKgBAgAAAAGpAQIAAAAEqgECAAAABKsBAgAAAAGsAQIAAAABrQECAAAAAa4BAgAAAAGvAQIA8QEAIQ0JAADyAQAgHQAA8gEAIB4AAPIBACBvAADzAQAgcAAA8gEAIKgBAgAAAAGpAQIAAAAEqgECAAAABKsBAgAAAAGsAQIAAAABrQECAAAAAa4BAgAAAAGvAQIA8QEAIQioAQIAAAABqQECAAAABKoBAgAAAASrAQIAAAABrAECAAAAAa0BAgAAAAGuAQIAAAABrwECAPIBACEIqAEIAAAAAakBCAAAAASqAQgAAAAEqwEIAAAAAawBCAAAAAGtAQgAAAABrgEIAAAAAa8BCADzAQAhDgkAAPIBACAdAAD1AQAgHgAA9QEAIKgBAQAAAAGpAQEAAAAEqgEBAAAABKsBAQAAAAGsAQEAAAABrQEBAAAAAa4BAQAAAAGvAQEA9AEAIbABAQAAAAGxAQEAAAABsgEBAAAAAQuoAQEAAAABqQEBAAAABKoBAQAAAASrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEAAAABrwEBAPUBACGwAQEAAAABsQEBAAAAAbIBAQAAAAEFowEAAPYBADCkAQAA2AEAEKUBAAD2AQAwpgEBAPcBACGnAQIA-AEAIQuoAQEAAAABqQEBAAAABKoBAQAAAASrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEAAAABrwEBAPUBACGwAQEAAAABsQEBAAAAAbIBAQAAAAEIqAECAAAAAakBAgAAAASqAQIAAAAEqwECAAAAAawBAgAAAAGtAQIAAAABrgECAAAAAa8BAgDyAQAhEqMBAAD5AQAwpAEAANIBABClAQAA-QEAMKYBAQDvAQAhswEBAPoBACG0AQEA-gEAIbUBAQD6AQAhtgEBAPoBACG3AQEA-gEAIbgBAQD6AQAhuQEBAPoBACG6AQEA-gEAIbsBAQD6AQAhvAEBAPoBACG9ASAA-wEAIb4BQAD8AQAhvwFAAPwBACHAAUAA_QEAIQ4JAAD_AQAgHQAAhgIAIB4AAIYCACCoAQEAAAABqQEBAAAABaoBAQAAAAWrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEAAAABrwEBAIUCACGwAQEAAAABsQEBAAAAAbIBAQAAAAEFCQAA8gEAIB0AAIQCACAeAACEAgAgqAEgAAAAAa8BIACDAgAhCwkAAPIBACAdAACCAgAgHgAAggIAIKgBQAAAAAGpAUAAAAAEqgFAAAAABKsBQAAAAAGsAUAAAAABrQFAAAAAAa4BQAAAAAGvAUAAgQIAIQsJAAD_AQAgHQAAgAIAIB4AAIACACCoAUAAAAABqQFAAAAABaoBQAAAAAWrAUAAAAABrAFAAAAAAa0BQAAAAAGuAUAAAAABrwFAAP4BACELCQAA_wEAIB0AAIACACAeAACAAgAgqAFAAAAAAakBQAAAAAWqAUAAAAAFqwFAAAAAAawBQAAAAAGtAUAAAAABrgFAAAAAAa8BQAD-AQAhCKgBAgAAAAGpAQIAAAAFqgECAAAABasBAgAAAAGsAQIAAAABrQECAAAAAa4BAgAAAAGvAQIA_wEAIQioAUAAAAABqQFAAAAABaoBQAAAAAWrAUAAAAABrAFAAAAAAa0BQAAAAAGuAUAAAAABrwFAAIACACELCQAA8gEAIB0AAIICACAeAACCAgAgqAFAAAAAAakBQAAAAASqAUAAAAAEqwFAAAAAAawBQAAAAAGtAUAAAAABrgFAAAAAAa8BQACBAgAhCKgBQAAAAAGpAUAAAAAEqgFAAAAABKsBQAAAAAGsAUAAAAABrQFAAAAAAa4BQAAAAAGvAUAAggIAIQUJAADyAQAgHQAAhAIAIB4AAIQCACCoASAAAAABrwEgAIMCACECqAEgAAAAAa8BIACEAgAhDgkAAP8BACAdAACGAgAgHgAAhgIAIKgBAQAAAAGpAQEAAAAFqgEBAAAABasBAQAAAAGsAQEAAAABrQEBAAAAAa4BAQAAAAGvAQEAhQIAIbABAQAAAAGxAQEAAAABsgEBAAAAAQuoAQEAAAABqQEBAAAABaoBAQAAAAWrAQEAAAABrAEBAAAAAa0BAQAAAAGuAQEAAAABrwEBAIYCACGwAQEAAAABsQEBAAAAAbIBAQAAAAETBgAAjAIAIKMBAACHAgAwpAEAAA0AEKUBAACHAgAwpgEBAPcBACGzAQEAiAIAIbQBAQCIAgAhtQEBAIgCACG2AQEAiAIAIbcBAQCIAgAhuAEBAIgCACG5AQEAiAIAIboBAQCIAgAhuwEBAIgCACG8AQEAiAIAIb0BIACJAgAhvgFAAIoCACG_AUAAigIAIcABQACLAgAhC6gBAQAAAAGpAQEAAAAFqgEBAAAABasBAQAAAAGsAQEAAAABrQEBAAAAAa4BAQAAAAGvAQEAhgIAIbABAQAAAAGxAQEAAAABsgEBAAAAAQKoASAAAAABrwEgAIQCACEIqAFAAAAAAakBQAAAAASqAUAAAAAEqwFAAAAAAawBQAAAAAGtAUAAAAABrgFAAAAAAa8BQACCAgAhCKgBQAAAAAGpAUAAAAAFqgFAAAAABasBQAAAAAGsAUAAAAABrQFAAAAAAa4BQAAAAAGvAUAAgAIAISsDAACjAgAgBwAApAIAIAgAAKUCACCjAQAAnQIAMKQBAAALABClAQAAnQIAMKYBAQD3AQAhtAEBAPcBACG-AUAAigIAIb8BQACKAgAhwAFAAIsCACHEAQEA9wEAIcUBAQD3AQAhxgEBAPcBACHHAQEA9wEAIcgBAQD3AQAhyQEBAPcBACHKAQEAiAIAIcsBCACeAgAhzAEBAIgCACHNAQEAiAIAIc4BAQCIAgAhzwEBAIgCACHQAQEAiAIAIdEBAQCIAgAh0gEBAIgCACHTAQEAiAIAIdQBAQD3AQAh1QEBAPcBACHWAQEAiAIAIdcBAQCIAgAh2AEBAPcBACHZAQEA9wEAIdoBAQCIAgAh2wEBAIgCACHdAQAAnwLdASLfAQAAoALfASLhAQAAoQLhASLjAQAAogLjASLkAQEA9wEAIeUBIACJAgAhggIAAAsAIIMCAAALACALowEAAI0CADCkAQAAuAEAEKUBAACNAgAwpgEBAO8BACG9ASAA-wEAIb4BQAD8AQAhvwFAAPwBACHAAUAA_QEAIcEBAQDvAQAhwgEIAI4CACHDAQEA7wEAIQ0JAADyAQAgHQAA8wEAIB4AAPMBACBvAADzAQAgcAAA8wEAIKgBCAAAAAGpAQgAAAAEqgEIAAAABKsBCAAAAAGsAQgAAAABrQEIAAAAAa4BCAAAAAGvAQgAjwIAIQ0JAADyAQAgHQAA8wEAIB4AAPMBACBvAADzAQAgcAAA8wEAIKgBCAAAAAGpAQgAAAAEqgEIAAAABKsBCAAAAAGsAQgAAAABrQEIAAAAAa4BCAAAAAGvAQgAjwIAISajAQAAkAIAMKQBAACiAQAQpQEAAJACADCmAQEA7wEAIbQBAQDvAQAhvgFAAPwBACG_AUAA_AEAIcABQAD9AQAhxAEBAO8BACHFAQEA7wEAIcYBAQDvAQAhxwEBAO8BACHIAQEA7wEAIckBAQDvAQAhygEBAPoBACHLAQgAjgIAIcwBAQD6AQAhzQEBAPoBACHOAQEA-gEAIc8BAQD6AQAh0AEBAPoBACHRAQEA-gEAIdIBAQD6AQAh0wEBAPoBACHUAQEA7wEAIdUBAQDvAQAh1gEBAPoBACHXAQEA-gEAIdgBAQDvAQAh2QEBAO8BACHaAQEA-gEAIdsBAQD6AQAh3QEAAJEC3QEi3wEAAJIC3wEi4QEAAJMC4QEi4wEAAJQC4wEi5AEBAO8BACHlASAA-wEAIQcJAADyAQAgHQAAnAIAIB4AAJwCACCoAQAAAN0BAqkBAAAA3QEIqgEAAADdAQivAQAAmwLdASIHCQAA8gEAIB0AAJoCACAeAACaAgAgqAEAAADfAQKpAQAAAN8BCKoBAAAA3wEIrwEAAJkC3wEiBwkAAPIBACAdAACYAgAgHgAAmAIAIKgBAAAA4QECqQEAAADhAQiqAQAAAOEBCK8BAACXAuEBIgcJAADyAQAgHQAAlgIAIB4AAJYCACCoAQAAAOMBAqkBAAAA4wEIqgEAAADjAQivAQAAlQLjASIHCQAA8gEAIB0AAJYCACAeAACWAgAgqAEAAADjAQKpAQAAAOMBCKoBAAAA4wEIrwEAAJUC4wEiBKgBAAAA4wECqQEAAADjAQiqAQAAAOMBCK8BAACWAuMBIgcJAADyAQAgHQAAmAIAIB4AAJgCACCoAQAAAOEBAqkBAAAA4QEIqgEAAADhAQivAQAAlwLhASIEqAEAAADhAQKpAQAAAOEBCKoBAAAA4QEIrwEAAJgC4QEiBwkAAPIBACAdAACaAgAgHgAAmgIAIKgBAAAA3wECqQEAAADfAQiqAQAAAN8BCK8BAACZAt8BIgSoAQAAAN8BAqkBAAAA3wEIqgEAAADfAQivAQAAmgLfASIHCQAA8gEAIB0AAJwCACAeAACcAgAgqAEAAADdAQKpAQAAAN0BCKoBAAAA3QEIrwEAAJsC3QEiBKgBAAAA3QECqQEAAADdAQiqAQAAAN0BCK8BAACcAt0BIikDAACjAgAgBwAApAIAIAgAAKUCACCjAQAAnQIAMKQBAAALABClAQAAnQIAMKYBAQD3AQAhtAEBAPcBACG-AUAAigIAIb8BQACKAgAhwAFAAIsCACHEAQEA9wEAIcUBAQD3AQAhxgEBAPcBACHHAQEA9wEAIcgBAQD3AQAhyQEBAPcBACHKAQEAiAIAIcsBCACeAgAhzAEBAIgCACHNAQEAiAIAIc4BAQCIAgAhzwEBAIgCACHQAQEAiAIAIdEBAQCIAgAh0gEBAIgCACHTAQEAiAIAIdQBAQD3AQAh1QEBAPcBACHWAQEAiAIAIdcBAQCIAgAh2AEBAPcBACHZAQEA9wEAIdoBAQCIAgAh2wEBAIgCACHdAQAAnwLdASLfAQAAoALfASLhAQAAoQLhASLjAQAAogLjASLkAQEA9wEAIeUBIACJAgAhCKgBCAAAAAGpAQgAAAAEqgEIAAAABKsBCAAAAAGsAQgAAAABrQEIAAAAAa4BCAAAAAGvAQgA8wEAIQSoAQAAAN0BAqkBAAAA3QEIqgEAAADdAQivAQAAnALdASIEqAEAAADfAQKpAQAAAN8BCKoBAAAA3wEIrwEAAJoC3wEiBKgBAAAA4QECqQEAAADhAQiqAQAAAOEBCK8BAACYAuEBIgSoAQAAAOMBAqkBAAAA4wEIqgEAAADjAQivAQAAlgLjASIVBAAAtgIAIAUAALcCACAGAACMAgAgCgAAuAIAIKMBAACzAgAwpAEAABoAEKUBAACzAgAwpgEBAPcBACG9ASAAiQIAIb4BQACKAgAhvwFAAIoCACHAAUAAiwIAIcEBAQD3AQAh6QEBAPcBACH8AQAAtAL8ASL-AQAAtQL-ASL_ASAAiQIAIYACIACJAgAhgQIBAIgCACGCAgAAGgAggwIAABoAIBUGAACMAgAgowEAAIcCADCkAQAADQAQpQEAAIcCADCmAQEA9wEAIbMBAQCIAgAhtAEBAIgCACG1AQEAiAIAIbYBAQCIAgAhtwEBAIgCACG4AQEAiAIAIbkBAQCIAgAhugEBAIgCACG7AQEAiAIAIbwBAQCIAgAhvQEgAIkCACG-AUAAigIAIb8BQACKAgAhwAFAAIsCACGCAgAADQAggwIAAA0AIAPmAQAAEAAg5wEAABAAIOgBAAAQACANowEAAKYCADCkAQAAigEAEKUBAACmAgAwpgEBAO8BACG9ASAA-wEAIb4BQAD8AQAhvwFAAPwBACHAAUAA_QEAIcEBAQDvAQAhxAEBAO8BACHpAQEA7wEAIeoBAQD6AQAh6wEBAPoBACEOAwAAowIAIKMBAACnAgAwpAEAABUAEKUBAACnAgAwpgEBAPcBACG9ASAAiQIAIb4BQACKAgAhvwFAAIoCACHAAUAAiwIAIcEBAQD3AQAhxAEBAPcBACHpAQEA9wEAIeoBAQCIAgAh6wEBAIgCACEJowEAAKgCADCkAQAAcgAQpQEAAKgCADCmAQEA7wEAIb4BQAD8AQAhvwFAAPwBACHsAQEA7wEAIe0BAQDvAQAh7gFAAPwBACEJowEAAKkCADCkAQAAXwAQpQEAAKkCADCmAQEA9wEAIb4BQACKAgAhvwFAAIoCACHsAQEA9wEAIe0BAQD3AQAh7gFAAIoCACEQowEAAKoCADCkAQAAWQAQpQEAAKoCADCmAQEA7wEAIb4BQAD8AQAhvwFAAPwBACHEAQEA7wEAIe8BAQDvAQAh8AEBAO8BACHxAQEA-gEAIfIBAQD6AQAh8wEBAPoBACH0AUAA_QEAIfUBQAD9AQAh9gEBAPoBACH3AQEA-gEAIQujAQAAqwIAMKQBAABDABClAQAAqwIAMKYBAQDvAQAhvgFAAPwBACG_AUAA_AEAIcQBAQDvAQAh7gFAAPwBACH4AQEA7wEAIfkBAQD6AQAh-gEBAPoBACEPowEAAKwCADCkAQAALQAQpQEAAKwCADCmAQEA7wEAIb0BIAD7AQAhvgFAAPwBACG_AUAA_AEAIcABQAD9AQAhwQEBAO8BACHpAQEA7wEAIfwBAACtAvwBIv4BAACuAv4BIv8BIAD7AQAhgAIgAPsBACGBAgEA-gEAIQcJAADyAQAgHQAAsgIAIB4AALICACCoAQAAAPwBAqkBAAAA_AEIqgEAAAD8AQivAQAAsQL8ASIHCQAA8gEAIB0AALACACAeAACwAgAgqAEAAAD-AQKpAQAAAP4BCKoBAAAA_gEIrwEAAK8C_gEiBwkAAPIBACAdAACwAgAgHgAAsAIAIKgBAAAA_gECqQEAAAD-AQiqAQAAAP4BCK8BAACvAv4BIgSoAQAAAP4BAqkBAAAA_gEIqgEAAAD-AQivAQAAsAL-ASIHCQAA8gEAIB0AALICACAeAACyAgAgqAEAAAD8AQKpAQAAAPwBCKoBAAAA_AEIrwEAALEC_AEiBKgBAAAA_AECqQEAAAD8AQiqAQAAAPwBCK8BAACyAvwBIhMEAAC2AgAgBQAAtwIAIAYAAIwCACAKAAC4AgAgowEAALMCADCkAQAAGgAQpQEAALMCADCmAQEA9wEAIb0BIACJAgAhvgFAAIoCACG_AUAAigIAIcABQACLAgAhwQEBAPcBACHpAQEA9wEAIfwBAAC0AvwBIv4BAAC1Av4BIv8BIACJAgAhgAIgAIkCACGBAgEAiAIAIQSoAQAAAPwBAqkBAAAA_AEIqgEAAAD8AQivAQAAsgL8ASIEqAEAAAD-AQKpAQAAAP4BCKoBAAAA_gEIrwEAALAC_gEiA-YBAAADACDnAQAAAwAg6AEAAAMAIAPmAQAABwAg5wEAAAcAIOgBAAAHACAQAwAAowIAIKMBAACnAgAwpAEAABUAEKUBAACnAgAwpgEBAPcBACG9ASAAiQIAIb4BQACKAgAhvwFAAIoCACHAAUAAiwIAIcEBAQD3AQAhxAEBAPcBACHpAQEA9wEAIeoBAQCIAgAh6wEBAIgCACGCAgAAFQAggwIAABUAIAwGAAC6AgAgowEAALkCADCkAQAAEAAQpQEAALkCADCmAQEA9wEAIb0BIACJAgAhvgFAAIoCACG_AUAAigIAIcABQACLAgAhwQEBAPcBACHCAQgAngIAIcMBAQD3AQAhKwMAAKMCACAHAACkAgAgCAAApQIAIKMBAACdAgAwpAEAAAsAEKUBAACdAgAwpgEBAPcBACG0AQEA9wEAIb4BQACKAgAhvwFAAIoCACHAAUAAiwIAIcQBAQD3AQAhxQEBAPcBACHGAQEA9wEAIccBAQD3AQAhyAEBAPcBACHJAQEA9wEAIcoBAQCIAgAhywEIAJ4CACHMAQEAiAIAIc0BAQCIAgAhzgEBAIgCACHPAQEAiAIAIdABAQCIAgAh0QEBAIgCACHSAQEAiAIAIdMBAQCIAgAh1AEBAPcBACHVAQEA9wEAIdYBAQCIAgAh1wEBAIgCACHYAQEA9wEAIdkBAQD3AQAh2gEBAIgCACHbAQEAiAIAId0BAACfAt0BIt8BAACgAt8BIuEBAAChAuEBIuMBAACiAuMBIuQBAQD3AQAh5QEgAIkCACGCAgAACwAggwIAAAsAIBEDAACjAgAgowEAALsCADCkAQAABwAQpQEAALsCADCmAQEA9wEAIb4BQACKAgAhvwFAAIoCACHEAQEA9wEAIe8BAQD3AQAh8AEBAPcBACHxAQEAiAIAIfIBAQCIAgAh8wEBAIgCACH0AUAAiwIAIfUBQACLAgAh9gEBAIgCACH3AQEAiAIAIQwDAACjAgAgowEAALwCADCkAQAAAwAQpQEAALwCADCmAQEA9wEAIb4BQACKAgAhvwFAAIoCACHEAQEA9wEAIe4BQACKAgAh-AEBAPcBACH5AQEAiAIAIfoBAQCIAgAhAAAAAAABhwIBAAAAAQWHAgIAAAABjQICAAAAAY4CAgAAAAGPAgIAAAABkAICAAAAAQAAAAABhwIBAAAAAQGHAiAAAAABAYcCQAAAAAEBhwJAAAAAAQcXAADaAwAgGAAA3QMAIIQCAADbAwAghQIAANwDACCIAgAACwAgiQIAAAsAIIoCAACNAQAgAxcAANoDACCEAgAA2wMAIIoCAACNAQAgEQMAAPcCACAHAAD4AgAgCAAA-QIAIMABAADEAgAgygEAAMQCACDMAQAAxAIAIM0BAADEAgAgzgEAAMQCACDPAQAAxAIAINABAADEAgAg0QEAAMQCACDSAQAAxAIAINMBAADEAgAg1gEAAMQCACDXAQAAxAIAINoBAADEAgAg2wEAAMQCACAAAAAAAAWHAggAAAABjQIIAAAAAY4CCAAAAAGPAggAAAABkAIIAAAAAQUXAADVAwAgGAAA2AMAIIQCAADWAwAghQIAANcDACCKAgAAjQEAIAMXAADVAwAghAIAANYDACCKAgAAjQEAIAAAAAAAAYcCAAAA3QECAYcCAAAA3wECAYcCAAAA4QECAYcCAAAA4wECBRcAAM8DACAYAADTAwAghAIAANADACCFAgAA0gMAIIoCAAABACAHFwAA7wIAIBgAAPICACCEAgAA8AIAIIUCAADxAgAgiAIAAA0AIIkCAAANACCKAgAAuwEAIAsXAADjAgAwGAAA6AIAMIQCAADkAgAwhQIAAOUCADCGAgAA5gIAIIcCAADnAgAwiAIAAOcCADCJAgAA5wIAMIoCAADnAgAwiwIAAOkCADCMAgAA6gIAMAemAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHCAQgAAAABAgAAABIAIBcAAO4CACADAAAAEgAgFwAA7gIAIBgAAO0CACABEAAA0QMAMAwGAAC6AgAgowEAALkCADCkAQAAEAAQpQEAALkCADCmAQEAAAABvQEgAIkCACG-AUAAigIAIb8BQACKAgAhwAFAAIsCACHBAQEAAAABwgEIAJ4CACHDAQEA9wEAIQIAAAASACAQAADtAgAgAgAAAOsCACAQAADsAgAgC6MBAADqAgAwpAEAAOsCABClAQAA6gIAMKYBAQD3AQAhvQEgAIkCACG-AUAAigIAIb8BQACKAgAhwAFAAIsCACHBAQEA9wEAIcIBCACeAgAhwwEBAPcBACELowEAAOoCADCkAQAA6wIAEKUBAADqAgAwpgEBAPcBACG9ASAAiQIAIb4BQACKAgAhvwFAAIoCACHAAUAAiwIAIcEBAQD3AQAhwgEIAJ4CACHDAQEA9wEAIQemAQEAwgIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhwQEBAMICACHCAQgA1AIAIQemAQEAwgIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhwQEBAMICACHCAQgA1AIAIQemAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHCAQgAAAABDqYBAQAAAAGzAQEAAAABtQEBAAAAAbYBAQAAAAG3AQEAAAABuAEBAAAAAbkBAQAAAAG6AQEAAAABuwEBAAAAAbwBAQAAAAG9ASAAAAABvgFAAAAAAb8BQAAAAAHAAUAAAAABAgAAALsBACAXAADvAgAgAwAAAA0AIBcAAO8CACAYAADzAgAgEAAAAA0AIBAAAPMCACCmAQEAwgIAIbMBAQDIAgAhtQEBAMgCACG2AQEAyAIAIbcBAQDIAgAhuAEBAMgCACG5AQEAyAIAIboBAQDIAgAhuwEBAMgCACG8AQEAyAIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhDqYBAQDCAgAhswEBAMgCACG1AQEAyAIAIbYBAQDIAgAhtwEBAMgCACG4AQEAyAIAIbkBAQDIAgAhugEBAMgCACG7AQEAyAIAIbwBAQDIAgAhvQEgAMkCACG-AUAAygIAIb8BQADKAgAhwAFAAMsCACEDFwAAzwMAIIQCAADQAwAgigIAAAEAIAMXAADvAgAghAIAAPACACCKAgAAuwEAIAQXAADjAgAwhAIAAOQCADCGAgAA5gIAIIoCAADnAgAwBgQAALsDACAFAAC8AwAgBgAAzgIAIAoAAL0DACDAAQAAxAIAIIECAADEAgAgDAYAAM4CACCzAQAAxAIAILQBAADEAgAgtQEAAMQCACC2AQAAxAIAILcBAADEAgAguAEAAMQCACC5AQAAxAIAILoBAADEAgAguwEAAMQCACC8AQAAxAIAIMABAADEAgAgAAAAAAUXAADKAwAgGAAAzQMAIIQCAADLAwAghQIAAMwDACCKAgAAAQAgAxcAAMoDACCEAgAAywMAIIoCAAABACAAAAAAAAAFFwAAxQMAIBgAAMgDACCEAgAAxgMAIIUCAADHAwAgigIAAAEAIAMXAADFAwAghAIAAMYDACCKAgAAAQAgAAAABRcAAMADACAYAADDAwAghAIAAMEDACCFAgAAwgMAIIoCAAABACADFwAAwAMAIIQCAADBAwAgigIAAAEAIAAAAAGHAgAAAPwBAgGHAgAAAP4BAgsXAACrAwAwGAAAsAMAMIQCAACsAwAwhQIAAK0DADCGAgAArgMAIIcCAACvAwAwiAIAAK8DADCJAgAArwMAMIoCAACvAwAwiwIAALEDADCMAgAAsgMAMAsXAACfAwAwGAAApAMAMIQCAACgAwAwhQIAAKEDADCGAgAAogMAIIcCAACjAwAwiAIAAKMDADCJAgAAowMAMIoCAACjAwAwiwIAAKUDADCMAgAApgMAMAcXAACaAwAgGAAAnQMAIIQCAACbAwAghQIAAJwDACCIAgAACwAgiQIAAAsAIIoCAACNAQAgBxcAAJUDACAYAACYAwAghAIAAJYDACCFAgAAlwMAIIgCAAAVACCJAgAAFQAgigIAAHUAIAmmAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHpAQEAAAAB6gEBAAAAAesBAQAAAAECAAAAdQAgFwAAlQMAIAMAAAAVACAXAACVAwAgGAAAmQMAIAsAAAAVACAQAACZAwAgpgEBAMICACG9ASAAyQIAIb4BQADKAgAhvwFAAMoCACHAAUAAywIAIcEBAQDCAgAh6QEBAMICACHqAQEAyAIAIesBAQDIAgAhCaYBAQDCAgAhvQEgAMkCACG-AUAAygIAIb8BQADKAgAhwAFAAMsCACHBAQEAwgIAIekBAQDCAgAh6gEBAMgCACHrAQEAyAIAISQHAAD1AgAgCAAA9gIAIKYBAQAAAAG0AQEAAAABvgFAAAAAAb8BQAAAAAHAAUAAAAABxQEBAAAAAcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAAAABywEIAAAAAcwBAQAAAAHNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHTAQEAAAAB1AEBAAAAAdUBAQAAAAHWAQEAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHdAQAAAN0BAt8BAAAA3wEC4QEAAADhAQLjAQAAAOMBAuQBAQAAAAHlASAAAAABAgAAAI0BACAXAACaAwAgAwAAAAsAIBcAAJoDACAYAACeAwAgJgAAAAsAIAcAAOECACAIAADiAgAgEAAAngMAIKYBAQDCAgAhtAEBAMICACG-AUAAygIAIb8BQADKAgAhwAFAAMsCACHFAQEAwgIAIcYBAQDCAgAhxwEBAMICACHIAQEAwgIAIckBAQDCAgAhygEBAMgCACHLAQgA1AIAIcwBAQDIAgAhzQEBAMgCACHOAQEAyAIAIc8BAQDIAgAh0AEBAMgCACHRAQEAyAIAIdIBAQDIAgAh0wEBAMgCACHUAQEAwgIAIdUBAQDCAgAh1gEBAMgCACHXAQEAyAIAIdgBAQDCAgAh2QEBAMICACHaAQEAyAIAIdsBAQDIAgAh3QEAANwC3QEi3wEAAN0C3wEi4QEAAN4C4QEi4wEAAN8C4wEi5AEBAMICACHlASAAyQIAISQHAADhAgAgCAAA4gIAIKYBAQDCAgAhtAEBAMICACG-AUAAygIAIb8BQADKAgAhwAFAAMsCACHFAQEAwgIAIcYBAQDCAgAhxwEBAMICACHIAQEAwgIAIckBAQDCAgAhygEBAMgCACHLAQgA1AIAIcwBAQDIAgAhzQEBAMgCACHOAQEAyAIAIc8BAQDIAgAh0AEBAMgCACHRAQEAyAIAIdIBAQDIAgAh0wEBAMgCACHUAQEAwgIAIdUBAQDCAgAh1gEBAMgCACHXAQEAyAIAIdgBAQDCAgAh2QEBAMICACHaAQEAyAIAIdsBAQDIAgAh3QEAANwC3QEi3wEAAN0C3wEi4QEAAN4C4QEi4wEAAN8C4wEi5AEBAMICACHlASAAyQIAIQymAQEAAAABvgFAAAAAAb8BQAAAAAHvAQEAAAAB8AEBAAAAAfEBAQAAAAHyAQEAAAAB8wEBAAAAAfQBQAAAAAH1AUAAAAAB9gEBAAAAAfcBAQAAAAECAAAACQAgFwAAqgMAIAMAAAAJACAXAACqAwAgGAAAqQMAIAEQAAC_AwAwEQMAAKMCACCjAQAAuwIAMKQBAAAHABClAQAAuwIAMKYBAQAAAAG-AUAAigIAIb8BQACKAgAhxAEBAPcBACHvAQEA9wEAIfABAQD3AQAh8QEBAIgCACHyAQEAiAIAIfMBAQCIAgAh9AFAAIsCACH1AUAAiwIAIfYBAQCIAgAh9wEBAIgCACECAAAACQAgEAAAqQMAIAIAAACnAwAgEAAAqAMAIBCjAQAApgMAMKQBAACnAwAQpQEAAKYDADCmAQEA9wEAIb4BQACKAgAhvwFAAIoCACHEAQEA9wEAIe8BAQD3AQAh8AEBAPcBACHxAQEAiAIAIfIBAQCIAgAh8wEBAIgCACH0AUAAiwIAIfUBQACLAgAh9gEBAIgCACH3AQEAiAIAIRCjAQAApgMAMKQBAACnAwAQpQEAAKYDADCmAQEA9wEAIb4BQACKAgAhvwFAAIoCACHEAQEA9wEAIe8BAQD3AQAh8AEBAPcBACHxAQEAiAIAIfIBAQCIAgAh8wEBAIgCACH0AUAAiwIAIfUBQACLAgAh9gEBAIgCACH3AQEAiAIAIQymAQEAwgIAIb4BQADKAgAhvwFAAMoCACHvAQEAwgIAIfABAQDCAgAh8QEBAMgCACHyAQEAyAIAIfMBAQDIAgAh9AFAAMsCACH1AUAAywIAIfYBAQDIAgAh9wEBAMgCACEMpgEBAMICACG-AUAAygIAIb8BQADKAgAh7wEBAMICACHwAQEAwgIAIfEBAQDIAgAh8gEBAMgCACHzAQEAyAIAIfQBQADLAgAh9QFAAMsCACH2AQEAyAIAIfcBAQDIAgAhDKYBAQAAAAG-AUAAAAABvwFAAAAAAe8BAQAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAHzAQEAAAAB9AFAAAAAAfUBQAAAAAH2AQEAAAAB9wEBAAAAAQemAQEAAAABvgFAAAAAAb8BQAAAAAHuAUAAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAABAgAAAAUAIBcAALYDACADAAAABQAgFwAAtgMAIBgAALUDACABEAAAvgMAMAwDAACjAgAgowEAALwCADCkAQAAAwAQpQEAALwCADCmAQEAAAABvgFAAIoCACG_AUAAigIAIcQBAQD3AQAh7gFAAIoCACH4AQEAAAAB-QEBAIgCACH6AQEAiAIAIQIAAAAFACAQAAC1AwAgAgAAALMDACAQAAC0AwAgC6MBAACyAwAwpAEAALMDABClAQAAsgMAMKYBAQD3AQAhvgFAAIoCACG_AUAAigIAIcQBAQD3AQAh7gFAAIoCACH4AQEA9wEAIfkBAQCIAgAh-gEBAIgCACELowEAALIDADCkAQAAswMAEKUBAACyAwAwpgEBAPcBACG-AUAAigIAIb8BQACKAgAhxAEBAPcBACHuAUAAigIAIfgBAQD3AQAh-QEBAIgCACH6AQEAiAIAIQemAQEAwgIAIb4BQADKAgAhvwFAAMoCACHuAUAAygIAIfgBAQDCAgAh-QEBAMgCACH6AQEAyAIAIQemAQEAwgIAIb4BQADKAgAhvwFAAMoCACHuAUAAygIAIfgBAQDCAgAh-QEBAMgCACH6AQEAyAIAIQemAQEAAAABvgFAAAAAAb8BQAAAAAHuAUAAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAABBBcAAKsDADCEAgAArAMAMIYCAACuAwAgigIAAK8DADAEFwAAnwMAMIQCAACgAwAwhgIAAKIDACCKAgAAowMAMAMXAACaAwAghAIAAJsDACCKAgAAjQEAIAMXAACVAwAghAIAAJYDACCKAgAAdQAgAAAEAwAA9wIAIMABAADEAgAg6gEAAMQCACDrAQAAxAIAIAemAQEAAAABvgFAAAAAAb8BQAAAAAHuAUAAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAABDKYBAQAAAAG-AUAAAAABvwFAAAAAAe8BAQAAAAHwAQEAAAAB8QEBAAAAAfIBAQAAAAHzAQEAAAAB9AFAAAAAAfUBQAAAAAH2AQEAAAAB9wEBAAAAAQ8FAAC4AwAgBgAAuQMAIAoAALoDACCmAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHpAQEAAAAB_AEAAAD8AQL-AQAAAP4BAv8BIAAAAAGAAiAAAAABgQIBAAAAAQIAAAABACAXAADAAwAgAwAAABoAIBcAAMADACAYAADEAwAgEQAAABoAIAUAAJIDACAGAACTAwAgCgAAlAMAIBAAAMQDACCmAQEAwgIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhwQEBAMICACHpAQEAwgIAIfwBAACPA_wBIv4BAACQA_4BIv8BIADJAgAhgAIgAMkCACGBAgEAyAIAIQ8FAACSAwAgBgAAkwMAIAoAAJQDACCmAQEAwgIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhwQEBAMICACHpAQEAwgIAIfwBAACPA_wBIv4BAACQA_4BIv8BIADJAgAhgAIgAMkCACGBAgEAyAIAIQ8EAAC3AwAgBgAAuQMAIAoAALoDACCmAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHpAQEAAAAB_AEAAAD8AQL-AQAAAP4BAv8BIAAAAAGAAiAAAAABgQIBAAAAAQIAAAABACAXAADFAwAgAwAAABoAIBcAAMUDACAYAADJAwAgEQAAABoAIAQAAJEDACAGAACTAwAgCgAAlAMAIBAAAMkDACCmAQEAwgIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhwQEBAMICACHpAQEAwgIAIfwBAACPA_wBIv4BAACQA_4BIv8BIADJAgAhgAIgAMkCACGBAgEAyAIAIQ8EAACRAwAgBgAAkwMAIAoAAJQDACCmAQEAwgIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhwQEBAMICACHpAQEAwgIAIfwBAACPA_wBIv4BAACQA_4BIv8BIADJAgAhgAIgAMkCACGBAgEAyAIAIQ8EAAC3AwAgBQAAuAMAIAYAALkDACCmAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHpAQEAAAAB_AEAAAD8AQL-AQAAAP4BAv8BIAAAAAGAAiAAAAABgQIBAAAAAQIAAAABACAXAADKAwAgAwAAABoAIBcAAMoDACAYAADOAwAgEQAAABoAIAQAAJEDACAFAACSAwAgBgAAkwMAIBAAAM4DACCmAQEAwgIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhwQEBAMICACHpAQEAwgIAIfwBAACPA_wBIv4BAACQA_4BIv8BIADJAgAhgAIgAMkCACGBAgEAyAIAIQ8EAACRAwAgBQAAkgMAIAYAAJMDACCmAQEAwgIAIb0BIADJAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhwQEBAMICACHpAQEAwgIAIfwBAACPA_wBIv4BAACQA_4BIv8BIADJAgAhgAIgAMkCACGBAgEAyAIAIQ8EAAC3AwAgBQAAuAMAIAoAALoDACCmAQEAAAABvQEgAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcEBAQAAAAHpAQEAAAAB_AEAAAD8AQL-AQAAAP4BAv8BIAAAAAGAAiAAAAABgQIBAAAAAQIAAAABACAXAADPAwAgB6YBAQAAAAG9ASAAAAABvgFAAAAAAb8BQAAAAAHAAUAAAAABwQEBAAAAAcIBCAAAAAEDAAAAGgAgFwAAzwMAIBgAANQDACARAAAAGgAgBAAAkQMAIAUAAJIDACAKAACUAwAgEAAA1AMAIKYBAQDCAgAhvQEgAMkCACG-AUAAygIAIb8BQADKAgAhwAFAAMsCACHBAQEAwgIAIekBAQDCAgAh_AEAAI8D_AEi_gEAAJAD_gEi_wEgAMkCACGAAiAAyQIAIYECAQDIAgAhDwQAAJEDACAFAACSAwAgCgAAlAMAIKYBAQDCAgAhvQEgAMkCACG-AUAAygIAIb8BQADKAgAhwAFAAMsCACHBAQEAwgIAIekBAQDCAgAh_AEAAI8D_AEi_gEAAJAD_gEi_wEgAMkCACGAAiAAyQIAIYECAQDIAgAhJQMAAPQCACAHAAD1AgAgpgEBAAAAAbQBAQAAAAG-AUAAAAABvwFAAAAAAcABQAAAAAHEAQEAAAABxQEBAAAAAcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAAAABywEIAAAAAcwBAQAAAAHNAQEAAAABzgEBAAAAAc8BAQAAAAHQAQEAAAAB0QEBAAAAAdIBAQAAAAHTAQEAAAAB1AEBAAAAAdUBAQAAAAHWAQEAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBAQAAAAHdAQAAAN0BAt8BAAAA3wEC4QEAAADhAQLjAQAAAOMBAuQBAQAAAAHlASAAAAABAgAAAI0BACAXAADVAwAgAwAAAAsAIBcAANUDACAYAADZAwAgJwAAAAsAIAMAAOACACAHAADhAgAgEAAA2QMAIKYBAQDCAgAhtAEBAMICACG-AUAAygIAIb8BQADKAgAhwAFAAMsCACHEAQEAwgIAIcUBAQDCAgAhxgEBAMICACHHAQEAwgIAIcgBAQDCAgAhyQEBAMICACHKAQEAyAIAIcsBCADUAgAhzAEBAMgCACHNAQEAyAIAIc4BAQDIAgAhzwEBAMgCACHQAQEAyAIAIdEBAQDIAgAh0gEBAMgCACHTAQEAyAIAIdQBAQDCAgAh1QEBAMICACHWAQEAyAIAIdcBAQDIAgAh2AEBAMICACHZAQEAwgIAIdoBAQDIAgAh2wEBAMgCACHdAQAA3ALdASLfAQAA3QLfASLhAQAA3gLhASLjAQAA3wLjASLkAQEAwgIAIeUBIADJAgAhJQMAAOACACAHAADhAgAgpgEBAMICACG0AQEAwgIAIb4BQADKAgAhvwFAAMoCACHAAUAAywIAIcQBAQDCAgAhxQEBAMICACHGAQEAwgIAIccBAQDCAgAhyAEBAMICACHJAQEAwgIAIcoBAQDIAgAhywEIANQCACHMAQEAyAIAIc0BAQDIAgAhzgEBAMgCACHPAQEAyAIAIdABAQDIAgAh0QEBAMgCACHSAQEAyAIAIdMBAQDIAgAh1AEBAMICACHVAQEAwgIAIdYBAQDIAgAh1wEBAMgCACHYAQEAwgIAIdkBAQDCAgAh2gEBAMgCACHbAQEAyAIAId0BAADcAt0BIt8BAADdAt8BIuEBAADeAuEBIuMBAADfAuMBIuQBAQDCAgAh5QEgAMkCACElAwAA9AIAIAgAAPYCACCmAQEAAAABtAEBAAAAAb4BQAAAAAG_AUAAAAABwAFAAAAAAcQBAQAAAAHFAQEAAAABxgEBAAAAAccBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQAAAAHLAQgAAAABzAEBAAAAAc0BAQAAAAHOAQEAAAABzwEBAAAAAdABAQAAAAHRAQEAAAAB0gEBAAAAAdMBAQAAAAHUAQEAAAAB1QEBAAAAAdYBAQAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEBAAAAAd0BAAAA3QEC3wEAAADfAQLhAQAAAOEBAuMBAAAA4wEC5AEBAAAAAeUBIAAAAAECAAAAjQEAIBcAANoDACADAAAACwAgFwAA2gMAIBgAAN4DACAnAAAACwAgAwAA4AIAIAgAAOICACAQAADeAwAgpgEBAMICACG0AQEAwgIAIb4BQADKAgAhvwFAAMoCACHAAUAAywIAIcQBAQDCAgAhxQEBAMICACHGAQEAwgIAIccBAQDCAgAhyAEBAMICACHJAQEAwgIAIcoBAQDIAgAhywEIANQCACHMAQEAyAIAIc0BAQDIAgAhzgEBAMgCACHPAQEAyAIAIdABAQDIAgAh0QEBAMgCACHSAQEAyAIAIdMBAQDIAgAh1AEBAMICACHVAQEAwgIAIdYBAQDIAgAh1wEBAMgCACHYAQEAwgIAIdkBAQDCAgAh2gEBAMgCACHbAQEAyAIAId0BAADcAt0BIt8BAADdAt8BIuEBAADeAuEBIuMBAADfAuMBIuQBAQDCAgAh5QEgAMkCACElAwAA4AIAIAgAAOICACCmAQEAwgIAIbQBAQDCAgAhvgFAAMoCACG_AUAAygIAIcABQADLAgAhxAEBAMICACHFAQEAwgIAIcYBAQDCAgAhxwEBAMICACHIAQEAwgIAIckBAQDCAgAhygEBAMgCACHLAQgA1AIAIcwBAQDIAgAhzQEBAMgCACHOAQEAyAIAIc8BAQDIAgAh0AEBAMgCACHRAQEAyAIAIdIBAQDIAgAh0wEBAMgCACHUAQEAwgIAIdUBAQDCAgAh1gEBAMgCACHXAQEAyAIAIdgBAQDCAgAh2QEBAMICACHaAQEAyAIAIdsBAQDIAgAh3QEAANwC3QEi3wEAAN0C3wEi4QEAAN4C4QEi4wEAAN8C4wEi5AEBAMICACHlASAAyQIAIQUEBgIFCgMGDAQJAAkKFggBAwABAQMAAQQDAAEHDgUIEwYJAAcBBg8EAQYABAEIFAABAwABAgQXAAUYAAAAAAMJAA4dAA8eABAAAAADCQAOHQAPHgAQAQMAAQEDAAEDCQAVHQAWHgAXAAAAAwkAFR0AFh4AFwEDAAEBAwABAwkAHB0AHR4AHgAAAAMJABwdAB0eAB4AAAADCQAkHQAlHgAmAAAAAwkAJB0AJR4AJgEDAAEBAwABAwkAKx0ALB4ALQAAAAMJACsdACweAC0BAwABAQMAAQUJADIdADUeADZvADNwADQAAAAAAAUJADIdADUeADZvADNwADQBBgAEAQYABAUJADsdAD4eAD9vADxwAD0AAAAAAAUJADsdAD4eAD9vADxwAD0BBscBBAEGzQEEAwkARB0ARR4ARgAAAAMJAEQdAEUeAEYAAAAFCQBMHQBPHgBQbwBNcABOAAAAAAAFCQBMHQBPHgBQbwBNcABOCwIBDBkBDRwBDh0BDx4BESABEiIKEyMLFCUBFScKFigMGSkBGioBGysKHy4NIC8RITACIjECIzICJDMCJTQCJjYCJzgKKDkSKTsCKj0KKz4TLD8CLUACLkEKL0QUMEUYMUYDMkcDM0gDNEkDNUoDNkwDN04KOE8ZOVEDOlMKO1QaPFUDPVYDPlcKP1obQFsfQV0gQl4gQ2EgRGIgRWMgRmUgR2cKSGghSWogSmwKS20iTG4gTW8gTnAKT3MjUHQnUXYIUncIU3kIVHoIVXsIVn0IV38KWIABKFmCAQhahAEKW4UBKVyGAQhdhwEIXogBCl-LASpgjAEuYY4BBGKPAQRjkQEEZJIBBGWTAQRmlQEEZ5cBCmiYAS9pmgEEapwBCmudATBsngEEbZ8BBG6gAQpxowExcqQBN3OlAQZ0pgEGdacBBnaoAQZ3qQEGeKsBBnmtAQp6rgE4e7ABBnyyAQp9swE5frQBBn-1AQaAAbYBCoEBuQE6ggG6AUCDAbwBBYQBvQEFhQG_AQWGAcABBYcBwQEFiAHDAQWJAcUBCooBxgFBiwHJAQWMAcsBCo0BzAFCjgHOAQWPAc8BBZAB0AEKkQHTAUOSAdQBR5MB1gFIlAHXAUiVAdoBSJYB2wFIlwHcAUiYAd4BSJkB4AEKmgHhAUmbAeMBSJwB5QEKnQHmAUqeAecBSJ8B6AFIoAHpAQqhAewBS6IB7QFR"
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
import { Router as Router4 } from "express";

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
      fullName: true
    }
  });
  const formattedTeachers = teachers.map((teacher) => ({
    label: teacher.fullName,
    value: teacher.id
  }));
  return formattedTeachers;
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
  return newClass;
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
        monthlyTutionFee: payload.tuitionFee
      },
      ...payload.classTeacher !== void 0 && {
        classTeacher: payload.classTeacher
      }
    },
    include: {
      employee: true
    }
  });
  return updateClass2;
};
var ClassesService = {
  getAllTeachers,
  createClass,
  updateClass
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
var ClassesController = {
  getAllTeachers: getAllTeachers2,
  createClass: createClass2,
  udpateClass
};

// src/app/modules/classes/classes.routes.ts
var router2 = Router2();
router2.get(
  "/teachers",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassesController.getAllTeachers
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
  employeeRole: z3.enum(EmployeeRole, {
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
  employeeRole: z3.enum(EmployeeRole).optional(),
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

// src/app/routes/index.ts
var routes = Router4();
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