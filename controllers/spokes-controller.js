'use strict';

const Wheel = require('../models/wheel');
const fs = require('fs');
const path = require('path');

const extractExif = require('../tools/extract-exif');
const calculateDistance = require('../tools/distance');

const postSpoke = async (req, res, next) => {
  //check user
  console.log('POST spoke');

  const spot = JSON.parse(req.body.spot);
  const image = req.file;
  let metadata;

  try {
    fs.writeFileSync(path.join(__dirname, '..', 'public', image.originalname), image.buffer);
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

  const {distance, lat, lng} = calculateDistance(exifDec, spotCoordinates);
  let imageDate = null
  if (metadata.exif.DateTimeOriginal) {
    let date = metadata.exif.DateTimeOriginal.split(" ");
    date[0] = date[0].replace(/:/g,"-");
    imageDate = Date.parse(date.join("T"));
    console.log(date.join("T"),imageDate);
    
  }

  let spoke;

  try {
    let wheel = await Wheel.findById(spot.wheel).populate({path: 'trip', select: 'confirmation'});
    //ha ez a spot volt már...
    const spokeVerified = (wheel.trip.confirmation === 'none' || (wheel.trip.confirmation === 'photo' && distance < 150)) ? new Date() : null;
    const spokeLocation = spokeVerified ? spot.location : exifDec;

    spoke = {image: {
                      path: path.join(__dirname, '..', 'public', image.originalname),
                      info: {
                        make: metadata.image.Make,
                        model: metadata.image.Model,
                        taken: imageDate,
                        lat: exifDec.lat,
                        lng: exifDec.lng}},
                  verified: spokeVerified,
                  location: spokeLocation,
                  spot: spot._id};
    wheel.spokes.push(spoke);
    await wheel.save();
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error saving spoke');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
  
  if (metadata.gps.GPSLatitude) {
    res.status(200).json({gps: metadata.gps, distance, spoke});
  } else {
    res.status(200).json({gps: "N/A", distance: "N/A", spoke});
  }
};

const patchSpoke = async (req, res, next) => {
  //check tripadmin
};

exports.postSpoke = postSpoke;