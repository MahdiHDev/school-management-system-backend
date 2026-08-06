import { Request, Response } from "express";
import AppError from "../../errorHelpers/AppError";

import status from "http-status";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { sendResponse } from "../../shared/sendResponse";
import {
    createEmployeeSchema,
    updateEmployeeSchema,
} from "./employees.validation";
import { EmployeeService } from "./employess.service";

const getAllEmployees = async (req: Request, res: Response) => {
    const query = req.query;

    const result = await EmployeeService.getAllEmployees(query as IQueryParams);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employees fetched successfully",
        data: result.data,
        meta: result.meta,
    });
};

const getEmployeeById = async (req: Request, res: Response) => {
    const { id } = req.params;

    const employee = await EmployeeService.getEmployeeById(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee fetched successfully",
        data: employee,
    });
};

const getEmployeeByIdForUpdate = async (req: Request, res: Response) => {
    const { id } = req.params;

    const employee = await EmployeeService.getEmployeeByIdForUpdate(
        id as string,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee For Update fetched successfully",
        data: employee,
    });
};

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

const updateEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body.data
        ? updateEmployeeSchema.parse(JSON.parse(req.body.data))
        : {};
    const files = req.files as Record<string, UploadFile[]>;

    const employee = await EmployeeService.updateEmployee(
        id as string,
        payload,
        files,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee Updated Successfully",
        data: employee,
    });
};

const deleteEmployee = async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await EmployeeService.deleteEmployee(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee Deleted Successfully",
        data: result,
    });
};

export const EmployeeController = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeByIdForUpdate,
};
