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

export const updateUser = async( req, res = response ) => {
    try {
        
        const { id } = req.params;
        const { _id,  email, ...data } = req.body;
        const encryptedPassword = await hash (data.password);

        const user = await Usuario.findByIdAndUpdate(id, data, {new: true});

        res.status(200).json({
            success: true,
            msg: 'Usuario Actualizado',
            user
        })

    } catch (error) {
        res.status(500).json({
            sucess: false,
            msg: 'Error al actualizar usuario',
            error
        })
    }
}
