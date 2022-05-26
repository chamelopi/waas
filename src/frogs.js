import * as THREE from "three";

import { Doodads } from "./doodads";

let froggos = [];

function createFrogs(textures, models, scene) {
    const texture = textures["assets/frog.png"];
    const frogMaterial = new THREE.MeshBasicMaterial({ map: texture });
    frogMaterial.transparent = true;
    const frogMaterialList = [frogMaterial, undefined, undefined, undefined, undefined, undefined];

    
    // 2d frogs jumping in the background
    const geometry = new THREE.BoxGeometry();
    const froggo = create2dFrog(geometry, frogMaterialList, [-0.9, 1, -7], [0, -Math.PI / 2, 0], [1, 1, 1], 0.015);
    scene.add(froggo);
    const froggo2 = create2dFrog(geometry, frogMaterialList, [-8, 1, -5], [0, -Math.PI / 4, 0], [2, 2, 2], 0.02);
    scene.add(froggo2);
    const froggo3 = create2dFrog(geometry, frogMaterialList, [3.5, 1, -7], [0, 3*Math.PI / 2, 0], [1.2, 1.2, 1.2], 0.017);
    scene.add(froggo3);
    froggos.push(froggo, froggo2, froggo3);
    
    // Add multiple 3d froggos
    const frogPosRot = [
        [[2.5, 0.7, -0.5], [2 / 3 * Math.PI]],
        [[-2.6, 0.7, -0.6], [-2 / 3 * Math.PI]],
        [[-4, 0.7, 1], [-Math.PI / 2]],
        [[-4, 1.65, -2], [-2 / 3 * Math.PI]],
        [[0, 1.65, -2.7], [Math.PI]],
        [[4.5, 1.65, -2], [2 / 3 * Math.PI]],
    ];

    const frog3d = new Doodads(models["assets/froggo.glb"].geometry, textures["assets/froggo.png"], scene);
    for (let i = 0; i < frogPosRot.length; ++i) {
        frog3d.add(new THREE.Vector3(...frogPosRot[i][0]), frogPosRot[i][1], 0.5);
        // Note: This is relatively cheap, even when called every frame
        frog3d.setNeedsUpdate(true);
    }

    function create2dFrog(geom, mat, pos, rot, scale, vel) {
        const froggo = new THREE.Mesh(geom, mat);
        froggo.position.set(pos[0], pos[1], pos[2]);
        froggo.rotation.set(rot[0], rot[1], rot[2]);
        froggo.scale.set(scale[0], scale[1], scale[2]);
        froggo.baseVelocity = vel;
        froggo.velocity = froggo.baseVelocity;
        return froggo;
    }

    
}

function updateFrogs() {
    // Update jumping frogs
    for (const f of froggos) {
        f.position.y += f.velocity;
        if (f.position.y > 3.5) {
            f.velocity -= 0.05;
        }
        if (f.position.y <= 1.0) {
            f.velocity = f.baseVelocity;
        }
    }
}

export {
    createFrogs,
    updateFrogs,
}