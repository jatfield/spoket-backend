'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const spotSchema = new Schema ({
  image: {type: String},
  description: {type: String},
  reward: {type: String},
  name: {type: String},
  location: {    
    lat:  {type: Number, required: true},
    lng:  {type: Number, required: true}
  },
  ratings: [{rating: {type: Number}, rider: {type: mongoose.Types.ObjectId, ref: 'Rider'}}],
  flagged: [{rider: {type: mongoose.Types.ObjectId, ref: 'Rider'}, time: {type: Date}, reason: {type: String}}]
});

const tripSchema = new Schema ({
  creator: {
    rider: {type: mongoose.Types.ObjectId, required: true, ref: 'Rider'}, 
    bike: {model: {type: String}, make: {type: String}, year: {type: Number}}},
  name: {type: String, required: true},
  description: {type: String, required: true},
  countries: [{type: mongoose.Types.ObjectId, ref: 'Country'}],
  origin: {    
    lat:  {type: Number, required: true},
    lng:  {type: Number, required: true}
  },
  spots: [spotSchema],
  participation: {type: String, enum: ['open', 'invitational', 'approval'], required: true},
  wheels: [{type: mongoose.Types.ObjectId, ref: 'Wheel'}],
  confirmation: {type: String, enum: ['none', 'photo', 'manual'], required: true},
  live: {from: {type: Date, required: true}, till: {type: Date, required: true}},
  ratings: [{rating: {type: Number}, rider: {type: mongoose.Types.ObjectId, ref: 'Rider'}}],
  rating: {type: Number}
});

module.exports = mongoose.model('Trip', tripSchema);