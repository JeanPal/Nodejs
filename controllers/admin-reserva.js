const { response } = require('express');
const Reserva = require('../models/reserva');


const CrearReservasAdmin = async(req, res = response ) =>{
    const { fecha, hora, descripcion } = req.body;

    try {
        const reserva = new Reserva({
            usuario: req.usuario._id, 
            fecha,
            hora,
            descripcion
        });

        await reserva.save();
        res.status(201).json(reserva);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error en el servidor'
        });
    }
}

const EliminarReservasAdmin = async(req, res = response ) =>{
    const { id } = req.params;
    console.log('ID recibido:', id);
    try {
        const reserva = await Reserva.findByIdAndDelete(id);
        if (!reserva) {
            return res.status(404).json({ msg: 'Reserva no encontradaa' });
        }
        res.json({ msg: 'Reserva eliminada', reserva });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
}


module.exports = {
    CrearReservasAdmin,
    EliminarReservasAdmin
}