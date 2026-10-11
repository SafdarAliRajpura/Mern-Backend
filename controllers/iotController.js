const IoTManager = require('../services/IoTManager');
const Venue = require('../models/Venue');

const iotManager = IoTManager.getInstance();

// @route   GET /api/iot/venue/:venueId
// @desc    Get IoT device state, telemetry, and audit log for a venue
// @access  Private (Partner / Admin)
exports.getVenueIoTStatus = async (req, res) => {
    try {
        const { venueId } = req.params;
        let venueName = 'Tactical Turf Arena';
        
        try {
            const venue = await Venue.findById(venueId);
            if (venue) venueName = venue.name;
        } catch (e) {
            // In case venueId is placeholder or mock
        }

        const device = await iotManager.getDeviceState(venueId, venueName);
        res.status(200).json({
            success: true,
            data: device
        });
    } catch (error) {
        console.error('[IoT CONTROLLER] Get Status Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   POST /api/iot/venue/:venueId/command
// @desc    Execute an IoT hardware command (Floodlights, Sprinklers, Gates, etc.)
// @access  Private (Partner / Admin)
exports.executeHardwareCommand = async (req, res) => {
    try {
        const { venueId } = req.params;
        const { commandType, params } = req.body;

        if (!commandType) {
            return res.status(400).json({ success: false, message: 'commandType is required' });
        }

        const executedBy = req.user ? `${req.user.first_name || 'Partner'} (${req.user.role})` : 'Tactical Admin';
        const result = await iotManager.executeCommand(venueId, commandType, params, executedBy);

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('[IoT CONTROLLER] Execute Command Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   POST /api/iot/venue/:venueId/undo
// @desc    Undo the last executed hardware command using the Command Pattern
// @access  Private (Partner / Admin)
exports.undoHardwareCommand = async (req, res) => {
    try {
        const { venueId } = req.params;
        const result = await iotManager.undoLastCommand(venueId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('[IoT CONTROLLER] Undo Command Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   POST /api/iot/venue/:venueId/auto-sync
// @desc    Auto-synchronize floodlight and gate states with confirmed bookings
// @access  Private (Partner / Admin)
exports.syncBookingsWithHardware = async (req, res) => {
    try {
        const { venueId } = req.params;
        const syncResult = await iotManager.syncWithActiveBookings(venueId);
        const device = await iotManager.getDeviceState(venueId);

        res.status(200).json({
            success: true,
            syncResult,
            data: device
        });
    } catch (error) {
        console.error('[IoT CONTROLLER] Auto Sync Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route   PUT /api/iot/venue/:venueId/toggle-auto-sync
// @desc    Toggle the auto-sync mode flag
// @access  Private (Partner / Admin)
exports.toggleAutoSyncMode = async (req, res) => {
    try {
        const { venueId } = req.params;
        const device = await iotManager.getDeviceState(venueId);
        device.autoSyncWithBookings = !device.autoSyncWithBookings;
        await device.save();

        res.status(200).json({
            success: true,
            autoSyncWithBookings: device.autoSyncWithBookings
        });
    } catch (error) {
        console.error('[IoT CONTROLLER] Toggle Auto-Sync Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
