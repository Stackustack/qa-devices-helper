// {
// 'T1': {
//     index: 'T1',
//     brand: 'Samsung',
//     model: 'Galaxy S II',
//     androidVersion: '4.1.2',
//     additionalNotes: 'qa+s2@netguru.pl',
//     status: 'Available'
//     takenByUser: {
//        name: 'Andrew Golara',
//        picture: 'url address'
//     }
// }, {
//     ...
// }

const { devicesData } = require('./../data/devicesData.js')


class Devices {
  constructor() {
    this.devicesList = devicesData
  }

  all() {
    return this.devicesList
  }

  find(deviceIndex) {
    const device = this.devicesList[deviceIndex]

    if (device) {
      return device
    }

    throw new Error(`Could not find device with ID: ${deviceIndex}`)
  }

  blockDevice(deviceIndex) {
    const device = this.find(deviceIndex)

    device['status']  = 'RETAKE'
  }

  unblockDevice(deviceIndex) {
    const device = this.find(deviceIndex)

    device.status  = 'Taken'
  }

  toggleAvailability(deviceIndex, user) {
    const device = this.find(deviceIndex)

    device.status === 'Available' ? device.status = 'Taken' : device.status = 'Available'
    device.takenByUser === null ? device.takenByUser = user : device.takenBy = null
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
    console.log(device)
    this.setStatus(deviceIndex, 'Taken')
  }

  getCurrentOwnerOfDevice(deviceId) {
    const device = this.find(deviceId)

    if (device.takenByUser != null) { return device.takenByUser.name }
    if (device.takenByUser == null) { return null }
  }
}

module.exports = { Devices };
