require('dotenv').config()


const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
    // unique: true // disabled for debuging purposes
  },
  picture: {
    required: true,
    type: String
  },
  email: {
    required: true,
    type: String,
    // unique: true // disabled for debuging purposes
  }
})

UserSchema.statics.findByEmail = function(email) {
  const User = this

  return User.findOne({
    email: email
  })
}

UserSchema.statics.getNamesList = function() {
  const User = this

  return User
    .find({}, {name: 1})
}

UserSchema.methods.isAuthorized = function() {
  const user = this
  const domain = user.email.split('@')[1]

  return (domain === process.env.AUTHRORIZATION_DOMAIN) ? true : false
}

UserSchema.methods.isUnauthorized = function() {
  const user = this

  return !user.isAuthorized()
}

const User = mongoose.model('User', UserSchema)

module.exports = { User }
