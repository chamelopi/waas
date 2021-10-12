import * as THREE from "three";
import { makeSkybox } from "./skybox";
import { loadTextures, loadGLTFs } from "./assetman";
import { loadTerrain } from "./terrain"
import { CameraControls } from "./camera-controls";
import { Path } from "three";

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(1, 5, 3);
camera.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 5);
const camControl = new CameraControls(camera);
// This is more like a "demo", camera controls are disabled at first but can be enabled for debug use
camControl.enabled = false;

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
const frogMaterialList = [frogMaterial, undefined, undefined, undefined, undefined, undefined];

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

// TODO: Replace with sth that textures better, maybe another indexed buffer geometry.
// TODO: We could use even sin and cos to simulate small waves in a custom vertex shader
const water = new THREE.Mesh(new THREE.PlaneBufferGeometry(16, 16),
    new THREE.MeshBasicMaterial({ map: textures["assets/water.png"], transparent: true, opacity: 0.65 }));
water.position.y = 0.6;
water.rotation.x = -Math.PI / 2;
scene.add(water);

function create2dFrog(geom, mat, pos, rot, scale, vel) {
    const froggo = new THREE.Mesh(geom, mat);
    froggo.position.set(pos[0], pos[1], pos[2]);
    froggo.rotation.set(rot[0], rot[1], rot[2]);
    froggo.scale.set(scale[0], scale[1], scale[2]);
    froggo.baseVelocity = vel;
    froggo.velocity = froggo.baseVelocity;
    return froggo;
}

// 2d frogs jumping in the background
const geometry = new THREE.BoxGeometry();
const froggo = create2dFrog(geometry, frogMaterialList, [-0.9, 1, -7], [0, -Math.PI / 2, 0], [1, 1, 1], 0.015);
scene.add(froggo);
const froggo2 = create2dFrog(geometry, frogMaterialList, [-8, 1, -5], [0, -Math.PI / 4, 0], [2, 2, 2], 0.02);
scene.add(froggo2);
const froggo3 = create2dFrog(geometry, frogMaterialList, [3.5, 1, -7], [0, 3*Math.PI / 2, 0], [1.2, 1.2, 1.2], 0.017);
scene.add(froggo3);
const froggos = [froggo, froggo2, froggo3];


let lastframe = performance.now();
// Main loop
function animate() {
    // calculate dt
    const curframe = performance.now();
    const dt = lastframe - curframe;
    lastframe = curframe;

    // Update camera
    camControl.update(dt);

    // Update jumping frogs
    for (const f of froggos) {
        f.position.y += f.velocity;
        if (f.position.y > 3.5) {
            f.velocity -= 0.05;
        }
        if (f.position.y <= 1.0) {
            f.velocity = f.baseVelocity;
        }
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