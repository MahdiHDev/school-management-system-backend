import { Request, Response } from "express";
import AppError from "../../errorHelpers/AppError";

import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { createEmployeeSchema } from "./employees.validation";
import { EmployeeService } from "./employess.service";

const createEmployee = async (req: Request, res: Response) => {
    const payload = createEmployeeSchema.parse(JSON.parse(req.body.data));
    const files = req.files as Record<string, UploadFile[]>;

    if (!files.picture?.length) {
        throw new AppError(400, "Picture is required");
    }

    if (!files.authoritySign?.length) {
        throw new AppError(400, "Authority Sign is required");
    }
    if (!files.employeeSign?.length) {
        throw new AppError(400, "Employee Sign is required");
    }

    const employee = await EmployeeService.createEmployee(payload, files);

    res.status(201).json({
        success: true,
        data: employee,
    });
};

export const EmployeeController = {
    createEmployee,
};
