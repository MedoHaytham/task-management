// middlewares/projectAccess.js
const asyncWrapper = require('../utils/asyncWrapper');
const AppError = require('../utils/appError');
const Project = require('../models/projects');

// Fetches the project once, verifies the current user is either the
// owner or a member, and attaches it to req.project so downstream
// controllers don't need to query it again.
exports.checkProjectAccess = asyncWrapper(async (req, res, next) => {
  // Works whether the route param is `id` (project routes)
  // or `projectId` (nested task routes)
  const projectId = req.params.projectId || req.params.id;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  const isOwner = project.owner._id.equals(req.user.id);
  const isMember = project.members.some(member =>
    member._id.equals(req.user.id)
  );

  if (!isOwner && !isMember) {
    return next(
      new AppError('You do not have access to this project', 403)
    );
  }

  req.project = project;
  next();
});

// Restricts an action to the project owner only
// (e.g. adding/removing members, updating/deleting the project)
exports.checkProjectOwner = (req, res, next) => {
  if (!req.project) {
    return next(new AppError('Project not loaded on request', 500));
  }

  if (!req.project.owner._id.equals(req.user.id)) {
    return next(
      new AppError('Only the project owner can perform this action', 403)
    );
  }

  next();
};