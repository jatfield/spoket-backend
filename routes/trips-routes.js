'use strict';

const express = require('express');
const tripsRoutes = express.Router();
const checkAuth = require('../middleware/check-auth');

const tripsController = require('../controllers/trips-controller');

tripsRoutes.get('/', tripsController.getTrips);
tripsRoutes.use(checkAuth); //auth token required 
tripsRoutes.get('/:tId/role', tripsController.getTripRole);
tripsRoutes.get('/:tId/participants', tripsController.getTripParticipants);

module.exports = tripsRoutes;