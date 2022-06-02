import * as THREE from "three";
import { makeSkybox } from "./skybox";
import { loadAssets } from "./assetman";
import { HEIGHTMAP_TILE_SCALE, loadTerrain, randomPositionOnTerrain } from "./terrain"
import { CameraControls } from "./camera-controls";
import { Doodads } from "/doodads.js";
import { Controls } from "./controls";

const scene = new THREE.Scene();

const hemLight = new THREE.HemisphereLight();
scene.add(hemLight)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(1, 5, 3);
camera.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 5);
const controls = new Controls();
const camControl = new CameraControls(camera, controls);

// Load assets
const assets = await loadAssets();
const [terrain, heightmap] = await loadTerrain("heightmap.png", assets);

// Finished loading
// TODO: Maybe display a spinning cube or sth
document.querySelector("#loading").classList.add("invisible");

// Add terrain
scene.add(terrain);
// Move camera to center of terrain
camera.position.x = +(heightmap.width * HEIGHTMAP_TILE_SCALE * 0.5);
camera.position.z = +(heightmap.height * HEIGHTMAP_TILE_SCALE * 0.5);

// TODO: Refactor skybox + water mesh into 'basic env setup function'
const skybox = makeSkybox(assets.textures, "assets/envmap_miramar", "miramar", "png");
scene.add(skybox);

// TODO: We could use sin and cos to simulate small waves in a custom vertex shader
const water = new THREE.Mesh(new THREE.PlaneBufferGeometry(64, 64),
    new THREE.MeshBasicMaterial({ map: assets.textures["assets/water.png"], transparent: true, opacity: 0.65 }));
water.position.set(32, 0.6, 32);
water.rotation.x = -Math.PI / 2;
scene.add(water);

// TODO: Create objects based on config/map file or sth
let container = new THREE.Group();
scene.add(container);

// Create random trees
const trees = new Doodads(assets.getMesh("assets/tree.glb"), assets.textures["assets/ImphenziaPalette01.png"], container);
function createTree(pos) {
    trees.add(pos, Math.random() * 2 * Math.PI, 0.05);
}
function createRandomTree(heightmap) {
    let pos;
    do {
        pos = randomPositionOnTerrain(heightmap);
    } while (pos.y < 0.6);
    createTree(pos);
}
for (let i = 0; i < 100; ++i) {
    createRandomTree(heightmap);
}
// Add a random tree when t is pressed
controls.onKeyUp("t", () => {
    createRandomTree(heightmap);
});


// TODO: Refactor into main loop + update func for certain types of game objects
let lastframe = performance.now();
// Main loop
function animate() {
    // calculate dt
    const curframe = performance.now();
    const dt = curframe - lastframe;
    lastframe = curframe;

    // Update camera
    camControl.update(dt, heightmap);
    // Needs dt in seconds
    assets.mixers.forEach(mixer => mixer.update(dt / 1000));

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


// Next TODOs/Ideas:
// - Animate the sheep I made (walk, eat grass, idle)
// - Add some animated sheep to the world, walking around avoiding water and steep cliffs
//
// - Allow update logic to be implemented more easily
// - Use webpack to reduce distribution size