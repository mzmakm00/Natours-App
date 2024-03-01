const express = require('express');

const userController = require('./../controllers/userController');
const router = express.Router();
const authController = require('./../controllers/authController');

router.post('/signup', authController.signUP);
router.post('/login', authController.logIn)
router.get('/logout', authController.loggedOut)
router.post('/forgotpassword', authController.forgotPassword)
router.patch('/resetpassword/:token', authController.resetPassword)

// PROTECT ALL ROUTES AFTER THIS MIDDLEWARE
router.use(authController.protect)

router.patch('/updatemypassword', authController.changedPassword)
router.get('/me',userController.getMe,userController.getUser)
router.patch('/updateMe',userController.uploadUserPhoto,userController.uploadresizePhoto,userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)

router.use(authController.restrictTo('admin'))

router
.route('/')
.get(userController.getAllUsers) 
.post(userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)

module.exports = router;