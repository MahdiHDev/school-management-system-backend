import { Router } from "express";
import { UserRole } from "../../../generated/enums.js";
import { checkAuth } from "../../middleware/auth.js";
import { userController } from "./user.controller.js";
const userRouter = Router();
userRouter.get("/", checkAuth(UserRole.STUDENT, UserRole.TEACHER), userController.getUsers);
export default userRouter;
//# sourceMappingURL=user.routes.js.map