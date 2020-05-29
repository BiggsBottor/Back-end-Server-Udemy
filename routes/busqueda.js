/*jshint esversion: 6 */

// -- REQUIRES -- //
var express = require('express');

// -- MODELS -- //
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');

// Inicializar variables
var app = express();

// -- ROUTES -- //

// =================================
// Búsqueda por colección
// =================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'hospitales': 
            promesa = buscarHospitales( regex );
            break;
        case 'medicos': 
            promesa = buscarMedicos( regex );
            break;
        case 'usuarios': 
            promesa = buscarUsuarios( regex );
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda sólo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' } 
            });
    }

    promesa.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data            
        });

    });

});

// =================================
// Búsqueda General
// =================================
app.get( '/todo/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all( [ 
                    buscarHospitales( regex ),
                    buscarMedicos( regex ), 
                    buscarUsuarios( regex ), 
                ] )
            .then( respuestas => {

                res.status(200).json({
                    ok: true,
                    hospitales: respuestas[0],
                    medicos: respuestas[1],
                    usuarios: respuestas[2],
                });

            });

} );

function buscarHospitales( regex ) {
 
    return new Promise( (resolve, reject) => {
        
        Hospital.find({ nombre: regex })
            .populate( 'usuario', 'nombre email' )
            .exec( ( err, hospitales ) => {

                    if (err) {
                        reject('Error buscando hospitales', err);
                    } else {
                        resolve(hospitales);
                    }
        
                }

            );
    });
}

function buscarMedicos( regex ) {
 
    return new Promise( (resolve, reject) => {
        
        Medico.find({ nombre: regex })
            .populate( 'usuario', 'nombre email' )
            .populate('hospital')
            .populate({ path: 'hospital', populate: ({
                    path: 'usuario', models: 'usuario', select: 'nombre email'
                })
            })
            .exec( ( err, medicos ) => {

                if (err) {
                    reject('Error buscando medicos', err);
                } else {
                    resolve(medicos);
                }
        
            }

        );

    });
}

function buscarUsuarios( regex ) {
 
    return new Promise( (resolve, reject) => {
        
        Usuario.find({}, 'nombre email role')
            .or([ { nombre: regex }, { email: regex } ])
            .exec( ( err, usuarios ) => {

                    if (err) {
                        reject('Error buscando usuarios', err);
                    } else {
                        resolve(usuarios);
                    }

                }

            );
    });
}

module.exports = app;