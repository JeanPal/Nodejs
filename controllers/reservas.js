const { response } = require('express');
const Reserva = require('../models/reserva');
const { validationResult } = require('express-validator');
const { enviarCorreo } = require('../helpers/mailer');


const disponibilidad = async(req, res = response ) =>{

    const { fecha } = req.query;

    if (!fecha) {
        return res.status(400).json({ msg: 'La fecha es requerida' });
    }

    try {
        const reservas = await Reserva.find({
            fecha: new Date(fecha),
            reservadoD: false 
        });

        const openingTime = process.env.BUSINESS_OPENING_TIME;
        const closingTime = process.env.BUSINESS_CLOSING_TIME;

        res.json({
            openingTime,
            closingTime,
            reservas
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error en el servidor'
        });
    }
}

const ReclamarReservas = async(req, res = response ) =>{

    const { idReservaD } = req.params;
    const { numeroPersonas, datosAdicionales = '' } = req.body;

    // Validación de los campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const reserva = await Reserva.findById(idReservaD);

        if (!reserva) {
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        }

        if (reserva.reservadoD) {
            return res.status(400).json({ msg: 'La reserva ya ha sido reclamada' });
        }

        // OJO Marca la reserva como reservada y agregar los datos adicionales
        reserva.reservadoD = true;
        reserva.cliente = req.usuario._id; 
        reserva.numeroPersonas = numeroPersonas; 
        reserva.datosAdicionales = datosAdicionales; 
        
        await reserva.save();

         await enviarCorreo(req.usuario.email, 'Reserva Reclamada', 'Tu reserva ha sido Reclamada.');

        res.json({ msg: 'Reserva reclamada con éxito', reserva });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
}

const ModificarReservas = async(req, res = response ) =>{

    const { id } = req.params;
    const { numeroPersonas, datosAdicionales, nuevaIdReserva } = req.body;

    try {
        const reserva = await Reserva.findById(id);
        if (!reserva) {
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        }

        if (String(reserva.cliente) !== String(req.usuario._id) && req.usuario.rol !== 'ADMIN_ROLE') {
            return res.status(403).json({ msg: 'No tienes permiso para modificar esta reserva' });
        }

        if (nuevaIdReserva && nuevaIdReserva === id) {
            return res.status(400).json({ msg: 'Debe ser un ID de reserva diferente' });
        }

        if (nuevaIdReserva) {
            try {
                const nuevaReserva = await Reserva.findById(nuevaIdReserva);
                if (!nuevaReserva) {
                    return res.status(404).json({ msg: 'Nueva reserva no encontrada' });
                }

                nuevaReserva.cliente = req.usuario._id;
                nuevaReserva.numeroPersonas = numeroPersonas || nuevaReserva.numeroPersonas;
                nuevaReserva.datosAdicionales = datosAdicionales || nuevaReserva.datosAdicionales;
                nuevaReserva.reservadoD = true;

                await nuevaReserva.save();
                await enviarCorreo(req.usuario.email, 'Reserva Modificada', 'Tu reserva ha sido modificada.');

                reserva.cliente = null; 
                reserva.numeroPersonas = null; 
                reserva.reservadoD = false; 
                await reserva.save();
            } catch (error) {
                if (error.name === 'CastError') {
                    return res.status(400).json({ msg: 'ID de reserva no válida' });
                }
                return res.status(500).json({ msg: 'Error en el servidor' });
            }
        } else {
            if (numeroPersonas !== undefined) reserva.numeroPersonas = numeroPersonas;
            if (datosAdicionales !== undefined) reserva.datosAdicionales = datosAdicionales;
        }

        await reserva.save();
        res.json({ msg: 'Reserva actualizada con éxito', reserva });
    } catch (error) {
        const errorMsg = error.name === 'CastError' ? 'ID de reserva no válida' : 'Error en el servidor';
        console.log(error);
        res.status(error.name === 'CastError' ? 400 : 500).json({ msg: errorMsg });
    }
};

const EliminarReservas = async(req, res = response ) =>{

    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).json({ msg: 'Verifique la ID de la reserva' });
        }
    
        // Buscar la reserva
        const reserva = await Reserva.findById(id);
    
        if (!reserva || !reserva.reservadoD) {
            return res.status(404).json({ msg: 'Reserva no encontrada o ya eliminada' });
        }
    
        if (req.usuario.rol !== 'ADMIN_ROLE') {
            if (!reserva.cliente || reserva.cliente.toString() !== req.usuario._id.toString()) {
                return res.status(401).json({ msg: 'No tienes permiso para eliminar esta reserva' });
            }
        }
    
        reserva.reservadoD = false;
        reserva.cliente = null;
        reserva.numeroPersonas = null;
        reserva.datosAdicionales = '';
        await reserva.save();
    
        await enviarCorreo(req.usuario.email, 'Reserva Eliminada', 'Confirmamos que tu reserva ha sido eliminada.');
    
        res.json({ msg: 'Reserva eliminada correctamente' });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
    
}

const MisReservas = async(req, res = response ) =>{

    try {
        const esAdmin = req.usuario.rol === 'ADMIN_ROLE';
        const usuarioId = esAdmin ? {} : { cliente: req.usuario.id };
    
        const reservas = await Reserva.find({ ...usuarioId, reservadoD: true });
    
        if (!reservas.length) {
            const mensaje = esAdmin ? 'No hay reservas programadas' : 'No tienes reservas programadas';
            return res.status(404).json({ msg: mensaje });
        }
    
        res.json({
            msg: esAdmin ? 'Reservas encontradas para Admins' : 'Reservas encontradas',
            reservas
        });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
    
}



module.exports = {
    disponibilidad,
    ReclamarReservas,
    ModificarReservas,
    MisReservas,
    EliminarReservas
}
