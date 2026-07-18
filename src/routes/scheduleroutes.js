const scheduleController = require('../controllers/scheduleController');
const express = require('express');
const router = express.Router();


router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);
router.get('/:id', scheduleController.findScheduleById);
// for users
router.get('/', scheduleController.findAllSchedules);

module.exports = router;