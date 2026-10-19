import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { ClassesRoutes } from "../modules/classes/classes.routes";
import { EmployeeRoutes } from "../modules/employees/employees.routes";
import { GeneralSettingsRoutes } from "../modules/general/general.routes";
import { GradeConfigurationRoutes } from "../modules/grades/grades.routes";
import { StudentRoutes } from "../modules/student/student.routes";
import { subjectRoutes } from "../modules/subjects/subject.routes";

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
    {
        path: "/student",
        route: StudentRoutes,
    },
    {
        path: "/settings",
        route: GeneralSettingsRoutes,
    },
    {
        path: "/settings/grades",
        route: GradeConfigurationRoutes,
    },
    {
        path: "/subjects",
        route: subjectRoutes,
    },
];

moduleRoutes.forEach((route) => routes.use(route.path, route.route));

export default routes;
