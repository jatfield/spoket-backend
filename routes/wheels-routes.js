'use strict';

const express = require('express');
const checkAuth = require('../middleware/check-auth')
const wheelsRoutes = express.Router();

const wheelsController = require('../controllers/wheels-controller');

wheelsRoutes.get('/:wId', wheelsController.getWheel);
wheelsRoutes.get('/rider/:rId', wheelsController.getWheelsByRider);
wheelsRoutes.use(checkAuth); //auth token required 
wheelsRoutes.post('/approval', wheelsController.approveWheels);

module.exports = wheelsRoutes;