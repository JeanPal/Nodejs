const Role = require('../models/role'); // Asegúrate de tener el modelo Role importado

const crearRolesPorDefecto = async () => {
    try {
        // Verificar si existen roles
        const existeAdminRole = await Role.findOne({ rol: 'ADMIN_ROLE' });
        const existeUserRole = await Role.findOne({ rol: 'USER_ROLE' });

        // Si no existe el rol ADMIN_ROLE, lo creamos
        if (!existeAdminRole) {
            await Role.create({ rol: 'ADMIN_ROLE' });
            console.log('Rol ADMIN_ROLE creado');
        }

        // Si no existe el rol USER_ROLE, lo creamos
        if (!existeUserRole) {
            await Role.create({ rol: 'USER_ROLE' });
            console.log('Rol USER_ROLE creado');
        }

    } catch (error) {
        console.error('Error creando roles:', error);
    }
};

module.exports = crearRolesPorDefecto;
