import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AttendanceService } from "./attendance.service";
import {
    createAttendanceSchema,
    getAttendanceStudentsSchema,
} from "./attendance.validation";

const getAttendanceStudents = catchAsync(
    async (req: Request, res: Response) => {
        const { classId, date } = getAttendanceStudentsSchema.parse(req.query);

        const result = await AttendanceService.getAttendanceStudents(
            classId,
            date,
        );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Students with Attendance Fetched successfully",
            data: result,
        });
    },
);

const saveAttendence = catchAsync(async (req: Request, res: Response) => {
    const payload = createAttendanceSchema.parse(req.body);

    const result = await AttendanceService.saveAttesavndance(payload);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Attendance Created successfully",
        data: result,
    });
});

export const AttendanceController = { getAttendanceStudents, saveAttendence };
