const User = require('../models/users');
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/appError');
const httpStatus = require('../utils/httpStatusText');
const factory = require('./handlerFactory');
const { filterObj } = require('../utils/filterObject');

// admin only handlers
exports.getAllUsers = factory.getAll(User, ['name', 'email']);
exports.getUser = factory.getOne(User, null, { includeInactive: true });

// whitelist enforced: password/passwordConfirm/refreshToken can never be
// set through this endpoint, since findByIdAndUpdate skips the pre-save
// hashing hook and would store a plain-text password otherwise
exports.updateUser = factory.updateOne(
  User,
  ['name', 'email', 'role', 'active'],
  { includeInactive: true }
);
exports.deleteUser = factory.deleteOne(User);

// self update handlers
exports.updateMe = asyncWrapper(
  async (req, res, next) => {

    // 1) create error if user tries to update password
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('You cannot update your password here! Use /updateMyPassword instead.', 400));
    }

    // 2) filter out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) update user document
    const { _id } = req.user;

    const updatedUser = await User.findByIdAndUpdate(_id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: httpStatus.SUCCESS,
      data: {
        user: updatedUser,
      }
    });
  }
);

exports.deleteMe = asyncWrapper(
  async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: httpStatus.SUCCESS,
      data: null
    });
  }
);

// middleware to get current user
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
}