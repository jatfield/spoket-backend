'use strict';

const express = require('express');
const {checkAuth} = require('../middleware/check-auth')
const ridersRoutes = express.Router();

const ridersController = require('../controllers/riders-controller');


ridersRoutes.get('/getresettoken/:email', ridersController.getResetToken);
ridersRoutes.post('/login', ridersController.login);
ridersRoutes.use(checkAuth); //auth token required 

ridersRoutes.put('/setpassword', ridersController.setPassword);

module.exports = ridersRoutes;