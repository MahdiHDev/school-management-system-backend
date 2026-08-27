import { Request, Response } from "express";
import status from "http-status";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { sendResponse } from "../../shared/sendResponse";
import { StudentService } from "./student.service";
import { createStudentSchema, updateStudentSchema } from "./student.validation";

const getAllStudent = async (req: Request, res: Response) => {
    const query = req.query;

    const result = await StudentService.getAllStudent(query as IQueryParams);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Students Fetched Successfully",
        data: result.data,
        meta: result.meta,
    });
};

const getStudentForUpdate = async (req: Request, res: Response) => {
    const { id } = req.params;

    const student = await StudentService.getStudentForUpdate(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Student For Update fetched successfully",
        data: student,
    });
};

const createStudent = async (req: Request, res: Response) => {
    const payload = createStudentSchema.parse(JSON.parse(req.body.data));
    const files = req.files as Record<string, UploadFile[]>;

    if (!files.picture?.length) {
        throw new AppError(400, "Picture is required");
    }

    if (!files.authoritySign?.length) {
        throw new AppError(400, "Authority Sign is required");
    }
    if (!files.studentSign?.length) {
        throw new AppError(400, "Student Sign is required");
    }
    if (!files.guardianSign?.length) {
        throw new AppError(400, "Guardian Sign is required");
    }

    const student = await StudentService.createStudent(payload, files);

    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Student profile created successfully",
        data: student,
    });
};

const updateStudent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = updateStudentSchema.parse(JSON.parse(req.body.data));
    const files = req.files as Record<string, UploadFile[]>;

    const student = await StudentService.updateStudent(
        id as string,
        payload,
        files,
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Student Updated Successfully",
        data: student,
    });
};

const deleteStudent = async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await StudentService.deleteStudent(id as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: result.message || "Student Profile Deleted Successfully",
    });
};

export const studentController = {
    getAllStudent,
    getStudentForUpdate,
    createStudent,
    updateStudent,
    deleteStudent,
};
