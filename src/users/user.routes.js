import { Router } from "express";
import { check } from "express-validator";
import { getUser, getByIdUser, deleteUser, getUsersByRole, updateUser } from "./user.controller.js";
import { existeUsuarioById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from '../middlewares/validar-roles.js'

 
const router = Router();
 
router.get(
    "/", 
    getUser
);

router.get(
    "/findUser/:id",
    [
        check("id", "No es un ID valido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    getByIdUser
)

router.get(
    "/byRole/:role", 
    check("id", "No es un ID valido").isMongoId(),
    check("id").custom(existeUsuarioById),
    getUsersByRole
);

router.delete(
    "/:id",
    [
        validarJWT,
        tieneRole("TEACHER_ROLE"),
        check("id", "No es un ID valido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos
    ],
    deleteUser   
)

router.put(
    "/:id",
    [
        validarJWT, 
        check("id", "No es un ID válido").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos,
    ],
    updateUser
);

 
export default router;