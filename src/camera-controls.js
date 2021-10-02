import * as THREE from "three";

const CAMERA_LEFT = "a";
const CAMERA_RIGHT = "d";
const CAMERA_FORWARD = "w";
const CAMERA_BACK = "s";
const CAMERA_CLOCKWISE = "q";
const CAMERA_COUNTERCLOCKWISE = "e";
const CAMERA_ROT_RESET = " ";

const CAMERA_SPEED = 0.005;
const CAMERA_ROT_SPEED = 0.002 * Math.PI/4

const KEYS = [CAMERA_LEFT, CAMERA_RIGHT, CAMERA_FORWARD, CAMERA_BACK, CAMERA_CLOCKWISE, CAMERA_COUNTERCLOCKWISE, CAMERA_ROT_RESET];

/**
 * Basic RTS camera control with WASD
 */
export class CameraControls {

    constructor(camera) {
        /// Underlying THREE.Camera that is being controlled
        this.camera = camera;
        /// Stores current key states for later update
        this.keystate = {};
        /// Determines if the controls should be active or not 
        this.enabled = true;

        document.addEventListener("keydown", e => this.keyDownListener(e));
        document.addEventListener("keyup", e => this.keyUpListener(e));
    }

    keyDownListener(ev) {
        if (ev.defaultPrevented) return;
    
        if (KEYS.indexOf(ev.key) > -1) {
            this.keystate[ev.key] = true;
        }
    }

    keyUpListener(ev) {
        if (ev.defaultPrevented) return;
        console.log("key: " + ev.key);
    
        if (KEYS.indexOf(ev.key) > -1) {
            this.keystate[ev.key] = false;
        }

        // Special case: Rotation reset:
        if (ev.key == CAMERA_ROT_RESET) {
            // FIXME: This does not reset correctly
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.camera.rotation.y);
            this.camera.applyQuaternion(q);
        }
    }

    update(dt) {
        if (!this.enabled) return;

        let dir = new THREE.Vector2(0, 0);
        let rot = 0;
        if (this.keystate[CAMERA_LEFT]) {
            dir.x += 1;
        }
        if (this.keystate[CAMERA_RIGHT]) {
            dir.x -= 1;
        }
        if (this.keystate[CAMERA_FORWARD]) {
            dir.y += 1;
        }
        if (this.keystate[CAMERA_BACK]) {
            dir.y -= 1;
        }
        if (this.keystate[CAMERA_CLOCKWISE]) {
            rot = CAMERA_ROT_SPEED * dt;
        } 
        if (this.keystate[CAMERA_COUNTERCLOCKWISE]) {
            rot = -CAMERA_ROT_SPEED * dt;
        }

        // FIXME: This fucks up everything in combination with camera movement
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        this.camera.applyQuaternion(q);

        this.camera.position.x += dir.x * CAMERA_SPEED * dt;
        this.camera.position.z += dir.y * CAMERA_SPEED * dt;
    }
}
