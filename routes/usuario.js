/*jshint esversion: 6 */

// -- REQUIRES -- //
var express = require('express');
var bcrypt = require('bcryptjs');

// -- MODELS -- //
var Usuario = require('../models/usuario');

// Inicializar variables
var app = express();
var mdAutnticacion = require('../middlewares/autenticacion');

// -- ROUTES -- //

// ==========================
// Obtoner todos los usuarios
// ==========================
app.get( '/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error cargando usuario',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error buscando total de usuarios',
                            errors: err
                        });
                    }
                    
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });

                });

            }
        );

});

// -- Requieren token -- //

// ======================
// Crear un nuevo usuario
// ======================
app.post('/', mdAutnticacion.verificarToken, (req, res) => {

    var body = req.body; // IMPORTANT: sólo funciona si está instalado el body-parser

    var usuario = new Usuario ({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10 ),
        img: body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

// =====================
// Actualizar un usuario
// =====================
app.put('/:id', mdAutnticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, ( err, usuario ) => {
        
        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }
        
        if ( !usuario ) {
            return res.status(400).json({
                ok: false,
                message: `El usuario con el id ${ id } no existe`,
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( ( err, usuarioGuardado) => {

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });

    });

});

// ========================
// Borrar usuario por el id
// ========================
app.delete('/:id', mdAutnticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove( id, ( err, usuarioBorrado ) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar usuario',
                errors: err
            });
        }
        
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                message: `El usuario con el id ${ id } no existe`,
                errors: { message: 'No existe un usuario con ese ID' } 
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

// -- EXPORTS -- //
module.exports = app;