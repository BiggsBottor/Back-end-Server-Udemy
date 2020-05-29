/*jshint esversion: 6 */

// -- REQUIRES -- //
var mongoose = require('mongoose');

// -- Definición de variables -- //
var Schema = mongoose.Schema;

// -- Tablas/Schemas -- //
var hospitalSchema = new Schema({

    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }

}, { collection: 'hospitales' });

// -- EXPORTS -- //
module.exports = mongoose.model('Hospital', hospitalSchema);