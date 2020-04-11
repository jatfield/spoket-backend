'use strict';

const express = require('express');
const {checkFbAuth} = require('../middleware/check-auth')
const ridersRoutes = express.Router();

const ridersController = require('../controllers/riders-controller');


ridersRoutes.use(checkFbAuth); //auth token required 
ridersRoutes.get('/login', ridersController.login);

module.exports = ridersRoutes;