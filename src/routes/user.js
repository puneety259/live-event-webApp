const express = require('express');
const bodyParser = require('body-parser');
const { signup, signin, updatePassword, forgotPassword, resetPassword } = require('../controllers/userController');
const router = express.Router();
const userController = require('../controllers/userController');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/signup', signup);
router.post('/signin', signin);

//update password
router.post('/updatePassword', updatePassword);
//forgot password
router.post('/forgotPassword', forgotPassword);
//reset password
router.get('/resetPassword', resetPassword);

module.exports = router;
