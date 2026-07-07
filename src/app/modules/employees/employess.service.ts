import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { EmployeePayload } from "./employees.interface";

const createEmployee = async (
    payload: EmployeePayload,
    files: Record<string, UploadFile[]>,
) => {
    const pictureFile = files.picture?.[0];
    const authoritySignFile = files.authoritySign?.[0];

    if (!authoritySignFile) {
        throw new AppError(400, "Missing employee upload files");
    }

    const [picture, authoritySign] = await Promise.all([
        pictureFile
            ? CloudinaryService.upload(pictureFile, {
                  folder: "employees/profile",
              })
            : Promise.resolve(null),

        CloudinaryService.upload(authoritySignFile, {
            folder: "employees/signature",
        }),
    ]);

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
                where: {
                    id: userId!,
                },
                data: {
                    emailVerified: true,
                    needPasswordChange: true,
                },
            });

            await tx.employee.create({
                data: {
                    userId: userId!,
                    phone: payload.phone,
                    fullName: payload.fullName,
                    picture: picture?.secure_url ?? null,
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
                },
            });
        });

        return {
            employee,
            credentials: {
                email: payload.email,
                password: tempPassword,
            },
        };
    } catch (err: any) {
        console.log("Transaction error : ", err);
        await prisma.user.delete({
            where: {
                id: userId!,
            },
        });
        throw err;
    }
};

export const EmployeeService = {
    createEmployee,
};
