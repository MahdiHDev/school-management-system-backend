import status from "http-status";
import { AttendanceStatus } from "../../../generated/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateAttendancePayload } from "./attendance.validation";

const getAttendanceStudents = async (classId: string, date: string) => {
    const attendanceDate = new Date(`${date}T00:00:00.000Z`);

    const existingClass = await prisma.class.findFirst({
        where: {
            id: classId,
            isDeleted: false,
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!existingClass) {
        throw new AppError(status.NOT_FOUND, "Class not found");
    }

    const attendanceSession = await prisma.attendanceSession.findUnique({
        where: {
            classId_date: {
                classId,
                date: attendanceDate,
            },
        },
        select: {
            id: true,
        },
    });

    console.log("attendenceSesssion", attendanceSession);

    // temporary
    const sessions = await prisma.attendanceSession.findMany({
        where: {
            classId,
        },
        select: {
            id: true,
            classId: true,
            date: true,
        },
    });

    console.log("ALL SESSIONS:", sessions);
    console.log("GET DATE:", attendanceDate.toISOString());
    // temporary

    const students = await prisma.student.findMany({
        where: {
            classId,
            isdeleted: false,
        },
        select: {
            id: true,
            birthRegistrationNumber: true,
            fullName: true,
        },
        orderBy: {
            studentId: "asc",
        },
    });

    let attendanceRecords: {
        studentId: string;
        status: AttendanceStatus;
    }[] = [];

    if (attendanceSession) {
        attendanceRecords = await prisma.attendanceRecord.findMany({
            where: {
                sessionId: attendanceSession.id,
            },
            select: {
                studentId: true,
                status: true,
            },
        });
    }

    const attendanceMap = new Map(
        attendanceRecords.map((record) => [record.studentId, record.status]),
    );

    const formattedStudents = students.map((student) => {
        const { birthRegistrationNumber, ...studentData } = student;

        return {
            ...studentData,
            studentId: birthRegistrationNumber,
            attendanceStatus: attendanceMap.get(student.id) ?? null,
        };
    });

    return {
        date: date,
        class: existingClass,
        students: formattedStudents,
    };
};

const saveAttesavndance = async (payload: CreateAttendancePayload) => {
    const { classId, date, records } = payload;

    if (!records.length) {
        throw new AppError(
            status.BAD_REQUEST,
            "Attendance records are required",
        );
    }

    console.log("orgianl date: ", date);
    const attendanceDate = new Date(`${date}T00:00:00.000Z`);
    console.log("date:", attendanceDate);

    // Check class
    const existingClass = await prisma.class.findFirst({
        where: {
            id: classId,
            isDeleted: false,
        },
        select: {
            id: true,
        },
    });

    if (!existingClass) {
        throw new AppError(status.NOT_FOUND, "Class not found");
    }

    // Get all students from this class
    const students = await prisma.student.findMany({
        where: {
            classId,
            isdeleted: false,
        },
        select: {
            id: true,
        },
    });

    const studentIds = new Set(students.map((student) => student.id));

    // Make sure submitted students belong to this class
    const invalidStudents = records.filter(
        (record) => !studentIds.has(record.studentId),
    );

    if (invalidStudents.length > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "One or more students do not belong to this class",
        );
    }

    // Prevent duplicate student IDs
    const uniqueStudentIds = new Set(records.map((record) => record.studentId));

    if (uniqueStudentIds.size !== records.length) {
        throw new AppError(
            status.BAD_REQUEST,
            "Duplicate student attendance records are not allowed",
        );
    }

    const result = await prisma.$transaction(async (tx) => {
        // Find attendance session
        const existingSession = await tx.attendanceSession.findUnique({
            where: {
                classId_date: {
                    classId,
                    date: attendanceDate,
                },
            },
            select: {
                id: true,
            },
        });

        // CREATE
        if (!existingSession) {
            return tx.attendanceSession.create({
                data: {
                    classId,
                    date: attendanceDate,

                    records: {
                        create: records.map((record) => ({
                            studentId: record.studentId,
                            status: record.status,
                        })),
                    },
                },

                include: {
                    records: {
                        select: {
                            id: true,
                            studentId: true,
                            status: true,
                        },
                    },
                },
            });
        }

        // UPDATE
        await tx.attendanceRecord.deleteMany({
            where: {
                sessionId: existingSession.id,
            },
        });

        return tx.attendanceSession.update({
            where: {
                id: existingSession.id,
            },

            data: {
                records: {
                    create: records.map((record) => ({
                        studentId: record.studentId,
                        status: record.status,
                    })),
                },
            },

            include: {
                records: {
                    select: {
                        id: true,
                        studentId: true,
                        status: true,
                    },
                },
            },
        });
    });

    return result;
};

export const AttendanceService = {
    getAttendanceStudents,
    saveAttesavndance,
};
