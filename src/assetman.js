import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const zip = (...rows) => [...rows[0]].map((_, c) => rows.map(row => row[c]));

async function loadTextures(paths) {
    const loader = new THREE.TextureLoader();
    const textures = await Promise.all(paths.map(path => loader.loadAsync(path)));
    return Object.fromEntries(zip(paths, textures));
}

async function loadGLTFs(paths) {
    const loader = new GLTFLoader();
    const models = (await Promise.all(paths.map(path => loader.loadAsync(path))))
    .map(gltf => {
        const model = gltf.scene.children[0];
        // Initial rotation fixes
        model.rotation.x = Math.PI / 2;
        return model;
    });
    return Object.fromEntries(zip(paths, models));
}

export {
    loadTextures,
    loadGLTFs,
}