// adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.get('/signup', adminController.getAdminRegistration);
router.post('/signup', adminController.postAdminRegistration);

router.get('/login', adminController.getAdminLogin);
router.post('/login', adminController.postAdminLogin);

// Protect the /dashboard route with authentication
router.get('/dashboard', auth.authenticateToken, adminController.getAdminDashboard);

// Protect the /logout route with authentication
router.get('/logout', auth.authenticateToken, adminController.logoutAdmin);

module.exports = router;
 