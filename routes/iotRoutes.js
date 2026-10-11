const express = require('express');
const router = express.Router();
const {
    getVenueIoTStatus,
    executeHardwareCommand,
    undoHardwareCommand,
    syncBookingsWithHardware,
    toggleAutoSyncMode
} = require('../controllers/iotController');
const { protect } = require('../middleware/authMiddleware');

router.get('/venue/:venueId', protect, getVenueIoTStatus);
router.post('/venue/:venueId/command', protect, executeHardwareCommand);
router.post('/venue/:venueId/undo', protect, undoHardwareCommand);
router.post('/venue/:venueId/auto-sync', protect, syncBookingsWithHardware);
router.put('/venue/:venueId/toggle-auto-sync', protect, toggleAutoSyncMode);

module.exports = router;
