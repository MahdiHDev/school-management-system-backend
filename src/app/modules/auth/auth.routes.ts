import { Router } from "express";
import { UserRole } from "../../../generated/enums";
import { checkAuth } from "../../middleware/auth";
import { AuthController } from "./auth.controller";

const router: Router = Router();

router.post("/login", AuthController.loginUser);
router.post("/test", checkAuth(UserRole.SUPER_ADMIN), (req, res) => {
    res.json({
        message: "Test route is working!",
    });
});
router.get("/ping", (req, res) => {
    res.send("pong");
});

export const AuthRoutes = router;
