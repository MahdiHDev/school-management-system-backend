import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { SalaryService } from "./salary.service";
import { createSalarySchema } from "./salary.validation";

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
    createSalary,
};
