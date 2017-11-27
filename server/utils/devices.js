// NEW MODEL
// [ { _id: 59edfaf2fe29921a2f227101,
//     __v: 0,
//     codeName: 't1-1508768499',
//     brand: 'Samsung',
//     model: 'S8-1',
//     osType: 'Android',
//     osVersion: '7.1',
//     currentOwner: null,
//     status: 'Available' // or 'Taken', 'Retake'
// },
// { ...
// } ]

const { Device }  = require('./../models/device.js')
const { Log }     = require('./../models/log.js')

class Devices {
  constructor() {
    Device
      .fetchAll()
      .then(res => { this.list = res })
      .catch(e  => { console.log(e) })
  }

  all() {
    return this.list
  }

  find(deviceCodeName) {
    const device = this.list.find((device) => {
      return device.codeName === deviceCodeName
    })

    if (device) {
      return device
    }

    throw new Error(`Could not find device with ID: ${deviceCodeName}`)
  }

  findWithSystem(systemType) {
    const devices = this.list.filter((device) => {
      return device.osType === systemType
    })

    return devices
  }

  blockDevice(deviceIndex) {
    const device = this.find(deviceIndex)
    // console.log("device: ", device)


    if (device.status !== 'Available') {
        device.status  = 'RETAKE'
    }
  }

  unblockDevice(deviceIndex) {
    const device = this.find(deviceIndex)

    if (device.status !== 'Available') {
        device.status  = 'Taken'
    }
  }

  toggleAvailability(deviceCodeName, user) {
    const device = this.find(deviceCodeName)

    if (device.status === 'Available') {
      device.status = 'Taken'
      device.currentOwner = user

      Device.findOneAndUpdate({
        codeName: deviceCodeName
      }, {
        $set: {
          currentOwner: user,
          status: 'Taken'
        }
      }).catch(e => {
        console.log('Error while toggling device:', e)
      })

      // Turn off logging for now
      // Log.new(device)

    } else if (device.status === 'Taken') {
      device.status = 'Available'
      device.currentOwner = null

      Device.findOneAndUpdate({
        codeName: deviceCodeName
      }, {
        $set: {
          currentOwner: null,
          status: 'Available'
        }
      }).catch(e => {
        console.log('Error while toggling device:', e)
      })

      // Turn off logging for now
      // Log.findByDeviceAndClose(device)
    }
  }

  toggleAvailabilityInDB(deviceCodeName, sessionUser) {
    const device = this.find(deviceCodeName)
      
    if (device.status === 'Available') {
      Device.findOneAndUpdate({
        codeName: deviceCodeName
      }, {
        $set: {
          currentOwner: user,
          status: 'Taken'
        }
      }).catch(e => {
        console.log('Error while toggling device:', e)
      })
    } else if (device.status === 'Taken') {
      Device.findOneAndUpdate({
        codeName: deviceCodeName
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
    Log.new(device)
  }

  currentOwnerOf(deviceId) {
    const device = this.find(deviceId)

    if (device.currentOwner != null) { return device.currentOwner.name }
    if (device.currentOwner == null) { return null }
  }
}

module.exports = { Devices };
