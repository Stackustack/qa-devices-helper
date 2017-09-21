var google = require('googleapis');
var plus = google.plus('v1');
const numeral = require('numeral');
const http = require('http')

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
    // .then(function (data) {
    //     req.session.user = data
    // })
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
    if (user.domain === 'netguru.pl') { return true}
}

const saveUserToSession = (session, user) => {
  session.user = user
}

module.exports = {
    logServer,
    getUserDataFromOAuthClient,
    keepHerokuFromIdling,
    deviceReturnableByCurrentUser,
    authorizedUser,
    saveUserToSession
}
