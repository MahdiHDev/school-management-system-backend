import status from "http-status";
import { Prisma, UserStatus } from "../../../generated/client";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
    employeeFilterableFields,
    employeeSearchableFields,
} from "./employees.constant";
import { EmployeePayload } from "./employees.interface";
import { formatEmployeeResponse } from "./employees.mapper";

type EmployeeListItem = Prisma.EmployeeGetPayload<{
    select: {
        id: true;
        fullName: true;
        picture: true;
        gender: true;
        user: {
            select: {
                email: true;
                role: true;
            };
        };
    };
}>;

const getAllEmployees = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<
        EmployeeListItem,
        Prisma.EmployeeWhereInput,
        Prisma.EmployeeInclude
    >(prisma.employee, query, {
        searchableFields: employeeSearchableFields,
        filterableFields: employeeFilterableFields,
    });

    const result = await queryBuilder
        .search()
        .filter()
        .where({ isdeleted: false })
        .select({
            id: true,
            fullName: true,
            picture: true,
            gender: true,
            employeeRole: true,
            user: {
                select: {
                    email: true,
                },
            },
        })
        .paginate()
        .sort()
        .execute();

    const data = result.data as unknown as EmployeeListItem[];

    return {
        ...result,
        data: data.map(({ user, ...employee }) => ({
            ...employee,
            email: user.email,
            role: user.role,
        })),
    };
};

const getEmployeeById = async (id: string) => {
    const employee = await prisma.employee.findUnique({
        where: {
            id,
            isdeleted: false,
        },
        include: {
            user: true,
            address: true,
        },
    });

    return employee;
};

const createEmployee = async (
    payload: EmployeePayload,
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
    const employeeSignFile = files.employeeSign?.[0];
    const experienceFile = files.experience?.[0];

    if (!authoritySignFile) {
        throw new AppError(400, "Missing Authority Sign Image");
    }

    if (!employeeSignFile) {
        throw new AppError(400, "Missing Employee Sign Image");
    }

    const [picture, authoritySign, employeeSign, experience] =
        await Promise.all([
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
            experienceFile
                ? CloudinaryService.upload(experienceFile, {
                      folder: CloudinaryFolders.employee.experience,
                  })
                : Promise.resolve(null),
        ]);

    // Track uploaded public_ids so we can roll them back if anything below fails
    const uploadedPublicIds = [
        picture?.public_id,
        authoritySign?.public_id,
        employeeSign?.public_id,
        experience?.public_id,
    ].filter((id): id is string => !!id);

    const tempPassword = "Temp@12345";
    let userId: string | null = null;

    try {
        const authUser = await auth.api.signUpEmail({
            body: {
                email: payload.email,
                password: tempPassword,
                role: payload.role,
                name: payload.fullName,
                image: picture?.secure_url,
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

            const sequence = await tx.sequence.update({
                where: { id: "employee" },
                data: {
                    current: {
                        increment: 1,
                    },
                },
            });

            return await tx.employee.create({
                data: {
                    userId: userId!,
                    employeeId: sequence.current.toString(),
                    phone: payload.phone,
                    fullName: payload.fullName,
                    picture: picture?.secure_url ?? null,
                    picturePublicId: picture?.public_id ?? null,
                    EmployeeSign: employeeSign.secure_url,
                    EmployeeSignPublicId: employeeSign.public_id,
                    nid: payload.nid,
                    fatherName: payload.fatherName,
                    motherName: payload.motherName,
                    emergencyContactNumber: payload.emergencyContact ?? null,
                    monthlySalary: payload.monthlySalary,
                    authoritySign: authoritySign.secure_url,
                    authoritySignPublicId: authoritySign.public_id ?? null,
                    experience: experience?.secure_url ?? null,
                    experiencePublicId: experience?.public_id ?? null,
                    gender: payload.gender,
                    bloodGroup: payload.bloodGroup,
                    religion: payload.religion,
                    employeeRole: payload.employeeRole,
                    dateOfJoining: payload.dateOfJoining,
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
            employee: {
                ...formatEmployeeResponse(employee),
                picture: picture
                    ? {
                          uri: picture.secure_url,
                          name: pictureFile?.originalname,
                          type: pictureFile?.mimetype,
                      }
                    : undefined,
                experience: experience
                    ? {
                          uri: experience.secure_url,
                          name: experienceFile?.originalname,
                          type: experienceFile?.mimetype,
                      }
                    : null,

                authoritySign: {
                    uri: authoritySign.secure_url,
                    name: authoritySignFile.originalname,
                    type: authoritySignFile.mimetype,
                },

                employeeSign: {
                    uri: employeeSign.secure_url,
                    name: employeeSignFile.originalname,
                    type: employeeSignFile.mimetype,
                },
            },
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

const deleteEmployee = async (id: string) => {
    const employee = await prisma.employee.findUnique({
        where: { id },
        select: {
            id: true,
            userId: true,
            picturePublicId: true,
            authoritySignPublicId: true,
            EmployeeSignPublicId: true,
            experiencePublicId: true,
        },
    });

    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee Not found");
    }

    await prisma.$transaction(async (tx) => {
        await tx.employee.update({
            where: { id },
            data: {
                isdeleted: true,
                deletedAt: new Date(),
            },
        });

        await tx.user.update({
            where: { id: employee.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED,
            },
        });

        await tx.session.deleteMany({
            where: { userId: employee.userId },
        });
    });

    await Promise.allSettled([
        employee.picturePublicId
            ? CloudinaryService.delete(employee.picturePublicId)
            : Promise.resolve(),

        employee.authoritySignPublicId
            ? CloudinaryService.delete(employee.authoritySignPublicId)
            : Promise.resolve(),

        employee.EmployeeSignPublicId
            ? CloudinaryService.delete(employee.EmployeeSignPublicId)
            : Promise.resolve(),

        employee.experiencePublicId
            ? CloudinaryService.delete(employee.experiencePublicId)
            : Promise.resolve(),
    ]);

    return { message: "Employee deleted successfully" };
};

export const EmployeeService = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    deleteEmployee,
};
