const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.get('/signup', adminController.getAdminRegistration);
router.post('/signup', adminController.postAdminRegistration);

router.get('/login', adminController.getAdminLogin);
router.post('/login', adminController.postAdminLogin);

router.get('/dashboard', auth.authenticateToken, adminController.getAdminDashboard);
router.delete('/deleteUser/:id', adminController.deleteUserById);

router.get('/logout', auth.authenticateToken, adminController.logoutAdmin);




router.get('/', function(req, res) {
    res.redirect('/admin');
});


module.exports = router;