'use strict';

const Rider = require('../models/rider');
const jwt = require ('jsonwebtoken');

const login = async (req, res, next) => {
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

  let token;
  try {
    token = jwt.sign({spoketId: rider._id, fbId: req.userData.id, fbToken: req.headers.authentication.split(' ')[1]}, process.env.SPOKET_JWT_PASS);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error("Token generálás hiba.");
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({rider, token});
};

exports.login = login;