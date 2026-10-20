import { CloudinaryService } from "../../../services/cloudinary";
import { UploadFile } from "../../../services/cloudinary/cloudinary.interface";
import { CloudinaryFolders } from "../../config/cloudinary.folders";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { bankInfoPayload, GeneralSettingPayload } from "./general.valdation";

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

const createbankInfo = async (
    payload: bankInfoPayload,
    files: Record<string, UploadFile[]>,
) => {
    const { name, address, accountNumber, instruction } = payload;
    const bankLogoFile = files.instituteLogo?.[0];

    if (!bankLogoFile) {
        throw new AppError(400, "Missing Authority Sign Image");
    }

    // Upload a new logo only when provided
    const instituteLogo = bankLogoFile
        ? await CloudinaryService.upload(bankLogoFile, {
              folder: CloudinaryFolders.general.bankLogo,
          })
        : null;

    const uploadedPublicIds: string[] = instituteLogo?.public_id
        ? [instituteLogo.public_id]
        : [];

    try {
        const result = prisma.bankInfo.create({
            data: {
                bankLogo: "hello",
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

export const GeneralService = {
    updateGeneralSetting,
    updateStudentRulesRegulations,
    updateEmployeeRulesRegulations,
    createbankInfo,
};
