'use strict';

const Wheel = require('../models/wheel');

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
}

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
}

exports.getWheel = getWheel;
exports.getWheelsByRider = getWheelsByRider;