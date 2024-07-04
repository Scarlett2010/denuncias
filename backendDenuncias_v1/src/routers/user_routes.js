import {Router} from 'express'
const router = Router()
import {
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
} from "../controllers/user_controller.js";
import verificarAutenticacion from '../middlewares/autenticacion.js';

router.post('/login',login)

router.post('/registro',registro)

router.get('/confirmar/:token',confirmEmail)

router.get('/usuarios',listarUsuarios)

router.post('/recuperar-password',recuperarPassword)

router.get('/recuperar-password/:token',comprobarTokenPasword)

router.post('/nuevo-password/:token',nuevoPassword)

router.get('/perfil',verificarAutenticacion,perfil)

router.put('/usuarios/actualizarpassword',verificarAutenticacion,actualizarPassword)

router.get('/usuarios/:id',verificarAutenticacion,detalleUsuario)

router.put('/usuarios/:id',verificarAutenticacion,actualizarPerfil)

export default router