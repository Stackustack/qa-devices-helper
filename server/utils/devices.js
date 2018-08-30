// NEW MODEL
// [ { _id: 59edfaf2fe29921a2f227101,
//     __v: 0,
//     codeName: 't1-1508768499',
//     brand: 'Samsung',
//     model: 'S8-1',
//     osType: 'Android',
//     osVersion: '7.1',
//     currentOwner: null,
//     status: 'Available' // or 'Taken', 'Retake',
//     location: 'Bialystok'
// },
// { ...
// } ]

const ObjectId = require('mongoose').Types.ObjectId;
const {
  Device
} = require('./../models/device.js')
const {
  Log
} = require('./../models/log.js')

class Devices {
  constructor() {
    Device
      .fetchAll()
      .then(res => {
        this.list = res
      })
      .catch(e => {
        console.log(e)
      })
  }

  all() {
    return this.list
  }

  findWithLocation(deviceCodeName, location) {
    const device = this.list.find((device) => {
      return device.codeName === deviceCodeName && device.location === location
    })

    if (device) {
      return device
    }

    throw new Error(`Could not find device with ID: ${deviceCodeName} and location ${location} `)
  }

  findById(deviceId) {
    deviceId = new ObjectId(deviceId)

    const device = this.list.filter(device => {
      return device.id == deviceId
    })[0]

    if (device) {
      return device
    }

    throw new Error(`Could not find device with ID: ${deviceId}`)
  }

  findWithSystem(systemType) {
    const devices = this.list.filter((device) => {
      return device.osType === systemType
    })

    return devices
  }

  findTakenByUserId(userId) {
    const userObjId = new ObjectId(userId)

    const devices = this.list.filter((device) => {
      if (device.currentOwner) {
        return device.currentOwner._id == userObjId
      } else {
        return false
      }
    })

    return devices
  }

  blockDevice(deviceIndex) {
    const device = this.find(deviceIndex)

    if (device.status !== 'Available') {
      device.status = 'RETAKE'
    }
  }

  unblockDevice(deviceIndex) {
    const device = this.find(deviceIndex)

    if (device.status !== 'Available') {
      device.status = 'Taken'
    }
  }

  toggleAvailability(deviceId, user) {
    const device = this.findById(deviceId)
    deviceId = new ObjectId(deviceId)

    if (device.status === 'Available') {
      device.status = 'Taken'
      device.currentOwner = user

      Device.findOneAndUpdate({
        _id: deviceId
      }, {
        $set: {
          currentOwner: user,
          status: 'Taken'
        }
      }).catch(e => {
        console.log('Error while toggling device:', e)
      })

    } else if (device.status === 'Taken') {
      device.status = 'Available'
      device.currentOwner = null

      Device.findOneAndUpdate({
        _id: deviceId
      }, {
        $set: {
          currentOwner: null,
          status: 'Available'
        }
      }).catch(e => {
        console.log('Error while toggling device:', e)
      })
    }
  }

  toggleAvailabilityInDB(deviceId, user) {
    const device = this.findById(deviceId)
    deviceId = new ObjectId(deviceId)

    if (device.status === 'Available') {
      Device.findOneAndUpdate({
        _id: deviceId
      }, {
        $set: {
          currentOwner: user,
          status: 'Taken'
        }
      }).catch(e => {
        console.log('Error while toggling device:', e)
      })

      Log.new(device, user)

    } else if (device.status === 'Taken') {
      Device.findOneAndUpdate({
        _id: deviceId
      }, {
        $set: {
          currentOwner: null,
          status: 'Available'
        }
      }).catch(e => {
        console.log('Error while toggling device:', e)
      })

      Log.findByDeviceAndClose(device)
    }
  }

  passDeviceToUserInDB(deviceCodeName, sessionUser) {
    const device = this.find(deviceCodeName)

    Device
      .findOneAndUpdate({
        codeName: deviceCodeName
      }, {
        $set: {
          currentOwner: sessionUser
        }
      })
      .catch(e => {
        console.log('Error during retake device flow: ', e)
      })
  }

  // UNIT TESTS NEEDED
  setStatus(deviceIndex, status) {
    const device = this.find(deviceIndex)
    device.status = status
  }

  // UNIT TESTS NEEDED
  passDeviceToUser(deviceIndex, user) {
    const device = this.find(deviceIndex)

    // Finish DeviceLog for current User
    Log.findByDeviceAndClose(device)

    device.status = 'Taken'
    device.currentOwner = user

    // Start new DeviceLog for new User
    Log.new(device, user)
  }

  currentOwnerOf(deviceId) {
    const device = this.find(deviceId)

    if (device.currentOwner != null) {
      return device.currentOwner.name
    }
    if (device.currentOwner == null) {
      return null
    }
  }
}

module.exports = {
  Devices
};