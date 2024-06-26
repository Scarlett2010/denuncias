// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';

import router from './routers/user_routes.js';
// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
app.set('port',process.env.port || 3000)
app.use(cors())

// Middlewares 
app.use(express.json())


// Variables globales
app.use("/api", router);

// Rutas 
app.get('/',(req,res)=>{
    res.send("Server on")
})

// Exportar la instancia de express por medio de app
export default  app