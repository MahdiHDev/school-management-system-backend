import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
    failCriteriaPayload,
    IGradingConfigurationPayload,
} from "./grades.validation";

const getGradeData = async () => {
    const result = prisma.gradingConfiguration.findFirst({
        where: {
            isActive: true,
        },
        include: {
            grades: true,
            failCriteria: true,
        },
    });

    return result;
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
                if (grade.id) {
                    // Make sure this grade belongs to this configuration
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
                                status: grade.status,
                            },
                        });
                    }
                } else {
                    // New grade
                    await tx.gradeScale.create({
                        data: {
                            grade: grade.grade,
                            minMarks: grade.minMarks,
                            maxMarks: grade.maxMarks,
                            status: grade.status,
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
    updateGradingConfiguration,
    updateFailCriteria,
};
