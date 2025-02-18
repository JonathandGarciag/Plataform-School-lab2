import { Router } from "express";
import { check } from "express-validator";
import { createCourse, updateCourse, deleteCourse, getCourses, joinCourse, getStudentCourses } from "../course/course.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router();

const validarTeacherRole = [validarJWT, (req, res, next) => {
    if (!req.user || req.user.role !== "TEACHER_ROLE") {
        return res.status(403).json({ msg: "Acceso denegado. Solo profesores pueden realizar esta acción." });
    }
    next();
}];

router.post(
    "/",
    [
        validarTeacherRole,
        check("nameCourse", "El nombre del curso es obligatorio").not().isEmpty(),
        check("description", "La descripción es obligatoria").not().isEmpty(),
        validarCampos
    ],
    validarTeacherRole,
    createCourse
);

router.put(
    "/:id", 
    validarTeacherRole, 
    updateCourse
);

router.delete(
    "/:id", 
    validarTeacherRole,
    deleteCourse
);

router.get(
    "/", 
    validarTeacherRole, 
    getCourses
);


router.post(
    "/join/:id", 
    validarJWT, 
    joinCourse
);

router.get(
    "/student", 
    validarJWT, 
    getStudentCourses
);


export default router;
