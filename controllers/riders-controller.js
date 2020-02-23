'use strict';

const Rider = require('../models/rider');
const inspectToken = require('../tools/inspect-token')

const getRiderByFb = async (req, res, next) => {
  let rider;
  let token = req.params.fbToken
  let fbId = "";
  let tokenValid = false;
  try {
    const tokenData = await inspectToken(token);
    tokenValid = tokenData.valid;
    fbId = tokenData.id;
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error validating token');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  if (!tokenValid) {
    res.status(401);
  }

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