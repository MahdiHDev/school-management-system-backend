import { Router } from "express";
import { UserRole } from "../../../generated/enums";
import { checkAuth } from "../../middleware/auth";
import { subjectController } from "./subject.controller";

const router = Router();

router.post(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    subjectController.createSubject,
);

router.patch(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    subjectController.updateSubject,
);

export const subjectRoutes: Router = router;
