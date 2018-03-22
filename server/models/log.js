const mongoose = require('mongoose')

const LogSchema = mongoose.Schema({
  takenTimestamp: {
    type: Number
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

LogSchema.statics.new = function(device, user) {
  const Log = this

  console.log('device for log.new():', device)

  return new Log({
    _device: device._id,
    _deviceTakenByUser: user,
    takenTimestamp: Math.floor(Date.now() / 1000)
  }).save()
}

LogSchema.statics.findByDeviceAndClose = function(deviceObj) {
  const Log = this

  Log.findOneAndUpdate({
    _device: deviceObj._id,
    deviceReturned: false
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

LogSchema.statics.findAllForDevice = function(deviceObj) {
  const Log = this

  return Log.find({
    _device: deviceObj._id,
  }, {takenTimestamp: 1, returnTimestamp: 1, _deviceTakenByUser: 1, deviceReturned: 1})
}

const Log = mongoose.model('Log', LogSchema)

module.exports = { Log }
