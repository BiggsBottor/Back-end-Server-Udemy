/*jshint esversion: 6 */
/*jshint esversion: 8 */

// -- REQUIRES -- //
var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

// -- MODELS -- //
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');

// Inicializar variables
var app = express();

// default options
app.use(fileUpload());

// -- ROUTES -- //
app.put( '/:tipo/:id', async (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección
    var validTypes = ['hospitales', 'medicos', 'usuarios'];

    if ( validTypes.indexOf( tipo ) < 0 ) {
        return res.status(400).json({
            ok: false,
            message: 'Error de tipo de colección no válida',
            errors: { message: 'Los tipos válidos son: ' + validTypes.join(', ') }
        });
    }

    // validación de archivo vacío
    if ( !req.files ) {
        return res.status(400).json({
            ok: false,
            message: 'Error cargando archivo',
            errors: { message: 'Debe de selecionar una imagen' }
        });
    }

    // Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var splitName = archivo.name.split('.');
    var fileExtension = splitName[splitName.length - 1];

    // Extensiones aceptadas
    var ValidExtensions = ['png', 'jpg', 'jpeg', 'gif'];

    if ( ValidExtensions.indexOf( fileExtension ) < 0 ) {
        return res.status(400).json({
            ok: false,
            message: 'Extension de archivo no válida',
            errors: { message: 'Las extensiones válidas son: ' + ValidExtensions.join(', ') }
        });
    }

     // Validacion de ID existente según el modelo
     var Modelo;
     var errTipo; // para mostrar el tipo de modelo en singular en el mensaje de error

     switch (tipo) {
         case 'usuarios':
             Modelo = Usuario;
             errTipo = 'usuario';
             break;
         case  'medicos':
             Modelo = Medico;
             errTipo = 'médico';
             break;
         case 'hospitales':
             Modelo = Hospital;
             errTipo = 'hospital';
             break;
         default:
             break;
     }

     var idExiste = await Modelo.exists({ _id: id });

     if (!idExiste) {
         return res.status(400).json({
             ok: false,
             mensaje: 'Error de ID inexistente',
             errors: { message: `El ${ errTipo } no existe` }
         });
     }

    // Nombre de archivo personalizado
    var fileName = `${ id }-${ new Date().getMilliseconds() }.${ fileExtension }`;

    // Mover el archivo del temporal a un Path
    var path = `./uploads/${ tipo }/${ fileName }`;

    archivo.mv( path, err => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                errors: err
            });
        }

        uploadByType( tipo, id, fileName, res );

    });

} );

function uploadByType( tipo, id, fileName, res ) {

    switch( tipo ) {
        case 'usuarios':
            
            Usuario.findById( id, (err, usuario) => {
 
                var oldPath = './uploads/usuarios/' + usuario.img;

                // Si existe, elimina la imagen anterior
                if ( fs.existsSync(oldPath) ) { fs.unlinkSync( oldPath ); }

                usuario.img = fileName;

                usuario.save( (err, updatedUser) => {

                    updatedUser.password = ':)';

                    return res.status(200).json({
                        ok: true,
                        message: 'Imagen de usuario actualizada',
                        usuario: updatedUser
                    });

                });

            });

            break;
        case 'hospitales':

            Hospital.findById( id, (err, hospital) => {
                
                var oldPath = './uploads/hospitales/' + hospital.img;

                // Si existe, elimina la imagen anterior
                if ( fs.existsSync(oldPath) ) { fs.unlinkSync( oldPath ); }

                hospital.img = fileName;

                hospital.save( (err, updatedHospital) => {

                    return res.status(200).json({
                        ok: true,
                        message: 'Imagen de hospital actualizada',
                        hospital: updatedHospital
                    });

                });

            });

            break;
        case 'medicos':

            Medico.findById( id, (err, medico) => {

                var oldPath = './uploads/medicos/' + medico.img;

                // Si existe, elimina la imagen anterior
                if ( fs.existsSync(oldPath) ) { fs.unlinkSync( oldPath ); }
                
                medico.img = fileName;

                medico.save( (err, updatedMedico) => {

                    return res.status(200).json({
                        ok: true,
                        message: 'Imagen de medico actualizada',
                        medico: updatedMedico
                    });

                });
                
            });

            break;
    }

}

module.exports = app;