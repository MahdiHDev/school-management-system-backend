import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { SalaryService } from "./salary.service";
import { createSalarySchema } from "./salary.validation";

const getEmployeeforSalary = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await SalaryService.getEmployeeforSalary(
        query as IQueryParams,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employees fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const createSalary = catchAsync(async (req: Request, res: Response) => {
    const payload = createSalarySchema.parse(req.body);

    const salary = await SalaryService.createSalary(payload);

    sendResponse(res, {
        httpStatusCode: 201,
        success: true,
        message: "Salary created successfully",
        data: salary,
    });
});

export const SalaryController = {
    getEmployeeforSalary,
    createSalary,
};
