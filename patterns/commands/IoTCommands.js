/**
 * DESIGN PATTERN: COMMAND PATTERN (GoF Behavioral Pattern)
 * 
 * Encapsulates stadium hardware actions as first-class objects.
 * Allows parameterization of requests, queuing, execution logging,
 * and reversible (undo) operations for physical turf devices.
 */

class IoTCommand {
    constructor(device) {
        if (new.target === IoTCommand) {
            throw new TypeError("Cannot construct Abstract IoTCommand instances directly");
        }
        this.device = device;
        this.name = this.constructor.name;
        this.executedAt = null;
        this.previousState = null;
    }

    async execute() {
        throw new Error("execute() must be implemented by subclass");
    }

    async undo() {
        throw new Error("undo() must be implemented by subclass");
    }
}

/**
 * Command: Toggle or Set Floodlight Status
 */
class ToggleFloodlightsCommand extends IoTCommand {
    constructor(device, { targetStatus, lux, mode } = {}) {
        super(device);
        this.targetStatus = targetStatus;
        this.lux = lux;
        this.mode = mode;
    }

    async execute() {
        // Capture snapshot for reversible undo
        this.previousState = {
            status: this.device.floodlights.status,
            lux: this.device.floodlights.lux,
            mode: this.device.floodlights.mode,
            zones: JSON.parse(JSON.stringify(this.device.floodlights.zones))
        };

        const newStatus = this.targetStatus !== undefined 
            ? this.targetStatus 
            : !this.device.floodlights.status;

        this.device.floodlights.status = newStatus;
        if (this.lux) this.device.floodlights.lux = this.lux;
        if (this.mode) this.device.floodlights.mode = this.mode;

        // Sync individual zone states
        this.device.floodlights.zones.forEach(z => {
            z.active = newStatus;
        });

        // Recalculate power telemetry
        this.device.telemetry.powerDrawKw = newStatus 
            ? Math.round((14.8 * (this.device.floodlights.lux / 750)) * 10) / 10 
            : 1.2;

        this.executedAt = new Date();
        return {
            success: true,
            action: 'FLOODLIGHTS_TOGGLED',
            status: newStatus,
            lux: this.device.floodlights.lux
        };
    }

    async undo() {
        if (!this.previousState) return { success: false, message: 'No state to restore' };
        
        this.device.floodlights.status = this.previousState.status;
        this.device.floodlights.lux = this.previousState.lux;
        this.device.floodlights.mode = this.previousState.mode;
        this.device.floodlights.zones = this.previousState.zones;

        this.device.telemetry.powerDrawKw = this.previousState.status ? 14.8 : 1.2;
        return {
            success: true,
            action: 'FLOODLIGHTS_REVERTED',
            status: this.previousState.status
        };
    }
}

/**
 * Command: Set Lux Intensity Level (Lighting Power)
 */
class SetLuxIntensityCommand extends IoTCommand {
    constructor(device, { lux }) {
        super(device);
        this.targetLux = Math.min(Math.max(Number(lux) || 750, 100), 1200);
    }

    async execute() {
        this.previousState = { lux: this.device.floodlights.lux };
        this.device.floodlights.lux = this.targetLux;
        if (this.device.floodlights.status) {
            this.device.telemetry.powerDrawKw = Math.round((14.8 * (this.targetLux / 750)) * 10) / 10;
        }
        this.executedAt = new Date();
        return { success: true, lux: this.targetLux };
    }

    async undo() {
        this.device.floodlights.lux = this.previousState.lux;
        return { success: true, restoredLux: this.previousState.lux };
    }
}

/**
 * Command: Activate/Deactivate Irrigation Sprinklers
 */
class ToggleSprinklersCommand extends IoTCommand {
    constructor(device, { targetStatus, durationMinutes } = {}) {
        super(device);
        this.targetStatus = targetStatus;
        this.durationMinutes = durationMinutes || 3;
    }

    async execute() {
        this.previousState = {
            status: this.device.sprinklers.status,
            soilMoisture: this.device.sprinklers.soilMoisturePct
        };

        const newStatus = this.targetStatus !== undefined 
            ? this.targetStatus 
            : !this.device.sprinklers.status;

        this.device.sprinklers.status = newStatus;
        if (newStatus) {
            this.device.sprinklers.activeCycleMinutes = this.durationMinutes;
            this.device.sprinklers.soilMoisturePct = Math.min(this.device.sprinklers.soilMoisturePct + 15, 85);
        }

        this.executedAt = new Date();
        return { success: true, sprinklersActive: newStatus };
    }

    async undo() {
        this.device.sprinklers.status = this.previousState.status;
        this.device.sprinklers.soilMoisturePct = this.previousState.soilMoisture;
        return { success: true, restoredStatus: this.previousState.status };
    }
}

/**
 * Command: Lock / Unlock Ingress Turnstiles (QR Gate Barrier)
 */
class ToggleTurnstileCommand extends IoTCommand {
    constructor(device, { isLocked, mode } = {}) {
        super(device);
        this.targetLocked = isLocked;
        this.mode = mode;
    }

    async execute() {
        this.previousState = {
            isLocked: this.device.turnstile.isLocked,
            mode: this.device.turnstile.mode
        };

        const newLockedState = this.targetLocked !== undefined 
            ? this.targetLocked 
            : !this.device.turnstile.isLocked;

        this.device.turnstile.isLocked = newLockedState;
        if (this.mode) this.device.turnstile.mode = this.mode;
        
        if (!newLockedState) {
            this.device.turnstile.lastIngressTime = new Date();
            this.device.turnstile.totalPassesToday += 1;
        }

        this.executedAt = new Date();
        return { success: true, isLocked: newLockedState };
    }

    async undo() {
        this.device.turnstile.isLocked = this.previousState.isLocked;
        this.device.turnstile.mode = this.previousState.mode;
        return { success: true, restoredLocked: this.previousState.isLocked };
    }
}

/**
 * Command: Tactical Emergency Shutdown (All off / Gates unlocked)
 */
class EmergencyShutdownCommand extends IoTCommand {
    constructor(device) {
        super(device);
    }

    async execute() {
        this.previousState = {
            floodlights: JSON.parse(JSON.stringify(this.device.floodlights)),
            sprinklers: JSON.parse(JSON.stringify(this.device.sprinklers)),
            turnstile: JSON.parse(JSON.stringify(this.device.turnstile)),
            telemetry: JSON.parse(JSON.stringify(this.device.telemetry))
        };

        this.device.floodlights.status = false;
        this.device.sprinklers.status = false;
        this.device.turnstile.isLocked = false; // Safety protocol: unlock for egress
        this.device.turnstile.mode = 'EMERGENCY_EXIT';
        this.device.telemetry.powerDrawKw = 0.4;
        this.device.telemetry.systemHealth = 'EMERGENCY_OVERRIDE';

        this.executedAt = new Date();
        return { success: true, message: 'EMERGENCY SHUTDOWN EXECUTED' };
    }

    async undo() {
        this.device.floodlights = this.previousState.floodlights;
        this.device.sprinklers = this.previousState.sprinklers;
        this.device.turnstile = this.previousState.turnstile;
        this.device.telemetry = this.previousState.telemetry;
        return { success: true, message: 'EMERGENCY OVERRIDE REVOKED' };
    }
}

module.exports = {
    IoTCommand,
    ToggleFloodlightsCommand,
    SetLuxIntensityCommand,
    ToggleSprinklersCommand,
    ToggleTurnstileCommand,
    EmergencyShutdownCommand
};
