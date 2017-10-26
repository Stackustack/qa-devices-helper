const mongoose = require('mongoose')

const LogSchema = mongoose.Schema({
  takenTimestamp: {
    required: true,
    type: Date,
  },
  returnTimestamp: {
    default: null, // will it work? or undefined? or no default?
    type: Date
  },
  _device: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  _deviceTakenByUser: {
    required: true,
    type: mongoose.Schema.Types.ObjectId
  },
  deviceReturned: {
    type: Boolean,
    default: false
  },
})

const Log = mongoose.model('Log', LogSchema)

module.exports = { Log }
