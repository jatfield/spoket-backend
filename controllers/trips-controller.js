'use strict';

const Trip = require('../models/trip');
const Rider = require('../models/rider');
const Wheel = require('../models/wheel');

const getTrips = async (req, res, next) => {
  let trips;

  try {
    trips = await Trip.find().select('-spots.riders -spots.name -spots.description -spots.ratings -spots.rating -spots.image -spots.reward -spots.flagged');
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trips');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({trips});
};

exports.getTrips = getTrips;