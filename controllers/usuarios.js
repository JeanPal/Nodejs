const { response, request } = require('express');
const bcryptjs = require('bcryptjs');


const Usuario = require('../models/usuario');



const usuariosGet = async(req = request, res = response) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, usuarios ] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);

    res.json({
        total,
        usuarios
    });
}

// Obtener los correos electrónicos de administradores desde el .env
const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
console.log('Admin Emails:', adminEmails);

const usuariosPost = async(req, res = response) => {
    
    const { nombre, correo, password, telefono } = req.body;
    const usuario = new Usuario({ nombre, correo, password, telefono});

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync( password, salt );

    // Guardar en BD
    await usuario.save();

        // Verificar si el correo está en la lista de administradores y actualizar el rol si es necesario
        if (adminEmails.includes(correo)) {
            await Usuario.findByIdAndUpdate(usuario._id, { rol: 'ADMIN_ROLE' }, { new: true });
        }

    res.json({
        usuario
    });
}

const usuariosPut = async(req, res = response) => {

    const { id } = req.params;
    const { _id, password, google, correo, ...resto } = req.body;

    if ( password ) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync( password, salt );
    }

    const usuario = await Usuario.findByIdAndUpdate( id, resto );

    res.json(usuario);
}

const usuariosPatch = (req, res = response) => {
    res.json({
        msg: 'patch API - usuariosPatch'
    });
}

const usuariosDelete = async(req, res = response) => {

    const { id } = req.params;

    // Buscar el usuario por ID
    const usuario = await Usuario.findById(id);

    if (!usuario) {
        return res.status(404).json({
            msg: 'Usuario no encontrado'
        });
    }

    // Verificar si el usuario ya esta eliminado
    if (!usuario.estado) {
        return res.status(400).json({
            msg: 'Este usuario ya se encuentra eliminado',
            usuario
        });
    }

    // Si el usuario esta activo, actualizar su estado a false (eliminado)
    await Usuario.findByIdAndUpdate(id, { estado: false });

    res.json({
        msg: 'Usuario eliminado correctamente',
        usuario
    });
}




module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosPatch,
    usuariosDelete,
}