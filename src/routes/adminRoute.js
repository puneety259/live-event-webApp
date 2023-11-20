const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// router.get('/auth/signup', adminController.getAdminRegistration);
// router.post('/auth/signup', adminController.postAdminRegistration);

router.get('/auth/login', adminController.getAdminLogin);
router.post('/auth/login', adminController.postAdminLogin);

router.get('/dashboard', auth.authenticateToken, adminController.getAdminDashboard);
router.delete('/deleteUser/:id', adminController.deleteUserById);

router.get('/auth/logout', auth.authenticateToken, adminController.logoutAdmin);




router.get('/', function(req, res) {
    res.redirect('/admin');
});



module.exports = router;