import status from "http-status";
import { UserRole } from "../../../generated/enums";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateStudentPayload } from "./student.interface";

const createStudent = async (
    payload: ICreateStudentPayload,
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
                    classId: payload.classId,
                    admissionTotalFees: payload.admissionTotalFees,
                    admissionDate: payload.admissionDate,

                    authoritySign: authoritySign.secure_url,
                    authoritySignPublicId: authoritySign.public_id,
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
                            motherName: payload.mothersName,
                            motherNameBangla: payload.mothersNameBangla,
                            motherMobileNumber: payload.motherMobileNumber,
                            motherOccupation: payload.motherOccupation,

                            nameOfLocalGuardian: payload.guardianName ?? null,
                            GuardianMobileNumber:
                                payload.guardianMobile ?? null,
                            relationShipOfStudent:
                                payload.guardianRelationship ?? null,
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

export const StudentService = { createStudent };
