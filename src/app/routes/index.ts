import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { ClassesRoutes } from "../modules/classes/classes.routes";
import { EmployeeRoutes } from "../modules/employees/employees.routes";

const routes: ExpressRouter = Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: AuthRoutes,
    },
    {
        path: "/employees",
        route: EmployeeRoutes,
    },
    {
        path: "/classes",
        route: ClassesRoutes,
    },
];

moduleRoutes.forEach((route) => routes.use(route.path, route.route));

export default routes;
