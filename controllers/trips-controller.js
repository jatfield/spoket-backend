'use strict';

const Trip = require('../models/trip');
const Rider = require('../models/rider');
const Wheel = require('../models/wheel');
const getFbData = require('../tools/get-fb-data');

const getTrips = async (req, res, next) => {
  let trips;

  try {
    trips = await Trip.find().select('-participants -spots.riders -spots.name -spots.description -spots.ratings -spots.rating -spots.image -spots.reward -spots.flagged');
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trips');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({trips});
};

const getTripForOwner = async (req, res, next) => {
  let creator, trip, wheels;
  let ridersFinished = [];

  try {
    creator = await Rider.findOne({fbId: req.userData.id});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    trip = await Trip.findOne({'creator.rider': creator._id, _id: req.params.tId}).select('participants').populate('participants.rider');
    wheels = await Wheel.find({trip: trip._id, approved: true}).select('rider spokes.verifiedAt');       
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trip');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  for (let index = 0; index < trip.participants.length; index++) {
    let rider = {};
    if (trip.participants[index].completedAt) {
      rider.fbData = await getFbData(trip.participants[index].rider.fbId);
      ridersFinished.push(rider);
    }
  }

  res.status(200).json({trip, ridersFinished});
};

const getTripRole = async (req, res, next) => {
  let rider, trip, role;

  try {
    rider = await Rider.findOne({fbId: req.userData.id});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    trip = await Trip.findById(req.params.tId);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trip');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  if (trip.participants.find((p) => p.rider.equals(rider._id))) role = 'participant'
  if (trip.creator.rider.equals(rider._id)) role = 'creator'

  res.status(200).json({role});
};

exports.getTrips = getTrips;
exports.getTripRole = getTripRole;
exports.getTripForOwner = getTripForOwner;