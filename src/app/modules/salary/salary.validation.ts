import { z } from "zod";

export const createSalarySchema = z.object({
    employeeId: z.string().trim().min(1, "Employee ID is required"),

    salaryMonth: z
        .string()
        .trim()
        .regex(
            /^(0[1-9]|1[0-2])\/\d{4}$/,
            "Salary month must be in MM/YYYY format",
        ),

    paymentDate: z
        .string()
        .trim()
        .regex(
            /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
            "Payment date must be in DD/MM/YYYY format",
        )
        .refine((value) => {
            const [day, month, year] = value.split("/").map(Number);

            const date = new Date(Date.UTC(year!, month! - 1, day!));

            return (
                date.getUTCFullYear() === year &&
                date.getUTCMonth() === month! - 1 &&
                date.getUTCDate() === day
            );
        }, "Invalid payment date"),

    bonus: z.number().min(0, "Bonus cannot be negative").default(0),

    deduction: z.number().min(0, "Deduction cannot be negative").default(0),
});

export const SalaryValidation = {
    createSalarySchema,
};

export type CreateSalaryPayload = z.infer<typeof createSalarySchema>;
