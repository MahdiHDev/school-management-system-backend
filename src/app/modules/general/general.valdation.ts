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
