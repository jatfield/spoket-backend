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
  const rId = req.params.rId;
  let wheel;

  try {
    wheel = await Wheel.findOne({rider: rId, approved: true}).populate("trip");    
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({wheel});
};

const approveWheels = async (req, res, next) => {
  let rider, wheels;

  try {
    rider = await Rider.findOne({fbId: req.userData.id})
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);    
  }

  try {
    wheels = await Wheel.find({_id: req.body.approved})
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);    
  }

  try {
    for (let index = 0; index < wheels.length; index++) {
      let wheel = wheels[index];
      let trip = await Trip.findById(wheel.trip, 'participants');
      let rider = await Rider.findById(wheel.rider, 'tripsActive');      
      
      wheel.approved = true;
      trip.participants.find((p) => String(p.rider) === String(rider._id)).approved = true;
      rider.tripsActive.push(trip);
      await wheel.save();
      await trip.save();
      await rider.save();
    }
    
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error updating wheels');
    errorResponse.errorCode = 500; 
    return next(errorResponse); 
  }

  res.status(200).json({message: "success"});
};

exports.getWheel = getWheel;
exports.getWheelsByRider = getWheelsByRider;
exports.approveWheels = approveWheels;