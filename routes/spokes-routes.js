'use strict';

const express = require('express');
const spokesRoutes = express.Router();

const checkAuth = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');
const spokesController = require('../controllers/spokes-controller');

spokesRoutes.use(checkAuth); //auth token required 
spokesRoutes.post('/', fileUpload.single('image'), spokesController.postSpoke);

module.exports = spokesRoutes;
