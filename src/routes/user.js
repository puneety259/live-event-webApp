const express = require('express');
const bodyParser = require('body-parser');
const { signup, signin, updatePassword, forgotPassword, resetPassword,getAllUsers, logoutUser, findUserById } = require('../controllers/userController');
const router = express.Router();
// const userController = require('../controllers/userController');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/signup', signup);
router.post('/auth/signin', signin);    
router.get('/logout', logoutUser);

router.get('/users',getAllUsers);
router.get('/byId/:id', findUserById)
//update password
router.post('/updatePassword', updatePassword);
//forgot password
router.post('/forgot-password/forgotPassword', forgotPassword);
//reset password
router.get('/forgot-password/resetPassword', resetPassword);


module.exports = router; 
