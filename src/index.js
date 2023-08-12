import * as THREE from "three";
import { makeSkybox } from "./skybox";
import { loadAssets } from "./assetman";
import { loadTerrain, randomPositionOnTerrain, getCenterOfTerrain } from "./terrain/terrain"
import { CameraControls } from "./camera-controls";
import { Doodads } from "./doodads";
import { Controls } from "./controls";
import { GUIManager } from "./ui/gui-manager";
import { ComputeShaderRunner } from "./terrain/compute-shader";
import { ShaderMaterial } from "three";

const scene = new THREE.Scene();

const hemLight = new THREE.HemisphereLight();
scene.add(hemLight)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Y is set later based on terrain height
camera.position.set(1, 0, 3);
camera.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 4);
const controls = new Controls(renderer.domElement);
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
const center = getCenterOfTerrain(heightmap);
camera.position.x = center[0];
camera.position.z = center[1];

// TODO: Refactor skybox + water mesh into 'basic env setup function'
const skybox = makeSkybox(assets.textures, "envmap_miramar", "miramar", "png");
scene.add(skybox);

const gpuCompute = new ComputeShaderRunner(renderer, new THREE.Vector2(32, 32), assets);

// TODO: We could use sin and cos to simulate small waves in a custom vertex shader
const water = new THREE.Mesh(new THREE.PlaneBufferGeometry(64, 64),
    new THREE.MeshBasicMaterial({ map: assets.textures["water.png"], transparent: true, opacity: 0.65 }));
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


let initialData = new Uint8Array(gpuCompute.dims.x * gpuCompute.dims.y);
initialData.fill(1);
gpuCompute.uploadData(initialData);

let guiMan = new GUIManager(controls);
guiMan.show("map-editor");
guiMan.getCurrentView().addEvent("click", "shader-run", () => {
    gpuCompute.computeTexture("compute-update", {
        time: { value: 0.24 }
    });
    gpuCompute.swapTextures();

    // inTexture contains output from previous frame now
    cubeShader.uniforms.myTexture = gpuCompute.getInTexture();
    cubeShader.needsUpdate = true;
});

camControl.camera.position.set(8, 1, 8);

let cubeShader = new ShaderMaterial({
    uniforms: {
        myTexture: { value: gpuCompute.getInTexture() },
    },
    vertexShader: assets.shaders["shaders/passthrough.glsl"],
    fragmentShader: assets.shaders["shaders/test-showtexture.glsl"],
});
let obj = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), cubeShader);
scene.add(obj);


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

    guiMan.update(dt);

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
