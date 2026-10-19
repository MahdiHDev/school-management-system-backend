import z from "zod";

const gradeScaleSchema = z.object({
    id: z.string().optional(),
    grade: z.string().min(1),
    minMarks: z.number().int().min(0).max(100),
    maxMarks: z.number().int().min(0).max(100),
    status: z.enum(["PASS", "FAIL"]),
});

export const gradingConfigurationSchema = z.object({
    name: z.string().optional(),

    grades: z.array(gradeScaleSchema).optional(),

    // failCriteria: z
    //     .object({
    //         overallPercentage: z.number().min(0).max(100),
    //         subjectPercentage: z.number().min(0).max(100),
    //         minFailedSubjects: z.number().int().min(1),
    //     })
    //     .nullable()
    //     .optional(),
});

export type IGradingConfigurationPayload = z.infer<
    typeof gradingConfigurationSchema
>;

export const failCriteriaSchema = z.object({
    overall: z
        .number({ error: "Overall percentage is required" })
        .min(0)
        .max(100),
    subject: z
        .number({ error: "Subject percentage is required" })
        .min(0)
        .max(100),
    number: z.number({ error: "Number of subject is required" }).int().min(1),
});

export type failCriteriaPayload = z.infer<typeof failCriteriaSchema>;
