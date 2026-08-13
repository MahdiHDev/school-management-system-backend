import z from "zod";

export const createClassSchema = z.object({
    className: z
        .string({ error: "Class Name is required" })
        .min(1, "Class Name can't be empty"),
    classTeacher: z
        .string({ error: "Class Teacher is required" })
        .min(1, "Class Teacher can't be empty"),
    tuitionFee: z.coerce
        .number({ error: "Tuition Fee is required" })
        .min(0, "Tuition Fee cannot be negative"),
});

export type ICreateClassPayload = z.infer<typeof createClassSchema>;

export const updateClassSchema = z.object({
    className: z.string().min(1, "Class Name can't be empty").optional(),
    classTeacher: z.string().min(1, "Class Teacher can't be empty").optional(),
    tuitionFee: z.coerce
        .number()
        .min(0, "Tuition Fee cannot be negative")
        .optional(),
});

export type IUpdateClassPayload = z.infer<typeof updateClassSchema>;
