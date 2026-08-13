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
import { IEmployeePayload, IUpdatePayload } from "./employees.interface";
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
            user: {
                select: {
                    email: true,
                    role: true,
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

    if (!employee || employee.isdeleted) {
        throw new AppError(status.NOT_FOUND, "Employee not found");
    }

    return employee;
};

const getEmployeeByIdForUpdate = async (id: string) => {
    const employee = await prisma.employee.findUnique({
        where: {
            id,
            isdeleted: false,
        },
        select: {
            fullName: true,
            fatherName: true,
            motherName: true,
            gender: true,
            bloodGroup: true,
            religion: true,
            employeeRole: true,
            emergencyContact: true,
            monthlySalary: true,
            dateOfJoining: true,
            phone: true,
            nid: true,
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
            authoritySign: true,
            authoritySignName: true,
            authoritySignType: true,
            employeeSign: true,
            employeeSignName: true,
            employeeSignType: true,
            experience: true,
            experienceName: true,
            experienceType: true,
            user: {
                select: {
                    email: true,
                },
            },
        },
    });

    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee Not found");
    }

    if (!employee?.address) {
        throw new AppError(status.NOT_FOUND, "Employee address not found");
    }

    const {
        pictureName,
        pictureType,
        authoritySignName,
        authoritySignType,
        employeeSignName,
        employeeSignType,
        experienceName,
        experienceType,
        user: { email },
        ...employeeData
    } = employee;

    const formattedEmployee = {
        ...employeeData,

        picture: {
            uri: employee.picture,
            name: pictureName,
            type: pictureType,
        },

        authoritySign: {
            uri: employee.authoritySign,
            name: authoritySignName,
            type: authoritySignType,
        },

        employeeSign: {
            uri: employee.employeeSign,
            name: employeeSignName,
            type: employeeSignType,
        },

        experience: employee.experience
            ? {
                  uri: employee.experience,
                  name: experienceName,
                  type: experienceType,
              }
            : null,

        address: {
            present: {
                village: employee.address.presentAddressVillage,
                postOffice: employee.address.presentAddressPostOffice,
                postCode: employee.address.presentAddressPostCode,
                district: employee.address.presentAddressDistrict,
            },
            permanent: {
                village: employee.address.permanentAddressVillage,
                postOffice: employee.address.permanentAddressPostOffice,
                postCode: employee.address.permanentAddressPostCode,
                district: employee.address.permanentAddressDistrict,
            },
        },

        email,
    };

    return formattedEmployee;
};

const createEmployee = async (
    payload: IEmployeePayload,
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
                role: payload.employeeRole,
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
                    pictureName: pictureFile?.originalname ?? null,
                    pictureType: pictureFile?.mimetype ?? null,
                    employeeSign: employeeSign.secure_url,
                    employeeSignPublicId: employeeSign.public_id,
                    employeeSignName: employeeSignFile.originalname,
                    employeeSignType: employeeSignFile.mimetype,
                    nid: payload.nid,
                    fatherName: payload.fatherName,
                    motherName: payload.motherName,
                    emergencyContact: payload.emergencyContact ?? null,
                    monthlySalary: payload.monthlySalary,
                    authoritySign: authoritySign.secure_url,
                    authoritySignPublicId: authoritySign.public_id ?? null,
                    authoritySignName: authoritySignFile.originalname,
                    authoritySignType: authoritySignFile.mimetype,
                    experience: experience?.secure_url ?? null,
                    experiencePublicId: experience?.public_id ?? null,
                    experienceName: experienceFile?.originalname ?? null,
                    experienceType: experienceFile?.mimetype ?? null,
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
                          uri: employee.picture,
                          name: employee.pictureName,
                          type: employee.pictureType,
                      }
                    : undefined,
                experience: experience
                    ? {
                          uri: experience.secure_url,
                          name: employee.experienceName,
                          type: employee.experienceType,
                      }
                    : null,

                authoritySign: {
                    uri: authoritySign.secure_url,
                    name: employee.authoritySignName,
                    type: employee.authoritySignType,
                },

                employeeSign: {
                    uri: employeeSign,
                    name: employee.employeeSignName,
                    type: employee.employeeSignType,
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

const updateEmployee = async (
    id: string,
    payload: IUpdatePayload,
    files: Record<string, UploadFile[]>,
) => {
    const employee = await prisma.employee.findUnique({
        where: { id },
        include: {
            user: true,
            address: true,
        },
    });

    if (!employee) {
        throw new AppError(status.NOT_FOUND, "Employee Not found");
    }

    const pictureFile = files.picture?.[0];
    const authoritySignFile = files.authoritySign?.[0];
    const employeeSignFile = files.employeeSign?.[0];
    const experienceFile = files.experience?.[0];

    const [picture, authoritySign, employeeSign, experience] =
        await Promise.all([
            pictureFile
                ? CloudinaryService.upload(pictureFile, {
                      folder: CloudinaryFolders.employee.profile,
                  })
                : Promise.resolve(null),

            authoritySignFile
                ? CloudinaryService.upload(authoritySignFile, {
                      folder: CloudinaryFolders.employee.authoritySign,
                  })
                : Promise.resolve(null),

            employeeSignFile
                ? CloudinaryService.upload(employeeSignFile, {
                      folder: CloudinaryFolders.employee.employeeSign,
                  })
                : Promise.resolve(null),

            experienceFile
                ? CloudinaryService.upload(experienceFile, {
                      folder: CloudinaryFolders.employee.experience,
                  })
                : Promise.resolve(null),
        ]);

    const uploadedPublicIds = [
        picture?.public_id,
        authoritySign?.public_id,
        employeeSign?.public_id,
        experience?.public_id,
    ].filter((id): id is string => Boolean(id));

    try {
        const updatedEmployee = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: employee.userId },
                data: {
                    ...(payload.fullName !== undefined && {
                        name: payload.fullName,
                    }),

                    ...(payload.employeeRole !== undefined && {
                        role: payload.employeeRole,
                    }),

                    ...(picture && {
                        image: picture.secure_url,
                    }),
                },
            });

            if (payload.address) {
                await tx.address.update({
                    where: { employeeId: employee.id },
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

            return await tx.employee.update({
                where: {
                    id,
                },
                data: {
                    ...(payload.fullName !== undefined && {
                        fullName: payload.fullName,
                    }),

                    ...(payload.phone !== undefined && {
                        phone: payload.phone,
                    }),

                    ...(payload.fatherName !== undefined && {
                        fatherName: payload.fatherName,
                    }),

                    ...(payload.motherName !== undefined && {
                        motherName: payload.motherName,
                    }),

                    ...(payload.gender !== undefined && {
                        gender: payload.gender,
                    }),

                    ...(payload.bloodGroup !== undefined && {
                        bloodGroup: payload.bloodGroup,
                    }),

                    ...(payload.religion !== undefined && {
                        religion: payload.religion,
                    }),

                    ...(payload.employeeRole !== undefined && {
                        employeeRole: payload.employeeRole,
                    }),

                    ...(payload.monthlySalary !== undefined && {
                        monthlySalary: payload.monthlySalary,
                    }),

                    ...(payload.nid !== undefined && {
                        nid: payload.nid,
                    }),

                    ...(payload.dateOfJoining !== undefined && {
                        dateOfJoining: payload.dateOfJoining,
                    }),

                    ...(payload.emergencyContact !== undefined && {
                        emergencyContact: payload.emergencyContact,
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

                    ...(employeeSign && {
                        employeeSign: employeeSign.secure_url,
                        employeeSignPublicId: employeeSign.public_id,
                        ...(employeeSignFile !== undefined && {
                            employeeSignName: employeeSignFile.originalname,
                            employeeSignType: employeeSignFile.mimetype,
                        }),
                    }),

                    ...(experience && {
                        experience: experience.secure_url,
                        experiencePublicId: experience.public_id,
                        ...(experienceFile !== undefined && {
                            experienceName: experienceFile.originalname,
                            experienceType: experienceFile.mimetype,
                        }),
                    }),
                },
                include: {
                    user: true,
                    address: true,
                },
            });
        });

        // delete old cloudinary assets AFTER successful update
        await Promise.all([
            picture &&
                employee.picturePublicId &&
                CloudinaryService.delete(employee.picturePublicId),

            authoritySign &&
                employee.authoritySignPublicId &&
                CloudinaryService.delete(employee.authoritySignPublicId),

            employeeSign &&
                employee.employeeSignPublicId &&
                CloudinaryService.delete(employee.employeeSignPublicId),

            experience &&
                employee.experiencePublicId &&
                CloudinaryService.delete(employee.experiencePublicId),
        ]);

        return formatEmployeeResponse(updatedEmployee);
    } catch (error) {
        // rollback newly uploaded files
        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId).catch(() => {}),
            ),
        );

        throw error;
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
            employeeSignPublicId: true,
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

        employee.employeeSignPublicId
            ? CloudinaryService.delete(employee.employeeSignPublicId)
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
    getEmployeeByIdForUpdate,
    createEmployee,
    updateEmployee,
    deleteEmployee,
};
