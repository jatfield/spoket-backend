'use strict';

const Trip = require('../models/trip');
const Rider = require('../models/rider');
const Wheel = require('../models/wheel');

const getTrips = async (req, res, next) => {
  let trips;

  try {
    trips = await Trip.find();
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trips');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({trips});
}

const applyForTrip = async (req, res, next)  => {
  if (!req.userData.valid) res.status(401);

  let rider, trip;

  try {
    rider = await Rider.findOne({fbId: req.userData.id});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  if (!rider) {
    console.log(error);
    const errorResponse = new Error('No such rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    trip = await Trip.findById(req.params.tId)
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trip');
    errorResponse.errorCode = 500; 
    return next(errorResponse);    
  }

  const approved = trip.participation === "open" ? true : false;
  const wheel = new Wheel({trip: trip._id, rider: rider._id, approved});

  try {
    await wheel.save();
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error saving wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({wheel})
}

exports.getTrips = getTrips;
exports.applyForTrip = applyForTrip;