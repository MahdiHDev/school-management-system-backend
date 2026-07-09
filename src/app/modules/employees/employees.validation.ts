import { z } from "zod";
import {
    BloodGroup,
    EmployeeRole,
    Gender,
    Religion,
} from "../../../generated/enums";

export const createEmployeeSchema = z.object({
    fullName: z.string().min(1),
    fatherName: z.string().min(1),
    motherName: z.string().min(1),
    phone: z.string().min(11),

    gender: z.enum(Gender),

    bloodGroup: z.enum(BloodGroup),
    religion: z.enum(Religion),
    employeeRole: z.enum(EmployeeRole),

    emergencyContact: z.string().min(11).optional(),
    dateOfBirth: z.coerce.date(),

    monthlySalary: z.coerce.number(),

    experience: z.string().min(1),

    email: z.email(),
    nid: z.string().min(1),
    birthRegistrationNumber: z.string().optional(),
});

export type EmployeePayload = z.infer<typeof createEmployeeSchema>;
