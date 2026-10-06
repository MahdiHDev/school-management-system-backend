import { prisma } from "../../lib/prisma";

import {
    CreateSubjectPayload,
    UpdateSubjectPayload,
} from "./subject.validation";

const createSubject = async (payload: CreateSubjectPayload) => {
    const { classId, subjects } = payload;

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
        where: {
            id: classId,
        },
    });

    if (!existingClass) {
        throw new Error("Class not found");
    }

    const subjectData = subjects.map((subject) => ({
        classId,
        subjectName: subject.subjectName,
        maxMarks: subject.marks,
    }));

    const createdSubjects = await prisma.subject.createMany({
        data: subjectData,
    });

    return createdSubjects;
};

const updateSubjects = async (payload: UpdateSubjectPayload) => {
    const { classId, subjects } = payload;

    const existingClass = await prisma.class.findUnique({
        where: {
            id: classId,
        },
    });

    if (!existingClass) {
        throw new Error("Class not found");
    }

    return await prisma.$transaction(async (tx) => {
        // Get current active subjects
        const existingSubjects = await tx.subject.findMany({
            where: {
                classId,
                isdeleted: false,
            },
        });

        // IDs submitted by frontend
        const submittedIds = subjects
            .filter((subject) => subject.id)
            .map((subject) => subject.id!);

        // --------------------------------
        // 1. UPDATE existing / CREATE new
        // --------------------------------

        for (const subject of subjects) {
            if (subject.id) {
                // Existing subject → UPDATE
                await tx.subject.upsert({
                    where: {
                        id: subject.id,
                    },

                    update: {
                        subjectName: subject.subjectName,
                        maxMarks: subject.marks,
                        isdeleted: false,
                        deletedAt: null,
                    },

                    create: {
                        id: subject.id,
                        classId,
                        subjectName: subject.subjectName,
                        maxMarks: subject.marks,
                    },
                });
            } else {
                // New subject → CREATE
                await tx.subject.create({
                    data: {
                        classId,
                        subjectName: subject.subjectName,
                        maxMarks: subject.marks,
                    },
                });
            }
        }

        // --------------------------------
        // 2. SOFT DELETE removed subjects
        // --------------------------------

        const deletedSubjectIds = existingSubjects
            .filter((subject) => !submittedIds.includes(subject.id))
            .map((subject) => subject.id);

        if (deletedSubjectIds.length > 0) {
            await tx.subject.updateMany({
                where: {
                    id: {
                        in: deletedSubjectIds,
                    },
                    classId,
                    isdeleted: false,
                },

                data: {
                    isdeleted: true,
                    deletedAt: new Date(),
                },
            });
        }

        // --------------------------------
        // 3. Return updated subjects
        // --------------------------------

        return await tx.subject.findMany({
            where: {
                classId,
                isdeleted: false,
            },
        });
    });
};

export const SubjectService = {
    createSubject,
    updateSubjects,
};
