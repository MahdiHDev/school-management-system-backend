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

router.get(
    "/employee",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AttendanceController.getEmployeeAttendance,
);

router.patch(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AttendanceController.saveAttendance,
);

router.patch(
    "/employee",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    AttendanceController.saveEmployeeAttendance,
);

export const AttendanceRoutes: Router = router;
