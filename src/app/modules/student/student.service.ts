import status from "http-status";
import { Prisma } from "../../../generated/client";
import { UserRole, UserStatus } from "../../../generated/enums";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
    studentFilterableFields,
    studentSearchableFields,
} from "./student.constant";
import { IUpdateStudentPayload, StudentPayload } from "./student.validation";

type StudentListItem = Prisma.StudentGetPayload<{
    select: {
        id: true;
        fullName: true;
        birthRegistrationNumber: true;
        gender: true;
        picture: true;
        user: {
            select: {
                email: true;
            };
        };
    };
}>;

const getAllStudent = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
        StudentListItem,
        Prisma.StudentWhereInput,
        Prisma.StudentInclude
    >(prisma.student, query, {
        searchableFields: studentSearchableFields,
        filterableFields: studentFilterableFields,
    });

    const result = await queryBuilder
        .search()
        .filter()
        .where({ isdeleted: false })
        .select({
            id: true,
            birthRegistrationNumber: true,
            fullName: true,
            gender: true,
            picture: true,
            user: {
                select: {
                    email: true,
                },
            },
        })
        .paginate()
        .sort()
        .execute();

    const data = result.data as unknown as StudentListItem[];

    return {
        ...result,
        data: data.map(({ user, ...student }) => ({
            ...student,
            email: user.email,
        })),
    };
};

const getStudentForUpdate = async (id: string) => {
    const student = await prisma.student.findUnique({
        where: {
            id,
            isdeleted: false,
        },
        select: {
            fullName: true,
            fullNameBangla: true,
            dateOfBirth: true,

            birthRegistrationNumber: true,
            religion: true,
            gender: true,
            bloodGroup: true,
            classId: true,
            admissionTotalFees: true,
            previousInstituteName: true,
            endingClass: true,
            result: true,
            testimonialNumber: true,

            guardianInfo: {
                select: {
                    fatherName: true,
                    fatherNameBangla: true,
                    fatherMobileNumber: true,
                    fatherOccupation: true,
                    motherName: true,
                    motherNameBangla: true,
                    motherMobileNumber: true,
                    motherOccupation: true,
                    nameOfLocalGuardian: true,
                    relationShipOfStudent: true,
                    GuardianMobileNumber: true,
                    whatsappNumber: true,
                },
            },
            address: {
                select: {
                    presentAddressVillage: true,
                    presentAddressPostOffice: true,
                    presentAddressPostCode: true,
                    presentAddressDistrict: true,

                    permanentAddressVillage: true,
                    permanentAddressPostOffice: true,
                    permanentAddressPostCode: true,
                    permanentAddressDistrict: true,
                },
            },

            picture: true,
            pictureName: true,
            pictureType: true,

            studentSign: true,
            studentsignName: true,
            studentSignType: true,

            guardianSign: true,
            guardianSignName: true,
            guardianSignType: true,

            authoritySign: true,
            authoritySignName: true,
            authoritySignType: true,
            user: {
                select: {
                    email: true,
                },
            },
        },
    });

    if (!student) {
        throw new AppError(status.NOT_FOUND, "Student Not found");
    }

    if (!student?.address) {
        throw new AppError(status.NOT_FOUND, "Student address not found");
    }

    const {
        pictureName,
        pictureType,
        authoritySignName,
        authoritySignType,
        studentsignName,
        studentSignType,
        guardianSignName,
        guardianSignType,
        guardianInfo,
        user: { email },
        ...studenData
    } = student;
    const formattedStudent = {
        ...studenData,
        ...guardianInfo,

        picture: {
            uri: student.picture,
            name: pictureName,
            type: pictureType,
        },

        authoritySign: {
            uri: student.authoritySign,
            name: authoritySignName,
            type: authoritySignType,
        },

        studentSign: {
            uri: student.studentSign,
            name: studentsignName,
            type: studentSignType,
        },
        guardianSign: {
            uri: student.guardianSign,
            name: guardianSignName,
            type: guardianSignType,
        },

        address: {
            present: {
                village: student.address.presentAddressVillage,
                postOffice: student.address.presentAddressPostOffice,
                postCode: student.address.presentAddressPostCode,
                district: student.address.presentAddressDistrict,
            },
            permanent: {
                village: student.address.permanentAddressVillage,
                postOffice: student.address.permanentAddressPostOffice,
                postCode: student.address.permanentAddressPostCode,
                district: student.address.permanentAddressDistrict,
            },
        },
        email,
    };

    return formattedStudent;
};

const createStudent = async (
    payload: StudentPayload,
    files: Record<string, UploadFile[]>,
) => {
    // Check for existing email BEFORE any uploads — fail fast, no wasted work
    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email.toLocaleLowerCase() },
        select: { id: true },
    });

    if (existingUser) {
        throw new AppError(
            status.CONFLICT,
            "An account with this email already exists",
        );
    }

    const pictureFile = files.picture?.[0];
    const authoritySignFile = files.authoritySign?.[0];
    const studentSignFile = files.studentSign?.[0];
    const guardianSignFile = files.guardianSign?.[0];

    if (!authoritySignFile) {
        throw new AppError(400, "Missing Authority Sign Image");
    }

    if (!pictureFile) {
        throw new AppError(400, "Missing Picture of Student");
    }
    if (!studentSignFile) {
        throw new AppError(400, "Missing Student Sign Image");
    }
    if (!guardianSignFile) {
        throw new AppError(400, "Missing Guardian Sign Image");
    }

    const [picture, authoritySign, studentSign, guardianSign] =
        await Promise.all([
            pictureFile
                ? CloudinaryService.upload(pictureFile, {
                      folder: CloudinaryFolders.student.profile,
                  })
                : Promise.resolve(null),

            CloudinaryService.upload(authoritySignFile, {
                folder: CloudinaryFolders.student.authoritySign,
            }),
            CloudinaryService.upload(studentSignFile, {
                folder: CloudinaryFolders.student.studentSign,
            }),
            CloudinaryService.upload(guardianSignFile, {
                folder: CloudinaryFolders.student.guardianSign,
            }),
        ]);

    // Track uploaded public_ids so we can roll them back if anything below fails
    const uploadedPublicIds = [
        picture?.public_id,
        authoritySign?.public_id,
        studentSign?.public_id,
        guardianSign?.public_id,
    ].filter((id): id is string => !!id);

    const tempPassword = "Temp@12345";
    let userId: string | null = null;

    try {
        const authUser = await auth.api.signUpEmail({
            body: {
                email: payload.email,
                password: tempPassword,
                role: UserRole.STUDENT,
                name: payload.fullName,
                image: picture?.secure_url,
                needPasswordChange: true,
            },
        });

        userId = authUser.user.id;

        const student = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId! },
                data: {
                    emailVerified: true,
                    needPasswordChange: true,
                },
            });

            const sequence = await tx.sequence.update({
                where: { id: "student" },
                data: {
                    current: {
                        increment: 1,
                    },
                },
            });

            return await tx.student.create({
                data: {
                    userId: userId!,
                    studentId: sequence.current.toString(),
                    fullName: payload.fullName,
                    fullNameBangla: payload.fullNameBangla,
                    picture: picture?.secure_url as string,
                    picturePublicId: picture?.public_id ?? null,
                    pictureName: pictureFile?.originalname ?? null,
                    pictureType: pictureFile?.mimetype ?? null,
                    dateOfBirth: payload.dateOfBirth,
                    birthRegistrationNumber: payload.birthRegistrationNumber,
                    religion: payload.religion,
                    gender: payload.gender,
                    classId: payload.classId,
                    admissionTotalFees: payload.admissionTotalFees,
                    admissionDate: payload.admissionDate,
                    testimonialNumber: payload.testimonialNumber ?? null,
                    previousInstituteName: payload.previousInstitute ?? null,
                    endingClass: payload.endingClass ?? null,
                    result: payload.result ?? null,
                    bloodGroup: payload.bloodGroup ?? null,

                    authoritySign: authoritySign.secure_url,
                    authoritySignPublicId: authoritySign.public_id,
                    authoritySignName: authoritySignFile.originalname,
                    authoritySignType: authoritySignFile.mimetype,

                    studentSign: studentSign.secure_url,
                    studentSignPublicId: studentSign.public_id,
                    studentsignName: studentSignFile.originalname,
                    studentSignType: studentSignFile.mimetype,

                    guardianSign: guardianSign.secure_url,
                    guardianSignPublicId: guardianSign.public_id,
                    guardianSignName: guardianSignFile.originalname,
                    guardianSignType: guardianSignFile.mimetype,

                    guardianInfo: {
                        create: {
                            fatherName: payload.fatherName,
                            fatherNameBangla: payload.fatherNameBangla,
                            whatsappNumber: payload.whatsappNumber,
                            fatherOccupation: payload.fatherOccupation,
                            motherName: payload.motherName,
                            motherNameBangla: payload.motherNameBangla,
                            motherMobileNumber: payload.motherMobileNumber,
                            fatherMobileNumber: payload.fatherMobileNumber,
                            motherOccupation: payload.motherOccupation,

                            nameOfLocalGuardian: payload.guardianName,
                            GuardianMobileNumber: payload.guardianMobile,
                            relationShipOfStudent: payload.guardianRelationship,
                        },
                    },

                    address: {
                        create: {
                            permanentAddressVillage:
                                payload.address.permanent.village,
                            permanentAddressPostOffice:
                                payload.address.permanent.postOffice,
                            permanentAddressPostCode:
                                payload.address.permanent.postCode,
                            permanentAddressDistrict:
                                payload.address.permanent.district,

                            presentAddressVillage:
                                payload.address.present.village,
                            presentAddressPostOffice:
                                payload.address.present.postOffice,
                            presentAddressPostCode:
                                payload.address.present.postCode,
                            presentAddressDistrict:
                                payload.address.present.district,
                        },
                    },
                },
            });
        });

        return student;
    } catch (error: any) {
        console.log("Transaction error : ", error);

        // Roll back the auth user only if it was actually created
        if (userId) {
            await prisma.user
                .delete({ where: { id: userId } })
                .catch((delErr) => {
                    console.log("Failed to rollback user:", delErr);
                });
        }

        // Roll back uploaded Cloudinary assets so nothing gets orphaned
        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId).catch((delErr) => {
                    console.log(
                        `Failed to rollback Cloudinary asset ${publicId}:`,
                        delErr,
                    );
                }),
            ),
        );

        throw error;
    }
};

const updateStudent = async (
    id: string,
    payload: IUpdateStudentPayload,
    files: Record<string, UploadFile[]>,
) => {
    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            user: true,
            guardianInfo: true,
            address: true,
        },
    });

    if (!student) {
        throw new AppError(status.NOT_FOUND, "Student not found");
    }

    const pictureFile = files.picture?.[0];
    const authoritySignFile = files.authoritySign?.[0];
    const studentSignFile = files.studentSign?.[0];
    const guardianSignFile = files.guardianSign?.[0];

    /*
     * Upload only the files that were actually provided.
     */
    const [picture, authoritySign, studentSign, guardianSign] =
        await Promise.all([
            pictureFile
                ? CloudinaryService.upload(pictureFile, {
                      folder: CloudinaryFolders.student.profile,
                  })
                : Promise.resolve(null),

            authoritySignFile
                ? CloudinaryService.upload(authoritySignFile, {
                      folder: CloudinaryFolders.student.authoritySign,
                  })
                : Promise.resolve(null),

            studentSignFile
                ? CloudinaryService.upload(studentSignFile, {
                      folder: CloudinaryFolders.student.studentSign,
                  })
                : Promise.resolve(null),

            guardianSignFile
                ? CloudinaryService.upload(guardianSignFile, {
                      folder: CloudinaryFolders.student.guardianSign,
                  })
                : Promise.resolve(null),
        ]);

    // Newly uploaded files.
    const uploadedPublicIds = [
        picture?.public_id,
        authoritySign?.public_id,
        studentSign?.public_id,
        guardianSign?.public_id,
    ].filter((id): id is string => Boolean(id));

    try {
        const updatedStudent = await prisma.$transaction(async (tx) => {
            // 1. Update User
            await tx.user.update({
                where: {
                    id: student.userId,
                },
                data: {
                    ...(payload.fullName !== undefined && {
                        name: payload.fullName,
                    }),

                    ...(picture && {
                        image: picture.secure_url,
                    }),
                },
            });

            // 2. Update Student
            const updatedStudent = await tx.student.update({
                where: {
                    id: student.id,
                },
                data: {
                    ...(payload.fullName !== undefined && {
                        fullName: payload.fullName,
                    }),

                    ...(payload.fullNameBangla !== undefined && {
                        fullNameBangla: payload.fullNameBangla,
                    }),

                    ...(payload.dateOfBirth !== undefined && {
                        dateOfBirth: payload.dateOfBirth,
                    }),

                    ...(payload.birthRegistrationNumber !== undefined && {
                        birthRegistrationNumber:
                            payload.birthRegistrationNumber,
                    }),

                    ...(payload.religion !== undefined && {
                        religion: payload.religion,
                    }),

                    ...(payload.classId !== undefined && {
                        classId: payload.classId,
                    }),

                    ...(payload.admissionTotalFees !== undefined && {
                        admissionTotalFees: payload.admissionTotalFees,
                    }),

                    ...(payload.admissionDate !== undefined && {
                        admissionDate: payload.admissionDate,
                    }),

                    ...(payload.previousInstitute !== undefined && {
                        previousInstituteName:
                            payload.previousInstitute || null,
                    }),

                    ...(payload.endingClass !== undefined && {
                        endingClass: payload.endingClass || null,
                    }),

                    ...(payload.result !== undefined && {
                        result: payload.result || null,
                    }),

                    ...(payload.testimonialNumber !== undefined && {
                        testimonialNumber: payload.testimonialNumber || null,
                    }),

                    ...(payload.gender !== undefined && {
                        gender: payload.gender,
                    }),

                    ...(payload.bloodGroup !== undefined && {
                        bloodGroup: payload.bloodGroup || null,
                    }),

                    ...(picture && {
                        picture: picture.secure_url,
                        picturePublicId: picture.public_id,
                        ...(pictureFile !== undefined && {
                            pictureName: pictureFile.originalname,
                            pictureType: pictureFile.mimetype,
                        }),
                    }),

                    ...(authoritySign && {
                        authoritySign: authoritySign.secure_url,
                        authoritySignPublicId: authoritySign.public_id,
                        ...(authoritySignFile !== undefined && {
                            authoritySignName: authoritySignFile.originalname,
                            authoritySignType: authoritySignFile.mimetype,
                        }),
                    }),

                    ...(studentSign && {
                        studentSign: studentSign.secure_url,
                        studentSignPublicId: studentSign.public_id,
                        ...(studentSignFile !== undefined && {
                            studentsignName: studentSignFile.originalname,
                            studentSignType: studentSignFile.mimetype,
                        }),
                    }),

                    ...(guardianSign && {
                        guardianSign: guardianSign.secure_url,
                        guardianSignPublicId: guardianSign.public_id,
                        ...(guardianSignFile !== undefined && {
                            guardianSignName: guardianSignFile.originalname,
                            guardianSignType: guardianSignFile.mimetype,
                        }),
                    }),
                },
            });

            // 3. Update Guardian Info
            if (student.guardianInfo) {
                await tx.guardianInfo.update({
                    where: {
                        studentId: student.id,
                    },
                    data: {
                        ...(payload.fatherName !== undefined && {
                            fatherName: payload.fatherName,
                        }),

                        ...(payload.fatherNameBangla !== undefined && {
                            fatherNameBangla: payload.fatherNameBangla,
                        }),

                        ...(payload.fatherMobileNumber !== undefined && {
                            fatherMobileNumber: payload.fatherMobileNumber,
                        }),

                        ...(payload.whatsappNumber !== undefined && {
                            whatsappNumber: payload.whatsappNumber,
                        }),

                        ...(payload.fatherOccupation !== undefined && {
                            fatherOccupation: payload.fatherOccupation,
                        }),

                        ...(payload.motherName !== undefined && {
                            motherName: payload.motherName,
                        }),

                        ...(payload.motherNameBangla !== undefined && {
                            motherNameBangla: payload.motherNameBangla,
                        }),

                        ...(payload.motherMobileNumber !== undefined && {
                            motherMobileNumber: payload.motherMobileNumber,
                        }),

                        ...(payload.motherOccupation !== undefined && {
                            motherOccupation: payload.motherOccupation,
                        }),

                        ...(payload.guardianName !== undefined && {
                            nameOfLocalGuardian: payload.guardianName,
                        }),

                        ...(payload.guardianRelationship !== undefined && {
                            relationShipOfStudent: payload.guardianRelationship,
                        }),

                        ...(payload.guardianMobile !== undefined && {
                            GuardianMobileNumber: payload.guardianMobile,
                        }),
                    },
                });
            }

            // 4. Update Address
            if (student.address && payload.address) {
                await tx.address.update({
                    where: {
                        id: student.address.id,
                    },
                    data: {
                        ...(payload.address.permanent?.village !==
                            undefined && {
                            permanentAddressVillage:
                                payload.address.permanent.village,
                        }),

                        ...(payload.address.permanent?.postOffice !==
                            undefined && {
                            permanentAddressPostOffice:
                                payload.address.permanent.postOffice,
                        }),

                        ...(payload.address.permanent?.postCode !==
                            undefined && {
                            permanentAddressPostCode:
                                payload.address.permanent.postCode,
                        }),

                        ...(payload.address.permanent?.district !==
                            undefined && {
                            permanentAddressDistrict:
                                payload.address.permanent.district,
                        }),

                        ...(payload.address.present?.village !== undefined && {
                            presentAddressVillage:
                                payload.address.present.village,
                        }),

                        ...(payload.address.present?.postOffice !==
                            undefined && {
                            presentAddressPostOffice:
                                payload.address.present.postOffice,
                        }),

                        ...(payload.address.present?.postCode !== undefined && {
                            presentAddressPostCode:
                                payload.address.present.postCode,
                        }),

                        ...(payload.address.present?.district !== undefined && {
                            presentAddressDistrict:
                                payload.address.present.district,
                        }),
                    },
                });
            }

            return updatedStudent;
        });

        // 5. Delete old Cloudinary files AFTER successful transaction
        const oldPublicIds = [
            picture && student.picturePublicId,
            authoritySign && student.authoritySignPublicId,
            studentSign && student.studentSignPublicId,
            guardianSign && student.guardianSignPublicId,
        ].filter((id): id is string => Boolean(id));

        await Promise.all(
            oldPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId).catch((error) => {
                    console.log(
                        `Failed to delete old Cloudinary file ${publicId}:`,
                        error,
                    );
                }),
            ),
        );

        return updatedStudent;
    } catch (error) {
        /*
         * -------------------------------------------------------------
         * Rollback newly uploaded Cloudinary files
         * -------------------------------------------------------------
         */
        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId).catch((deleteError) => {
                    console.log(
                        `Failed to rollback Cloudinary asset ${publicId}:`,
                        deleteError,
                    );
                }),
            ),
        );

        throw error;
    }
};

const deleteStudent = async (id: string) => {
    const student = await prisma.student.findUnique({
        where: { id },
        select: {
            id: true,
            userId: true,
            picturePublicId: true,
            studentSignPublicId: true,
            guardianSignPublicId: true,
            authoritySignPublicId: true,
        },
    });

    if (!student) {
        throw new AppError(status.NOT_FOUND, "Student Profile not found");
    }

    await prisma.$transaction(async (tx) => {
        await tx.student.update({
            where: { id },
            data: {
                isdeleted: true,
                deletedAt: new Date(),
            },
        });

        await tx.user.update({
            where: { id: student.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED,
            },
        });

        await tx.session.deleteMany({
            where: { userId: student.userId },
        });
    });

    await Promise.allSettled([
        student.picturePublicId
            ? CloudinaryService.delete(student.picturePublicId)
            : Promise.resolve(),

        student.authoritySignPublicId
            ? CloudinaryService.delete(student.authoritySignPublicId)
            : Promise.resolve(),

        student.studentSignPublicId
            ? CloudinaryService.delete(student.studentSignPublicId)
            : Promise.resolve(),

        student.guardianSignPublicId
            ? CloudinaryService.delete(student.guardianSignPublicId)
            : Promise.resolve(),
    ]);

    return { message: "Student Profile deleted successfully" };
};

export const StudentService = {
    getAllStudent,
    getStudentForUpdate,
    createStudent,
    updateStudent,
    deleteStudent,
};
