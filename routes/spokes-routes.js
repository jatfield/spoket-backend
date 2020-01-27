'use strict';

const express = require('express');
const spokesRoutes = express.Router();

const fileUpload = require('../middleware/file-upload');
const spokesController = require('../controllers/spokes-controller');

spokesRoutes.post('/', fileUpload.single('image'), spokesController.postSpoke);

module.exports = spokesRoutes;
