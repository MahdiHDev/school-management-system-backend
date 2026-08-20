import z from "zod";
import { Religion } from "../../../generated/enums";
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
    classId: z
        .string({ error: "Class Id is required" })
        .min(1, { error: "Class Id can't be empty" }),
    fatherName: z
        .string({ error: "Father name is required" })
        .min(1, { error: "Father Name can't be emptry" }),
    fatherNameBangla: z
        .string({ error: "Father name Bangla is required" })
        .min(1, { error: "Father Name Bangla can't be empty" }),
    fatherMobileNumber: z
        .string({ error: "Father Mobile Number is required" })
        .optional(),
    whatsappNumber: z
        .string({ error: "Whatsapp number is required" })
        .min(1, { error: "Whatsup Number can't be empty" }),
    fatherOccupation: z
        .string({ error: "Father Occupation is required" })
        .min(1, { error: "Father Occupation can't be empty" }),
    mothersName: z
        .string({ error: "Mother Name is required" })
        .min(1, { error: "Mother Name Bangla can't be empty" }),
    mothersNameBangla: z
        .string({ error: "Mother Name Bangla is required" })
        .min(1, { error: "Mother Name Bangla can't be empty" }),
    motherMobileNumber: z
        .string({ error: "Mother Mobile Number is required" })
        .optional(),
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
        .min(1, "Admission date can't be emptry"),
    prviousInstitute: z
        .string()
        .min(1, "Previous Institution Can't be Empty")
        .optional(),
    endingClass: z
        .string()
        .min(1, { error: "Ending Class can't be empty" })
        .optional(),
    result: z.string().min(1, { error: "Result can't be empty" }).optional(),
    testimonialNumber: z
        .string()
        .min(1, { error: "Testimonial Number can't be empty" })
        .optional(),
    address: z.object({
        present: presentAddressSchema,
        permanent: permanentAddressSchema,
    }),
});

export type EmployeePayload = z.infer<typeof createStudentSchema>;
