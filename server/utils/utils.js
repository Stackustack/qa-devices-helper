var google = require('googleapis');
var plus = google.plus('v1');
const numeral = require('numeral');
const http = require('http')

require('dotenv').config()


const logServer = (data) => {
    const timestamp = new Date

    console.log(`[${timestamp}]: ${data}`)
}

const getUserDataFromOAuthClient = (req, res, client) => {
    return new Promise((resolve, reject) => {
        plus.people.get({
            userId: 'me',
            auth: client
        }, function (err, response) {
            resolve(response || err);
        });
    })
}

// TESTS NEEDED
const keepHerokuFromIdling = (interval) => {
    const intervalInMs = numeral(interval).value()*1000

    setInterval(function () {
        http.get("https://qa-devices-helper.herokuapp.com/");
    }, intervalInMs)
}

// GUESS THIS SHOULD BE MOVED TO DEVICES CLASS BUT HEY, FUCK IT XD
// ALSO, TEST NEEDED
const deviceReturnableByCurrentUser = (currentUser, deviceCurrentlyTakenBy) => {
    return (currentUser === deviceCurrentlyTakenBy || deviceCurrentlyTakenBy === '')
}

const authorizedUser = (user) => {
    if (user.domain === process.env.AUTHRORIZATION_DOMAIN) { return true }
}

const saveUserToSession = (session, user) => {
  session.user = user
}

const ensureRetakeStatusReset = (device, devices, io, deviceId) => {
    setTimeout(function() {
        if (device.status == 'RETAKE') {
            devices.unblockDevice(deviceId)
            io.emit('updateDevicesList', devices.all())
        }
    }, 15000)
}

module.exports = {
    logServer,
    getUserDataFromOAuthClient,
    keepHerokuFromIdling,
    deviceReturnableByCurrentUser,
    authorizedUser,
    saveUserToSession,
    ensureRetakeStatusReset
}
