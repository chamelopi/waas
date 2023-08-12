import * as THREE from "three";
import { Controls } from "../controls";
import { HEIGHTMAP_TILE_SCALE, Terrain } from "../terrain/terrain";
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
            return;
        }

        if (this.controls.getMouseState(0) || this.controls.getMouseState(2)) {
            switch(this.mode) {
                case MapEditorMode.SelectMode:
                    TODO:
                    break;
                case MapEditorMode.HeightMode:
                    TODO:
                    this.updateHeight(intersects[0]);
                    break;
                case MapEditorMode.TextureMode:
                    TODO:
                    break;
            }
        }
    }

    updateHeight(intersection: THREE.Intersection<THREE.Object3D<THREE.Event>>) {
        // TODO: Increase or decrease height
        const up = this.controls.getMouseState(0) ? true : false;
        
        const localPoint = this.terrain.mesh.worldToLocal(intersection.point);

        localPoint.x = Math.floor(localPoint.x / HEIGHTMAP_TILE_SCALE);
        localPoint.z = Math.floor(localPoint.z / HEIGHTMAP_TILE_SCALE);

        const center = new THREE.Vector2(localPoint.x, localPoint.z);
        const radius = 10
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                const offset = new THREE.Vector2(localPoint.x + i, localPoint.z + j);
                
                if (offset.distanceTo(center) <= radius) {
                    this.terrain.setHeight(offset.x, offset.y, 127);
                }
            }
        }
        this.terrain.flush();
    }
}

enum MapEditorMode {
    SelectMode,
    HeightMode,
    TextureMode,
}
