'use strict';

const mongoose = require('mongoose');
const Wheel = require('../models/wheel');

const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.SPOKET_AWSAccessKeyId,
  secretAccessKey: process.env.SPOKET_AWSSecretKey,
  region: 'eu-central-1'
});

const extractExif = require('../tools/extract-exif');
const calculateDistance = require('../tools/distance');

const postSpoke = async (req, res, next) => {
  //check user
  console.log('POST spoke');

  const image = req.file;
  let metadata;

  try {
    metadata = await extractExif(image.buffer);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error extracting exif');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
}

  const spot = JSON.parse(req.body.spot);
  const spotCoordinates = {
    lat: spot.location.lat,
    lng: spot.location.lng
  };
  const exifDec = {
    lat: metadata.gps.GPSLatitude[0] + metadata.gps.GPSLatitude[1]/60 + metadata.gps.GPSLatitude[2]/3600,
    lng: metadata.gps.GPSLongitude[0] + metadata.gps.GPSLongitude[1]/60 + metadata.gps.GPSLongitude[2]/3600
  };
  const distance = calculateDistance(exifDec, spotCoordinates);
  let imageDate = null
  if (metadata.exif.DateTimeOriginal) {
    let date = metadata.exif.DateTimeOriginal.split(" ");
    date[0] = date[0].replace(/:/g,"-");
    imageDate = Date.parse(date.join("T"));
  }

  let wheel;
  let spoke = {}
  let url;

  try {
    wheel = await Wheel.findById(spot.wheel).populate({path: 'trip', select: 'confirmation'});
    spoke = wheel.spokes.find((spoke) => toString(spoke.spot) === toString(spot._id)) || {_id: new mongoose.Types.ObjectId(), image:{}, spot: spot._id};
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error loading wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
  
  try {
    const s3 = new AWS.S3({signatureVersion: 'v4'});
    const s3Params = { 
      Bucket: process.env.SPOKET_S3_BUCKET,
      Body: image.buffer,
      Key: `${Date.now()}_original_${image.originalname}`,
      ContentType: image.mimetype,
      Expires: 900} //default
    await s3.upload(s3Params).promise();
    spoke.image.key = s3Params.Key
    url = s3.getSignedUrl('getObject', {Bucket: s3Params.Bucket, Key: s3Params.Key});
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error using bucket');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  try {
    const spokeVerified = (wheel.trip.confirmation === 'none' || (wheel.trip.confirmation === 'photo' && distance < 150)) ? new Date() : null;
    const spokeLocation = spokeVerified ? spot.location : exifDec;
    spoke.image.info = {
                make: metadata.image.Make,
                model: metadata.image.Model,
                taken: imageDate,
                lat: exifDec.lat,
                lng: exifDec.lng};
    spoke.verified = spokeVerified;
    spoke.location = spokeLocation;
    if (wheel.spokes.id(spoke._id)) {
      wheel.spokes.id(spoke._id).set(spoke);
    } else {
      wheel.spokes.push(spoke);
    }
    //wheel.spokes[wheel.spokes.findIndex((spokeToFind) => toString(spokeToFind._id) === toString(spoke._id))] = spoke;
    await wheel.save();
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error saving spoke');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
  
  if (metadata.gps.GPSLatitude) {
    res.status(200).json({gps: metadata.gps, distance, spoke, url});
  } else {
    res.status(200).json({gps: "N/A", distance: "N/A", spoke, url});
  }
};

const patchSpoke = async (req, res, next) => {
  //check tripadmin
};

exports.postSpoke = postSpoke;