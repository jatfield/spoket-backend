'use strict';

const Trip = require('../models/trip');
const Rider = require('../models/rider');
const getFbData = require('../tools/get-fb-data');
const {s3Upload, s3GetUrl} = require('../tools/s3-upload')

const getTrips = async (req, res, next) => {
  let trips;

  try {
    trips = await Trip.find({'live.from': {$lte: new Date()}, 'live.till': {$gte: new Date()}}).select('-spots.name -spots.description -spots.ratings -spots.image -spots.reward -spots.flagged').populate('wheels', 'approvedAt completedAt');
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trips');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({trips});
};

const getTrip = async (req, res, next) => {
  const tId = req.params.tId;
  let trip;

  try {
    trip = await Trip.findById(tId).populate('wheels', 'approvedAt completedAt');
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trip');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({trip});
};

const getTripParticipants = async (req, res, next) => {
  let creator, trip, riders;

  try {
    creator = await Rider.findById(req.userData.spoketId);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    let applicants = [], completers = [], participants = [];
    trip = await Trip.findOne({'creator.rider': creator._id, _id: req.params.tId}, 'wheels spots')
      .populate({path: 'wheels', select: 'rider completedAt approvedAt createdAt spokes'});

    for (let index = 0; index < trip.wheels.length; index++) {
      const rider = await Rider.findById(trip.wheels[index].rider).lean();
     // rider.fbData = await getFbData(rider.fbId);
      rider.wheel = trip.wheels[index];
      rider.wheel.spokes = rider.wheel.spokes.filter((spoke) => spoke.verifiedAt != null);

      if (!trip.wheels[index].approvedAt) {
        applicants.push(rider);
      } else if (trip.wheels[index].completedAt) {
        completers.push(rider);
      } else {
        participants.push(rider);
      }
    } 
    riders = {applicants, completers, participants};
    
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trip');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({riders});
};

const getTripRole = async (req, res, next) => {
  let rider, trip, role;

  try {
    rider = await Rider.findById(req.userData.spoketId);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    trip = await Trip.findById(req.params.tId).populate('wheels');
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting trip');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
  if (trip.wheels.find((w) => w.rider.equals(rider._id))) role = 'participant'
  if (trip.creator.rider.equals(rider._id)) role = 'creator'

  res.status(200).json({role});
};

const getSpotImageUrl = async (req, res, next) => {
  let trip, spot, url;
  try {
    trip = await Trip.findById(req.params.tId);
    spot = trip.spots.id(req.params.sId);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error loading trip');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
if (spot && spot.image) {
  try {
    url = await s3GetUrl(spot.image)
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting spot image url');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
}
  res.status(200).json({url});

};

exports.getTrip = getTrip;
exports.getTrips = getTrips;
exports.getTripRole = getTripRole;
exports.getTripParticipants = getTripParticipants;
exports.getSpotImageUrl = getSpotImageUrl;