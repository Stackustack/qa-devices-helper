const mongoose = require('mongoose')

const DeviceSchema = mongoose.Schema({
  codeName: {
    required: true,
    type: String,
    trim: true,
    unique: true
  },
  brand: {
    required: true,
    type: String,
    trim: true
  },
  model: {
    required: true,
    type: String,
    trim: true
  },
  osType: {
    required: true,
    type: String,  // or Int and 0 = 'Android', 1 = 'iOS' ?
    trim: true
  },
  osVersion: {
    required: true,
    type: String,
    trim: true
  },
  status: {
    default: 'free', // should i have status as 'free'/'taken'/'retake' or rather set is as Int 0 = 'Free', 1 = ...
    type: String,
    trim: true
  },
  currentOwner: {
    default: null, // is it allowed to set 'default' to 'null' and 'type' to 'String' at the same time?
    type: String,
  }
})

const Device = mongoose.model('Device', DeviceSchema)

module.exports = { Device }
