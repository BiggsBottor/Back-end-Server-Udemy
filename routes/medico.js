/*jshint esversion: 6 */
/*jshint esversion: 8 */

// -- REQUIRES -- //
var express = require('express');

// -- MODELS -- //
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Inicializar variables
var app = express();
var mdAutnticacion = require('../middlewares/autenticacion');

// -- ROUTES -- //

// =========================
// Obtoner todos los médicos
// =========================
app.get( '/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .populate({ path: 'hospital', populate: ({
                path: 'usuario', models: 'usuario', select: 'nombre email'
            })
        })
        .exec( 
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error cargando médicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'Error buscando total de usuarios',
                            errors: err
                        });
                    }
                    
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });

                });

            }
        );
});

// -- Requieren token -- //

// =====================
// Crear un nuevo médico
// =====================
app.post('/', mdAutnticacion.verificarToken, async (req, res) => {

    var body = req.body;

    var _hospital = body.hospital; // IMPORTANT: enviar desde ForntEnd SÓLO el ID, sino usar body.hospital._id


    var existeHospital = await Hospital.exists( { _id: _hospital } );

    if (!existeHospital) {
        return res.status(400).json({
            ok: false,
            message: `El hospital con el id ${ _hospital } no existe`,
            errors: { message: 'No existe un hospital con ese ID' }
        });
    } else {

        var medico = new Medico ({
            nombre: body.nombre,
            usuario: req.usuario._id,
            hospital: _hospital 
        });

        medico.save( (err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al crear médico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    }

});

// ====================
// Actualizar un médico
// ====================
app.put('/:id', mdAutnticacion.verificarToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById( id, ( err, medico ) => {
        
        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar médico',
                errors: err
            });
        }
        
        if ( !medico ) {
            return res.status(400).json({
                ok: false,
                message: `El médico con el id ${ id } no existe`,
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( ( err, medicoGuardado) => {

            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar el médico',
                    errors: err
                });
            }
            
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

// =======================
// Borrar médico por el id
// =======================
app.delete('/:id', mdAutnticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove( id, ( err, medicoBorrado ) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar el médico',
                errors: err
            });
        }
        
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                message: `El médico con el id ${ id } no existe`,
                errors: { message: 'No existe un médico con ese ID' } 
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});

// -- EXPORTS -- //
module.exports = app;