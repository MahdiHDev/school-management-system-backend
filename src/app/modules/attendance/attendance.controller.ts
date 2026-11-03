import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AttendanceService } from "./attendance.service";
import {
    createAttendanceSchema,
    getAttendanceStudentsSchema,
    getEmployeeAttendanceSchema,
    saveEmployeeAttendanceSchema,
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

const getEmployeeAttendance = catchAsync(async (req, res) => {
    const validatedQuery = getEmployeeAttendanceSchema.parse(req.query);

    const result =
        await AttendanceService.getEmployeeAttendance(validatedQuery);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Employee attendance retrieved successfully",
        data: result,
    });
});

const saveAttendance = catchAsync(async (req: Request, res: Response) => {
    const payload = createAttendanceSchema.parse(req.body);

    const result = await AttendanceService.saveAttendance(payload);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Attendance Created successfully",
        data: result,
    });
});

const saveEmployeeAttendance = catchAsync(async (req, res) => {
    const validatedData = saveEmployeeAttendanceSchema.parse(req.body);

    const result =
        await AttendanceService.saveEmployeeAttendance(validatedData);

    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: "Employee attendance saved successfully",
        data: result,
    });
});

export const AttendanceController = {
    getAttendanceStudents,
    getEmployeeAttendance,
    saveAttendance,
    saveEmployeeAttendance,
};
