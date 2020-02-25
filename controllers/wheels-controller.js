'use strict';

const Wheel = require('../models/wheel');
const Rider = require('../models/rider');

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
    wheel = await Wheel.findOne({rider: rId}).populate("trip");    
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({wheel});
};

const approveWheels = async (req, res, next) => {
  let rider;
  console.log(req.body);

  try {
    rider = await Rider.findOne({fbId: req.userData.id})
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);    
  }

  try {
    await Wheel.updateMany({_id: req.body.approved}, {approved: true})
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