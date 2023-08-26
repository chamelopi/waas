import * as THREE from "three";

/**
 * Handles keyboard input, ignoring key presses automatically when HTML input fields are selected
 * 
 */
export class Controls {

    private keystate: any;
    private mouseState: any;
    private mouseX: number;
    private mouseY: number;

    constructor(canvas: HTMLCanvasElement) {
        this.keystate = {};
        this.mouseState = {};
        this.mouseX = 0;
        this.mouseY = 0;

        document.addEventListener("keyup", e => this.keyUpListener(e));
        document.addEventListener("keydown", e => this.keyDownListener(e));
        document.addEventListener("pointermove", e => this.pointerMove(e));
        canvas.addEventListener("mousedown", e => this.mouseDownListener(e));
        canvas.addEventListener("mouseup", e => this.mouseUpListener(e));
        // Prevent right click context menu
        canvas.addEventListener("contextmenu", e => {
            e.preventDefault();
            return false;
        });
    }

    isInputElement(): boolean {
        return ["input", "button"].indexOf(document.activeElement.tagName.toLowerCase()) >= 0;
    }

    isCanvasElement(): boolean {
        return document.activeElement.tagName === "canvas";
    }

    pointerMove(ev) {
        if (ev.defaultPrevented) return;

        // normalized device coordinates
        this.mouseX = (ev.clientX / window.innerWidth ) * 2 - 1;
        this.mouseY = -(ev.clientY / window.innerHeight ) * 2 + 1;
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
    getKeyState(key?: any): boolean {
        if (key) {
            return !!(this.keystate[key]);
        } else {
            return this.keystate;
        }
    }

    getMousePos(): THREE.Vector2 {
        return new THREE.Vector2(this.mouseX, this.mouseY);
    }

    /**
     * Returns mouse button state
     * 
     * 0: left mouse button
     * 1: middle mouse button
     * 2: right mouse button
     */
    getMouseState(button: number): boolean {
        return !!(this.mouseState[button]);
    }

    /**
     * Resets all keystates/mouse states
     */
    reset() {
        for (const [k, v] of Object.entries(this.keystate)) {
            if (v) {
                this.keystate[k] = false;
            }
        }
        for(const i in [0, 1, 2]) {
            this.mouseState[i] = false;
        }
    }
}
