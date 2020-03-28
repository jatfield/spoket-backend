'use strict';

const express = require('express');
const checkAuth = require('../middleware/check-auth')
const ridersRoutes = express.Router();

const ridersController = require('../controllers/riders-controller');


ridersRoutes.use(checkAuth); //auth token required 
ridersRoutes.get('/byfb', ridersController.getRiderByFb);
ridersRoutes.get('/messages/', ridersController.getRiderMessages);

module.exports = ridersRoutes;