import { MapEditor } from "./map-editor";
import { GUIBase } from "./gui-base";
import { Controls } from "../controls";
import { Terrain } from "../terrain/terrain";
import * as THREE from "three";
import { EntityManager } from "../entity-manager";

export class GUIManager {

    private views: Record<ViewName, GUIBase>;
    private currentView?: string;
    private entityManager;

    constructor(controls: Controls, terrain: Terrain, camera: THREE.Camera, entityManager: EntityManager) {
        this.views = {
            "map-editor": new MapEditor(controls, terrain, new THREE.Raycaster(), camera, entityManager),
        };
    }

    show(name: ViewName) {
        if (this.currentView) {
            this.views[this.currentView].onHide();
        }
        this.currentView = name;
        this.views[this.currentView].onShow();
    }

    getCurrentView(): ViewName | null {
        return this.views[this.currentView];
    }

    update() {
        if (this.currentView) {
            this.views[this.currentView].onUpdate();
        }
    }
}

export type ViewName = "map-editor";
