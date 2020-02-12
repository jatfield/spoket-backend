'use strict';

const Rider = require('../models/rider');

const getRiderByFb = async (req, res, next) => {
  let rider;
  const fbId = req.params.fbId

  try {
    rider = await Rider.findOne({fbId});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  if (!rider) {
    let newRider = new Rider({fbId});
    try {
      await newRider.save();
      rider = newRider;
    } catch (error) {
      console.log(error);
      const errorResponse = new Error('Error saving rider');
      errorResponse.errorCode = 500; 
      return next(errorResponse);
    }
  }
  res.status(200).json({rider});

}

exports.getRiderByFb = getRiderByFb;