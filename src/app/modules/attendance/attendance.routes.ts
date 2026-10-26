import { Router } from "express";
import { UserRole } from "../../../generated/browser";
import { checkAuth } from "../../middleware/auth";
import { AttendanceController } from "./attendance.controller";

const router = Router();

router.get(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AttendanceController.getAttendanceStudents,
);

router.post(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AttendanceController.saveAttendence,
);

export const AttendanceRoutes: Router = router;
