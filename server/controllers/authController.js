/* eslint-disable no-console */
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const AppError = require('../utils/appError');
const asyncWrapper = require('../utils/asyncWrapper');
const httpStatus = require('../utils/httpStatusText');
const crypto = require('crypto');

const signToken = (id, type) => {
  if (type === 'refresh') {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
    });
  }

  if (type === 'access') {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    });
  }
};

const createSendToken = async (user, statusCode, req, res) => {
  const refreshToken = signToken(user._id, 'refresh');
  const accessToken = signToken(user._id, 'access');

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('accessToken', accessToken, {
    expires: new Date(
      Date.now() + Number(process.env.ACCESS_TOKEN_COOKIE_EXPIRES_IN) * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
  });

  res.cookie('refreshToken', refreshToken, {
    expires: new Date( 
      Date.now() + Number(process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
  });

  // remove the password from response
  user.password = undefined;
    
  res.status(statusCode).json({
    status: httpStatus.SUCCESS,
    data: {
      user
    }
  });
}

exports.signup = asyncWrapper(async (req, res, next) => {
  // Whitelist fields explicitly — never let the client set `role` to 'admin'
  // via the request body (privilege escalation prevention)
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  await createSendToken(newUser, 201, req, res);
});

exports.login = asyncWrapper ( 
  async (req, res, next) => {
    const {email, password} = req.body;

    // check if email and password exist
    if( !email || !password ) {
      return next(new AppError('please enter email and password', 400));
    };

    // check if user exists with this email
    const user = await User.findOne({ email }).select('+password');

    if( !user ) {
      return next(new AppError('Invalid email or password', 401));
    };

    // check if the password is correct
    const correct = await user.correctPassword(password, user.password);

    if( !correct ) {
      return next(new AppError('Invalid email or password', 401));
    };

    // if everything is ok, creat token and send it
    await createSendToken(user, 200, req, res);
  }
);

exports.refreshAccessToken = asyncWrapper(
  async (req, res, next) => {
    const token = req.cookies.refreshToken;
    
    if( !token ) {
      return next(new AppError('No refresh token provided', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
    } catch (error){
      return next(new AppError('Invalid or expired refresh token', 401));
    };

    const user = await User.findById(decoded.id).select('+refreshToken');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if(!user || user.refreshToken !== hashedToken){
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    await createSendToken(user, 200, req, res);
  }
);


exports.logout = asyncWrapper(async (req, res, next) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined });
  }

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax',
  });

  res.status(200).json({ status: httpStatus.SUCCESS });
});