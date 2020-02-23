'use strict';

const express = require('express');
const ridersRoutes = express.Router();

const ridersController = require('../controllers/riders-controller');

ridersRoutes.get('/byfb/:fbToken', ridersController.getRiderByFb);

module.exports = ridersRoutes;