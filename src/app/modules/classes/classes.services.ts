import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateClassPayload, IUpdateClassPayload } from "./classes.validation";

const getAllTeachers = async () => {
    const teachers = await prisma.employee.findMany({
        where: {
            isdeleted: false,
            user: {
                role: {
                    in: ["TEACHER", "PRINCIPAL"],
                },
            },
        },
        select: {
            id: true,
            fullName: true,
        },
    });

    const formattedTeachers = teachers.map((teacher) => ({
        label: teacher.fullName,
        value: teacher.id,
    }));

    return formattedTeachers;
};

const getAllClass = async () => {
    const result = await prisma.class.findMany({
        where: {
            isDeleted: false,
        },
        select: {
            id: true,
            name: true,
        },
    });

    return result;
};

const createClass = async (payload: ICreateClassPayload) => {
    const newClass = await prisma.class.create({
        data: {
            name: payload.className,
            monthlyTuitionFee: payload.tuitionFee,

            classTeacher: payload.classTeacher,
        },
        include: {
            employee: true,
        },
    });

    return newClass;
};

const updateClass = async (id: string, payload: IUpdateClassPayload) => {
    // Check class exists
    const existingClass = await prisma.class.findUnique({
        where: {
            id,
        },
    });
    console.log(existingClass);

    if (!existingClass) {
        throw new AppError(status.NOT_FOUND, "Class not found");
    }

    // Validate employee
    if (payload.classTeacher !== undefined) {
        const employee = await prisma.employee.findFirst({
            where: {
                id: payload.classTeacher,
                isdeleted: false,
            },
        });

        if (!employee) {
            throw new AppError(status.NOT_FOUND, "Class teacher not found");
        }
    }

    const updateClass = await prisma.class.update({
        where: { id },
        data: {
            ...(payload.className !== undefined && {
                name: payload.className,
            }),
            ...(payload.tuitionFee !== undefined && {
                monthlyTutionFee: payload.tuitionFee,
            }),
            ...(payload.classTeacher !== undefined && {
                classTeacher: payload.classTeacher,
            }),
        },
        include: {
            employee: true,
        },
    });

    return updateClass;
};

const deleteClass = async (id: string) => {
    const result = await prisma.class.update({
        where: { id },
        data: {
            isDeleted: true,
        },
    });

    return result;
};

export const ClassesService = {
    getAllTeachers,
    getAllClass,
    createClass,
    updateClass,
    deleteClass,
};
