// Express, sockets and general server configuration 
require('./config/config');

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
const { logServer, saveUserToSession } = require('./utils/utils.js')
const auth = require('./config/auth.js')

// Importing Devices class
const { Devices } = require('./utils/devices.js')
const devices = new Devices()

// Googles OAUTH  
function getOAuthClient() {
    return new OAuth2(
        auth.googleAuth.clientID,
        auth.googleAuth.clientSecret,
        auth.googleAuth.redirectionUrl);
}

function getAuthUrl() {
    var oauth2Client = getOAuthClient();

    var scopes = [
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
    const user = socket.handshake.session.user.displayName

    socket.emit('updateDevicesList', devices.all())

    socket.on('toggleDeviceState', (deviceIndex) => {
        const device = devices.toggleAvailability(deviceIndex, user)
        io.emit('updateDevicesList', devices.all())
    })
});

app.use("/oauthCallback", (req, res) => {
    var oauth2Client = getOAuthClient();
    var code = req.query.code;
    oauth2Client.getToken(code, async (err, tokens) => {
        if (!err) {
            oauth2Client.setCredentials(tokens);
            
            try {
                await saveUserToSession(req, res, oauth2Client)
            } catch(err) {
                res.render('error', {message: err})
            }

            res.redirect('devices')
        }
        else {
            res.render('error', { message: err })
        }
    });
});

app.use('/devices', (req, res) => {
    if (!req.session.user) {
       return res.redirect('/')
    }

    res.render('devices')
})

app.use('/debug', (req, res) => {
    console.log('SESJA w "debugu":', req.session)
    console.log('--------------------')
    res.render('debug', { data: req.session })
})

app.use('/', (req, res) => {
    const url = getAuthUrl()
    console.log('SESJA w "/":', req.session)
    console.log('--------------------')
    res.render('login', { url })
})

server.listen(port, () => {
    logServer(`Server started at ${port}`)
});



