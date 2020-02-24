'use strict';

const Rider = require('../models/rider');
const Wheel = require('../models/wheel');
const inspectToken = require('../tools/inspect-token');
const getFbData = require('../tools/get-fb-data');

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
};

const getRiderMessages = async (req, res, next) => {

  let rider, wheelsToApprove
  let ridersToApprove = [];

  try {
    rider = await Rider.findById(req.params.rId);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    wheelsToApprove = await Wheel.find({trip: rider.tripsCreated, approved: false}).populate('rider')
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting wheels');
    errorResponse.errorCode = 500; 
    return next(errorResponse);    
  }
console.log(wheelsToApprove);

for (let index = 0; index < wheelsToApprove.length; index++) {
    const riderToApprove = await getFbData(wheelsToApprove[index].rider.fbId);
    riderToApprove.spoketId = wheelsToApprove[index].rider._id
    ridersToApprove.push(riderToApprove);
}
  res.status(200).json({ridersToApprove});
};

exports.getRiderByFb = getRiderByFb;
exports.getRiderMessages = getRiderMessages;