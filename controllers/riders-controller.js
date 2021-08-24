'use strict';

const Rider = require('../models/rider');
const jwt = require ('jsonwebtoken');
const getFbData = require('../tools/get-fb-data');
const sendMail = require('../tools/mailer');

const getResetToken = async (req, res, next) => {
  let token, rider;
  
  try {
    rider = await Rider.findOne({email: req.params.email}, '_id email passwordChanged');
  } catch (error) {
    console.log(error);
  }

  if (rider.passwordChanged && new Date().getTime() - new Date (rider.passwordChanged).getTime() < 30*60000) {
    const errorResponse = new Error('Password change too frequent');
    errorResponse.errorCode = 401; 
    return next(errorResponse);
  }

  try {
    token = jwt.sign({spoketId: rider._id, email: rider.email}, process.env.SPOKET_JWT_PASS, {expiresIn: "30m"});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error("Token generálás hiba.");
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
  const message = `Az alábbi hivatkozásra kattintva új jelszót állíthat be a ${rider.email} e-mail címhez tartozó fiókhoz:<br/><a href ="${process.env.SPOKET_FRONTEND_URL}/passwordreset?token=${token}">http://localhost:3000/passwordreset?token=${token}</a>`;
  let mailSuccess = false;

  try {   
    await sendMail("Jelszóvisszaállítás a kerekkalandok.hu-n", "Jelszóvisszaállítás", message, rider.email)
    mailSuccess = true;
  } catch (error) {
    console.log(error);
  }
  res.status(200).json({rider, token, mailSuccess});
};

const setPassword = async (req, res, next) => {
  let rider;
  const password = req.body.password;

  try {
    rider = await Rider.findOne({email: req.userData.email}, '_id email passwordChanged');
    if (rider.passwordChanged && new Date().getTime() - new Date (rider.passwordChanged).getTime() < 30*60000) {
      const errorResponse = new Error('Password change too frequent');
      errorResponse.errorCode = 401; 
      return next(errorResponse);
    }
    rider.password = password;
    rider.passwordChanged = new Date();
    await rider.save()
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error updating rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }


  res.status(200).json({rider});
};

const login = async (req, res, next) => {
  let rider, token;

  try {
    rider = await Rider.findOne({email: req.body.email});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting rider');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    const passed = await rider.validatePassword(req.body.password);
    if (!passed) {  
      const errorResponse = new Error('Login failed');
      errorResponse.errorCode = 401; 
      return next(errorResponse);    
    }
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error validating password');
    errorResponse.errorCode = 500; 
    return next(errorResponse);    
  }

  try {
    token = jwt.sign({spoketId: rider._id, email: rider.email}, process.env.SPOKET_JWT_PASS);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error("Token generálás hiba.");
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  res.status(200).json({rider: {"_id": rider._id, "email": rider.email}, token});
};

exports.login = login;
exports.setPassword = setPassword;
exports.getResetToken = getResetToken;