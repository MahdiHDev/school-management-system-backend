import { Router } from "express";
import { UserRole } from "../../../generated/browser";
import { checkAuth } from "../../middleware/auth";
import { SalaryController } from "./salary.controller";

const router = Router();

router.get(
    "/employees",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    SalaryController.getEmployeeforSalary,
);

router.post(
    "/",
    checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    SalaryController.createSalary,
);

export const salaryRoutes: Router = router;
