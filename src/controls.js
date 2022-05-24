/**
 * Handles keyboard input, ignoring key presses automatically when HTML input fields are selected
 * 
 */
export class Controls {

    constructor() {
        this.keystate = {};

        document.addEventListener("keyup", e => this.keyUpListener(e));
        document.addEventListener("keydown", e => this.keyDownListener(e));
    }

    keyDownListener(ev) {
        if (ev.defaultPrevented) return;
        if (document.activeElement.tagName.toLowerCase() === "input") return;
    
        this.keystate[ev.key] = true;
    }

    keyUpListener(ev) {
        if (ev.defaultPrevented) return;
        if (document.activeElement.tagName.toLowerCase() === "input") return;
        
        this.keystate[ev.key] = false;
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
}