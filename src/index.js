import * as THREE from "three";
import { makeSkybox } from "./skybox";
import { loadAssets } from "./assetman";
import { loadTerrain, randomPositionOnTerrain, getCenterOfTerrain } from "./terrain/terrain"
import { CameraControls } from "./camera-controls";
import { Doodads } from "./doodads";
import { Controls } from "./controls";
import { GUIManager } from "./ui/gui-manager";

const scene = new THREE.Scene();

const hemLight = new THREE.HemisphereLight();
scene.add(hemLight)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
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

// TODO: Refactor skybox + water mesh into 'basic env setup function'
const skybox = makeSkybox(assets.textures, "envmap_miramar", "miramar", "png");
scene.add(skybox);

// TODO: We could use sin and cos to simulate small waves in a custom vertex shader
const water = new THREE.Mesh(new THREE.PlaneBufferGeometry(64, 64, 128, 128),
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
    //new THREE.MeshBasicMaterial({ map: assets.textures["water.png"], transparent: true, opacity: 0.65 }));
water.position.set(32, 0.6, 32);
water.rotation.x = -Math.PI / 2;
scene.add(water);

// TODO: Create objects based on config/map file or sth
let container = new THREE.Group();
scene.add(container);

// Create random trees
const trees = new Doodads(assets.getMesh("tree.glb"), assets.textures["ImphenziaPalette01.png"], container);
function createTree(pos) {
    trees.add(pos, Math.random() * 2 * Math.PI, 0.05);
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


let guiMan = new GUIManager(controls, terrain, camera);
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
