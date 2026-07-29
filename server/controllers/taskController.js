const factory = require('./handlerFactory');
const Task = require('../models/tasks');
const AppError = require('../utils/appError');
const asyncWrapper = require('../utils/asyncWrapper');
const httpStatus = require('../utils/httpStatusText');
const { filterObj } = require('../utils/filterObject');

// Nested under /projects/:projectId/tasks
exports.restrictToProjectTasks = (req, res, next) => {
  req.baseFilter = { project: req.params.projectId };
  next();
};

exports.getAllTasks = factory.getAll(Task, ['title', 'description']);
exports.getTask = factory.getOne(Task, null, {}, req => ({
  project: req.params.projectId,
}));
// Checks that the given assignee (if provided) is actually the owner
// or a member of the parent project — req.project is already loaded
// and populated by the checkProjectAccess middleware
const validateAssignee = (assigneeId, project, next) => {
  if (!assigneeId) return true; // unassigned is always valid

  const isValidAssignee =
    project.owner._id.equals(assigneeId) ||
    project.members.some(member => member._id.equals(assigneeId));

  if (!isValidAssignee) {
    next(new AppError('Assignee must be a member of this project', 400));
    return false;
  }

  return true;
};

exports.createTask = asyncWrapper(async (req, res, next) => {
  if (!validateAssignee(req.body.assignee, req.project, next)) return;

  const task = await Task.create({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    priority: req.body.priority,
    dueDate: req.body.dueDate,
    assignee: req.body.assignee,
    project: req.params.projectId,
    creator: req.user.id,
  });

  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: {
      data: task,
    },
  });
});

exports.updateTask = asyncWrapper(async (req, res, next) => {
  if (!validateAssignee(req.body.assignee, req.project, next)) return;

  const filteredBody = filterObj(
    req.body,
    'title',
    'description',
    'status',
    'priority',
    'dueDate',
    'assignee'
  );

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, project: req.params.projectId },
    filteredBody,
    { new: true, runValidators: true }
  );

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: {
      data: task,
    },
  });
});

exports.deleteTask = factory.deleteOne(Task, req => ({
  project: req.params.projectId,
}));