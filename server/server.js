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
    ensureRetakeStatusReset
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
    const userSession         = socket.handshake.session.user

    // handling redirect users with no user session
    if (!userSession) { return socket.emit('redirect', '/') }

    const userName         = userSession.displayName
    const userEmail    = userSession.emails[0].value // only for logging users xD
    const userPicture  = userSession.image.url

    const sessionUser = {
      name: userName,
      email: userEmail,
      picture: userPicture
    }

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
        console.log(sessionUser)
        io.emit('updateDevicesList', devices.all())
    })

    socket.on('retakeCanceled', (deviceIndex) => {
        console.log('reset z retakeCanceled')
        devices.unblockDevice(deviceIndex)
        io.emit('updateDevicesList', devices.all())
    })
});

app.use("/oauthCallback", (req, res) => {
    var oauth2Client = getOAuthClient()
    var code = req.query.code
    const session = req.session

    oauth2Client.getToken(code, async (err, tokens) => {
        if (err) { return res.render('error', { message: err }) }

        oauth2Client.setCredentials(tokens);

        try {
            const user = await getUserDataFromOAuthClient(req, res, oauth2Client)

            if (!authorizedUser(user)) {
                throw new Error(`Account you're authenticating with (${user.emails[0].value}) doesn't have NETGURU.PL domain :(`)
            }

            saveUserToSession(session, user)
        } catch (err) {
            return res.render('error', { message: err })
        }

        res.redirect('devices')
    });
});

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
