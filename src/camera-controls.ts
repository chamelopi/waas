import * as THREE from "three";
import { Controls } from "./controls";
import { Terrain } from "./terrain/terrain";

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
const CAMERA_Y_OFFSET = 8;
const CAMERA_ZOOM_SPEED = 0.0005;

/**
 * Basic RTS camera control with WASD
 */
export class CameraControls {

    private enabled: boolean;
    private zoomFactor: number;

    constructor(private camera: THREE.Camera, private controls: Controls) {
        /// Determines if the controls should be active or not 
        this.enabled = true;
        this.zoomFactor = 1.0;

        document.addEventListener("keyup", e => this.keyUpListener(e));

        document.addEventListener("wheel", (e) => {
            this.zoomFactor = Math.min(2.0, Math.max(0.5, this.zoomFactor + e.deltaY * CAMERA_ZOOM_SPEED));
        })
    }

    keyUpListener(ev) {
        // Special case: Rotation reset:
        if (ev.key == CAMERA_ROT_RESET) {
            // Dirty hack, this "reset" only works when applied several times in a row (I don't know why)
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

    update(dt: number, terrain: Terrain) {
        if (!this.enabled) return;

        const keystate = this.controls.getKeyState();
        let dir = new THREE.Vector2(0, 0);
        let camdir = new THREE.Vector3(0, 0, 0);
        this.camera.getWorldDirection(camdir);
        let rot = 0;

        if (keystate[CAMERA_LEFT]) {
            // Turn left: Swap X and Y and make X negative
            dir.x += camdir.z;
            dir.y += -camdir.x;
        }
        if (keystate[CAMERA_RIGHT]) {
            // Turn right: Swap X and Y, and make Y negative
            dir.x += -camdir.z;
            dir.y += camdir.x;
        }
        if (keystate[CAMERA_FORWARD]) {
            dir.x += camdir.x;
            dir.y += camdir.z;
        }
        if (keystate[CAMERA_BACK]) {
            dir.x += -camdir.x;
            dir.y += -camdir.z;
        }
        if (keystate[CAMERA_CLOCKWISE]) {
            rot = CAMERA_ROT_SPEED * dt;
        } 
        if (keystate[CAMERA_COUNTERCLOCKWISE]) {
            rot = -CAMERA_ROT_SPEED * dt;
        }

        const q = new THREE.Quaternion();
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        this.camera.applyQuaternion(q);

        dir = dir.normalize();

        // TODO: Clamp camera to terrain

        this.camera.position.x += dir.x * CAMERA_SPEED * dt;
        this.camera.position.z += dir.y * CAMERA_SPEED * dt;

        // Set height based on terrain, so that we can look on the top of high mountains etc.
        let height = terrain.getHeightFromPosition(this.camera.position.x, this.camera.position.z);
        this.camera.position.y = (Math.max(height, 0) + CAMERA_Y_OFFSET) * this.zoomFactor;
    }
}
