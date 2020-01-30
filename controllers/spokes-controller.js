'use strict';

const Wheel = require('../models/wheel');

const extractExif = require('../tools/extract-exif');
const calculateDistance = require('../tools/distance');

const postSpoke = async (req, res, next) => {
  //check user
  console.log('POST spoke');

  let image = req.file;
  let metadata;

  try {
    metadata = await extractExif(image.buffer);
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error extracting exif');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }

  const spotCoordinates = {
    lat: 48.726938,
    lng: 20.731077
  } 
  
/*   let newSpoke = req.body;

  try {
    let wheel = await Wheel.findById(req.params.wId);
    wheel.spokes.push(newSpoke);
    await wheel.save()
  } catch (error) {
    console.log(error);
    const errorResponse = new Error('Error saving spoke');
    errorResponse.errorCode = 500; 
    return next(errorResponse);
  }
  
  res.status(200).json({newSpoke}) */

  res.status(200).json({gps: metadata.gps, distance: calculateDistance(metadata.gps, spotCoordinates)});

};

const patchSpoke = async (req, res, next) => {
  //check tripadmin
};

exports.postSpoke = postSpoke;