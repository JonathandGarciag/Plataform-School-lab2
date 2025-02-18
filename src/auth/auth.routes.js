import { Router } from "express";
import { login,  registerStudent, registerTeacher } from "./auth.controller.js";
import { registerValidator, loginValidator } from "../middlewares/validator.js";

const router = Router();

router.post(
    '/login',
    loginValidator,
    login
)

router.post(
    '/register/student',
    registerValidator,
    registerStudent
)

router.post(
    '/register/teacher',
    registerValidator,
    registerTeacher
)


export default router;