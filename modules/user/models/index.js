'use strict';

const mongoose = require('mongoose').set('debug', true);
const schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const userModel = new schema(
  {
    name: { trim: true, index: true, required: true, type: String },
    email: { type: String },
    password: { type: String },
    active: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

userModel.pre('save', (next) => {
  const now = new Date();
  if (!this.createdAt) this.createdAt = now;
  next();
});

module.exports = mongoose.model('User', userModel);
