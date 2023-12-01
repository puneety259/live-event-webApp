const mongoose = require('mongoose');
const userModel = require('../models/user')
const config = require('../config/config');
const Event = require('../models/Event');
const nodemailer = require('nodemailer');

const sendEventNotification = async (eventDetails, userEmails) => {
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
            bcc: userEmails,
            subject: 'New Event Created',
            html: `<p>Hi there,<br><br>A new event has been created:<br><br>
            <strong>Event Name:</strong> ${eventDetails.title}<br>
            <strong>Description:</strong> ${eventDetails.description}<br>
            <strong>Date:</strong> ${eventDetails.date}<br>
            <strong>Location:</strong> ${eventDetails.location}<br><br>
            Regards,<br>DreamCraft Events
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

const addEvent = async (req, res) => {
    try {
        const eventData = req.body;
        const event = new Event(eventData);
        const savedEvent = await event.save();

        const allUsers = await userModel.find({}, 'email');
        const userEmails = allUsers.map(user => user.email);

        sendEventNotification(savedEvent, userEmails);

        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const getEvent = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id; 
        const eventData = req.body;
        const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({
                error: 'Event not found',
            });
        }
        res.status(200).json(updatedEvent);
    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err.message,
        });
    }
};


const UpdateEventByID = async (req, res) => {
    try {
        const eventId = req.params.id; 
        const eventData = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({
                error: 'Event not found',
            });
        }
        res.status(202).json({
            eventData: updatedEvent,
            msg: 'Event updated successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message,
        });
    }
};


const getEventByID = async (req, res) => {
    try {
        const eventId = req.params.id; 
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                error: 'Event not found'
            });
        }
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const deleteEventByID = (req, res) => {
    const eventId = req.params.id; 

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return res.status(400).json({ error: 'Invalid Event ID' });
    }

    Event.findByIdAndRemove(eventId)
        .then((deletedEvent) => {
            if (deletedEvent) {
                res.status(200).json({ message: 'Event deleted' });
            } else {
                res.status(404).json({ error: 'Event not found' });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
};


module.exports = {
    addEvent,
    getEvent,
    updateEvent,
    UpdateEventByID,
    getEventByID,
    deleteEventByID,
};

