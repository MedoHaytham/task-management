const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide a your email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'a password must be at least 8 characters long'],
    trim: true,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password confirm'],
    trim: true,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords do not match'
    }
  },
  active: {
    type: Boolean,
    default: true,
    // select: false
  },
  refreshToken: {
    type: String,
    select: false
  }
},{
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});


// hashing password
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

// hash the refresh token
userSchema.pre('save', function () {
  if (!this.isModified('refreshToken') || !this.refreshToken) return;

  this.refreshToken = crypto.createHash('sha256').update(this.refreshToken).digest('hex');
});

// check if the entered password is correct
userSchema.methods.correctPassword = async function (inputPassword, userPassword) {
  return await bcrypt.compare(inputPassword, userPassword);
}

userSchema.pre(/^find/, function () {
  if (this.getOptions().includeInactive) return;
  this.find({ active: { $ne: false } });
});

const User = mongoose.model('User', userSchema);
module.exports = User;