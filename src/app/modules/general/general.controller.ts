import { Request, Response } from "express";
import status from "http-status";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import AppError from "../../errorHelpers/AppError";
import { sendResponse } from "../../shared/sendResponse";
import { GeneralService } from "./general.service";
import { generalSettingSchema } from "./general.valdation";

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

export const GeneralController = {
    updateGeneralSetting,
};
