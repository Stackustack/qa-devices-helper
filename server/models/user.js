require('dotenv').config()

const axios = require('axios')
const mongoose = require('mongoose')

const {
  fetchFreshServiceUserId,
} = require('./../utils/usersUtils.js')


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
  },
  location: {
    default: null,
    type: String
  },
  freshServiceUserId: {
    default: null,
    type: Number
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

UserSchema.methods.addFreshServiceUserId = async function() {
  const user = this
  const freshServiceUserId = await fetchFreshServiceUserId(user.email)

  user.freshServiceUserId = freshServiceUserId
  user.save()

  return user
}

const User = mongoose.model('User', UserSchema)

module.exports = { User }
