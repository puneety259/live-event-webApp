const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_KEY = 'my-secret-key';

const getAdminRegistration = (req, res) => {
  res.render('admin/signup', { msg: '' }); // Create an HTML form for admin registration
};

const postAdminRegistration = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // Check if the email is already registered
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.render('admin/signup', { msg: 'Email already registered.' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render('admin/signup', { msg: 'Passwords do not match.' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new userModel({
      fullName,
      email,
      phone,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    res.redirect('/admin/login');
  } catch (err) {
    console.error(err);
    res.render('admin/signup', { msg: 'Error during registration. Please try again.' });
  }
};

const getAdminLogin = (req, res) => {
  res.render('admin/login', { msg: '' }); // Render the admin login form
};

const postAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await userModel.findOne({ email });

    // If user not found or password does not match, redirect to login page
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('admin/login', { msg: 'Invalid email or password.' });
    }

    // Authentication successful, create JWT token
    const accessToken = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    // Store the token in a cookie (you may want to use a more secure method in production)
    res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiration

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/login', { msg: 'Error during login. Please try again.' });
  }
};

const getAdminDashboard = (req, res) => {
  res.render('admin/dashboard'); // Render the admin dashboard
};

// Admin logout
const logoutAdmin = (req, res) => {
  // Clear the JWT cookie
  res.clearCookie('jwt');
 // Optional: You can also call req.logout() if you are using passport for authentication
  res.redirect('/admin/login');
};

module.exports = {
  getAdminRegistration,
  postAdminRegistration,
  getAdminLogin,
  postAdminLogin,
  getAdminDashboard,
  logoutAdmin,
};
