'use strict';

const Rider = require('../models/rider');
const jwt = require ('jsonwebtoken');
const getFbData = require('../tools/get-fb-data');

const login = async (req, res, next) => {
  let rider;
  const fbToken = req.headers.authentication.split(' ')[1]

  try {
    rider = await Rider.findOne({fbId: req.userData.id}, '_id email');
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

  try {
    const fbData = await getFbData(req.userData.id, fbToken);
    await rider.update({email: fbData.email});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error saving rider');
    errorResponse.errorCode = 500; 
  }

  let token;
  try {
    token = jwt.sign({spoketId: rider._id, fbId: req.userData.id, fbToken}, process.env.SPOKET_JWT_PASS);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error("Token generálás hiba.");
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({rider, token});
};

exports.login = login;