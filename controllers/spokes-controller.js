'use strict';

const mongoose = require('mongoose');
const Wheel = require('../models/wheel');
const Jimp = require('jimp');
const s3Upload = require('../tools/s3-upload')

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
  //if image -> metadata, if exif -> distance,  confirmation none/photo/manual
  //return: resized url, distance, spoke
  console.log('POST spoke');

  const image = req.file;
  let resizedImage;
  let metadata;
  let wheel;
  let spoke = {}
  let url, resizedUrl;
  const spot = JSON.parse(req.body.spot);

  try {
    wheel = await Wheel.findById(spot.wheel).populate({path: 'trip', select: 'confirmation'});
    spoke = wheel.spokes.find((spoke) => toString(spoke.spot) === toString(spot._id)) || {_id: new mongoose.Types.ObjectId(), image:{}, spot: spot._id};
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error loading wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  //if image

  // Jimp.read(image.buffer)
  //   .then(async (image) => {
  //     image.resize(Jimp.AUTO, 1200);
  //     resizedImage = await image.getBufferAsync(Jimp.AUTO);
  //     console.log(resizedImage);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     const errorResponse = new Error('Error resizing image');
  //     errorResponse.errorCode = 500; 
  //     return next(errorResponse);
  //   });

    let jImage
    try {
      jImage = await Jimp.read(image.buffer);
      jImage.resize(Jimp.AUTO, 1080);
      jImage.quality(90);
      resizedImage = await jImage.getBufferAsync(Jimp.AUTO);
    } catch (error) {
      
    }

  try {
    metadata = await extractExif(image.buffer);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error extracting exif');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

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

  try {
    let uploadPromises = [];
    spoke.image.key = `photos/trip_${wheel.trip._id}/wheel_${wheel._id}/spoke_${spoke._id}/${Date.now()}_original_${image.originalname}`
    uploadPromises.push(s3Upload(spoke.image.key, image.buffer, image.mimetype))
    spoke.image.resizedKey = `photos/trip_${wheel.trip._id}/wheel_${wheel._id}/spoke_${spoke._id}/${Date.now()}_resized_${image.originalname}`
    uploadPromises.push(s3Upload(spoke.image.resizedKey, resizedImage, image.mimetype));
    const uploadResults = await Promise.all(uploadPromises);
    resizedUrl = uploadResults[1];
    url = uploadResults[0];
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error using bucket');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  //end if image 
  
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
    await wheel.save();
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error saving spoke');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
  
  if (metadata.gps.GPSLatitude) {
    res.status(200).json({gps: metadata.gps, distance, spoke, resizedUrl});
  } else {
    res.status(200).json({gps: "N/A", distance: "N/A", spoke, resizedUrl});
  }
};

const patchSpoke = async (req, res, next) => {
  //check tripadmin
};

exports.postSpoke = postSpoke;