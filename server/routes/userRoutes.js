const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/protect');
const { allowedTo } = require('../middleware/allowedTo');
const { USER_ROLES } = require('../utils/usersRoles');

const router = express.Router();

// Public routes (no auth required)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refreshToken', authController.refreshAccessToken);
router.post('/logout', authController.logout);


// Everything below requires a valid access token
router.use(protect);

// Self-service routes (any logged-in user)
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);


router.get('/lookup', userController.getUserByEmail);

// Everything below is admin-only
router.use(allowedTo(USER_ROLES.ADMIN));

router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;