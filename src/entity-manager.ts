import * as THREE from "three";
import { Doodads } from "./doodads";
import { AssetManager } from "./assetman";
import { Terrain } from "./terrain/terrain";

/**
 * Manages active antities as well as doodads.
 */
export class EntityManager {
    public container: THREE.Group;
    private doodads: Record<string, Doodads>;

    // TODO: For later, need update logic etc. but will have similar key-value pairs like doodads for instancing, animation, etc.
    private entities = {};
    terrain: Terrain;

    constructor(assets: AssetManager, terrain: Terrain) {
        this.container = new THREE.Group();
        this.doodads = {};
        this.terrain = terrain;
        this.setupDoodadTypes(assets);
    }

    setupDoodadTypes(assets: AssetManager) {
        this.doodads["tree"] = new Doodads(assets.getMesh("tree.glb"), assets.textures["ImphenziaPalette01.png"], this.container);
        // TODO: Add more types
    }

    createDoodad(type: string, position: THREE.Vector3, rotation: number, scale: number) {
        this.doodads[type].add(position, rotation, scale);
    }

    /**
     * Re-sets Y coordinates of all objects by looking them up in the terrain
     */
    updateHeights() {
        // TODO: is this a performance bottleneck?
        for (const list of Object.values(this.doodads)) {
            list.forEachMatrix((m: THREE.Matrix4) => {
                let pos = new THREE.Vector3();
                pos.setFromMatrixPosition(m);
                pos.y = this.terrain.getHeightFromPosition(pos.x, pos.z);
                m.setPosition(pos);
            })
        }
        // TODO: Do the same for entities
    }
}