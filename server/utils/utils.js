var google = require('googleapis');

var plus = google.plus('v1');

const logServer = (data) => {
    const timestamp = new Date

    console.log(`[${timestamp}]: ${data}`)
}

const saveUserToSession = (req, res, client) => {
    return new Promise((resolve, reject) => {
        plus.people.get({
            userId: 'me',
            auth: client
        }, function (err, response) {
            resolve(response || err);
        });
    }).then(function (data) {
        req.session.user = data
    })
}

module.exports = { logServer, saveUserToSession }