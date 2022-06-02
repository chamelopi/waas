import * as THREE from "three";
import { AnimationMixer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

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
        const model = gltf.scene;
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
    
    return new AssetManager(
        await loadGLTFs(response.models),
        await loadTextures(response.textures),
        await loadTextFiles(response.shaders),
    );
}

/**
 * Holds all currently loaded assets and provides some comfort functions
 */
class AssetManager {
    constructor(models, textures, shaders) {
        this.models = models;
        this.textures = textures;
        this.shaders = shaders;
        this.mixers = [];
    }

    /**
     * Returns the static geometry of the first child of this GLTF
     */
    getMesh(modelName) {
        return this.models[modelName].children[0].geometry;
    }

    /**
     * Creates a new instance of a model (including bones & animations)
     */
    instanciateModel(modelName) {
        let instance = clone(this.models[modelName]);
        // TODO: We might want to store this on the instance instead, so we can trigger animations etc. from there
        // We will want a base class for Entities (?) that handles animations comfortably probably
        let mixer = new AnimationMixer(instance);
        this.mixers.push(mixer);
    }
}

export {
    loadTextures,
    loadGLTFs,
    loadAssets,
}