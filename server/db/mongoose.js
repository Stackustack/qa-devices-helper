const mongose = require('mongoose')

mongose.Promise = global.Promise
mongose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TestDBMoongose', {
  // useMongoClient: true, // enable to get rid of 'decrapted' warning at startup
})

module.exports = { mongose }
