import { z } from "zod";
import { AttendanceStatus } from "../../../generated/enums";

export const getAttendanceStudentsSchema = z.object({
    classId: z.string().trim().min(1, "Class ID is required"),

    date: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format")
        .refine((value) => {
            const [day, month, year] = value.split("/").map(Number);

            const parsedDate = new Date(Date.UTC(year!, month! - 1, day!));

            return (
                parsedDate.getUTCFullYear() === year &&
                parsedDate.getUTCMonth() === month! - 1 &&
                parsedDate.getUTCDate() === day
            );
        }, "Invalid date")
        .transform((value) => {
            const [day, month, year] = value.split("/");

            return `${year}-${month}-${day}`;
        }),
});

export const createAttendanceSchema = z.object({
    classId: z.string().min(1, "Class ID is required"),

    date: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format")
        .refine((value) => {
            const [day, month, year] = value.split("/").map(Number);

            const parsedDate = new Date(Date.UTC(year!, month! - 1, day!));

            return (
                parsedDate.getUTCFullYear() === year &&
                parsedDate.getUTCMonth() === month! - 1 &&
                parsedDate.getUTCDate() === day
            );
        }, "Invalid date")
        .transform((value) => {
            const [day, month, year] = value.split("/");

            return `${year}-${month}-${day}`;
        }),

    records: z
        .array(
            z.object({
                studentId: z.string().min(1, "Student ID is required"),

                status: z.enum(AttendanceStatus),
            }),
        )
        .min(1, "At least one attendance record is required"),
});

export type CreateAttendancePayload = z.infer<typeof createAttendanceSchema>;
