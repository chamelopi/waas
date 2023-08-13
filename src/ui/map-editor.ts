import * as THREE from "three";
import { Controls } from "../controls";
import { HEIGHTMAP_TILE_SCALE, Terrain } from "../terrain/terrain";
import { GUIBase } from "./gui-base";

export class MapEditor extends GUIBase {

    private html: string;
    private mode: MapEditorMode;
    private terrainMode: TerrainEditMode;
    private brushRadius: number;

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
            <fieldset id="editor-terrain-options">
                <input type="radio" id="editor-terrain-raise-lower" name="editor-terrain-mode" value="raise-lower" checked />
                <label for="plateau">Raise / lower</label>
                <input type="radio" id="editor-terrain-smoothen" name="editor-terrain-mode" value="smoothen" />
                <label for="plateau">Smoothen</label>
                <input type="radio" id="editor-terrain-plateau" name="editor-terrain-mode" value="plateau" />
                <label for="plateau">Plateau</label>
                <br>
                <input type="range" id="editor-terrain-brush-radius" name="editor-terrain-brush-radius" min="1" max="15" value="10" />
                <label for="editor-brush-radius">Brush radius</label>
            </fieldset>
            <p>
            <span class="ui-label" id="editor-hint">Left-click to add height, right-click to remove it</span>
        </div>
        `
        this.mode = MapEditorMode.HeightMode;
        this.terrainMode = TerrainEditMode.RaiseLower;
        this.brushRadius = 10;
    }

    getHtml(): string {
        return this.html;
    }

    onShow(): void {
        super.onShow();
        this.addEvent("click", "editor-height-mode", () => {
            this.setText("editor-current-mode", "height mode");
            this.mode = MapEditorMode.HeightMode;
            this.setVisible("editor-terrain-options", true);
        });
        this.addEvent("click", "editor-texture-mode", () => {
            this.setText("editor-current-mode", "texture mode");
            this.mode = MapEditorMode.TextureMode;
            this.setVisible("editor-terrain-options", false);
        });
        this.addEvent("click", "editor-select-mode", () => {
            this.setText("editor-current-mode", "select mode");
            this.mode = MapEditorMode.SelectMode;
            this.setVisible("editor-terrain-options", false);
        });
        const terrainModeChangeHandler = (e) => {
            this.terrainMode = e.target.value as TerrainEditMode;
            this.setText("editor-hint", this.getEditorHint());
        };
        this.addEvent("change", "editor-terrain-plateau", terrainModeChangeHandler);
        this.addEvent("change", "editor-terrain-raise-lower", terrainModeChangeHandler);
        this.addEvent("change", "editor-terrain-smoothen", terrainModeChangeHandler);
        this.addEvent("change", "editor-terrain-brush-radius", () => {
            this.brushRadius = parseInt(this.getValue("editor-terrain-brush-radius"));
        });
    }

    onHide(): void {
        super.onHide();
    }

    getEditorHint() {
        switch(this.mode) {
            case MapEditorMode.SelectMode:
                return "Select entities with left click. Teleport them to a new position with right click."
            case MapEditorMode.HeightMode:
                switch(this.terrainMode) {
                    case TerrainEditMode.RaiseLower:
                        return "Left-click to add height, right-click to remove it";
                    case TerrainEditMode.Plateau:
                        return "Left-click on a point on the map to create a plateau at that height";
                    case TerrainEditMode.Smoothen:
                        return "Left-click to smoothen height transitions";
                }
            case MapEditorMode.TextureMode:
                return "Select a texture to paint on the landscape and left-click to paint it.";
        }
    }

    onUpdate(dt: Number): void {
        // Update brush visualization
        const mousePos = this.controls.getMousePos();
        //this.terrain.updateUniforms(true, 80, new THREE.Vector2(mousePos.x, window.innerHeight - mousePos.y));
        this.raycaster.setFromCamera(mousePos, this.camera);
        const intersects = this.raycaster.intersectObject(this.terrain.mesh, false);

        if (intersects.length > 0) {
            const positionOnMesh = new THREE.Vector2(intersects[0].point.x, intersects[0].point.z);
            this.terrain.updateUniforms(true, this.brushRadius / 10, positionOnMesh);
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
        const radius = this.brushRadius;
        
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
                    if (this.terrainMode === TerrainEditMode.Plateau) {
                        // Plateau editing functionality - set everything to the center's height
                        const heightValue = this.terrain.getHeightValue(center.x, center.y);
                        this.terrain.setHeight(offset.x, offset.y, heightValue);
                    } else if (this.terrainMode === TerrainEditMode.Smoothen) {
                        // Apply gaussian filter to this vertex & the 8 neighbouring vertices
                        let sum = 0;
                        for (let k = -1; k < 2; k++) {
                            for (let l = -1; l < 2; l++) {
                                sum += this.terrain.getHeightValue(offset.x + k, offset.y + l);;
                            }
                        }
                        const avg = sum / 9;
                        this.terrain.setHeight(offset.x, offset.y, avg);
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

enum TerrainEditMode {
    RaiseLower = "raise-lower",
    Plateau = "plateau",
    Smoothen = "smoothen",
}
