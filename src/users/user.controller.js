import { response, request } from "express";
import { hash, verify } from "argon2";
import User from '../users/user.model.js';
import jwt from "jsonwebtoken"

export const getUser = async( req = request, res = response ) => {
    try {
        const {limit = 10, desde = 0} = req.query;
        const query = {status: true}
        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query).skip(Number(desde)).limit(Number(limit))
        ])
 
        res.status(200).json({
            sucess: true,
            total,
            users
        })
 
    } catch (e) {
        res.status(400).json({
            sucess: false,
            msg: "Error al buscar usuarios",
            e
        })
    }
}

export const getByIdUser = async( req, res ) => {
    try {
        const {id} = req.params;
 
        const user = await User.findById(id);
 
        if(!user){
            return res.status(404).json({
                sucess:false,
                msg: "El usuario no encontrado o inexistente"
            })
        }
 
        res.status(200).json({
            sucess: true,
            user
        })
 
    } catch (e) {
        res.status(500).json({
            sucess: false,
            msg: "error al buscar usuario",
            e
        })
    }
}


export const deleteUser = async( req, res ) => {
    try {
        const { id } = req.params
        
        const authenticatedUser = req.user;
        
        const token = req.header('x-token')
        
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
        
        if(id == uid){
            const user = await User.findByIdAndUpdate( id, { status: false }, { new: true })
            console.log("HOLA")
            res.status(200).json({
                success: true,
                msg: 'Usuario desacticvado',
                user,
                authenticatedUser
                
            })
        } else{
            return res.status(400).json({
                msg: "El token no es del id asignado"
            })
            
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al desactivar usuario',
            error
        })
    }
}

export const getUsersByRole = async (req = request, res = response) => {
    try {
        const { role } = req.params; 
        const query = { status: true, role }; 

        if (!["TEACHER_ROLE", "STUDENT_ROLE"].includes(role)) {
            return res.status(400).json({
                success: false,
                msg: "Rol no válido. Los roles permitidos son: TEACHER_ROLE, STUDENT_ROLE"
            });
        }

        const users = await User.find(query);

        res.status(200).json({
            success: true,
            users
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            msg: "Error al buscar usuarios por rol",
            error: e.message
        });
    }
};

export const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { _id, email, password, ...data } = req.body; 

        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "No hay token en la petición",
            });
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        if (id !== uid) {
            return res.status(403).json({
                success: false,
                msg: "No tienes permisos para modificar este usuario",
            });
        }

        if (password) {
            data.password = await hash(password);
        }

        const user = await User.findByIdAndUpdate(id, data, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado",
            });
        }

        res.status(200).json({
            success: true,
            msg: "Usuario actualizado correctamente",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error al actualizar usuario",
            error: error.message,
        });
    }
};