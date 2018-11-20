// Express, sockets and general server configuration
require('./config/config');
require('dotenv').config()

var sslRedirect = require('heroku-ssl-redirect');
const express = require('express')
const app = express();
const session = require('express-session')({
    secret: 'some-random-password-elouel',
    resave: true,
    saveUninitialized: true
});
const sharedsession = require("express-socket.io-session")
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000
const path = require('path')
const ObjectId = require('mongoose').Types.ObjectId;
// const publicPath = path.join(__dirname, '../public'); // when using public path
const publicPath = path.join(__dirname, '../views'); // when using handlebars

// Favicon
const favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

// MongoDB, Mongoose and models
const { mongoose } = require('./db/mongoose.js')
const { User }     = require('./models/user.js')
const { Log }      = require('./models/log.js')
const { Device }   = require('./models/device.js')
const { Devices }  = require('./utils/devices.js') // Device model is used here
let devices        = new Devices()

// Google Oauth2 and SSL
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
app.use(sslRedirect());
app.use(session)

// Express Handlebars
const exphbs = require('express-handlebars')
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static(publicPath));

// Other usefull stuff
const {
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
} = require('./utils/utils.js')

const moment = require('moment')

// well... I dont have time to play with asyncs xDDDD Fuck this app xD
setTimeout(() => {
    sortDevices(devices)    
}, 5000)

// BodyParser
const bodyParser = require('body-parser')
app.use(bodyParser.json());

// Googles OAUTH
function getOAuthClient() {
    return new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECTION_URL);
}

function getAuthUrl() {
    var oauth2Client = getOAuthClient();

    var scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    var url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });

    return url;
}

// SOCKETS IO
io.use(sharedsession(session, {
    autosave: true
}));

io.on('connection', (socket) => {
    const sessionUser = socket.handshake.session.user
    // handling redirect users with no user session
    if (!sessionUser) { return socket.emit('redirect', '/') }
    const currentUserDevices = devices.findTakenByUserId(sessionUser._id)

    socket.emit('sendUserData', sessionUser)
    socket.emit('updateDevicesList', currentUserDevices)

    socket.on('toggleDeviceState', (deviceId) => {
        const device = devices.findById(deviceId)
        const currentOwner = device.currentOwner

        if (currentOwner == null || currentOwner._id == sessionUser._id ) { // TODO: REFACTOR METHOD "if (deviceBelongsToUser(device, user))"
            devices.toggleAvailabilityInDB(deviceId, sessionUser)
            devices.toggleAvailability(deviceId, sessionUser)
            io.emit('updateDevicesList', devices.all()) // REFACTOR NEEDED: .all() is the same as .list, so list shold be just used everywhere
        } else {

            devices.blockDevice(device.id)
            io.emit('updateDevicesList', devices.all())

            socket.emit('retakeDeviceFlow', device.id)

            // ENSURE DEVICE WAS UNBLOCKED AFTER 20 SECONDS (IN CASE USER CLOSED THE TAB / REFRESHED THE PAGE)
            // I think this might be done with something like on.disconnect or something...
            // I really need to refactor this abomination
            ensureRetakeStatusReset(device, devices, io, deviceId)
        }
    })

    socket.on('retakeDevice', (deviceIndex) => {
        devices.passDeviceToUserInDB(deviceIndex, sessionUser)
        devices.passDeviceToUser(deviceIndex, sessionUser)
        io.emit('updateDevicesList', devices.all())
    })

    socket.on('retakeCanceled', (deviceIndex) => {
        devices.unblockDevice(deviceIndex)
        io.emit('updateDevicesList', devices.all())
    })

    socket.on('refreshDevicesList', () => {
        io.emit('updateDevicesList', devices.all())
    })
});

app.use("/oauthCallback", (req, res) => {
    const oauth2Client  = getOAuthClient()
    const code          = req.query.code
    const session       = req.session

    oauth2Client.getToken(code, async (err, tokens) => {
        if (err) { return res.render('error', { message: err }) }

        oauth2Client.setCredentials(tokens);

        try {
            const userFromOAuth = await getUserDataFromOAuthClient(req, res, oauth2Client)
            const user          = parseUserFromOAuth(userFromOAuth)
            let userFromDB    = await User.findByEmail(user.email) || await newUserToDB(user)

            userFromDB = await handleFreshServiceIntegration(userFromDB) // Fetches Fresh Service user_id and stores it in DB, also updates current userFromDB

            if (userFromDB.isUnauthorized()) {
                throw new Error(renderUserUnauthorisedNotification(userFromDB.email))
            }

            saveUserToSession(userFromDB, session)

            if (session.user.location) {
                res.redirect('devices')
            } else {
                res.redirect('select_location')
            }

        } catch (err) {
            return res.render('error', { message: err })
        }

    })
})

app.get('/devices/new', (req,res) => {
    if (!req.session.user) {
        return res.redirect('/')
    }

    res.render('newDevices')
})

app.get('/select_location', (req,res) => {
    if (!req.session.user) {
        return res.redirect('/')
    }

    res.render('selectLocation', {user: req.session.user})
})

app.get('/:location/devices/:id', (req, res) => {
    const deviceId = req.params.id    
    const location = req.params.location
    let device

    if (!req.session.user) {
        return res.redirect('/')
    }

    // TODO: send device._id (objectId) as a header, search by it and then we can remove findWithLocation
    try {
        device = devices.findWithLocation(deviceId, location)
    } catch(err) {
        return res.render('error', { message: err })
    }

    return res.render('editDevices', { device })
})

app.get('/:location/devices/:codeName/log', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/')
    }

    const codeName = req.params.codeName
    const location = req.params.location 

    const device = devices.findWithLocation(codeName, location)

    const deviceLogs = await Log.findAllForDevice(device)
    const usersList  = await User.getNamesList()

    let parsedLogs = []

    deviceLogs.forEach(log => {
        let logObj = { 
            user: "Unknown",
            returned: log.deviceReturned
        }

        //Parse Users from UsersIDs
        usersList.forEach(user => {
            if (user._id.equals(log._deviceTakenByUser)) {
                logObj.user = user.name
            } 
        })

        //Parse takenTimestamp
        logObj.takenWhen = moment.unix(log.takenTimestamp).format('MMMM Do YYYY, H:mm:ss')

        //Parse returnTimestamp
        if (log.returnTimestamp) {
            logObj.returnedWhen = moment.unix(log.returnTimestamp).format('MMMM Do YYYY, H:mm:ss')
        }

        parsedLogs.push(logObj)
    })

    res.render('deviceLog', {device, parsedLogs})
})

app.use('/devices', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/')
    }

    res.render('devices', {location: req.session.user.location})
})

app.use('/debug', (req, res) => {
    res.render('debug', { data: req.session })
})



// API DEVICES ENDPOINT
app.post('/api-v1/set_location', (req, res) => {
    const user = req.session.user
    const location = req.body.location

    if (!location) {
        res.status(400).send( {
            error: `Failed to update user`,
            message: `Error while updating User '${user.name}', location was not provided`
        })
    }

    User.findByIdAndUpdate(user._id, {$set: {location}}, {new: true})
        .then(updatedUser => {
            user.location = location

            res.send({updatedUser})
        }, e => {
            res.status(400).send({
                error: `Failed to update user`,
                message: `Error while updating User '${user.name}' with location '${location}'`
            })
        }
    )
})

app.get('/api-v1/devices', (req, res) => {
  Device
    .find()
    .then((devices) => {
      res.redirect('/devices')
    }), (e) => {
      res.status(400).send(e)
    }
})
app.get('/api-v1/devices/:codeName', (req, res) => {
  const codeName = req.params.codeName

  Device
    .findOne({codeName})
    .then((doc) => {
      if (!doc) {
        res.status(404).send({
          errors: `Device not found`,
          message: `Device with code name '${codeName}' was not found in the DB.`
        })
      }

      res.send(doc)
    }), (e) => {
      res.status(400).send({
        errors: `${e}`,
        message: `Error while searching for device in DB.`
      })
    }
})

app.post('/api-v1/devices', async (req, res) => {
  const devicesArray = req.body
  let err = false
  let errArr = []
  let docArr = []

  const updateObj    = await devicesArray.map(deviceObj => {
    // HANDLE EDIT ACTION BY DEVICE ObjectId, TODO: Move this to two different actions for more clarity
    // or actually upsert: true should do the trick... 
    if (deviceObj.actionType == 'edit') {
        let editedDeviceData = deviceObj.deviceData
        let deviceObjId = new ObjectId(editedDeviceData.deviceId)

        return Device.update({
            _id: deviceObjId
        }, editedDeviceData, {
            upsert: true,
            setDefaultsOnInsert: true
        }).then(doc => {
            docArr.push(editedDeviceData)
        }).catch(e => {
            console.log(`Error while editing ${deviceObj.codeName} in DB`)
            console.log(`Error code`, e)
            console.log(`Error with device data:`, deviceObj)
            errArr.push(e)
            er = true
            return e
        })
    } else {
        // HANDLE NEW DEVICE OR DEVICES (ARRAY OF DEVICES)
        return Device
        .update({
          codeName: deviceObj.codeName,
          location: deviceObj.location
          }, deviceObj, {
            upsert: true,
            setDefaultsOnInsert: true
          })
        .then(doc => {
          docArr.push(deviceObj)
          return doc
        })
        .catch(e => {
          console.log(`Error while adding ${deviceObj.codeName} in DB`)
          console.log(`Error code`, e)
          console.log(`Error with device data:`, deviceObj)
          errArr.push(e)
          er = true
          return e
        })
    }
  })

  Promise
    .all(updateObj)
    .then(() => {
        if (err) { res.status(400).send(errArr) }

        devices = new Devices()
        res.send(docArr)
    })
    
    setTimeout(() => {
        sortDevices(devices)    
    }, 5000)
})

app.delete('/api-v1/devices/:deviceId', (req, res) => {
    let deviceId = req.params.deviceId

    if (!ObjectId.isValid(req.params.deviceId)) {
        res.status(401).send({
            error: `Provided ID (${deviceId}) is not valid Mongo ObjectID`,
            message: `Argument passed in must be a single String of 12 bytes or a string of 24 hex characters`
        })
    }

    Device
        .findByIdAndRemove(deviceId)
        .then((doc) => {
            if (!doc) {
                return res.status(404).send({
                    message: `Device with ID"${deviceId}" not found`
                })
            }

            res.send(doc)
        })
        .catch((e) => {
            res.status(400).send({
                errors: `${e}`,
                message: `Error while removing device with ID "${deviceId}".`
            })
        })
})

app.use('/', (req, res) => {
    // redirect to /devices if user session is available
    if (req.session.user) {
        return res.redirect('/devices')
    }

    const url = getAuthUrl()
    res.render('login', { url })
})

keepHerokuFromIdling('0:25:00')

server.listen(port, () => {
    logServer(`Server started at ${port}, evn: ${process.env.NODE_ENV}`)
    logServer(`Connected to DB: ${process.env.MONGODB_URI}`)
});
