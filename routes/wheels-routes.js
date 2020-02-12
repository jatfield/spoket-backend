'use strict';

const express = require('express');
const wheelsRoutes = express.Router();

const wheelsController = require('../controllers/wheels-controller');

wheelsRoutes.get('/:wId', wheelsController.getWheel);
wheelsRoutes.get('/rider/:rId', wheelsController.getWheelsByRider);

module.exports = wheelsRoutes;