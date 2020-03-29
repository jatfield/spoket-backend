'use strict';

const express = require('express');
const tripsRoutes = express.Router();
const checkAuth = require('../middleware/check-auth');

const tripsController = require('../controllers/trips-controller');

tripsRoutes.get('/', tripsController.getTrips);

module.exports = tripsRoutes;