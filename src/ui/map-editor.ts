import * as THREE from "three";
import { Controls } from "../controls";
import { Terrain } from "../terrain/terrain";
import { GUIBase } from "./gui-base";

export class MapEditor extends GUIBase {

    private html: string;
    private mode: MapEditorMode;

    constructor(controls: Controls, private terrain: Terrain, private raycaster: THREE.Raycaster, private camera: THREE.Camera) {
        super(controls);
        this.html = `
        <div class="ui-base ui-top-right">
            <button id="editor-select-mode" disabled>Select</button>
            <button id="editor-height-mode">Edit terrain height</button>
            <button id="editor-texture-mode" disabled>Edit terrain texture</button>
            <span class="ui-label" id="editor-current-mode">height mode</span>
        </div>
        `
        this.mode = MapEditorMode.HeightMode;
    }

    getHtml(): string {
        return this.html;
    }

    onShow(): void {
        super.onShow();
        this.addEvent("click", "editor-height-mode", () => {
            this.setText("editor-current-mode", "height mode");
            this.mode = MapEditorMode.HeightMode;
        });
        this.addEvent("click", "editor-texture-mode", () => {
            this.setText("editor-current-mode", "texture mode");
            this.mode = MapEditorMode.TextureMode;
        });
        this.addEvent("click", "editor-select-mode", () => {
            this.setText("editor-current-mode", "select mode");
            this.mode = MapEditorMode.SelectMode;
        });
    }

    onHide(): void {
        super.onHide();
    }

    onUpdate(dt: Number): void {
        // Update brush visualization
        const mousePos = this.controls.getMousePos();
        //this.terrain.updateUniforms(true, 80, new THREE.Vector2(mousePos.x, window.innerHeight - mousePos.y));
        this.raycaster.setFromCamera(mousePos, this.camera);
        const intersects = this.raycaster.intersectObject(this.terrain.mesh, false);

        if (intersects.length > 0) {
            const positionOnMesh = new THREE.Vector2(intersects[0].point.x, intersects[0].point.z);
            this.terrain.updateUniforms(true, 1, positionOnMesh);
        } else {
            this.terrain.updateUniforms(false, 0, new THREE.Vector2(0, 0));
        }

        if (this.controls.getMouseState(0)) {
            console.log("up");
        } else if (this.controls.getMouseState(2)) {
            console.log("down");
        }
    }
}

enum MapEditorMode {
    SelectMode,
    HeightMode,
    TextureMode,
}
