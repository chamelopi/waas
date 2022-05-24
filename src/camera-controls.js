import * as THREE from "three";

const CAMERA_LEFT = "a";
const CAMERA_RIGHT = "d";
const CAMERA_FORWARD = "w";
const CAMERA_BACK = "s";
const CAMERA_CLOCKWISE = "q";
const CAMERA_COUNTERCLOCKWISE = "e";
const CAMERA_ROT_RESET = " ";
const CAMERA_ENABLE = "c";

const CAMERA_SPEED = 0.005;
const CAMERA_ROT_SPEED = 0.002 * Math.PI/4

/**
 * Basic RTS camera control with WASD
 */
export class CameraControls {

    constructor(camera, controls) {
        /// Underlying THREE.Camera that is being controlled
        this.camera = camera;
        /// Determines if the controls should be active or not 
        this.enabled = true;
        this.controls = controls;

        document.addEventListener("keyup", e => this.keyUpListener(e));
    }

    keyUpListener(ev) {
        // Special case: Rotation reset:
        if (ev.key == CAMERA_ROT_RESET) {
            // Dirty hack, this "reset" only works when applied several times in a row
            for (let i = 0; i < 10; ++i) {
                const q = new THREE.Quaternion();
                q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -this.camera.rotation.y);
                this.camera.applyQuaternion(q);
            }
        }

        if (ev.key == CAMERA_ENABLE) {
            this.enabled = !this.enabled;
        }
    }

    update(dt) {
        if (!this.enabled) return;

        const keystate = this.controls.getKeyState();
        let dir = new THREE.Vector2(0, 0);
        let camdir = new THREE.Vector3(0, 0, 0);
        this.camera.getWorldDirection(camdir);
        let rot = 0;

        if (keystate[CAMERA_LEFT]) {
            // Turn left: Swap X and Y and make X negative
            dir.x += -camdir.z;
            dir.y += camdir.x;
        }
        if (keystate[CAMERA_RIGHT]) {
            // Turn right: Swap X and Y, and make Y negative
            dir.x += camdir.z;
            dir.y += -camdir.x;
        }
        if (keystate[CAMERA_FORWARD]) {
            dir.x += -camdir.x;
            dir.y += -camdir.z;
        }
        if (keystate[CAMERA_BACK]) {
            dir.x += camdir.x;
            dir.y += camdir.z;
        }
        if (keystate[CAMERA_CLOCKWISE]) {
            rot = -CAMERA_ROT_SPEED * dt;
        } 
        if (keystate[CAMERA_COUNTERCLOCKWISE]) {
            rot = CAMERA_ROT_SPEED * dt;
        }

        const q = new THREE.Quaternion();
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        this.camera.applyQuaternion(q);

        dir = dir.normalize();

        this.camera.position.x += dir.x * CAMERA_SPEED * dt;
        this.camera.position.z += dir.y * CAMERA_SPEED * dt;
    }
}
