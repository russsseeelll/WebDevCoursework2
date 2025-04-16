const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classesController');

router.get('/', classesController.getClasses);
router.post('/add', classesController.addClass);
router.post('/edit', classesController.editClass);
router.post('/delete', classesController.deleteClass);
router.post('/timeslots/update', classesController.updateTimeslots);
router.get('/participants', classesController.getParticipants);
router.post('/participants/add', classesController.addParticipant);

module.exports = router;
