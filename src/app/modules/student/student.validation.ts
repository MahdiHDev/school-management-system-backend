import z from "zod";
import { BloodGroup, Gender, Religion } from "../../../generated/enums";
import {
    permanentAddressSchema,
    presentAddressSchema,
} from "../employees/employees.validation";

export const createStudentSchema = z.object({
    fullName: z
        .string({ error: "Student Name is required" })
        .min(1, { error: "Student Name can't be empty" }),
    fullNameBangla: z
        .string({ error: "Student Name Bangla is required" })
        .min(1, { error: "Student Name Bangla can't be empty" }),
    dateOfBirth: z
        .string({ error: "Date of birth is required" })
        .min(1, { error: "Date of birth can't be empty" }),
    birthRegistrationNumber: z
        .string({ error: "Birth Registration Number is required" })
        .min(1, { error: "Birth Registration Number can't be empty" }),
    religion: z.enum(Religion, {
        error: "Religion must be one of: " + Object.values(Religion).join(", "),
    }),
    gender: z.enum(Gender, {
        error: "Gender must be one of: " + Object.values(Gender).join(", "),
    }),
    bloodGroup: z
        .enum(BloodGroup, {
            error:
                "BloodGroup must be one of: " +
                Object.values(BloodGroup).join(", "),
        })
        .optional(),
    classId: z
        .string({ error: "Class Id is required" })
        .min(1, { error: "Class Id can't be empty" }),
    fatherName: z
        .string({ error: "Father name is required" })
        .min(1, { error: "Father Name can't be emptry" }),
    fatherNameBangla: z
        .string({ error: "Father name Bangla is required" })
        .min(1, { error: "Father Name Bangla can't be empty" }),
    fatherMobileNumber: z.string({ error: "Father Mobile Number is required" }),
    whatsappNumber: z
        .string({ error: "Whatsapp number is required" })
        .min(1, { error: "Whatsapp Number can't be empty" }),
    fatherOccupation: z
        .string({ error: "Father Occupation is required" })
        .min(1, { error: "Father Occupation can't be empty" }),
    motherName: z
        .string({ error: "Mother Name is required" })
        .min(1, { error: "Mother Name Bangla can't be empty" }),
    motherNameBangla: z
        .string({ error: "Mother Name Bangla is required" })
        .min(1, { error: "Mother Name Bangla can't be empty" }),
    motherMobileNumber: z.string({ error: "Mother Mobile Number is required" }),
    motherOccupation: z
        .string({ error: "Mother Occupation is required" })
        .min(1, { error: "Mother Occupation can't be empty" }),
    email: z.email({ error: "Please provide a valid email address" }),
    guardianName: z
        .string({ error: "Guardian Name is required" })
        .min(1, { error: "Guardian Name can't be empty" }),

    guardianRelationship: z
        .string({ error: "Guardian Relationship is required" })
        .min(1, { error: "Guardian Relationship can't be empty" }),

    guardianMobile: z
        .string({ error: "Guardian Mobile number is required" })
        .min(11, { error: "Guardian Mobile must be minimum 11 digit" }),

    admissionTotalFees: z.coerce.number({
        error: "Total Fees of Admission and Other Expenses is required ",
    }),
    admissionDate: z
        .string({ error: "Admission date is required" })
        .min(1, "Admission date can't be empty"),
    previousInstitute: z.string().optional(),
    endingClass: z.string().optional(),
    result: z.string().optional(),
    testimonialNumber: z.string().optional(),
    address: z.object({
        present: presentAddressSchema,
        permanent: permanentAddressSchema,
    }),
});

export type StudentPayload = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
    fullName: z.string().optional(),

    fullNameBangla: z.string().optional(),
    dateOfBirth: z.string().optional(),
    birthRegistrationNumber: z.string().optional(),
    religion: z
        .enum(Religion, {
            error:
                "Religion must be one of: " +
                Object.values(Religion).join(", "),
        })
        .optional(),
    gender: z
        .enum(Gender, {
            error: "Gender must be one of: " + Object.values(Gender).join(", "),
        })
        .optional(),
    bloodGroup: z
        .enum(BloodGroup, {
            error:
                "BloodGroup must be one of: " +
                Object.values(BloodGroup).join(", "),
        })
        .optional(),
    classId: z.string().optional,
    fatherName: z.string().optional(),
    fatherNameBangla: z.string().optional(),
    fatherMobileNumber: z.string().optional(),
    whatsappNumber: z.string().optional(),
    fatherOccupation: z.string().optional(),
    motherName: z.string().optional(),
    motherNameBangla: z.string().optional(),
    motherMobileNumber: z.string().optional(),
    motherOccupation: z.string().optional(),
    email: z
        .email({ error: "Please provide a valid email address" })
        .optional(),
    guardianName: z.string().optional(),

    guardianRelationship: z.string().optional(),

    guardianMobile: z.string().optional(),

    admissionTotalFees: z.coerce.number().optional(),
    admissionDate: z.string().optional(),
    previousInstitute: z.string().optional(),
    endingClass: z.string().optional(),
    result: z.string().optional(),
    testimonialNumber: z.string().optional(),
    address: z
        .object({
            present: presentAddressSchema.partial().optional(),
            permanent: permanentAddressSchema.partial().optional(),
        })
        .optional(),
});

export type IUpdateStudentPayload = z.infer<typeof updateStudentSchema>;
