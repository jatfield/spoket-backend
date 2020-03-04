'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const spokeSchema = new Schema ({
  image: {
    key: {type: String},
    info: {    
      manufacturer: {type: String},
      model: {type: String},
      taken: {type: Date},
      lat:  {type: Number},
      lng:  {type: Number}
    }
  },
  verified: {type: Date},
  location: {    
    lat:  {type: Number, required: true},
    lng:  {type: Number, required: true}
  },
  rating: {type: Number},
  spot: {type: mongoose.Types.ObjectId, required: true, ref: 'Spot'},
}, {timestamps: true});

const wheelSchema = new Schema ({
  rider: {type: mongoose.Types.ObjectId, required: true, ref: 'Rider'},
  trip: {type: mongoose.Types.ObjectId, required: true, ref: 'Trip'},
  spokes: [spokeSchema],
  rating: {type: Number},
  approved: {type: Boolean, required: true, default: true},
  completed: {type: Date}
}, {timestamps: true});

module.exports = mongoose.model('Wheel', wheelSchema);