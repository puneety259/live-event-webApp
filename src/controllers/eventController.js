const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST method to create a new event
const addEvent = async (req, res) => {
    try {
        const eventData = req.body;
        const event = new Event(eventData);
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// GET method to retrieve all events
const getEvent = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT method to update an event by ID
const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id; // Assuming the event ID is passed as a route parameter
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

// PATCH method to partially update an event by ID
const UpdateEventByID = async (req, res) => {
    try {
        const eventId = req.params.id; // Assuming the event ID is passed as a route parameter
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


// GET method to retrieve an event by ID
const getEventByID = async (req, res) => {
    try {
        const eventId = req.params.id; // Assuming the event ID is passed as a route parameter
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

// DELETE method to delete an event by ID
const deleteEventByID = (req, res) => {
    const eventId = req.params.id; // Assuming the event ID is passed as a route parameter
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

