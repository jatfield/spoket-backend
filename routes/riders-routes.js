'use strict';

const express = require('express');
const checkAuth = require('../middleware/check-auth')
const ridersRoutes = express.Router();

const ridersController = require('../controllers/riders-controller');

ridersRoutes.get('/byfb/:fbToken', ridersController.getRiderByFb);

ridersRoutes.use(checkAuth); //auth token required 
ridersRoutes.get('/messages/:rId', ridersController.getRiderMessages);

module.exports = ridersRoutes;