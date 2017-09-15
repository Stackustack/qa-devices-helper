# QA Device Taker 

Real-time app for managing mobile devices status:
- Info about device 
- Is it available at the office?
- If it's taken, then by whom?
- Actions like take, retake, and give back the device
- Statistics (TBC)

## Installing

To setup the project, clone it, then
```
npm install
```
to install dependencies. 

Now you need to fill the secrets needed for Google OAuth - they're stored in '.env' file. 
```
cp .env.sample .env

```
You can ask me for them (@juni @ Netguru's Slack) or you can setup app for yourself. 

To do so go to https://console.developers.google.com and create a new project. Enable APIs on it (mare sure that Google+ API is enabled). Then go to 'Credentials' and enable OAuth Client ID (most likely you'll be asked to fill OAuth consent screen, fill it with whatever you like). Application type should be 'Web application' (duh!). Set name of your app, and fill 'Authorised JavaScript origins' with 
```
http://localhost:3000
```
and with your production address (if you already have one). 'Authorised redirect URIs' should be filled with 
```
http://localhost:3000/oauthCallback
```
and 
```
http://your-production-address.com/oauthCallback
```
if you have production already.

If you want to run app on your own production don't forget to export secrets from .env to your production enviroment.

## Running app locally

To run app locally in dev mode (using nodemon, so each time you change something in code app is restarted):
```
npm run devn
```

## Running the tests

To run tests (using nodemon):
```
npm run testn
```
or 
```
npm run test
```
to run them once :)

## Built With

* [Node.js](https://nodejs.org/en/) - For lulz xD
* [Socket.io](https://socket.io/) - For WebSockets
* [Semantic UI](https://semantic-ui.com/) - For UI Framework
* [Mocha](https://mochajs.org/) - For tests
* And others packages, check package.json for more info :)

## Contributing

- Go ahead, open PR xD

## Authors

* **Michał Jung** - *Initial work* - [stackustack](https://github.com/stackustack)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.