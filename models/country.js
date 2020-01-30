'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
//http://www.fema-online.eu/website/index.php/consumer-information/riding-abroad/
const countrySchema = new Schema ({
  name: {type: String},
  flag: {type: String},
  speeds: {motorway: {type: Number}, urban: {type: Number}, country: {type: Number}},
  equipment: [{type: String}],
  clothing: [{type: String}],
  filtering: {type: Boolean},
  buslanes: {type: Boolean},
  towing: {type: Boolean},
  tolls: {motorway: {type: Boolean}, country: {type: Boolean}}
}, {timestamps: true});


module.exports = mongoose.model('Country', countrySchema);