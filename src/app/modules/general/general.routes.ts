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

router.patch(
    "/",
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

router.patch(
    "/:id",
    ...generalSettingsMiddleware,
    GeneralController.updateGeneralSetting,
);

export const GeneralSettingsRoutes: Router = router;
