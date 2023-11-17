const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const SECRET_KEY = 'my-secret-key';
const nodemailer = require('nodemailer');

// const sendMail = async (email, fullName, token, res) => {
//   try {
//     // nodemailer transporter
//     let transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: config.emailUser,
//         pass: config.emailPassword,
//       },
//     });

//     // Email content
//     const mailOptions = {
//       from: config.emailUser, 
//       to: email,
//       subject: 'Password Reset',
//       html: `<p>Hi ${fullName},<br><br>You have requested to reset your password. Please click the following link to reset your password:<br><br><a href="http://localhost:3000/admin/reset/${token}">Reset your password</a><br><br>If you did not request a password reset, please ignore this email. Your password will remain unchanged.<br><br>Thank you for using our service.</p>`,
//     };

//     // Send email
//     let info = await transporter.sendMail(mailOptions);

//     console.log('Message sent: %s', info.messageId);
//     res.render('admin/forgot', { msg: 'Password reset email sent. Check your email.' });
//   } catch (error) {
//     console.error('Error in sending mail:', error);
//     res.render('admin/forgot', { msg: 'Error during password reset. Please try again.' });
//   }
// };


const getAdminRegistration = (req, res) => {
  res.render('admin/signup', { msg: '' }); 
};

const postAdminRegistration = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

  
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.render('admin/signup', { msg: 'Email already registered.' });
    }

  
    if (password !== confirmPassword) {
      return res.render('admin/signup', { msg: 'Passwords do not match.' });
    }

  
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
  res.render('admin/login', { msg: '' }); 
};

const postAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
   
    const user = await userModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('admin/login', { msg: 'Invalid email or password.' });
    }


    const accessToken = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiration

    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.render('admin/login', { msg: 'Error during login. Please try again.' });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
   
    const users = await userModel.find();

    res.render('admin/dashboard', { users });
  } catch (error) {
    console.error(error);
    res.render('admin/dashboard', { errorMsg: 'Error fetching user data.' });
  }
};


const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await userModel.findByIdAndRemove(userId);

    if (deletedUser) {
      await eventModel.deleteMany({ user: userId });

      res.status(200).json({ message: 'User deleted successfully.' });
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Admin logout
const logoutAdmin = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/admin/login');
};


module.exports = {
  getAdminRegistration,
  postAdminRegistration,
  getAdminLogin,
  postAdminLogin,
  getAdminDashboard,
  logoutAdmin,
  deleteUserById,
};
