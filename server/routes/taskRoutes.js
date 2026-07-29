// routes/taskRoutes.js
const express = require('express');
const taskController = require('../controllers/taskController');
const projectAccess = require('../middleware/projectAccess');

// mergeParams: true is required to access :projectId from the parent router
const router = express.Router({ mergeParams: true });

// Any task route first requires the user to have access to the parent project
router.use(projectAccess.checkProjectAccess);

router
  .route('/')
  .get(taskController.restrictToProjectTasks, taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route('/:id')
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;