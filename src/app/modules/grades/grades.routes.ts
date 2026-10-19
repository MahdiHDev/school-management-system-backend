import { Router } from "express";
import { UserRole } from "../../../generated/browser";
import { checkAuth } from "../../middleware/auth";
import { gradesController } from "./grades.controller";

const router = Router();

router.get(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    gradesController.getGradeData,
);

router.put(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    gradesController.updateGradingConfiguration,
);

router.put(
    "/fail-criteria",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    gradesController.updateFailCriteria,
);

export const GradeConfigurationRoutes: Router = router;
