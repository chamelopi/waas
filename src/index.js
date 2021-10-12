import * as THREE from "three";
import { makeSkybox } from "./skybox";
import { loadTextures, loadGLTFs } from "./assetman";
import { loadTerrain } from "./terrain"
import { CameraControls } from "./camera-controls";

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(1, 5, 3);
camera.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 5);
const camControl = new CameraControls(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



// TODO: Is specifying paths explicitly maintainable?
const textures = await loadTextures([
    "frog.png", "froggo.png", "grass.png", "rock.jpg", "water.png",
    "tileset.png",
    "envmap_miramar/miramar_ft.png",
    "envmap_miramar/miramar_bk.png",
    "envmap_miramar/miramar_up.png",
    "envmap_miramar/miramar_dn.png",
    "envmap_miramar/miramar_rt.png",
    "envmap_miramar/miramar_lf.png",
].map(x => "assets/" + x));
const models = await loadGLTFs(["assets/froggo.glb"]);
const terrain = await loadTerrain("heightmap2.png");

// Finished loading
// TODO: Maybe display a spinning cube or sth
document.querySelector("#text").classList.remove("invisible");
document.querySelector("#loading").classList.add("invisible");

// Add terrain
terrain.material = new THREE.MeshBasicMaterial({ map: textures["assets/rock.jpg"] });
scene.add(terrain);

const texture = textures["assets/frog.png"];
const frogMaterial = new THREE.MeshBasicMaterial({ map: texture });
frogMaterial.transparent = true;

// Add multiple 3d froggos
const frogPosRot = [
    [[2.5, 0.7, -0.5], [2 / 3 * Math.PI]],
    [[-2.6, 0.7, -0.6], [-2 / 3 * Math.PI]],
    [[-4, 0.7, 1], [-Math.PI / 2]],
    [[-4, 1.65, -2], [-2 / 3 * Math.PI]],
    [[0, 1.65, -2.7], [Math.PI]],
    [[4.5, 1.65, -2], [2 / 3 * Math.PI]],
];
const frog3d = new THREE.InstancedMesh(
    models["assets/froggo.glb"].geometry,
    new THREE.MeshBasicMaterial({ map: textures["assets/froggo.png"] }),
    frogPosRot.length
);
for (let i = 0; i < frog3d.count; ++i) {
    let matrix = new THREE.Matrix4();
    frog3d.getMatrixAt(i, matrix);
    matrix.makeRotationY(frogPosRot[i][1]);
    matrix.scale(new THREE.Vector3(0.5, 0.5, 0.5));
    matrix.setPosition(...frogPosRot[i][0]);
    frog3d.setMatrixAt(i, matrix);
    // Note: This is relatively cheap, even when called every frame
    frog3d.instanceMatrix.needsUpdate = true;
}

scene.add(frog3d);

const skybox = makeSkybox(textures, "assets/envmap_miramar", "miramar", "png");
scene.add(skybox);

// TODO: Replace with sth that textures better
const water = new THREE.Mesh(new THREE.PlaneBufferGeometry(16, 16),
    new THREE.MeshBasicMaterial({ map: textures["assets/water.png"], transparent: true, opacity: 0.65 }));
water.position.y = 0.6;
water.rotation.x = -Math.PI / 2;
scene.add(water);

const geometry = new THREE.BoxGeometry();
const froggo = new THREE.Mesh(geometry, [frogMaterial, undefined, undefined, undefined, undefined, undefined]);
froggo.position.set(-0.9, 1, -7);
froggo.rotation.set(0, -Math.PI / 2, 0);
scene.add(froggo);

const froggo2 = new THREE.Mesh(geometry, [frogMaterial, undefined, undefined, undefined, undefined, undefined]);
froggo2.position.set(-8, 1, -5);
froggo2.scale.set(2, 2, 2);
froggo2.rotation.y = -Math.PI / 4;
scene.add(froggo2);

// TODO: Third frog jumping

let dir = new THREE.Vector2(0.01, 0.01);
let vel = 0.015;
let vel2 = 0.02;

let lastframe = performance.now();
// Main loop
function animate() {
    // calculate dt
    const curframe = performance.now();
    const dt = lastframe - curframe;
    lastframe = curframe;

    // Update camera
    camControl.update(dt);

    // Update
    froggo.position.y += vel;
    if (froggo.position.y > 3.5) {
        vel -= 0.05;
    }
    if (froggo.position.y <= 1.0) {
        vel = 0.015;
    }

    froggo2.position.y += vel2;
    if (froggo2.position.y > 3.5) {
        vel2 -= 0.05;
    }
    if (froggo2.position.y <= 1.0) {
        vel2 = 0.02;
    }

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
// - Camera rotation, zoom?
// - More realistic jumping for the frogs
// - Allow update logic to be implemented more easily
// - Some sort of scene graph? Do we need that?
// - Use webpack to reduce distribution size
//   - Bonus points if the loading screen only shows the site on wednesdays