
const ExifImage = require('exif').ExifImage;

const extractExif = (buffer) => {
  return new Promise ((resolve, reject) => {
    new ExifImage({image: buffer}, (error, exifData) => {
      if (error) reject(error)
      resolve(exifData);
    });
  });
};

module.exports = extractExif;