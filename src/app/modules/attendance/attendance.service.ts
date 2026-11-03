import status from "http-status";
import {
    AttendanceStatus,
    EmployeeAttendanceStatus,
} from "../../../generated/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
    CreateAttendancePayload,
    GetEmployeeAttendanceQuery,
    SaveEmployeeAttendancePayload,
} from "./attendance.validation";

const getAttendanceStudents = async (classId: string, date: string) => {
    const attendanceDate = new Date(`${date}T00:00:00.000Z`);
    let isTaken = false;

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

    isTaken = !!attendanceSession;

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
        const { birthRegistrationNumber, fullName, ...studentData } = student;

        return {
            ...studentData,
            studentId: birthRegistrationNumber,
            name: fullName,
            status: attendanceMap.get(student.id) ?? null,
        };
    });

    return {
        date: date.split("-").reverse().join("/"),
        classId: existingClass.id,
        isTaken,
        students: formattedStudents,
    };
};

const getEmployeeAttendance = async (payload: GetEmployeeAttendanceQuery) => {
    const { date } = payload;
    let isTaken = false;

    // Convert YYYY-MM-DD into UTC midnight
    const attendanceDate = new Date(`${date}T00:00:00.000Z`);

    // Find attendance session for the selected date
    const attendanceSession = await prisma.employeeAttendanceSession.findUnique(
        {
            where: {
                date: attendanceDate,
            },
            select: {
                id: true,
            },
        },
    );

    // Get all active employees
    const employees = await prisma.employee.findMany({
        where: {
            isdeleted: false,
        },
        select: {
            id: true,
            employeeId: true,
            fullName: true,
            employeeRole: true,
        },
        orderBy: {
            employeeId: "asc",
        },
    });

    // Get attendance records if a session exists
    let attendanceRecords: {
        employeeId: string;
        status: EmployeeAttendanceStatus;
    }[] = [];

    if (attendanceSession) {
        attendanceRecords = await prisma.employeeAttendanceRecord.findMany({
            where: {
                sessionId: attendanceSession.id,
            },
            select: {
                employeeId: true,
                status: true,
            },
        });
    }
    isTaken = !!attendanceSession;

    // Create a map for quick attendance lookup
    const attendanceMap = new Map(
        attendanceRecords.map((record) => [record.employeeId, record.status]),
    );

    // Attach attendance status to each employee
    const formattedEmployees = employees.map((employee) => ({
        ...employee,
        status: attendanceMap.get(employee.id) ?? null,
    }));

    return {
        date: date.split("-").reverse().join("/"),
        isTaken,
        employees: formattedEmployees,
    };
};

const saveAttendance = async (payload: CreateAttendancePayload) => {
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

const saveEmployeeAttendance = async (
    payload: SaveEmployeeAttendancePayload,
) => {
    const { date, records } = payload;

    // Convert YYYY-MM-DD to Date
    const attendanceDate = new Date(`${date}T00:00:00.000Z`);

    // Get all active employees
    const employees = await prisma.employee.findMany({
        where: {
            isdeleted: false,
        },
        select: {
            id: true,
        },
    });

    const employeeIds = new Set(employees.map((employee) => employee.id));

    // Validate employee IDs
    const invalidEmployees = records.filter(
        (record) => !employeeIds.has(record.employeeId),
    );

    if (invalidEmployees.length > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "One or more employees do not exist or are inactive",
        );
    }

    // Prevent duplicate employee IDs
    const uniqueEmployeeIds = new Set(
        records.map((record) => record.employeeId),
    );

    if (uniqueEmployeeIds.size !== records.length) {
        throw new AppError(
            status.BAD_REQUEST,
            "Duplicate employee attendance records are not allowed",
        );
    }

    const result = await prisma.$transaction(async (tx) => {
        // Find existing attendance session
        const existingSession = await tx.employeeAttendanceSession.findUnique({
            where: {
                date: attendanceDate,
            },
            select: {
                id: true,
            },
        });

        // CREATE
        if (!existingSession) {
            return tx.employeeAttendanceSession.create({
                data: {
                    date: attendanceDate,

                    records: {
                        create: records.map((record) => ({
                            employeeId: record.employeeId,
                            status: record.status,
                        })),
                    },
                },

                include: {
                    records: {
                        select: {
                            id: true,
                            employeeId: true,
                            status: true,
                        },
                    },
                },
            });
        }

        // UPDATE
        await tx.employeeAttendanceRecord.deleteMany({
            where: {
                sessionId: existingSession.id,
            },
        });

        return tx.employeeAttendanceSession.update({
            where: {
                id: existingSession.id,
            },

            data: {
                records: {
                    create: records.map((record) => ({
                        employeeId: record.employeeId,
                        status: record.status,
                    })),
                },
            },

            include: {
                records: {
                    select: {
                        id: true,
                        employeeId: true,
                        status: true,
                    },
                },
            },
        });
    });

    return {
        ...result,
        date: date.split("-").reverse().join("/"),
    };
};

export const AttendanceService = {
    getEmployeeAttendance,
    getAttendanceStudents,
    saveAttendance,
    saveEmployeeAttendance,
};
