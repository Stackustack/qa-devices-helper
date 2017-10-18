const mongose = require('mongoose')

mongose.Promise = global.Promise
mongose.connect(process.env.MONGODB_URI, {
  // useMongoClient: true, // enable to get rid of 'decrapted' warning at startup
})

module.exports = { mongose }
