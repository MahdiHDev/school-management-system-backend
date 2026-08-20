import status from "http-status";
import { Prisma } from "../../../generated/client";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
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
            employeeId: true,
        },
    });

    const formattedTeachers = teachers.map((teacher) => ({
        label: `${teacher.fullName} [${teacher.employeeId}]`,
        value: teacher.id,
    }));

    return formattedTeachers;
};

type ClassListItem = Prisma.ClassGetPayload<{
    select: {
        id: true;
        name: true;
    };
}>;

const getAllClass = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
        ClassListItem,
        Prisma.ClassWhereInput,
        Prisma.ClassInclude
    >(prisma.class, query);

    const result = await queryBuilder
        .where({
            isDeleted: false,
        })
        .select({
            id: true,
            name: true,
        })
        .paginate()
        .sort()
        .execute();

    const data = result.data.map((classItem) => {
        const totalStudents = 25;
        const boys = Math.floor(Math.random() * (totalStudents + 1));
        const girls = totalStudents - boys;

        return {
            ...classItem,
            totalStudents,
            boys,
            girls,
        };
    });

    return {
        data,
        meta: result.meta,
    };
};

const getAllClassForUpdate = async () => {
    const classes = await prisma.class.findMany({
        where: { isDeleted: false },
        select: {
            id: true,
            name: true,
        },
    });

    const data = classes.map((classItem) => {
        return {
            label: classItem.name,
            value: classItem.id,
        };
    });

    return data;
};

const getSingleClass = async (id: string) => {
    const result = await prisma.class.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            monthlyTuitionFee: true,
            classTeacher: true,
        },
    });

    const formattedResult = {
        id: result?.id,
        className: result?.name,
        tuitionFee: result?.monthlyTuitionFee,
        classTeacher: result?.classTeacher,
    };

    return formattedResult;
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

    return {
        ...newClass,
        totalStudents: 0,
        boys: 0,
        girls: 0,
    };
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
                monthlyTuitionFee: payload.tuitionFee,
            }),
            ...(payload.classTeacher !== undefined && {
                classTeacher: payload.classTeacher,
            }),
        },
        include: {
            employee: true,
        },
    });

    return {
        ...updateClass,
        totalStudents: 0,
        boys: 0,
        girls: 0,
    };
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
    getSingleClass,
    getAllClassForUpdate,
    createClass,
    updateClass,
    deleteClass,
};
