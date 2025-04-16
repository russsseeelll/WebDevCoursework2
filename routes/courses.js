const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/coursesController');

router.get('/', coursesController.getCourses);
router.post('/add', coursesController.addCourse);
router.post('/edit', coursesController.editCourse);
router.post('/delete', coursesController.deleteCourse);
router.get('/participants', coursesController.getParticipants);
router.post('/participants/add', coursesController.addParticipant);

module.exports = router;
