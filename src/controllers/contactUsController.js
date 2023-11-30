const ContactUs = require('../models/contactUs');

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

    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  submitContactForm,
};
