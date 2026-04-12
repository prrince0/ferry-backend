const scheduleController = require('../controllers/scheduleController');
const express = require('express');
const router = express.Router();
router.get('/test', (req, res) => {
    res.json({ message: 'Schedule routes working' });
});
router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;