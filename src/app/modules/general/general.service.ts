import { Prisma } from "../../../generated/client";
import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { bankInfoSearchableFields } from "./general.constant";
import {
    bankInfoPayload,
    GeneralSettingPayload,
    updateBankInfoPayload,
} from "./general.valdation";

// const updateGeneralSetting = async (
//     payload: GeneralSettingPayload,
//     files: Record<string, UploadFile[]>,
//     id?: string,
// ) => {
//     const instituteLogoFile = files.instituteLogo?.[0];

//     // Upload a new logo only when provided
//     const instituteLogo = instituteLogoFile
//         ? await CloudinaryService.upload(instituteLogoFile, {
//               folder: CloudinaryFolders.general.instituteLogo,
//           })
//         : null;

//     const uploadedPublicIds: string[] = instituteLogo?.public_id
//         ? [instituteLogo.public_id]
//         : [];

//     try {
//         const settingData = {
//             ...(payload.schoolName !== undefined && {
//                 schoolName: payload.schoolName,
//             }),
//             ...(payload.schoolPhone !== undefined && {
//                 schoolPhone: payload.schoolPhone,
//             }),
//             ...(payload.schoolEmail !== undefined && {
//                 schoolEmail: payload.schoolEmail,
//             }),
//             ...(payload.schoolWebsite !== undefined && {
//                 schoolWebsite: payload.schoolWebsite,
//             }),
//             ...(payload.schoolAddress !== undefined && {
//                 schoolAddress: payload.schoolAddress,
//             }),
//             ...(payload.country !== undefined && {
//                 country: payload.country,
//             }),
//             ...(instituteLogo && {
//                 instituteLogo: instituteLogo.secure_url,
//                 schoolLogoPublicId: instituteLogo.public_id,
//                 schoolLogoName: instituteLogoFile!.originalname,
//                 schoolLogoType: instituteLogoFile!.mimetype,
//             }),
//         };

//         let result;

//         if (id) {
//             result = await prisma.generalSettings.update({
//                 where: { id, isDeleted: false },
//                 data: settingData,
//             });
//         } else {
//             if (!instituteLogoFile) {
//                 throw new AppError(
//                     400,
//                     "Institute logo is required when creating general settings",
//                 );
//             }

//             const requiredFields = [
//                 { field: "schoolName", value: payload.schoolName },
//                 { field: "schoolPhone", value: payload.schoolPhone },
//                 { field: "schoolEmail", value: payload.schoolEmail },
//                 { field: "schoolAddress", value: payload.schoolAddress },
//                 { field: "country", value: payload.country },
//             ];

//             const missingFields = requiredFields
//                 .filter(({ value }) => value === undefined)
//                 .map(({ field }) => field);

//             if (missingFields.length > 0) {
//                 throw new AppError(
//                     400,
//                     `Missing required fields: ${missingFields.join(", ")}`,
//                 );
//             }

//             result = await prisma.generalSettings.create({
//                 data: {
//                     ...settingData,
//                     schoolName: payload.schoolName!,
//                     schoolPhone: payload.schoolPhone!,
//                     schoolEmail: payload.schoolEmail!,
//                     schoolAddress: payload.schoolAddress!,
//                     country: payload.country!,
//                 },
//             });
//         }

//         return result;
//     } catch (error) {
//         await Promise.all(
//             uploadedPublicIds.map((publicId) =>
//                 CloudinaryService.delete(publicId),
//             ),
//         );

//         throw error;
//     }
// };

const updateGeneralSetting = async (
    payload: GeneralSettingPayload,
    files: Record<string, UploadFile[]>,
    id?: string,
) => {
    const instituteLogoFile = files.instituteLogo?.[0];

    // Upload a new logo only when provided
    const instituteLogo = instituteLogoFile
        ? await CloudinaryService.upload(instituteLogoFile, {
              folder: CloudinaryFolders.general.instituteLogo,
          })
        : null;

    const uploadedPublicIds: string[] = instituteLogo?.public_id
        ? [instituteLogo.public_id]
        : [];

    try {
        const settingData = {
            ...(payload.schoolName !== undefined && {
                schoolName: payload.schoolName,
            }),
            ...(payload.schoolPhone !== undefined && {
                schoolPhone: payload.schoolPhone,
            }),
            ...(payload.schoolEmail !== undefined && {
                schoolEmail: payload.schoolEmail,
            }),
            ...(payload.schoolWebsite !== undefined && {
                schoolWebsite: payload.schoolWebsite,
            }),
            ...(payload.schoolAddress !== undefined && {
                schoolAddress: payload.schoolAddress,
            }),
            ...(payload.country !== undefined && {
                country: payload.country,
            }),
            ...(instituteLogo && {
                instituteLogo: instituteLogo.secure_url,
                schoolLogoPublicId: instituteLogo.public_id,
                schoolLogoName: instituteLogoFile!.originalname,
                schoolLogoType: instituteLogoFile!.mimetype,
            }),
        };

        let result;

        if (id) {
            // Get the existing logo before updating
            const existingSetting = await prisma.generalSettings.findFirst({
                where: {
                    id,
                    isDeleted: false,
                },
                select: {
                    schoolLogoPublicId: true,
                },
            });

            if (!existingSetting) {
                throw new AppError(404, "General settings not found");
            }

            result = await prisma.generalSettings.update({
                where: { id },
                data: settingData,
            });

            // Delete the old image only after a successful database update
            if (
                instituteLogo &&
                existingSetting.schoolLogoPublicId &&
                existingSetting.schoolLogoPublicId !== instituteLogo.public_id
            ) {
                await CloudinaryService.delete(
                    existingSetting.schoolLogoPublicId,
                );
            }
        } else {
            if (!instituteLogoFile) {
                throw new AppError(
                    400,
                    "Institute logo is required when creating general settings",
                );
            }

            const requiredFields = [
                { field: "schoolName", value: payload.schoolName },
                { field: "schoolPhone", value: payload.schoolPhone },
                { field: "schoolEmail", value: payload.schoolEmail },
                { field: "schoolAddress", value: payload.schoolAddress },
                { field: "country", value: payload.country },
            ];

            const missingFields = requiredFields
                .filter(({ value }) => value === undefined)
                .map(({ field }) => field);

            if (missingFields.length > 0) {
                throw new AppError(
                    400,
                    `Missing required fields: ${missingFields.join(", ")}`,
                );
            }

            result = await prisma.generalSettings.create({
                data: {
                    ...settingData,
                    schoolName: payload.schoolName!,
                    schoolPhone: payload.schoolPhone!,
                    schoolEmail: payload.schoolEmail!,
                    schoolAddress: payload.schoolAddress!,
                    country: payload.country!,
                },
            });
        }

        return result;
    } catch (error) {
        // Roll back the newly uploaded image if the operation fails
        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};

const updateStudentRulesRegulations = async (payload: {
    studentRules: string;
}) => {
    if (!payload.studentRules || payload.studentRules.trim() === "") {
        throw new AppError(400, "Students rules & regulations are required");
    }

    const existingRules = await prisma.rulesRegulations.findFirst({
        where: { type: "STUDENT" },
    });

    if (existingRules) {
        return await prisma.rulesRegulations.update({
            where: { id: existingRules.id },
            data: { content: payload.studentRules },
        });
    } else {
        return await prisma.rulesRegulations.create({
            data: {
                content: payload.studentRules,
                type: "STUDENT",
            },
        });
    }
};

const updateEmployeeRulesRegulations = async (payload: {
    employeeRules: string;
}) => {
    if (!payload.employeeRules || payload.employeeRules.trim() === "") {
        throw new AppError(400, "Employees rules & regulations are required");
    }

    const existingRules = await prisma.rulesRegulations.findFirst({
        where: { type: "EMPLOYEE" },
    });

    if (existingRules) {
        return await prisma.rulesRegulations.update({
            where: { id: existingRules.id },
            data: { content: payload.employeeRules },
        });
    } else {
        return await prisma.rulesRegulations.create({
            data: {
                content: payload.employeeRules,
                type: "EMPLOYEE",
            },
        });
    }
};

const getAllBankInfo = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<Prisma.BankInfoWhereInput>(
        prisma.bankInfo,
        query,
        {
            searchableFields: bankInfoSearchableFields,
        },
    );

    const result = await queryBuilder
        .search()
        .where({ isDeleted: false })
        .paginate()
        .sort()
        .select({
            id: true,
            nameOfBank: true,
            // branchAddress: true,
            accountNumber: true,
            bankLogo: true,
            createdAt: true,
        })
        .execute();

    return result;
};

const getBankInfoById = async (id: string) => {
    const result = await prisma.bankInfo.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        select: {
            id: true,
            nameOfBank: true,
            branchAddress: true,
            accountNumber: true,
            instruction: true,
            bankLogo: true,
            bankLogoName: true,
            bankLogoType: true,
            bankLogoPublicId: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!result) {
        throw new AppError(404, "Bank information not found");
    }

    const { bankLogo, bankLogoName, bankLogoType, bankLogoPublicId, ...rest } =
        result;

    return {
        ...rest,
        bankLogo: {
            bankLogo,
            bankLogoName,
            bankLogoType,
            bankLogoPublicId,
        },
    };
};

const createbankInfo = async (
    payload: bankInfoPayload,
    files: Record<string, UploadFile[]>,
) => {
    const { name, address, accountNumber, instruction } = payload;
    const bankLogoFile = files.bankLogo?.[0];

    if (!bankLogoFile) {
        throw new AppError(400, "Missing Bank Logo Image");
    }

    // Upload a new logo only when provided
    const bankLogo = bankLogoFile
        ? await CloudinaryService.upload(bankLogoFile, {
              folder: CloudinaryFolders.general.bankLogo,
          })
        : null;

    const uploadedPublicIds: string[] = bankLogo?.public_id
        ? [bankLogo.public_id]
        : [];

    if (!bankLogo) {
        throw new AppError(400, "Bank Logo upload failed!");
    }

    try {
        const result = prisma.bankInfo.create({
            data: {
                bankLogo: bankLogo.secure_url,
                bankLogoPublicId: bankLogo.public_id,
                bankLogoName: bankLogo.original_filename,
                bankLogoType: bankLogoFile.mimetype,
                nameOfBank: name,
                branchAddress: address,
                accountNumber: accountNumber,
                ...(instruction && { instruction }),
            },
        });

        return result;
    } catch (error) {
        // Roll back the newly uploaded image if the operation fails
        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};

const updateBankInfo = async (
    id: string,
    payload: updateBankInfoPayload,
    files?: Record<string, UploadFile[]>,
) => {
    const { name, address, accountNumber, instruction } = payload;

    const existingBankInfo = await prisma.bankInfo.findUnique({
        where: {
            id,
        },
    });

    if (!existingBankInfo) {
        throw new AppError(404, "Bank information not found");
    }

    const bankLogoFile = files?.bankLogo?.[0];

    const bankLogo = bankLogoFile
        ? await CloudinaryService.upload(bankLogoFile, {
              folder: CloudinaryFolders.general.bankLogo,
          })
        : null;

    const uploadedPublicIds: string[] = bankLogo?.public_id
        ? [bankLogo.public_id]
        : [];

    try {
        const updateData: Prisma.BankInfoUpdateInput = {
            ...(name && {
                nameOfBank: name,
            }),
            ...(address && {
                branchAddress: address,
            }),
            ...(accountNumber && {
                accountNumber,
            }),
            ...(instruction !== undefined && {
                instruction,
            }),
        };

        if (bankLogo && bankLogoFile) {
            updateData.bankLogo = bankLogo.secure_url;
            updateData.bankLogoPublicId = bankLogo.public_id;
            updateData.bankLogoName = bankLogo.original_filename;
            updateData.bankLogoType = bankLogoFile.mimetype;
        }

        const result = await prisma.bankInfo.update({
            where: {
                id,
            },
            data: updateData,
        });

        // Delete old logo after successful database update
        if (bankLogo && existingBankInfo.bankLogoPublicId) {
            await CloudinaryService.delete(existingBankInfo.bankLogoPublicId);
        }

        return result;
    } catch (error) {
        // Delete newly uploaded logo if database update fails
        await Promise.all(
            uploadedPublicIds.map((publicId) =>
                CloudinaryService.delete(publicId),
            ),
        );

        throw error;
    }
};

const deleteBankInfo = async (id: string) => {
    const existingBankInfo = await prisma.bankInfo.findUnique({
        where: { id },
    });

    if (!existingBankInfo || existingBankInfo.isDeleted) {
        throw new AppError(404, "Bank information not found");
    }

    const result = await prisma.bankInfo.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return result;
};

export const GeneralService = {
    updateGeneralSetting,
    updateStudentRulesRegulations,
    updateEmployeeRulesRegulations,
    getAllBankInfo,
    getBankInfoById,
    createbankInfo,
    updateBankInfo,
    deleteBankInfo,
};
