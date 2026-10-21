import { Request, Response } from "express";
import status from "http-status";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { GeneralService } from "./general.service";
import {
    bankInfoSchema,
    generalSettingSchema,
    updateBankInfoSchema,
} from "./general.valdation";

const updateGeneralSetting = async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = generalSettingSchema.parse(JSON.parse(req.body.data));
    const files = req.files as Record<string, UploadFile[]>;

    if (!files.instituteLogo?.length) {
        throw new AppError(400, "Institute Logo is required");
    }

    const result = await GeneralService.updateGeneralSetting(
        payload,
        files,
        id as string,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "General Setting Updated Successfully",
        data: result,
    });
};

const updateStudentRulesRegulations = async (req: Request, res: Response) => {
    const { studentRules } = req.body;

    const result = await GeneralService.updateStudentRulesRegulations({
        studentRules,
    });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Student Rules & Regulations Updated Successfully",
        data: result,
    });
};

const updateEmployeeRulesRegulations = async (req: Request, res: Response) => {
    const { employeeRules } = req.body;

    const result = await GeneralService.updateEmployeeRulesRegulations({
        employeeRules,
    });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee Rules & Regulations Updated Successfully",
        data: result,
    });
};

const getAllBankInfo = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const result = await GeneralService.getAllBankInfo(query as IQueryParams);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Bank Informations fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getBankInfoById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await GeneralService.getBankInfoById(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Bank Information fetched successfully",
        data: result,
    });
});

const createBankInfo = catchAsync(async (req: Request, res: Response) => {
    const payload = bankInfoSchema.parse(JSON.parse(req.body.data));
    const files = req.files as Record<string, UploadFile[]>;

    if (!files.bankLogo?.length) {
        throw new AppError(400, "Institute Logo is required");
    }

    const result = await GeneralService.createbankInfo(payload, files);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Bank Information Added Successfully",
        data: result,
    });
});

const updateBankInfo = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = updateBankInfoSchema.parse(JSON.parse(req.body.data));
    const files = req.files as Record<string, UploadFile[]>;

    const result = await GeneralService.updateBankInfo(
        id as string,
        payload,
        files,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Bank Information Updated Successfully",
        data: result,
    });
});

const deleteBankInfo = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await GeneralService.deleteBankInfo(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Bank Information Deleted Successfully",
        data: result,
    });
});

export const GeneralController = {
    updateGeneralSetting,
    updateStudentRulesRegulations,
    updateEmployeeRulesRegulations,
    getAllBankInfo,
    getBankInfoById,
    createBankInfo,
    updateBankInfo,
    deleteBankInfo,
};
