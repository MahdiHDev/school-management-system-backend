import { z } from "zod";
import {
    BloodGroup,
    EmployeeRole,
    Gender,
    Religion,
} from "../../../generated/enums";

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
            Object.values(EmployeeRole).join(", "),
    }),

    emergencyContact: z
        .string()
        .min(11, { error: "Emergency contact must be at least 11 digits" })
        .optional(),

    dateOfBirth: z.coerce.date({
        error: "Date of birth must be a valid date",
    }),

    monthlySalary: z.coerce.number({
        error: "Monthly salary must be a valid number",
    }),

    experience: z
        .string({ error: "Experience is required" })
        .min(1, { error: "Experience cannot be empty" }),

    email: z.email({ error: "Please provide a valid email address" }),

    nid: z
        .string({ error: "NID is required" })
        .min(1, { error: "NID cannot be empty" }),

    birthRegistrationNumber: z.string().optional(),
});

export type EmployeePayload = z.infer<typeof createEmployeeSchema>;
