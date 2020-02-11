'use strict';

const calculateDistance = (exifGps, spotCoordinates) => {

  const R = 6371071;

  const exifDec = {
    lat: exifGps.GPSLatitude[0] + exifGps.GPSLatitude[1]/60 + exifGps.GPSLatitude[2]/3600,
    lng: exifGps.GPSLongitude[0] + exifGps.GPSLongitude[1]/60 + exifGps.GPSLongitude[2]/3600};
  
  const latDiff = (exifDec.lat - spotCoordinates.lat) * (Math.PI/180);
  const lngDiff = (exifDec.lng - spotCoordinates.lng) * (Math.PI/180);
  
  //Haversine formula
  const distance = 2 * R * Math.asin(Math.sqrt(Math.sin(latDiff/2) * Math.sin(latDiff/2) + Math.cos(exifDec.lat * (Math.PI/180)) * Math.cos(spotCoordinates.lat * (Math.PI/180)) * Math.sin(lngDiff/2) * Math.sin(lngDiff/2)));

  return {distance, lat: exifDec.lat, lng: exifDec.lng};
};

module.exports = calculateDistance;