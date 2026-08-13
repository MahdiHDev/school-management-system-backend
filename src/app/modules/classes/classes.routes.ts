import { Router } from "express";
import { UserRole } from "../../../generated/enums";
import { checkAuth } from "../../middleware/auth";
import { ClassesController } from "./classes.controller";

const router = Router();

router.get(
    "/teachers",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    ClassesController.getAllTeachers,
);

router.post(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    ClassesController.createClass,
);

router.patch(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    ClassesController.udpateClass,
);

export const ClassesRoutes: Router = router;
