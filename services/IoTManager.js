/**
 * DESIGN PATTERN: SINGLETON PATTERN (GoF Creational Pattern)
 * 
 * Ensures that only ONE authoritative IoT Device Manager exists in the server memory.
 * Coordinates all hardware commands, undo history stacks, and automated telemetry loops.
 */

const IoTDevice = require('../models/IoTDevice');
const Booking = require('../models/Booking');
const {
    ToggleFloodlightsCommand,
    SetLuxIntensityCommand,
    ToggleSprinklersCommand,
    ToggleTurnstileCommand,
    EmergencyShutdownCommand
} = require('../patterns/commands/IoTCommands');

class IoTManager {
    constructor() {
        if (IoTManager.instance) {
            return IoTManager.instance;
        }

        // Venue-specific command undo stacks: { [venueId]: IoTCommand[] }
        this.commandHistory = new Map();
        
        IoTManager.instance = this;
        console.log('[IoT MANAGER] Singleton Hardware Controller Initialized.');
    }

    static getInstance() {
        if (!IoTManager.instance) {
            IoTManager.instance = new IoTManager();
        }
        return IoTManager.instance;
    }

    /**
     * Get or lazy-initialize IoT hardware state for a venue
     */
    async getDeviceState(venueId, venueName = 'Tactical Arena') {
        let device = await IoTDevice.findOne({ venueId });
        if (!device) {
            device = await IoTDevice.create({
                venueId,
                venueName,
                floodlights: {
                    status: false,
                    lux: 750,
                    mode: 'MATCH_MODE',
                    zones: [
                        { name: 'Main Pitch', active: false },
                        { name: 'Sidelines & Goalposts', active: false },
                        { name: 'Spectator Canopy', active: false }
                    ]
                },
                sprinklers: {
                    status: false,
                    pressurePsi: 48,
                    activeCycleMinutes: 3,
                    soilMoisturePct: 42
                },
                turnstile: {
                    isLocked: true,
                    mode: 'QR_TICKET_ONLY',
                    totalPassesToday: 14,
                    lastIngressTime: new Date()
                },
                telemetry: {
                    powerDrawKw: 1.2,
                    solarBackupActive: true,
                    systemHealth: 'OPTIMAL',
                    ambientTempC: 28,
                    signalLatencyMs: 14
                },
                autoSyncWithBookings: true
            });
        }
        return device;
    }

    /**
     * Execute a Hardware Command (Command Pattern Invocation)
     */
    async executeCommand(venueId, commandType, params = {}, executedBy = 'Admin Partner') {
        const device = await this.getDeviceState(venueId);

        let command;
        switch (commandType) {
            case 'TOGGLE_FLOODLIGHTS':
                command = new ToggleFloodlightsCommand(device, params);
                break;
            case 'SET_LUX':
                command = new SetLuxIntensityCommand(device, params);
                break;
            case 'TOGGLE_SPRINKLERS':
                command = new ToggleSprinklersCommand(device, params);
                break;
            case 'TOGGLE_TURNSTILE':
                command = new ToggleTurnstileCommand(device, params);
                break;
            case 'EMERGENCY_SHUTDOWN':
                command = new EmergencyShutdownCommand(device);
                break;
            default:
                throw new Error(`Unknown hardware command type: ${commandType}`);
        }

        // Execute command
        const executionResult = await command.execute();

        // Push to in-memory undo stack for this venue
        if (!this.commandHistory.has(venueId.toString())) {
            this.commandHistory.set(venueId.toString(), []);
        }
        const venueStack = this.commandHistory.get(venueId.toString());
        venueStack.push(command);
        if (venueStack.length > 20) venueStack.shift(); // Keep latest 20 commands

        // Record in persistent audit log
        device.commandAuditLog.unshift({
            commandName: commandType,
            params,
            executedBy,
            timestamp: new Date(),
            status: 'SUCCESS'
        });
        if (device.commandAuditLog.length > 50) device.commandAuditLog.pop();

        await device.save();

        return {
            executionResult,
            device,
            canUndo: venueStack.length > 0
        };
    }

    /**
     * Undo Last Command (Reversible Command Pattern Action)
     */
    async undoLastCommand(venueId) {
        const venueStack = this.commandHistory.get(venueId.toString());
        if (!venueStack || venueStack.length === 0) {
            return { success: false, message: 'No command available in undo buffer' };
        }

        const lastCommand = venueStack.pop();
        const undoResult = await lastCommand.undo();
        const device = lastCommand.device;

        // Record undo in audit log
        device.commandAuditLog.unshift({
            commandName: `UNDO: ${lastCommand.name}`,
            params: {},
            executedBy: 'Tactical Undo Controller',
            timestamp: new Date(),
            status: 'REVERTED'
        });

        await device.save();

        return {
            success: true,
            undoResult,
            device,
            canUndo: venueStack.length > 0
        };
    }

    /**
     * Auto-Sync Stadium Hardware with Real-Time Bookings
     * If an active confirmed match is ongoing right now, automatically activate match lighting!
     */
    async syncWithActiveBookings(venueId) {
        const device = await this.getDeviceState(venueId);
        if (!device.autoSyncWithBookings) {
            return { synced: false, reason: 'Auto-sync disabled' };
        }

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // Find confirmed bookings for today at this venue
        const bookings = await Booking.find({
            turfName: device.venueName,
            status: 'Confirmed'
        });

        // Current time in minutes
        const currentMins = now.getHours() * 60 + now.getMinutes();

        let hasActiveMatchNow = false;
        let activeMatch = null;

        for (const b of bookings) {
            // Check time slot format: "06:00 PM (Court A) - 1h" or similar
            const match = b.timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (match) {
                let [_, hrs, mins, modifier] = match;
                hrs = parseInt(hrs);
                mins = parseInt(mins);
                if (hrs === 12) hrs = 0;
                if (modifier.toUpperCase() === 'PM') hrs += 12;

                const startMins = hrs * 60 + mins;
                const endMins = startMins + 60; // 1 hr slot

                if (currentMins >= startMins && currentMins <= endMins) {
                    hasActiveMatchNow = true;
                    activeMatch = b;
                    break;
                }
            }
        }

        if (hasActiveMatchNow && !device.floodlights.status) {
            // Turn on lights automatically for the active match
            await this.executeCommand(venueId, 'TOGGLE_FLOODLIGHTS', { targetStatus: true, lux: 850 }, 'Autonomous Booking Sync');
            return { synced: true, matchActive: true, booking: activeMatch.timeSlot };
        }

        return { synced: true, matchActive: hasActiveMatchNow, lightsOn: device.floodlights.status };
    }
}

module.exports = IoTManager;
