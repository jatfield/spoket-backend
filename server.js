'use strict';

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const spokesRoutes = require('./routes/spokes-routes.js');
const tripsRoutes = require('./routes/trips-routes.js');
const wheelsRoutes = require('./routes/wheels-routes.js');
const ridersRoutes = require('./routes/riders-routes.js');

const app = express();
app.use(cors());

app.use(morgan('combined'));
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/spokes', spokesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/wheels', wheelsRoutes);
app.use('/api/riders', ridersRoutes);

app.use((error, req, res, next) => {
  // middleware with four params are treated as error function
  if (res.headerSent) return next(error);
  res.status(error.code || 500).json({message: error.message || 'Unknown error occured'});
})

mongoose.connect(process.env.SPOKET_MONGO_DB_URL, { useNewUrlParser: true })
  .then(()=> {
      console.log('app started');
      app.listen(5000)
    })
  .catch((err) => console.log(err));