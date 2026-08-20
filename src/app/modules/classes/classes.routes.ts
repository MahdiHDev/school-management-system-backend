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

router.get(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    ClassesController.getAllClass,
);
router.get(
    "/classes-for-update",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    ClassesController.getAllClassForUpdate,
);
router.get(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    ClassesController.getSingleClass,
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

router.delete(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    ClassesController.deleteClass,
);

export const ClassesRoutes: Router = router;
