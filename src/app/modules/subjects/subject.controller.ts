import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { sendResponse } from "../../shared/sendResponse";
import { SubjectService } from "./subject.service";
import { createSubjectSchema, updateSubjectSchema } from "./subject.validation";

const getAllSubjectsByClassId = async (req: Request, res: Response) => {
    const query = req.query;

    const result = await SubjectService.getAllSubjectsByClassId(
        query as IQueryParams,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subjects Fetched Successfully",
        data: result.data,
        meta: result.meta,
    });
};

const createSubject = async (req: Request, res: Response) => {
    const payload = createSubjectSchema.parse(req.body);

    const subject = await SubjectService.createSubject(payload);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Subject created successfully",
        data: subject,
    });
};

const updateSubject = async (req: Request, res: Response) => {
    const payload = updateSubjectSchema.parse(req.body);

    const subject = await SubjectService.updateSubjects(payload);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subjects updated successfully",
        data: subject,
    });
};

export const subjectController = {
    getAllSubjectsByClassId,
    createSubject,
    updateSubject,
};
