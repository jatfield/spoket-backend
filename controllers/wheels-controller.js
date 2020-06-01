'use strict';

const Wheel = require('../models/wheel');
const Rider = require('../models/rider');
const Trip = require('../models/trip');

const getWheel = async (req, res, next) => {
  const wId = req.params.wId;
  let wheel;

  try {
    wheel = await Wheel.findById(wId).populate("trip");    
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({wheel});
};

const getWheelsByRider = async (req, res, next) => {
  let rider, wheels;

  try {
    rider = await Rider.findById(req.userData.spoketId);    
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    wheels = await Wheel.find({rider: rider._id, approvedAt: { $ne: null }}).populate('trip', 'spots origin description name');       
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting wheel');
    errorResponse.errorCode = 500;
    return next(errorResponse);
  }

  for (let i = 0; i < wheels.length; i++) {
    wheels[i].trip.spots.sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1 );
  }

  res.status(200).json({wheels});
};

const postWheel = async (req, res, next)  => {

  let rider, trip;

  try {
    rider = await Rider.findById(req.userData.spoketId);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  if (!rider) {
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
  const wheel = new Wheel({trip, rider});
  if (approved) wheel.approvedAt = Date.now();
  trip.wheels.push(wheel);

  try {
    await wheel.save();
    await trip.save();
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error saving wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({approved})
}

const approveWheels = async (req, res, next) => {
  let tripOwner, trip, approvedWheels;

  try {
    tripOwner = await Rider.findById(req.userData.spoketId);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500;
    return next(errorResponse);
  }

  try {
    trip = await Trip.findOne({_id: req.body.trip, creator: {rider: tripOwner._id}});
    approvedWheels = await Wheel.find({_id: req.body.approved, trip: trip._id});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting wheels');
    errorResponse.errorCode = 500;
    return next(errorResponse);
  }

  try {
    for (let index = 0; index < approvedWheels.length; index++) {
      let wheel = approvedWheels[index];
      wheel.approvedAt = Date.now();
      await wheel.save();
    }
    await Wheel.updateMany({_id: req.body.decided},{decidedAt: Date.now()})

  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error updating wheels');
    errorResponse.errorCode = 500;
    return next(errorResponse);
  }

  res.status(200).json({message: "success"});
};

exports.getWheel = getWheel;
exports.postWheel = postWheel;
exports.getWheelsByRider = getWheelsByRider;
exports.approveWheels = approveWheels;