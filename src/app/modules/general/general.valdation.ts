import { z } from "zod";

export const generalSettingSchema = z.object({
    id: z.string().optional(),

    schoolName: z.string().optional(),
    schoolPhone: z.string().optional(),
    schoolEmail: z.string().optional(),

    schoolWebsite: z
        .string()
        .trim()
        .url("Invalid school website URL")
        .optional()
        .or(z.literal("")),

    schoolAddress: z.string().optional(),
    country: z.string().trim().optional(),

    instituteLogo: z.string().optional(),
    schoolLogoPublicId: z.string().optional(),
    schoolLogoName: z.string().optional(),
    schoolLogoType: z.string().optional(),
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
    name: z.string().min(1, "Name of Bank is required"),
    address: z.string().min(1, "Bank/Branch Address is required"),
    accountNumber: z.string().min(1, "Account Number is required"),
    instruction: z.string().optional(),
});

export type bankInfoPayload = z.infer<typeof bankInfoSchema>;

export const updateBankInfoSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    accountNumber: z.string().optional(),
    instruction: z.string().optional(),
});

export type updateBankInfoPayload = z.infer<typeof updateBankInfoSchema>;
