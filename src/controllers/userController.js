const userModel = require('../models/user');
const config = require('../config/config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const SECRET_KEY = 'my-secret-key';



const sendMail = async (email, fullName, token, res) => {
    try {
        let transporter = await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailUser,
                pass: config.emailPassword,
            }, 
        });

        const info = {
            from: config.emailUser,
            to: email,
            subject: 'Password Reset',
            html: '<p>Hi ' + fullName + ', <br><br> You have requested to reset your password. Please click the following link to reset your password:<br><br> <a href="http://localhost:3000/users/resetPassword?token=' + token + '">reset your password</a><br><br>If you did not request a password reset, please ignore this email. Your password will remain unchanged.<br><br>Thank you for using our service.</p>'
        };

        transporter.sendMail(info, (err, result) => {
            if (err) {
                console.log('Error in sending Mail: ', err);
            } else {
                console.log('Mail sent successfully.', info);
            }
        });
    } catch (error) {
        res.status(400).json({ msg: ' there is an error in mail sending', err: error });
    }

};

const registrationMail = async (email, fullName) => {
    try {
        let transporter = await nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.emailUser,
                pass: config.emailPassword,
            },
        });

        const info = {
            from: config.emailUser,
            to: email,
            subject: 'Registration Successful',
            html: `<p style="font-family: 'Arial', sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
            Hi ${fullName},<br><br>
            
            <strong>Welcome to LeopardRuns Event Management Company!</strong><br>
            
            🎉 Congratulations on successfully registering with our Live Event Management service. We're thrilled to have you on board and look forward to providing you with an extraordinary event experience.<br><br>
            
            🌟 Your journey with LeopardRuns begins now! Explore our upcoming events, stay tuned for exciting updates, and get ready for an unforgettable event journey.<br><br>
            
            📅 Don't miss out on the latest happenings! Check our event calendar regularly to stay informed about upcoming events, workshops, and more.<br><br>
            
            🚀 Feel free to reach out to us if you have any questions or need assistance. Our team is here to make your event experience seamless and enjoyable.<br><br>
            
            🎈 Once again, thank you for choosing LeopardRuns Event Management. We can't wait to create memorable moments together!<br><br>
            
            Best Regards,<br>
            LeopardRuns Event Management Company
        </p>
        `
        };

        transporter.sendMail(info, (err, result) => {
            if (err) {
                console.log('Error in sending Mail: ', err);
            } else {
                console.log('Mail sent successfully.', info);
            }
        });
    } catch (error) {
        console.error('Error in sending mail:', error);
    }
};




const signup = async (req, res) => {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    try {
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (!password || typeof password !== 'string' || password !== confirmPassword) {
            return res.status(400).json({ message: "Password and Confirm Password don't match" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            fullName: fullName,
            email: email,
            phone: phone,
            password: hashPassword,
            confirmPassword: hashPassword,
            is_admin: 0
        });

        const token = jwt.sign(
            {
                email: newUser.email,
                id: newUser._id,
            },
            SECRET_KEY
        );

        registrationMail(newUser.email, newUser.fullName);

        res.status(200).json({
            msg: "Your Registration has been successful. ",
            user: newUser,
            token: token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Your registration has been failed.' });
    }
};

const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);
        if (!matchPassword) {
            return res.status(404).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            {
                email: existingUser.email,
                id: existingUser._id,
            },
            SECRET_KEY
        );
        res.status(200).json({ user: existingUser, token: token, redirect:'/dashboard' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const password = req.body.password;

        const data = userModel.findOne({ _id: user_id })

        if (data) {
            const newPassword = await bcrypt.hash(password, 10);

            const userData = await userModel.findByIdAndUpdate({ _id: user_id }, {
                $set: {
                    password: newPassword
                }
            });
            res.status(200).json({ msg: 'password updated successfully' })
        }
        else {
            res.status(200).json({ msg: "user not found" })
        }
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong' });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await userModel.findOne({ email: email });

        if (userData) {
            const randomString = randomstring.generate();
            const data = await userModel.updateOne({ email: email }, { $set: { token: randomString } });
            sendMail(userData.email, userData.fullName, randomString);
            res.status(200).json({ msg: 'Please check your email and reset your password.' });
        } else {
            res.status(200).json({ msg: 'This email does not exist.' })
        }


    } catch (error) {
        res.status(404).json({ msg: 'something went wrong in the forgot password' }, { err: error.message })
    }
};

const resetPassword = async (req, res) => {
    try {
        //validate token
        const token = req.query.token;
        const tokenData = await userModel.findOne({ token: token });
        if (tokenData) {
            const password = req.body.password;
            const newPassword = await bcrypt.hash(password, 10);
            const userData = await userModel.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newPassword, token: '' } }, { new: true })
            res.status(200).json({ msg: 'User password has been reset.', data: userData });

        }
        else {
            res.status(200).json({ msg: 'This link has been expired.' })
        }
    } catch (error) {
        res.status(404).json({ msg: 'something went wrong in the reset password' })
    }
}



module.exports = { signup, signin, updatePassword, forgotPassword, resetPassword };
