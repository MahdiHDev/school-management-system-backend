import { Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { ClassesService } from "./classes.services";
import { createClassSchema, updateClassSchema } from "./classes.validation";

const getAllTeachers = async (req: Request, res: Response) => {
    const result = await ClassesService.getAllTeachers();

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Teachers fetched successfully",
        data: result,
    });
};

const createClass = async (req: Request, res: Response) => {
    const payload = createClassSchema.parse(req.body);

    const createdClass = await ClassesService.createClass(payload);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Class Created Successfully",
        data: createdClass,
    });
};

const udpateClass = async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = updateClassSchema.parse(req.body);

    const updatedClass = await ClassesService.updateClass(
        id as string,
        payload,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Class Updated Succssfully",
        data: updatedClass,
    });
};

export const ClassesController = {
    getAllTeachers,
    createClass,
    udpateClass,
};
