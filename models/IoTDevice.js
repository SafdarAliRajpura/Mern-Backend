const mongoose = require('mongoose');

const iotDeviceSchema = new mongoose.Schema({
    venueId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Venue', 
        required: true, 
        unique: true 
    },
    venueName: { 
        type: String, 
        required: true 
    },
    floodlights: {
        status: { type: Boolean, default: false },
        lux: { type: Number, default: 750, min: 100, max: 1200 },
        colorTemp: { type: String, default: 'stadium-white' }, // 'stadium-white', 'warm-flood', 'cool-beam'
        mode: { type: String, default: 'MATCH_MODE' }, // 'MATCH_MODE', 'TRAINING_MODE', 'ECO_MODE'
        zones: [
            { name: { type: String, default: 'Main Pitch' }, active: { type: Boolean, default: false } },
            { name: { type: String, default: 'Sidelines & Goalposts' }, active: { type: Boolean, default: false } },
            { name: { type: String, default: 'Spectator Canopy' }, active: { type: Boolean, default: false } }
        ]
    },
    sprinklers: {
        status: { type: Boolean, default: false },
        pressurePsi: { type: Number, default: 48 },
        activeCycleMinutes: { type: Number, default: 3 },
        soilMoisturePct: { type: Number, default: 42 }
    },
    turnstile: {
        isLocked: { type: Boolean, default: true },
        mode: { type: String, default: 'QR_TICKET_ONLY' }, // 'QR_TICKET_ONLY', 'OPEN_INGRESS', 'EMERGENCY_EXIT'
        totalPassesToday: { type: Number, default: 0 },
        lastIngressTime: { type: Date }
    },
    telemetry: {
        powerDrawKw: { type: Number, default: 14.8 },
        solarBackupActive: { type: Boolean, default: true },
        systemHealth: { type: String, default: 'OPTIMAL' },
        ambientTempC: { type: Number, default: 27 },
        signalLatencyMs: { type: Number, default: 12 }
    },
    autoSyncWithBookings: { 
        type: Boolean, 
        default: true 
    },
    commandAuditLog: [
        {
            commandName: { type: String, required: true },
            params: { type: mongoose.Schema.Types.Mixed },
            executedBy: { type: String, default: 'Tactical System' },
            timestamp: { type: Date, default: Date.now },
            status: { type: String, default: 'SUCCESS' }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('IoTDevice', iotDeviceSchema);
