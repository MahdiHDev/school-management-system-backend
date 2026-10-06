import { Request, Response } from "express";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { SubjectService } from "./subject.service";
import { createSubjectSchema, updateSubjectSchema } from "./subject.validation";

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
    createSubject,
    updateSubject,
};
