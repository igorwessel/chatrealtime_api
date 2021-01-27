'use strict';

const mongoose = require('mongoose');
const schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const moment = require('moment');

const userModel = new schema(
  {
    name: { trim: true, index: true, required: true, type: String },
    email: { type: String },
    photo_url: { type: String },
    cpf: { type: String },
    phone: { type: String },
    password: { type: String },
    payDay: {
      type: Date,
      default: new Date(moment().add(7, 'days')._d.toISOString()),
    },
    active: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

userModel.pre('save', (next) => {
  const now = new Date();
  const nowv = new Date(moment().add(7, 'days')._d.toISOString());
  if (!this.createdAt) this.createdAt = now;
  if (!this.payDay) this.payDay = nowv;
  next();
});

module.exports = mongoose.model('User', userModel);
