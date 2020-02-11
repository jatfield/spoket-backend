'use strict';

const Rider = require('../models/rider');

const getRider = async (req, res, next) => {
  let rider;

  try {
    rider = await Rider.find({fbId: req.params.fbId});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trip');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({rider});

}

exports.getRider = getRider;