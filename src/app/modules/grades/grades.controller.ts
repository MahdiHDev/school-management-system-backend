import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { gradingConfigurationService } from "./grades.service";
import {
    failCriteriaSchema,
    gradingConfigurationSchema,
} from "./grades.validation";

const getGradeData = catchAsync(async (req: Request, res: Response) => {
    const result = await gradingConfigurationService.getGradeData();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Grading configuration data fetched successfully",
        data: result,
    });
});

const updateGradingConfiguration = catchAsync(
    async (req: Request, res: Response) => {
        const payload = gradingConfigurationSchema.parse(req.body);

        const result =
            await gradingConfigurationService.updateGradingConfiguration(
                payload,
            );

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Grading configuration updated successfully",
            data: result,
        });
    },
);

const updateFailCriteria = catchAsync(async (req: Request, res: Response) => {
    console.log(req.body);
    const payload = failCriteriaSchema.parse(req.body);

    console.log(payload);

    const result =
        await gradingConfigurationService.updateFailCriteria(payload);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Fail Crieteria Updated Successfully",
        data: result,
    });
});

export const gradesController = {
    getGradeData,
    updateGradingConfiguration,
    updateFailCriteria,
};
