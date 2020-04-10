'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const riderSchema = new Schema ({
  image: {type: String},
  nick: {type: String},
  fbId: {type: String},
  bike: {
    model: {type: String},
    make: {type: String},
    year: {type: Number}}
});


module.exports = mongoose.model('Rider', riderSchema);