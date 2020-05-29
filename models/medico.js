/*jshint esversion: 6 */

// -- REQUIRES -- //
var mongoose = require('mongoose');

// -- Definición de variables -- //
var Schema = mongoose.Schema;

// -- Tablas/Schemas -- //
var medicoSchema = new Schema({
    nombre: { type: String, unique: true, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'El id hospital es un campo obligatorio'] }
});

// -- EXPORTS -- //
module.exports = mongoose.model('Medico', medicoSchema);