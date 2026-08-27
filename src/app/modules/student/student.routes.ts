import { Router } from "express";
import { UserRole } from "../../../generated/browser";
import { checkAuth } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { studentController } from "./student.controller";

const router = Router();

router.get(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    studentController.getAllStudent,
);

router.get(
    "/:id/update",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    studentController.getStudentForUpdate,
);

router.post(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    upload.fields([
        {
            name: "picture",
            maxCount: 1,
        },
        {
            name: "authoritySign",
            maxCount: 1,
        },
        {
            name: "studentSign",
            maxCount: 1,
        },
        {
            name: "guardianSign",
            maxCount: 1,
        },
    ]),
    studentController.createStudent,
);

router.patch(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    upload.fields([
        {
            name: "picture",
            maxCount: 1,
        },
        {
            name: "authoritySign",
            maxCount: 1,
        },
        {
            name: "studentSign",
            maxCount: 1,
        },
        {
            name: "guardianSign",
            maxCount: 1,
        },
    ]),
    studentController.updateStudent,
);

router.delete(
    "/:id",
    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    studentController.deleteStudent,
);

export const StudentRoutes: Router = router;
