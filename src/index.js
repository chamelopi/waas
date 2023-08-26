import * as THREE from "three";
import { loadAssets } from "./assetman";
import { CameraControls } from "./camera-controls";
import { Controls } from "./controls";
import { EntityManager } from "./entity-manager";
import { setupLights, setupWater } from "./environment";
import { makeSkybox } from "./skybox";
import { loadTerrain } from "./terrain/terrain";
import { GUIManager } from "./ui/gui-manager";

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
const controls = new Controls(renderer.domElement);
const camControl = new CameraControls(camera, controls);

// Load assets
const assets = await loadAssets();
const terrain = await loadTerrain("heightmap.png", assets);

// Finished loading
// TODO: Maybe display a spinning cube or sth
document.querySelector("#loading").classList.add("invisible");

// Add terrain
scene.add(terrain.mesh);
// Move camera to center of terrain
const center = terrain.getCenterOfTerrain();
// Y is set later based on terrain height
camera.position.x = center[0];
camera.position.z = center[1];

// Adds ambient light & sunlight
setupLights(scene);
// Create skybox
scene.add(makeSkybox(assets.textures, "envmap_miramar", "miramar", "png"));
// Create water
const water = setupWater(scene, assets);

// TODO: Create objects based on config/map file or sth
const entityManager = new EntityManager(assets, terrain);
scene.add(entityManager.container);

// Create random trees
function createTree(pos) {
    entityManager.createDoodad("tree", pos, Math.random() * 2 * Math.PI, 0.05);
}
function createRandomTree(terrain) {
    let pos;
    do {
        pos = terrain.randomPositionOnTerrain();
    } while (pos.y < 0.6);
    createTree(pos);
}
for (let i = 0; i < 100; ++i) {
    createRandomTree(terrain);
}
// Add a random tree when t is pressed
controls.onKeyUp("t", () => {
    createRandomTree(terrain);
});

let guiMan = new GUIManager(controls, terrain, camera, entityManager);
guiMan.show("map-editor");


// TODO: Refactor into main loop + update func for certain types of game objects
let lastframe = performance.now();
// Main loop
function animate() {
    // calculate dt
    const curframe = performance.now();
    const dt = curframe - lastframe;
    lastframe = curframe;

    // Update camera
    camControl.update(dt, terrain);
    // Needs dt in seconds
    assets.mixers.forEach(mixer => mixer.update(dt / 1000));

    guiMan.update();

    water.material.uniforms.time = { value: performance.now() / 1000 };
    water.material.needsUpdate = true;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// React to resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
