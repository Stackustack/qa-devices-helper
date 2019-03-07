require('dotenv').config()

const mongoose = require('mongoose')

const {
  fetchFreshServiceUserId,
} = require('../utils/freshServiceUtils.js')


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
  const userDomain = user.email.split('@')[1]

  possibleDomainsArr = process.env.AUTHRORIZATION_DOMAIN.split(',')

  return possibleDomainsArr.includes(userDomain)
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
