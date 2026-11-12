import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
    failCriteriaPayload,
    IGradingConfigurationPayload,
} from "./grades.validation";

const getGradeData = async () => {
    const result = await prisma.gradingConfiguration.findFirst({
        where: {
            isActive: true,
        },
        select: {
            grades: {
                orderBy: {
                    minMarks: "desc",
                },
                select: {
                    id: true,
                    grade: true,
                    minMarks: true,
                    maxMarks: true,
                    status: true,
                },
            },
        },
    });

    return (
        result?.grades.map((grade) => ({
            ...grade,
            status: grade.status === "PASS" ? "Pass" : "Fail",
        })) ?? []
    );
};

const getFailCriteria = async () => {
    const result = await prisma.failCriteria.findFirst({
        where: {
            isActive: true,
        },
        select: {
            overallPercentage: true,
            subjectPercentage: true,
            minFailedSubjects: true,
        },
    });

    const formattedData = {
        overall: result?.overallPercentage,
        subject: result?.subjectPercentage,
        number: result?.minFailedSubjects,
    };

    return formattedData;
};

const updateGradingConfiguration = async (
    payload: IGradingConfigurationPayload,
) => {
    const { name, grades } = payload;

    return await prisma.$transaction(async (tx) => {
        // 1. Find active grading configuration
        let configuration = await tx.gradingConfiguration.findFirst({
            where: {
                isActive: true,
            },
            include: {
                grades: true,
                failCriteria: true,
            },
        });

        // 2. Create configuration if it doesn't exist
        if (!configuration) {
            configuration = await tx.gradingConfiguration.create({
                data: {
                    name: name || "Default Grading",
                    isActive: true,
                },
                include: {
                    grades: true,
                    failCriteria: true,
                },
            });
        } else if (name) {
            // Update name if provided
            configuration = await tx.gradingConfiguration.update({
                where: {
                    id: configuration.id,
                },
                data: {
                    name,
                },
                include: {
                    grades: true,
                    failCriteria: true,
                },
            });
        }

        // ==========================================
        // 3. Sync GradeScale
        // ==========================================

        if (grades !== undefined) {
            const existingGrades = await tx.gradeScale.findMany({
                where: {
                    configurationId: configuration.id,
                },
            });

            const incomingIds = grades
                .filter((grade) => grade.id)
                .map((grade) => grade.id as string);

            // Delete grades removed from frontend
            await tx.gradeScale.deleteMany({
                where: {
                    configurationId: configuration.id,
                    ...(incomingIds.length > 0
                        ? {
                              id: {
                                  notIn: incomingIds,
                              },
                          }
                        : {}),
                },
            });

            // Create / update grades
            for (const grade of grades) {
                const gradeStatus = grade.status.toUpperCase() as
                    | "PASS"
                    | "FAIL";

                if (grade.id) {
                    const existingGrade = existingGrades.find(
                        (item) => item.id === grade.id,
                    );

                    if (existingGrade) {
                        await tx.gradeScale.update({
                            where: {
                                id: grade.id,
                            },
                            data: {
                                grade: grade.grade,
                                minMarks: grade.minMarks,
                                maxMarks: grade.maxMarks,
                                status: gradeStatus,
                            },
                        });
                    }
                } else {
                    await tx.gradeScale.create({
                        data: {
                            grade: grade.grade,
                            minMarks: grade.minMarks,
                            maxMarks: grade.maxMarks,
                            status: gradeStatus,
                            configurationId: configuration.id,
                        },
                    });
                }
            }
        }

        // ==========================================
        // 5. Return complete configuration
        // ==========================================

        return await tx.gradingConfiguration.findUnique({
            where: {
                id: configuration.id,
            },
            include: {
                grades: {
                    orderBy: {
                        minMarks: "desc",
                    },
                },
                failCriteria: true,
            },
        });
    });
};

const updateFailCriteria = async (payload: failCriteriaPayload) => {
    const { overall, subject, number } = payload;

    return await prisma.$transaction(async (tx) => {
        // 1. Find the current grading configuration
        const configuration = await tx.gradingConfiguration.findFirst({
            where: {
                isActive: true,
            },
        });

        if (!configuration) {
            throw new AppError(
                status.NOT_FOUND,
                "Active grading configuration not found",
            );
        }

        // 2. Check whether fail criteria already exists
        const existingFailCriteria = await tx.failCriteria.findUnique({
            where: {
                configurationId: configuration.id,
            },
        });

        // 3. First time → create
        if (!existingFailCriteria) {
            return await tx.failCriteria.create({
                data: {
                    overallPercentage: overall,
                    subjectPercentage: subject,
                    minFailedSubjects: number,
                    configurationId: configuration.id,
                },
            });
        }

        // 4. Already exists → update
        return await tx.failCriteria.update({
            where: {
                id: existingFailCriteria.id,
            },
            data: {
                overallPercentage: overall,
                subjectPercentage: subject,
                minFailedSubjects: number,
            },
        });
    });
};

export const gradingConfigurationService = {
    getGradeData,
    getFailCriteria,
    updateGradingConfiguration,
    updateFailCriteria,
};
