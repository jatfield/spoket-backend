'use strict';

const express = require('express');
const mongoose = require('mongoose');

const spokesRoutes = require('./routes/spokes-routes.js');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/spokes', spokesRoutes);


mongoose.connect(process.env.SPOKET_MONGO_DB_URL, { useNewUrlParser: true })
  .then(()=> {
      console.log('app started');
      app.listen(5000)
    })
  .catch((err) => console.log(err));