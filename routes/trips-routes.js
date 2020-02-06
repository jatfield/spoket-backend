'use strict';

const express = require('express');
const tripsRoutes = express.Router();

const tripsController = require('../controllers/trips-controller');

tripsRoutes.get('/first', tripsController.getTrip);

module.exports = tripsRoutes;