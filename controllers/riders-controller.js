'use strict';

const Rider = require('../models/rider');
const Wheel = require('../models/wheel');
const getFbData = require('../tools/get-fb-data');

const getRiderByFb = async (req, res, next) => {
  let rider;

  try {
    rider = await Rider.findOne({fbId: req.userData.id}, '_id');
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  if (!rider) {
    let newRider = new Rider({fbId: req.userData.id});
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
    rider = await Rider.findById(req.userData.spoketId);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    wheelsToApprove = await Wheel.find({trip: rider.tripsCreated, approvedAt: null}).populate('rider').populate({path: 'trip', select: 'name'});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting wheels');
    errorResponse.errorCode = 500;
    return next(errorResponse);  
  }

  for (let index = 0; index < wheelsToApprove.length; index++) {
      const riderToApprove = await getFbData(wheelsToApprove[index].rider.fbId);
      riderToApprove.spoketId = wheelsToApprove[index].rider._id;
      riderToApprove.wheelId = wheelsToApprove[index]._id;
      riderToApprove.tripName = wheelsToApprove[index].trip.name;
      ridersToApprove.push(riderToApprove);
  }
  res.status(200).json({ridersToApprove});
};

exports.getRiderByFb = getRiderByFb;
exports.getRiderMessages = getRiderMessages;