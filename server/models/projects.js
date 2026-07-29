// models/projectModel.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project must have a name'],
      trim: true,
      maxlength: [100, 'Project name must be less than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be less than 1000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project must belong to an owner'],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes to speed up queries for projects a user owns or belongs to
projectSchema.index({ owner: 1 });
projectSchema.index({ members: 1 });

// Virtual populate: fetch all tasks belonging to this project
// without storing task IDs on the project document itself
projectSchema.virtual('tasks', {
  ref: 'Task',
  foreignField: 'project',
  localField: '_id',
});

// Auto-populate owner and members with limited fields
// so sensitive data (password, refreshToken) is never exposed
projectSchema.pre(/^find/, function () {
  this.populate({ path: 'owner', select: 'name email role' })
      .populate({ path: 'members', select: 'name email role' });
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;