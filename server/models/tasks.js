const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task must have a title'],
      trim: true,
      maxlength: [150, 'Title must be less than 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description must be less than 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['To Do', 'In Progress', 'Done'],
        message: 'Status must be one of: To Do, In Progress, Done',
      },
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be one of: Low, Medium, High',
      },
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      validate: {
        // Only enforced when a dueDate is actually provided
        validator: function (val) {
          return !val || val >= new Date().setHours(0, 0, 0, 0);
        },
        message: 'Due date cannot be in the past',
      },
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have a creator'],
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // task can be unassigned
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Speed up common queries: tasks by project, and filtering by status/priority/assignee
taskSchema.index({ project: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, priority: 1 });
taskSchema.index({ project: 1, assignee: 1 });

// Auto-populate creator and assignee with limited, safe fields
taskSchema.pre(/^find/, function () {
  this.populate({ path: 'creator', select: 'name email' })
      .populate({ path: 'assignee', select: 'name email' });
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;