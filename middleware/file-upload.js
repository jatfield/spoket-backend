'use strict';

const multer = require('multer');

const fileUpload = multer({
  limits: 50000,
  storage: multer.memoryStorage()
});

module.exports = fileUpload;