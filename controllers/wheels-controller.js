'use strict';

const Wheel = require('../models/wheel');

const getWheel = async (req, res, next) => {
  const wId = req.params.wId;
  console.log(wId);
  
  let wheel;

  try {
    wheel = await Wheel.findById(wId).populate("trip");
    console.log(wheel);
    
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({wheel});

}

exports.getWheel = getWheel;