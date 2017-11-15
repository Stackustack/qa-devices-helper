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

  blockDevice(deviceIndex) {
    const device = this.find(deviceIndex)

    device['status']  = 'RETAKE'
  }

  unblockDevice(deviceIndex) {
    const device = this.find(deviceIndex)

    device.status  = 'Taken'
  }

  toggleAvailability(deviceCodeName, user) {
    const device = this.find(deviceCodeName)

    if (device.status === 'Available') {
      device.status = 'Taken'
      device.currentOwner = user

      Log.new(device)

    } else if (device.status === 'Taken') {
      device.status = 'Available'
      device.currentOwner = null

      Log.findByDeviceAndClose(device)
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
