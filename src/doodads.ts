import * as THREE from "three";

// Manages several doodad objects (of a single type/model)
// Doodads are static objects that don't move, so mesh instancing makes sense here to reduce draw calls
class Doodads {
    public geometry: THREE.BufferGeometry;
    public material: THREE.MeshPhongMaterial;
    public matrices: Array<THREE.Matrix4>;
    public scene: THREE.Object3D;
    public mesh: THREE.InstancedMesh;
    public needsUpdate = false;

    constructor(geometry: THREE.BufferGeometry, texture: THREE.Texture, scene: THREE.Object3D) {
        this.geometry = geometry;
        // Needs to be phong or some similar material to be able to be lit up
        this.material = new THREE.MeshPhongMaterial({ map: texture });
        this.matrices = [];
        this.buildMesh();
        this.scene = scene;
        this.scene.add(this.mesh);
    }

    buildMesh() {
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.matrices.length);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        for (let i = 0; i < this.matrices.length; ++i) {
            this.mesh.setMatrixAt(i, this.matrices[i]);
        }
        this.mesh.instanceMatrix.needsUpdate = !!this.needsUpdate;
    }

    setNeedsUpdate(needsUpdate: boolean) {
        this.needsUpdate = needsUpdate;
        this.mesh.instanceMatrix.needsUpdate = needsUpdate;
    }

    forEachMatrix(cb: any) {
        for (let i = 0; i < this.matrices.length; ++i) {
            cb(this.matrices[i]);
            this.mesh.setMatrixAt(i, this.matrices[i]);
        }
        this.setNeedsUpdate(true);
    }

    add(pos: THREE.Vector3, rotationY: number, scale: number) {
        // Need to be in this order
        let matrix = new THREE.Matrix4();
        if (rotationY) {
            matrix.makeRotationY(rotationY);
        }
        if (scale) {
            matrix.scale(new THREE.Vector3(scale, scale, scale));
        }
        matrix.setPosition(pos);

        this.matrices.push(matrix);

        // Replace instanced mesh
        this.scene.remove(this.mesh);
        this.buildMesh();
        this.scene.add(this.mesh);
    }
}

export {
    Doodads,
}