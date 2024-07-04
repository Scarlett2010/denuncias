import {sendMailToUser, sendMailToRecoveryPassword } from "../config/nodemaile.js"
import generarJWT from "../helpers/JWT.js"
import User from "../models/user.js";
import mongoose from "mongoose"; 


const login = async (req,res)=>{
    //: ACTIVIDAD 1
    const {email,password} = req.body

    //: ACTIVIDAD 2
    // Validar campos vaíos
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"}) 
    // Validar confirmación de la cuenta
    const userBDD = await User.findOne({email})
    if (userBDD?.confirmEmail === false) return res.status(403).json({msg:"Lo sentimos, debes verificar tu cuenta"})
    // Validar el email
    if (!userBDD) return res.status(404).json({msg:"Lo sentimos, el email no existe"})
    // Validar la contraseña
    const verificartPassword = await userBDD.matchPassword(password)
    if (!verificartPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
    //: ACTIVIDAD 3 
    const token = generarJWT(userBDD._id,"user")
    const {username,_id} = userBDD
    //: ACTIVIDAD 4
    res.status(200).json({
        token,
        username,
        password,
        _id,
        email:userBDD.email
    })
}

const perfil=(req,res)=>{
    delete req.userBDD.token
    delete req.userBDD.confirmEmail
    delete req.userBDD.createdAt
    delete req.userBDD.updatedAt
    delete req.userBDD.__v
    res.status(200).json(req.userBDD)
}

const registro = async (req,res)=>{
    const {email,password} = req.body
    //: ACTIVIDAD 2
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const verificarEmailBDD = await User.findOne({email})
    if (verificarEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    //: ACTIVIDAD 3
    const nuevoUsuario = new User(req.body)
    nuevoUsuario.password = await nuevoUsuario.encrypPassword(password)
    const token = nuevoUsuario.crearToken()
    await sendMailToUser(email,token)
    await nuevoUsuario.save()
    //: ACTIVIDAD 4
    res.status(200).json({mg:"Revisa tu correo electrónico para confirmar tu cuenta"})
}

const confirmEmail = async(req,res)=>{
    //: ACTIVIDAD 1 - 2
    if(!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})

        const userBDD = await User.findOne({token:req.params.token})
        if(!userBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    
        //: ACTIVIDAD 3
        userBDD.token = null
        userBDD.confirmEmail=true
        await userBDD.save()
    
        //: ACTIVIDAD 4
        res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"}) 
    
}

const listarUsuarios = (req,res)=>{
    res.status(200).json({res:'lista de usuarios'})
}

const detalleUsuario = async (req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    const userBDD = await User.findById(id).select("-password")
    if(!userBDD) return res.status(404).json({msg:`Lo sentimos, no existe el User ${id}`})
    res.status(200).json({msg:userBDD})
}

const actualizarPerfil = async(req,res)=>{
    const {id} = req.params
    if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`Lo sentimos, debe ser un id válido`});
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const userBDD = await User.findById(id)
    if(!userBDD) return res.status(404).json({msg:`Lo sentimos, no existe el usuario ${id}`})
    if (userBDD.email !=  req.body.email)
    {
        const userBDDMail = await User.findOne({email:req.body.email})
        if (userBDDMail)
        {
            return res.status(404).json({msg:`Lo sentimos, el existe ya se encuentra registrado`})  
        }
    }
        userBDD.email = req.body.email || userBDD?.email
    userBDD.username = req.body.username  || userBDD?.username
    userBDD.password = req.body.password ||  userBDD?.password
    await userBDD.save()
    res.status(200).json({msg:"Perfil actualizado correctamente"})
}

const actualizarPassword = async(req,res)=>{
    const userBDD = await User.findById(req.userBDD._id)
    if(!userBDD) return res.status(404).json({msg:`Lo sentimos, no existe el usuario ${id}`})
    const verificarPassword = await userBDD.matchPassword(req.body.passwordactual)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password actual no es el correcto"})
    userBDD.password = await userBDD.encrypPassword(req.body.passwordnuevo)
    await userBDD.save()
    res.status(200).json({msg:"Password actualizado correctamente"})
}

const recuperarPassword= async(req,res)=>{
    const {email} = req.body
    //: ACTIVIDAD 2
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const userBDD = await User.findOne({email})
    if(!userBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    //: ACTIVIDAD 3
    const token = userBDD.crearToken()
    userBDD.token = token 
    await sendMailToRecoveryPassword(email,token)
    await userBDD.save()
    //: ACTIVIDAD 4
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}

const comprobarTokenPasword= async(req,res)=>{
    //:ACTIVIDAD 1 y 2
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        const userBDD = await User.findOne({token:req.params.token})
        if(userBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        //: ACTIVIDAD 3 
        await userBDD.save()
        //: Actividad 4
        res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}

const nuevoPassword= async (req,res)=>{
    const{password,confirmpassword} = req.body
    //: ACTIVIDAD 2 
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const userBDD = await user.findOne({token:req.params.token})
    if(userBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //: ACTIVIDAD 3 
    userBDD.token = null
    userBDD.password = await userBDD.encrypPassword(password)
    await userBDD.save()
    //: ACTIVIDAD 4 
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

export {
    login,
    perfil,
    registro,
    confirmEmail,
    listarUsuarios,
    detalleUsuario,
    actualizarPerfil,
    actualizarPassword,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword
}