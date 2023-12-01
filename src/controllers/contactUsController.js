const ContactUs = require('../models/contactUs');
const config = require('../config/config');
const nodemailer = require('nodemailer');

const submitContactForm = async (req, res) => {
  try {
    const { name, email, contactNumber, subject, message } = req.body;

    const newContact = new ContactUs({
      name,
      email,
      contactNumber,
      subject,
      message,
    });

    const savedContact = await newContact.save();
    sendContactNotification(savedContact);

    res.status(201).json({ msg: "Contact saved and sent successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const sendContactNotification = async (contactDetails) => {
  try {
    let transporter = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const info = {
      from: `${config.fromName} <${config.emailUser}>`,
      to: 'eventdlogin@gmail.com', 
      subject: 'New Contact Form Submission',
      html: `<p>Hi Admin,<br><br>A new contact form has been submitted:<br><br>
        <strong>Name:</strong> ${contactDetails.name}<br>
        <strong>Email:</strong> ${contactDetails.email}<br>
        <strong>Contact Number:</strong> ${contactDetails.contactNumber}<br>
        <strong>Subject:</strong> ${contactDetails.subject}<br>
        <strong>Message:</strong> ${contactDetails.message}<br><br>
        Regards,<br>DreamCraft Events
      </p>
      `,
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

module.exports = {
  submitContactForm,
};
