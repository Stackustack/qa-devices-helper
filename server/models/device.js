const mongoose = require('mongoose')

const DeviceSchema = mongoose.Schema({
  codeName: {
    required: true,
    type: String,
    trim: true,
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
  deviceType: {
    type: String,  // tablet or phone
    trim: true
  },
  osVersion: {
    required: true,
    type: String,
    trim: true
  },
  notes: {
    required: false,
    type: String,
    trim: true
  },
  status: {
    default: 'Available', // should i have status as 'Available'/'Taken'/'Retake' or rather set is as Int 0 = 'Free', 1 = ...
    type: String,
    trim: true
  },
  currentOwner: {
    default: null, // is it allowed to set 'default' to 'null' and 'type' to 'String' at the same time?
    type: Object,
  },
  location: {
    type: String,
    required: true
  },
  hub: {
    default: null,
    type: String,
  },
  freshServiceAssetId: {
    default: null,
    type: Number
  },
  freshServiceName: {
    default: null,
    type: String
  }
})

DeviceSchema.statics.fetchAll = function() {
  const Device = this

  return Device.find()
}

const Device = mongoose.model('Device', DeviceSchema)

module.exports = { Device }
