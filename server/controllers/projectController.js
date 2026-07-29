const factory = require('./handlerFactory');
const Project = require('../models/projects');
const User = require('../models/users');
const AppError = require('../utils/appError');
const asyncWrapper = require('../utils/asyncWrapper');
const httpStatus = require('../utils/httpStatusText');

// Restrict the project list to ones the user owns or is a member of
exports.restrictToUserProjects = (req, res, next) => {
  req.baseFilter = {
    $or: [{ owner: req.user.id }, { members: req.user.id }],
  };
  next();
};

exports.getAllProjects = factory.getAll(Project, ['name', 'description']);

// No need to query again — checkProjectAccess middleware already
// fetched the project and attached it to req.project
exports.getProject = (req, res) => {
  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: {
      data: req.project,
    },
  });
};

// owner is always the logged-in user, never taken from the request body
exports.createProject = factory.createOne(Project, req => ({
  owner: req.user.id,
}));

// client can only update name/description — owner and members
// are changed through dedicated endpoints below
exports.updateProject = factory.updateOne(Project, ['name', 'description']);

exports.deleteProject = factory.deleteOne(Project);

// Add a member to the project (owner only — enforced by checkProjectOwner)
exports.addMember = asyncWrapper(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('Please provide a userId', 400));
  }

  const userToAdd = await User.findById(userId);
  if (!userToAdd) {
    return next(new AppError('No user found with that ID', 404));
  }

  const project = req.project;

  const alreadyMember =
    project.owner._id.equals(userId) ||
    project.members.some(member => member._id.equals(userId));

  if (alreadyMember) {
    return next(new AppError('User is already a member of this project', 400));
  }

  project.members.push(userId);
  await project.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: {
      data: project,
    },
  });
});

// Remove a member from the project (owner only)
exports.removeMember = asyncWrapper(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('Please provide a userId', 400));
  }

  const project = req.project;

  if (project.owner._id.equals(userId)) {
    return next(new AppError('Cannot remove the project owner', 400));
  }

  project.members = project.members.filter(
    member => !member._id.equals(userId)
  );
  await project.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: {
      data: project,
    },
  });
});