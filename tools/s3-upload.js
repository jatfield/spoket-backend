const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.SPOKET_AWSAccessKeyId,
  secretAccessKey: process.env.SPOKET_AWSSecretKey,
  region: 'eu-central-1'
});

const s3Upload = async (key, buffer, mimetype) => {
  return new Promise(async (resolve, reject) => {
    const s3 = new AWS.S3({signatureVersion: 'v4'});
    const s3Params = { 
      Bucket: process.env.SPOKET_S3_BUCKET,
      Body: buffer,
      Key: key,
      ContentType: mimetype,
      Expires: 900} //default
      try {
        await s3.upload(s3Params).promise()
        let url = s3.getSignedUrl('getObject', {Bucket: s3Params.Bucket, Key: s3Params.Key});
        resolve(url)
      } catch (error) {
        reject(error)
      }
  })

};

module.exports = s3Upload;