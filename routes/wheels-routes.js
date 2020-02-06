'use strict';

const express = require('express');
const wheelsRoutes = express.Router();

const wheelsController = require('../controllers/wheels-controller');

wheelsRoutes.get('/:wId', wheelsController.getWheel);

module.exports = wheelsRoutes;