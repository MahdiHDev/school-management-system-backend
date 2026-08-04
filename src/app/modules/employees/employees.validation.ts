import { z } from "zod";
import {
    BloodGroup,
    EmployeeRole,
    Gender,
    Religion,
    UserRole,
} from "../../../generated/enums";

const presentAddressSchema = z.object({
    village: z
        .string({ error: "Present address village is required" })
        .min(1, { error: "Present address village cannot be empty" }),

    postOffice: z
        .string({ error: "Present address post office is required" })
        .min(1, { error: "Present address post office cannot be empty" }),

    postCode: z
        .string({ error: "Present address post code is required" })
        .min(1, { error: "Present address post code cannot be empty" }),

    district: z
        .string({ error: "Present address district is required" })
        .min(1, { error: "Present address district cannot be empty" }),
});

const permanentAddressSchema = z.object({
    village: z
        .string({ error: "Permanent address village is required" })
        .min(1, { error: "Permanent address village cannot be empty" }),

    postOffice: z
        .string({ error: "Permanent address post office is required" })
        .min(1, { error: "Permanent address post office cannot be empty" }),

    postCode: z
        .string({ error: "Permanent address post code is required" })
        .min(1, { error: "Permanent address post code cannot be empty" }),

    district: z
        .string({ error: "Permanent address district is required" })
        .min(1, { error: "Permanent address district cannot be empty" }),
});

export const createEmployeeSchema = z.object({
    fullName: z
        .string({ error: "Full name is required" })
        .min(1, { error: "Full name cannot be empty" }),

    fatherName: z
        .string({ error: "Father's name is required" })
        .min(1, { error: "Father's name cannot be empty" }),

    motherName: z
        .string({ error: "Mother's name is required" })
        .min(1, { error: "Mother's name cannot be empty" }),

    phone: z
        .string({ error: "Phone number is required" })
        .min(11, { error: "Phone number must be at least 11 digits" }),

    gender: z.enum(Gender, {
        error: "Gender must be one of: " + Object.values(Gender).join(", "),
    }),

    bloodGroup: z.enum(BloodGroup, {
        error:
            "Blood group must be one of: " +
            Object.values(BloodGroup).join(", "),
    }),

    religion: z.enum(Religion, {
        error: "Religion must be one of: " + Object.values(Religion).join(", "),
    }),

    employeeRole: z.enum(EmployeeRole, {
        error:
            "Employee role must be one of: " +
            Object.values(UserRole).join(", "),
    }),

    emergencyContact: z
        .string()
        .min(11, { error: "Emergency contact must be at least 11 digits" })
        .optional(),

    dateOfJoining: z.string().min(1, { error: "Date of joining is required" }),

    monthlySalary: z.coerce.number({
        error: "Monthly salary must be a valid number",
    }),

    email: z.email({ error: "Please provide a valid email address" }),

    nid: z
        .string({ error: "NID is required" })
        .min(1, { error: "NID cannot be empty" }),

    birthRegistrationNumber: z.string().optional(),

    address: z.object({
        present: presentAddressSchema,
        permanent: permanentAddressSchema,
    }),
});

export type EmployeePayload = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
    fullName: z.string().optional(),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    phone: z.string().optional(),
    gender: z.enum(Gender).optional(),
    bloodGroup: z.enum(BloodGroup).optional(),
    religion: z.enum(Religion).optional(),
    employeeRole: z.enum(EmployeeRole).optional(),
    emergencyContact: z.string().optional(),
    monthlySalary: z.coerce.number().optional(),
    dateOfJoining: z.string().optional(),
    nid: z.string().optional(),
    address: z
        .object({
            present: presentAddressSchema.partial().optional(),
            permanent: permanentAddressSchema.partial().optional(),
        })
        .optional(),
});

export type IUpdatePayload = z.infer<typeof updateEmployeeSchema>;
