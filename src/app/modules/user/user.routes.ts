import { Router } from "express";
import { UserRole } from "../../../generated/enums";
import { checkAuth } from "../../middleware/auth";
import { userController } from "./user.controller";

const userRouter: Router = Router();

userRouter.get(
  "/",
  checkAuth(UserRole.STUDENT, UserRole.TEACHER),
  userController.getUsers,
);

export default userRouter;
