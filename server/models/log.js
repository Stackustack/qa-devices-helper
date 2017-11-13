const mongoose = require('mongoose')

const LogSchema = mongoose.Schema({
  takenTimestamp: {
    type: Date,
    default: Math.floor(Date.now() / 1000)
  },
  returnTimestamp: {
    default: null,
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
