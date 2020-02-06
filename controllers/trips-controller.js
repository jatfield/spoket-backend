'use strict';

const Trip = require('../models/trip');

const getTrip = async (req, res, next) => {
  let trip;

  try {
    trip = await Trip.findOne();
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trip');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({trip});

}

exports.getTrip = getTrip;