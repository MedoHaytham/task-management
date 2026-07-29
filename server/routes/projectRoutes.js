// routes/projectRoutes.js
const express = require('express');
const projectController = require('../controllers/projectController');
const projectAccess = require('../middleware/projectAccess');
const taskRouter = require('./taskRoutes');
const { protect } = require('../middleware/protect');

const router = express.Router();

router.use(protect); // all routes below require login

// nested route: /projects/:projectId/tasks
router.use('/:projectId/tasks', taskRouter);

router
  .route('/')
  .get(projectController.restrictToUserProjects, projectController.getAllProjects)
  .post(projectController.createProject);

router
  .route('/:id')
  .get(projectAccess.checkProjectAccess, projectController.getProject)
  .patch(
    projectAccess.checkProjectAccess,
    projectAccess.checkProjectOwner,
    projectController.updateProject
  )
  .delete(
    projectAccess.checkProjectAccess,
    projectAccess.checkProjectOwner,
    projectController.deleteProject
  );

router.post(
  '/:id/members',
  projectAccess.checkProjectAccess,
  projectAccess.checkProjectOwner,
  projectController.addMember
);

router.delete(
  '/:id/members',
  projectAccess.checkProjectAccess,
  projectAccess.checkProjectOwner,
  projectController.removeMember
);

module.exports = router;