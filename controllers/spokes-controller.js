'use strict';

const mongoose = require('mongoose');
const Wheel = require('../models/wheel');
const Trip = require('../models/trip');
const Jimp = require('jimp');
const {s3Upload, s3GetUrl} = require('../tools/s3-upload')

const extractExif = require('../tools/extract-exif');
const calculateDistance = require('../tools/distance');

const postSpoke = async (req, res, next) => {
  //check user
  //if image -> metadata, if exif -> distance,  confirmation none/photo/manual
  //return: resized url, distance, spoke
  //console.log('POST spoke');

  //console.time("spoke processing", "bla");

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

  //console.timeLog("spoke processing","Exif start");

  //if image
  var exifDec;
  try {
    metadata = await extractExif(image.buffer);
    exifDec = {
      lat: metadata.gps.GPSLatitude[0] + metadata.gps.GPSLatitude[1]/60 + metadata.gps.GPSLatitude[2]/3600,
      lng: metadata.gps.GPSLongitude[0] + metadata.gps.GPSLongitude[1]/60 + metadata.gps.GPSLongitude[2]/3600
    };
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Hiányzó vagy sérült metaadatok');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  
  //console.timeLog("spoke processing","Imageprocess start");

  let jImage;

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

  const spotCoordinates = {
    lat: spot.location.lat,
    lng: spot.location.lng
  };


  let imageDate = null
  if (metadata.exif.DateTimeOriginal) {
    let date = metadata.exif.DateTimeOriginal.split(" ");
    date[0] = date[0].replace(/:/g,"-");
    imageDate = Date.parse(date.join("T"));
  }
  
  //console.timeLog("spoke processing","upload start");

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

  
  //console.timeLog("spoke processing","save start");

  // //end if image 

  try {
    spoke.distance = calculateDistance(exifDec, spotCoordinates);
    const spokeVerifiedAt = (wheel.trip.confirmation === 'none' || (wheel.trip.confirmation === 'photo' && spoke.distance < 70)) ? new Date() : null;
    const spokeLocation = exifDec;
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
  
  //console.timeEnd("spoke processing","save end");

  if (metadata.gps.GPSLatitude) {
    res.status(200).json({gps: metadata.gps, spoke, resizedUrl});
  } else {
    res.status(200).json({gps: "N/A", spoke, resizedUrl});
  }
};

const patchSpoke = async (req, res, next) => {
  //check tripadmin
};

const getSpokeUrl = async (req, res, next) => {
  let wheel, spoke, url;
  try {
    wheel = await Wheel.findById(req.params.wId);
    spoke = wheel.spokes.id(req.params.sId);
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

const getSpokes = async (req, res, next) => {
  let spokes;
  
  try {
    const wheel = await Wheel.findById(req.params.wId).lean();
    const trip = await Trip.findById(wheel.trip);
    wheel.spokes = wheel.spokes.filter((spoke) => spoke.verifiedAt != null);
    for (let index = 0; index < wheel.spokes.length; index++) {
      wheel.spokes[index].spot = trip.spots.id(wheel.spokes[index].spot);
    }
    spokes = wheel.spokes
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error loading wheel');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
  res.status(200).json({spokes});
}


exports.getSpokes = getSpokes;
exports.postSpoke = postSpoke;
exports.getSpokeUrl = getSpokeUrl;