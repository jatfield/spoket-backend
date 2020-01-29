'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const riderSchema = new Schema ({
  image: {type: String},
  name: {type: String},
  bike: {
    model: {type: String},
    make: {type: String},
    year: {type: Number}},
  tripsActive: [{type: mongoose.Types.ObjectId, ref: 'Trip'}],
  tripsTaken: [{type: mongoose.Types.ObjectId, ref: 'Trip'}],
  tripsCreated: [{type: mongoose.Types.ObjectId, ref: 'Trip'}]
});


module.exports = mongoose.model('Rider', riderSchema);