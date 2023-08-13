import * as THREE from "three";
import { Controls } from "../controls";
import { HEIGHTMAP_TILE_SCALE, Terrain } from "../terrain/terrain";
import { GUIBase } from "./gui-base";

export class MapEditor extends GUIBase {

    private html: string;
    private mode: MapEditorMode;
    private plateau: boolean;

    constructor(controls: Controls, private terrain: Terrain, private raycaster: THREE.Raycaster, private camera: THREE.Camera) {
        super(controls);
        this.html = `
        <div class="ui-base ui-top-right">
            <button id="editor-select-mode" disabled>Select</button>
            <button id="editor-insert-mode" disabled>Add entity</button>
            <button id="editor-height-mode">Edit terrain height</button>
            <button id="editor-texture-mode" disabled>Edit terrain texture</button>
            <span class="ui-label ui-larger" id="editor-current-mode">height mode</span>
            <p>
            <input type="checkbox" id="editor-plateau" title="enable this to create flat surfaces" /><label id="editor-plateau-label" for="editor-plateau">Plateau</label>
            <p>
            <span class="ui-label" id="editor-hint">Left-click to add height, right-click to remove it</span>
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
            this.setVisible("editor-plateau", true);
            this.setVisible("editor-plateau-label", true);
        });
        this.addEvent("click", "editor-texture-mode", () => {
            this.setText("editor-current-mode", "texture mode");
            this.mode = MapEditorMode.TextureMode;
            this.setVisible("editor-plateau", false);
            this.setVisible("editor-plateau-label", false);
        });
        this.addEvent("click", "editor-select-mode", () => {
            this.setText("editor-current-mode", "select mode");
            this.mode = MapEditorMode.SelectMode;
            this.setVisible("editor-plateau", false);
            this.setVisible("editor-plateau-label", false);
        });
        this.addEvent("change", "editor-plateau", () => {
            this.plateau = !this.plateau;
        })
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
        // Increase or decrease height
        const factor = this.controls.getMouseState(0) ? 1 : -1;
        // TODO: Make configurable
        const amount = 0.2;
        const radius = 10
        
        const localPoint = this.terrain.mesh.worldToLocal(intersection.point);

        localPoint.x = Math.floor(localPoint.x / HEIGHTMAP_TILE_SCALE);
        localPoint.z = Math.floor(localPoint.z / HEIGHTMAP_TILE_SCALE);

        const center = new THREE.Vector2(localPoint.x, localPoint.z);

        // Iterate a rectangle around the mouse position
        for (let i = -radius; i < radius; i++) {
            for (let j = -radius; j < radius; j++) {
                const offset = new THREE.Vector2(localPoint.x + i, localPoint.z + j);
                
                // Check if we are within the circle
                if (offset.distanceTo(center) <= radius) {
                    if (this.plateau) {
                        // Plateau editing functionality - set everything to the center's height
                        const heightValue = this.terrain.getHeightValue(center.x, center.y);
                        this.terrain.setHeight(offset.x, offset.y, heightValue);
                    } else {
                        // Scale the height amount with the distance from center to get a nice gradual ascent or descent
                        const distFactor = 1 - (offset.distanceTo(center) / radius)
                        // Get original height value to transform it
                        const heightValue = this.terrain.getHeightValue(offset.x, offset.y);

                        this.terrain.setHeight(offset.x, offset.y, heightValue + factor * amount * distFactor);
                    }
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
