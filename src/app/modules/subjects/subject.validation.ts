import { z } from "zod";

const subjectItemSchema = z.object({
    subjectName: z
        .string({ error: "Subject Name is required" })
        .trim()
        .min(1, { error: "Subject Name cannot be empty" }),

    marks: z
        .number({ error: "Total mark is required" })
        .int({ error: "Total mark must be a whole number" })
        .positive({ error: "Total mark must be greater than 0" }),
});

export const createSubjectSchema = z.object({
    classId: z
        .string({ error: "Class is required" })
        .trim()
        .min(1, { error: "Class cannot be empty" }),

    subjects: z
        .array(subjectItemSchema)
        .min(1, { error: "At least one subject is required" }),
});

export type CreateSubjectPayload = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = z.object({
    classId: z
        .string({ error: "Class is required" })
        .trim()
        .min(1, { error: "Class cannot be empty" }),
    subjects: z
        .array(
            subjectItemSchema.extend({
                id: z
                    .string({ error: "Subject ID is required" })
                    .uuid({ error: "Invalid subject ID" }),
            }),
        )
        .min(1, { error: "At least one subject is required" }),
});

export type UpdateSubjectPayload = z.infer<typeof updateSubjectSchema>;
