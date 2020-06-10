/*jshint esversion: 6 */

// -- REQUIRES -- //
var express = require('express');

// -- MODELS -- //
var Hospital = require('../models/hospital');

// Inicializar variables
var app = express();
var mdAutnticacion = require('../middlewares/autenticacion');

// -- ROUTES -- //

// ============================
// Obtoner todos los hospitales
// ============================
app.get( '/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
            .skip(desde)
            .limit(5)
            .populate('usuario', 'nombre email')
            .exec( 
                (err, hospitales) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error cargando hospital',
                            errors: err
                        });
                    }

                    // Hospital.count({}, (err, conteo) => {
                    Hospital.countDocuments({}, (err, conteo) => {

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                message: 'Error buscando total de usuarios',
                                errors: err
                            });
                        }
                        
                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: conteo
                        });
    
                    });
                }
            );
});

// -- Requieren token -- //

// =======================
// Crear un nuevo hospital
// =======================
app.post('/', mdAutnticacion.verificarToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital ({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });

});

// ======================
// Actualizar un hospital
// ======================
app.put('/:id', mdAutnticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById( id, ( err, hospital ) => {
        
        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar hospital',
                errors: err
            });
        }
        
        if ( !hospital ) {
            return res.status(400).json({
                ok: false,
                message: `El hospital con el id ${ id } no existe`,
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( ( err, hospitalGuardado) => {

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

});

// =========================
// Borrar hospital por el id
// =========================
app.delete('/:id', mdAutnticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove( id, ( err, hospitalBorrado ) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar el hospital',
                errors: err
            });
        }
        
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                message: `El hospital con el id ${ id } no existe`,
                errors: { message: 'No existe un hospital con ese ID' } 
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

// -- EXPORTS -- //
module.exports = app;