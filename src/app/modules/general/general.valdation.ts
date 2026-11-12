import { z } from "zod";

export const generalSettingSchema = z.object({
    id: z.string().optional(),

    instituteName: z.string().optional(),
    institutePhoneNumber: z.string().optional(),
    instituteEmail: z.string().optional(),

    instituteWebsite: z.string().trim().optional(),

    instituteAddress: z.string().optional(),
    instituteCountry: z.string().trim().optional(),
});

export const updateGeneralSettingSchema = z.object({
    body: generalSettingSchema,
});

export type GeneralSettingPayload = z.infer<typeof generalSettingSchema>;

export type UpdateGeneralSettingInput = z.infer<
    typeof updateGeneralSettingSchema
>;

export const studentRulesAndRegulationSchema = z.object({
    studentRules: z
        .string()
        .min(1, "Students rules & regulations are required"),
});

export type studentRulesAndRegulationPayload = z.infer<
    typeof studentRulesAndRegulationSchema
>;

export const employeeRulesAndRegulationSchema = z.object({
    employeeRules: z
        .string()
        .min(1, "Employees rules & regulations are required"),
});

export type EmployeeRulesAndRegulationPayload = z.infer<
    typeof employeeRulesAndRegulationSchema
>;

export const bankInfoSchema = z.object({
    bankName: z.string().min(1, "Name of Bank is required"),
    bankAddress: z.string().min(1, "Bank/Branch Address is required"),
    accountNumber: z.string().min(1, "Account Number is required"),
    instructions: z.string().optional(),
});

export type bankInfoPayload = z.infer<typeof bankInfoSchema>;

export const updateBankInfoSchema = z.object({
    bankName: z.string().optional(),
    bankAddress: z.string().optional(),
    accountNumber: z.string().optional(),
    instructions: z.string().optional(),
});

export type updateBankInfoPayload = z.infer<typeof updateBankInfoSchema>;
