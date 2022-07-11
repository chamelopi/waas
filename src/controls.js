/**
 * Handles keyboard input, ignoring key presses automatically when HTML input fields are selected
 * 
 */
export class Controls {

    constructor() {
        this.keystate = {};
        this.mouseState = {};

        document.addEventListener("keyup", e => this.keyUpListener(e));
        document.addEventListener("keydown", e => this.keyDownListener(e));
        document.addEventListener("mousedown", e => this.mouseDownListener(e));
        document.addEventListener("mouseup", e => this.mouseUpListener(e));
        // Prevent right click context menu
        document.addEventListener("contextmenu", e => {
            //e.preventDefault();
            //return false;
        });
    }

    isInputElement() {
        return ["input", "button"].indexOf(document.activeElement.tagName.toLowerCase()) >= 0;
    }

    isCanvasElement() {
        return document.activeElement.tagName === "canvas";
    }

    keyDownListener(ev) {
        if (ev.defaultPrevented) return;
        if (this.isInputElement()) return;
    
        this.keystate[ev.key] = true;
    }

    keyUpListener(ev) {
        if (ev.defaultPrevented) return;
        if (this.isInputElement()) return;
        
        this.keystate[ev.key] = false;
    }

    mouseDownListener(ev) {
        if (ev.defaultPrevented) return;
        if (this.isInputElement()) return;

        this.mouseState[ev.button] = true;
    }

    mouseUpListener(ev) {
        if (ev.defaultPrevented) return;
        if (this.isInputElement()) return;

        this.mouseState[ev.button] = false;
    }

    onKeyUp(key, handler) {
        const cb = (e) => {
            if (document.activeElement.tagName.toLowerCase() === "input") return;
            if (e.key === key) {
                handler(e);
            }
        };
        document.addEventListener("keyup", cb);
        return cb;
    }

    /**
     * Returns state for a specified key or all keys
     */
    getKeyState(key) {
        if (key) {
            return !!(this.keystate[key]);
        } else {
            return this.keystate;
        }
    }

    /**
     * Returns mouse button state
     */
    getMouseState(button) {
        return !!(this.mouseState[button]);
    }
}

