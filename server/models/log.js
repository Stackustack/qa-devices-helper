const mongoose = require('mongoose')

const LogSchema = mongoose.Schema({
  takenTimestamp: {
    type: Number,
    default: Math.floor(Date.now() / 1000)
  },
  returnTimestamp: {
    default: null,
    type: Number
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

LogSchema.statics.new = function(device) {
  const Log = this

  console.log('device w log.new():', device)

  return new Log({
    _device: device._id,
    _deviceTakenByUser: device.currentOwner._id
  }).save()
}

LogSchema.statics.findByDeviceAndClose = function(deviceObj) {
  const Log = this

  Log.findOneAndUpdate({
    _device: deviceObj._id
  }, {
    $set: {
      deviceReturned: true,
      returnTimestamp: Math.floor(Date.now() / 1000)
    }
  }, {
    new: true
  }).catch(e => {
    console.log('Error while closing DeviceLog:', e)
  })
}

const Log = mongoose.model('Log', LogSchema)

module.exports = { Log }
