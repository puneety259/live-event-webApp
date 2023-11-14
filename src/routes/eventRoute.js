const express = require('express');
const {
  addEvent,
  getEvent,
  updateEvent,
  UpdateEventByID,
  getEventByID,
  deleteEventByID,
} = require('../controllers/eventController');
const router = express.Router();

const Event = require('../models/Event'); // Correct the path to your model if necessar

router.post('/addEvent', addEvent);
router.get('/getEvent', getEvent);
router.get('/getEvent/:id', getEventByID);
router.put('/updateEvent/:id', updateEvent);
router.patch('/patchUpdate/:id', UpdateEventByID);
router.delete('/deleteEvent/:id', deleteEventByID);

module.exports = router;
