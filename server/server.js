// Express, sockets and general server configuration
require('./config/config');
require('dotenv').config()

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
// const publicPath = path.join(__dirname, '../public'); // when using public path
const publicPath = path.join(__dirname, '../views'); // when using handlebars

// MongoDB - Mongoose
const { mongoose } = require('./db/mongoose.js')
const { User }     = require('./models/user.js')
const { Device }   = require('./models/device.js')

// Google Oauth2
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
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
    newUserToDB
} = require('./utils/utils.js')

// Importing Devices class
const { Devices } = require('./utils/devices.js')
const devices = new Devices()

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
        'https://www.googleapis.com/auth/userinfo.email'
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
    const sessionUser         = socket.handshake.session.user

    // handling redirect users with no user session
    if (!sessionUser) { return socket.emit('redirect', '/') }

    // logs connecting users xD
    console.log(`USER CONNECTED: ${sessionUser.name} - ${sessionUser.email}`)

    socket.emit('updateDevicesList', devices.all())

    socket.on('toggleDeviceState', (deviceId) => {
        const device = devices.find(deviceId)
        const currentOwner = devices.getCurrentOwnerOfDevice(deviceId)

        if (currentOwner == null || currentOwner == sessionUser.name ) { // TODO: REFACTOR MET 'deviceReturnableByCurrentUser'
            devices.toggleAvailability(deviceId, sessionUser)
            io.emit('updateDevicesList', devices.all())
        } else {
            devices.blockDevice(deviceId)
            io.emit('updateDevicesList', devices.all())

            socket.emit('retakeDeviceFlow', deviceId)

            // ENSURE DEVICE WAS UNBLOCKED AFTER 10 SECONDS (IN CASE USER CLOSED THE TAB / REFRESHED THE PAGE)
            ensureRetakeStatusReset(device, devices, io, deviceId)
        }
    })

    socket.on('retakeDevice', (deviceIndex) => {
        devices.giveDeviceToUser(deviceIndex, sessionUser)
        io.emit('updateDevicesList', devices.all())
    })

    socket.on('retakeCanceled', (deviceIndex) => {
        devices.unblockDevice(deviceIndex)
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
            const userFromDB    = await User.findByEmail(user.email) || await newUserToDB(user)

            if (userFromDB.isUnauthorized()) {
                throw new Error(renderUserUnauthorisedNotification(user.email))
            }

            saveUserToSession(user, session)

        } catch (err) {
            return res.render('error', { message: err })
        }

        res.redirect('devices')
    })
})

app.use('/devices', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/')
    }

    res.render('devices')
})

app.use('/debug', (req, res) => {
    res.render('debug', { data: req.session })
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
    logServer(`Server started at ${port}`)
});
