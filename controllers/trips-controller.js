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

const applyForTrip = async (req, res, next)  => {

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
  trip.participants.push({rider, approved})
  const wheel = new Wheel({trip, rider, approved});

  try {
    await wheel.save();
    await trip.save();
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