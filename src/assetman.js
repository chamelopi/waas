import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const zip = (...rows) => [...rows[0]].map((_, c) => rows.map(row => row[c]));

// TODO: Strip `assets/` part of path

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
        return model;
    });
    return Object.fromEntries(zip(paths, models));
}

async function loadTextFiles(paths) {
    const loader = new THREE.FileLoader();
    const files = (await Promise.all(paths.map(path => loader.loadAsync(path))));

    return Object.fromEntries(zip(paths, files));
}

/**
 * Dynamically loads all assets from the 'assets' directory, distinguished by type
 * 
 * Current supported types are `textures` and `models`
 */
async function loadAssets() {
    // Retrieve list of assets (created dynamically during build process)
    let response = await (await fetch("/assets/asset-list.json")).json();
    
    return {
        models: await loadGLTFs(response.models),
        textures: await loadTextures(response.textures),
        shaders: await loadTextFiles(response.shaders),
    };
}

export {
    loadTextures,
    loadGLTFs,
    loadAssets,
}