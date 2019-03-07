var google      = require('googleapis');
var plus        = google.plus('v1');
const numeral   = require('numeral');
const http      = require('http')
const { User }  = require('./../models/user.js')


require('dotenv').config()


const logServer = (data) => {
    const timestamp = new Date

    console.log(`[${timestamp}]: ${data}`)
}

const sortDevices = (devices) => {
    devices.list.sort((deviceA,deviceB) => {
        let codeNameA = deviceA.codeName.toUpperCase()
        let codeNameB = deviceB.codeName.toUpperCase() 
        
        if (codeNameA < codeNameB) {
            return -1;
        }
        if (codeNameA > codeNameB) {
            return 1;
        }
        
        // codeNames are be equal - this case should not happen
        return 0;
    })
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
        http.get("http://qa-devices-helper.herokuapp.com/");
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

const saveUserToSession = (user, session) => {
  session.user = user
}

const ensureRetakeStatusReset = (device, devices, io, deviceId) => {
    setTimeout(function() {
        if (device.status == 'RETAKE') {
            devices.unblockDevice(deviceId)
            io.emit('updateDevicesList', devices.all())
        }
    }, 20000)
}

const parseUserFromOAuth = (userObjFromOAuth) => {
    return {
      name: userObjFromOAuth.displayName,
      email: userObjFromOAuth.emails[0].value,
      picture: userObjFromOAuth.image.url
    }
}

const renderUserUnauthorisedNotification = (userEmail) => {
  return `Account you're authenticating with (${userEmail}) doesn't have netguru.pl / .co / .com domain :(`
}

const newUserToDB = (parsedUser) => {
  return new User(parsedUser).save()
}

const handleFreshServiceIntegration = async (userFromDB) => {
    if (process.env.FRESHSERVICE_INTEGRATION == "true" && !userFromDB.freshServiceUserId) {
        userFromDB = await userFromDB.addFreshServiceUserId()
    }

    return userFromDB
}

module.exports = {
    logServer,
    getUserDataFromOAuthClient,
    keepHerokuFromIdling,
    deviceReturnableByCurrentUser,
    authorizedUser,
    saveUserToSession,
    ensureRetakeStatusReset,
    parseUserFromOAuth,
    renderUserUnauthorisedNotification,
    newUserToDB,
    sortDevices,
    handleFreshServiceIntegration
}
