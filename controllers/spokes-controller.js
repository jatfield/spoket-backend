'use strict';

const mongoose = require('mongoose');
const Wheel = require('../models/wheel');
const Jimp = require('jimp');
const {s3Upload, s3GetUrl} = require('../tools/s3-upload')

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
  let wheel, spoke;
  let url, resizedUrl;
  const spot = JSON.parse(req.body.spot);

  try {
    wheel = await Wheel.findById(spot.wheel).populate({path: 'trip', select: 'confirmation'});
    spoke = wheel.spokes.find(spoke => spoke.spot.equals(spot._id)) || wheel.spokes.create({image:{}, spot: mongoose.Types.ObjectId(spot._id)});    
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error loading wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  //if image

  let jImage
  try {
    jImage = await Jimp.read(image.buffer);
    jImage.resize(Jimp.AUTO, 1080);
    jImage.quality(90);
    resizedImage = await jImage.getBufferAsync(Jimp.AUTO);
  } catch (error) {
      console.log(error);
      const errorResponse = new Error('Error resizing image');
      errorResponse.errorCode = 500; 
      return next(errorResponse);
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

  // //end if image 

  try {
    const spokeVerifiedAt = (wheel.trip.confirmation === 'none' || (wheel.trip.confirmation === 'photo' && distance < 150)) ? new Date() : null;
    const spokeLocation = spokeVerifiedAt ? spot.location : exifDec;
    spoke.image.info = {
                make: metadata.image.Make,
                model: metadata.image.Model,
                taken: imageDate,
                lat: exifDec.lat,
                lng: exifDec.lng};
    spoke.verifiedAt = spokeVerifiedAt;
    spoke.location = spokeLocation;
    if (spoke.isNew) {
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

const getSpokeUrl = async (req, res, next) => {
  let wheel, spoke, url;
  try {
    wheel = await Wheel.findById(req.params.wId);
    spoke = wheel.spokes.find((s) => s.spot.equals(req.params.sId));
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error loading wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
if (spoke) {
  try {
    url = await s3GetUrl(spoke.image.key)
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error getting spoke image url');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
}
  res.status(200).json({url});

};

exports.postSpoke = postSpoke;
exports.getSpokeUrl = getSpokeUrl;