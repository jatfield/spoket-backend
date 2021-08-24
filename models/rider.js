'use strict';

const mongoose = require('mongoose');

const bcrypt = require('bcrypt')
const Schema = mongoose.Schema;

const riderSchema = new Schema ({
  image: {type: String},
  name: {type: String},
  password: { type: String, required: true },
  fbId: {type: String},
  email: {type: String, required: true, index: { unique: true }},
  bike: {
    model: {type: String},
    make: {type: String},
    year: {type: Number}},
  lastLogin: {type: Date},
  passwordChanged: {type: Date}
});

riderSchema.pre('save', function(next) {
  var user = this;
  const SALT_WORK_FACTOR = 10;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);
          // override the cleartext password with the hashed one
          user.password = hash;
          next();
      });
  });
});

riderSchema.methods.validatePassword = async function validatePassword(data) {
  return bcrypt.compare(data, this.password);
};


module.exports = mongoose.model('Rider', riderSchema);