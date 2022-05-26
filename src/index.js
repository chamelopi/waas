import * as THREE from "three";
import { makeSkybox } from "./skybox";
import { loadAssets } from "./assetman";
import { HEIGHTMAP_TILE_SCALE, loadTerrain, randomPositionOnTerrain } from "./terrain"
import { CameraControls } from "./camera-controls";
import { Doodads } from "/doodads.js";
import { Controls } from "./controls";
import { createFrogs, updateFrogs } from "./frogs";

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
// This is more like a "demo", camera controls are disabled at first but can be enabled for debug use
camControl.enabled = false;

// Load assets
const [textures, models] = await loadAssets();
const [terrain, heightmap] = await loadTerrain("heightmap.png");

console.log(textures, models);

// Finished loading
// TODO: Maybe display a spinning cube or sth
document.querySelector("#text").classList.remove("invisible");
document.querySelector("#loading").classList.add("invisible");

// Add terrain
terrain.material = new THREE.MeshBasicMaterial({ map: textures["assets/rock.jpg"] });
scene.add(terrain);

// TODO: Refactor skybox + water mesh into 'basic env setup function'
const skybox = makeSkybox(textures, "assets/envmap_miramar", "miramar", "png");
scene.add(skybox);

// TODO: Replace with sth that textures better, maybe another indexed buffer geometry.
// TODO: We could use even sin and cos to simulate small waves in a custom vertex shader
const water = new THREE.Mesh(new THREE.PlaneBufferGeometry(64, 64),
    new THREE.MeshBasicMaterial({ map: textures["assets/water.png"], transparent: true, opacity: 0.65 }));
water.position.y = 0.6;
water.rotation.x = -Math.PI / 2;
scene.add(water);

// TODO: Create objects based on config/map file or sth
createFrogs(textures, models, scene);

let container = new THREE.Group();
container.position.set(-(heightmap.width * HEIGHTMAP_TILE_SCALE * 0.5), 0, -(heightmap.height * HEIGHTMAP_TILE_SCALE * 0.5));
scene.add(container);


// Create random trees
const trees = new Doodads(models["assets/tree.glb"].geometry, textures["assets/ImphenziaPalette01.png"], container);
function createTree(pos) {
    trees.add(pos, Math.random() * 2 * Math.PI, 0.05);
}
for (let i = 0; i < 25; ++i) {
    createTree(randomPositionOnTerrain(heightmap));
}
// Add a random tree when t is pressed
controls.onKeyUp("t", () => {
    createTree(randomPositionOnTerrain(heightmap));
});


// TODO: Refactor into main loop + update func for certain types of game objects
let lastframe = performance.now();
// Main loop
function animate() {
    // calculate dt
    const curframe = performance.now();
    const dt = lastframe - curframe;
    lastframe = curframe;

    // Update camera
    camControl.update(dt);

    updateFrogs();

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


// TODOs/Ideas:
// - Terrain texturing! (this is going to be hard)
// - Allow update logic to be implemented more easily
// - Use webpack to reduce distribution size
//   - Bonus points if the loading screen only shows the site on wednesdays