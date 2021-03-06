/*
 * js99'er - TI-99/4A emulator written in JavaScript
 *
 * Created 2014 by Rasmus Moustgaard <rasmus.moustgaard@gmail.com>
*/

function Joystick(column, number) {
    this.column = column;
    this.number = number;
    this.index = null;
    this.log = Log.getLog();
    window.addEventListener("gamepadconnected", this.gamepadConnected.bind(this));
    window.addEventListener("gamepaddisconnected", this.gamepadDisconnected.bind(this));
    this.start();
}

Joystick.prototype.start = function () {
    this.interval = window.setInterval(this.update.bind(this), 17);
};

Joystick.prototype.stop = function () {
    if (this.interval) {
        clearInterval(this.interval);
    }
};

Joystick.prototype.registerGamepad = function (number, index) {
    if (!Joystick.gamepadIndices) {
        Joystick.gamepadIndices = {
            0: null,
            1: null
        };
    }
    if (Joystick.gamepadIndices[0] !== index && Joystick.gamepadIndices[1] !== index) {
        Joystick.gamepadIndices[number] = index;
        return true;
    }
    else {
        return false;
    }
};

Joystick.prototype.gamepadConnected = function (e) {
    console.log("gamepadConnected");
    if (this.index === null || !navigator.getGamepads()[this.index]) {
        var gamepad = e.gamepad;
        if (gamepad.id.toLowerCase().indexOf("unknown") === -1) {
            if (this.registerGamepad(this.number, gamepad.index)) {
                this.index = gamepad.index;
                this.log.info("Joystick " + this.number + " connected to gamepad " + this.index);
            }
        }
    }
};

Joystick.prototype.gamepadDisconnected = function (e) {
    var gamepad = e.gamepad;
    if (gamepad.index === this.index) {
        this.log.info("Joystick " + this.number + " disconnected from gamepad " + this.index);
        Joystick.gamepadIndices[this.number] = null;
        this.index = null;
    }
};

Joystick.prototype.update = function () {
    if (this.index !== null) {
        var gamepad = navigator.getGamepads()[this.index];
        if (gamepad && gamepad.connected) {
            this.column[3] = gamepad.buttons[0].pressed;
            var axis0 = gamepad.axes[0];
            this.column[4] = axis0 < -0.1 || gamepad.buttons[14] && gamepad.buttons[14].pressed; // Left
            this.column[5] = axis0 > 0.1  || gamepad.buttons[15] && gamepad.buttons[15].pressed; // Right
            var axis1 = gamepad.axes[1];
            this.column[6] = axis1 > 0.1  || gamepad.buttons[13] && gamepad.buttons[13].pressed; // Down
            this.column[7] = axis1 < -0.1 || gamepad.buttons[12] && gamepad.buttons[12].pressed; // Up
        }
    }
};

Joystick.prototype.getState = function () {
    return {
        column: this.column
    };
};

Joystick.prototype.restoreState = function (state) {
    this.column = state.column;
};