import { Router } from "express";
import { UserRole } from "../../../generated/browser";
import { checkAuth } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import { EmployeeController } from "./employees.controller";

const router = Router();

router.get(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    EmployeeController.getAllEmployees,
);
router.get(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    EmployeeController.getEmployeeById,
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
            name: "employeeSign",
            maxCount: 1,
        },
        {
            name: "experience",
            maxCount: 1,
        },
    ]),
    EmployeeController.createEmployee,
);
router.delete(
    "/:id",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    EmployeeController.deleteEmployee,
);

export const EmployeeRoutes: Router = router;
