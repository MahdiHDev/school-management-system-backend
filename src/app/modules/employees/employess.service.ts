import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { EmployeePayload } from "./employees.interface";
import { formatEmployeeResponse } from "./employees.mapper";

const createEmployee = async (
    payload: EmployeePayload,
    files: Record<string, UploadFile[]>,
) => {
    // Check for existing email BEFORE any uploads — fail fast, no wasted work
    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email.toLocaleLowerCase() },
        select: { id: true },
    });

    console.log("Hitting on Existing User Func 🚀", existingUser);

    if (existingUser) {
        throw new AppError(409, "An account with this email already exists");
    }

    const pictureFile = files.picture?.[0];
    const authoritySignFile = files.authoritySign?.[0];
    const employeeSignFile = files.employeeSign?.[0];

    if (!authoritySignFile) {
        throw new AppError(400, "Missing Authority Sign Image");
    }

    if (!employeeSignFile) {
        throw new AppError(400, "Missing Employee Sign Image");
    }

    const [picture, authoritySign, employeeSign] = await Promise.all([
        pictureFile
            ? CloudinaryService.upload(pictureFile, {
                  folder: CloudinaryFolders.employee.profile,
              })
            : Promise.resolve(null),

        CloudinaryService.upload(authoritySignFile, {
            folder: CloudinaryFolders.employee.authoritySign,
        }),
        CloudinaryService.upload(employeeSignFile, {
            folder: CloudinaryFolders.employee.employeeSign,
        }),
    ]);

    // Track uploaded public_ids so we can roll them back if anything below fails
    const uploadedPublicIds = [
        picture?.public_id,
        authoritySign?.public_id,
        employeeSign?.public_id,
    ].filter((id): id is string => !!id);

    const tempPassword = "Temp@12345";
    let userId: string | null = null;

    try {
        const authUser = await auth.api.signUpEmail({
            body: {
                email: payload.email,
                password: tempPassword,
                role: payload.employeeRole,
                name: payload.fullName,
                needPasswordChange: true,
            },
        });

        userId = authUser.user.id;

        const employee = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId! },
                data: {
                    emailVerified: true,
                    needPasswordChange: true,
                },
            });

            return await tx.employee.create({
                data: {
                    userId: userId!,
                    phone: payload.phone,
                    fullName: payload.fullName,
                    picture: picture?.secure_url ?? null,
                    EmployeeSign: employeeSign.secure_url,
                    nid: payload.nid,
                    fatherName: payload.fatherName,
                    motherName: payload.motherName,
                    emergencyContactNumber: payload.emergencyContact ?? null,
                    monthlySalary: payload.monthlySalary,
                    experience: payload.experience,
                    authoritySign: authoritySign.secure_url,
                    gender: payload.gender,
                    bloodGroup: payload.bloodGroup,
                    religion: payload.religion,
                    employeeRole: payload.employeeRole,
                    dateOfBirth: new Date(payload.dateOfBirth),
                    birthRegistrationNumber:
                        payload.birthRegistrationNumber ?? null,

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
                include: {
                    user: true,
                    address: true,
                },
            });
        });

        return {
            employee: formatEmployeeResponse(employee),
            credentials: {
                email: payload.email,
                password: tempPassword,
            },
        };
    } catch (err: any) {
        console.log("Transaction error : ", err);

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

        throw err;
    }
};

export const EmployeeService = {
    createEmployee,
};
