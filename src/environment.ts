import * as THREE from "three";

import { AssetManager } from "./assetman";

/**
 * Creates & sets up a hemisphere light and a directional light to simulate sunlight
 */
export function setupLights(scene: THREE.Scene) {
    scene.add(new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5));
    const sun = new THREE.DirectionalLight(0xffffcc, 1.25);
    sun.position.set(50, 22, 50);
    sun.target.position.set(25, 0, 0);
    sun.shadow.bias = -0.005;
    sun.shadow.mapSize.width = 2048;  // default
    sun.shadow.mapSize.height = 2048; 
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -35;
    sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35;
    sun.shadow.camera.bottom = -35;
    sun.castShadow = true;
    scene.add(sun);
}

export function setupWater(scene: THREE.Scene, assets: AssetManager) {
    // Add some segments in each direction, so that we have some vertices to transform
    const WATER_DIMS = 128;
    const water = new THREE.Mesh(new THREE.PlaneBufferGeometry(WATER_DIMS, WATER_DIMS, WATER_DIMS*2, WATER_DIMS*2),
        new THREE.ShaderMaterial({
            uniforms: {
                waterTexture: { value: assets.textures["water.png"] },
                perlin: { value: assets.textures["perlin.png"] },
                time: { value: 0.0 },
            },
            vertexShader: assets.shaders["shaders/water-vertex.glsl"],
            fragmentShader: assets.shaders["shaders/water-fragment.glsl"],
            transparent: true,
    }));
    water.position.set(32, 0.6, 32);
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
    return water;
}