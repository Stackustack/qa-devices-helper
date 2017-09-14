var google = require('googleapis');
var plus = google.plus('v1');
const numeral = require('numeral');

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

// TESTS NEEDED
const keepHerokuFromIdling = (interval) => {
    const intervalInMs = numeral(interval).value()*1000
    
    setInterval(function () {
        // http.get("https://secret-crag-36808.herokuapp.com");
        console.log(intervalInMs)
    }, intervalInMs)
}

module.exports = { logServer, saveUserToSession, keepHerokuFromIdling }