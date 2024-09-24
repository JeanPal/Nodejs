const express = require('express');
const cors = require('cors');

const { dbConnection } = require('../database/config');
const crearRolesPorDefecto = require('../helpers/init-roles');


class Server {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT;

        this.usuariosPath = '/api/usuarios';
        this.authPath     = '/api/auth';
        this.reservasPath  = '/api/reservas';  
        this.adminReservasPath = '/api/admin-reservas';


        // Conectar a base de datos
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // Crear roles por defecto si no existen
        this.crearRoles();

        // Rutas de mi aplicación
        this.routes();
    }

    async conectarDB() {
        await dbConnection();
    }

    async crearRoles() {
        await crearRolesPorDefecto(); // Llama a la función que inicializa roles
    }


    middlewares() {

        // CORS
        this.app.use( cors() );

        // Lectura y parseo del body
        this.app.use( express.json() );

        // Directorio Publico
        this.app.use( express.static('public') );

    }

    routes() {
        
        this.app.use( this.authPath, require('../routes/auth'));
        this.app.use( this.usuariosPath, require('../routes/usuarios'));
        this.app.use(this.reservasPath, require('../routes/reservas')); 
        this.app.use(this.adminReservasPath, require('../routes/admin-reservas'));
    }

    listen() {
        this.app.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });
    }

}




module.exports = Server;
