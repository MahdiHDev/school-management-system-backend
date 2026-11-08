import { Router } from "express";
import { UserRole } from "../../../generated/browser";
import { checkAuth } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { GeneralController } from "./general.controller";

const router = Router();

const generalSettingsMiddleware = [
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    upload.fields([
        {
            name: "instituteLogo",
            maxCount: 1,
        },
    ]),
];

router.get(
    "/general-setting",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    GeneralController.getGeneralSetting,
);

router.get(
    "/bank-informations",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    GeneralController.getAllBankInfo,
);

router.get(
    "/rules-regulations",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    GeneralController.getRulesRegulations,
);

router.patch(
    "/general-setting",
    ...generalSettingsMiddleware,
    GeneralController.updateGeneralSetting,
);

router.patch(
    "/student-rules-regulations",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    GeneralController.updateStudentRulesRegulations,
);

router.patch(
    "/employee-rules-regulations",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    GeneralController.updateEmployeeRulesRegulations,
);

router.post(
    "/bank-information",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    upload.fields([
        {
            name: "bankLogo",
            maxCount: 1,
        },
    ]),
    GeneralController.createBankInfo,
);

router.get(
    "/bank-information/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    GeneralController.getBankInfoById,
);

router.post(
    "/bank-information/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    upload.fields([
        {
            name: "bankLogo",
            maxCount: 1,
        },
    ]),
    GeneralController.createBankInfo,
);

router.patch(
    "/general-setting/:id",
    ...generalSettingsMiddleware,
    GeneralController.updateGeneralSetting,
);

export const GeneralSettingsRoutes: Router = router;
