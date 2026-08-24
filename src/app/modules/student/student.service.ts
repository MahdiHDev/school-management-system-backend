import status from "http-status";
import { Prisma } from "../../../generated/client";
import { UserRole } from "../../../generated/enums";
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
    });

    if (!student) {
        throw new AppError(status.NOT_FOUND, "Student Not found");
    }
};

export const StudentService = { getAllStudent, createStudent, updateStudent };
