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

// deprecated - old implementation which used data/devicesData
// now devices from stored on server are used
// const { devicesData } = require('./../data/devicesData.js')

// new implementation of above
const { Device }   = require('./../models/device.js')

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

    device.status === 'Available' ? device.status = 'Taken' : device.status = 'Available'
    device.currentOwner === null ? device.currentOwner = user : device.currentOwner = null
  }

  // UNIT TESTS NEEDED
  setStatus(deviceIndex, status) {
    const device = this.find(deviceIndex)
    device.status = status
  }

  // UNIT TESTS NEEDED
  giveDeviceToUser(deviceIndex, user) {
    const device = this.find(deviceIndex)
    device.takenByUser = user
    this.setStatus(deviceIndex, 'Taken')
  }

  currentOwnerOf(deviceId) {
    const device = this.find(deviceId)

    if (device.takenByUser != null) { return device.takenByUser.name }
    if (device.takenByUser == null) { return null }
  }
}

module.exports = { Devices };
