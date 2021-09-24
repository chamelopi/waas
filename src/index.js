import * as THREE from "three";
import { loadSkybox, makeSkybox } from "./skybox";
import { loadTextures, loadGLTFs } from "./assetman";

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(1, 4, 3);
camera.rotation.set(-Math.PI / 6, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
const cube = new THREE.Mesh(geometry, material);
cube.scale.set(15, 15, 0.1);
cube.position.set(0, 0, -10);

scene.add(cube);

// DEBUG
const textures = await loadTextures([
    "frog.png", "froggo.png", "grass.png",
    "envmap_miramar/miramar_ft.png",
    "envmap_miramar/miramar_bk.png",
    "envmap_miramar/miramar_up.png",
    "envmap_miramar/miramar_dn.png",
    "envmap_miramar/miramar_rt.png",
    "envmap_miramar/miramar_lf.png",
].map(x => "assets/" + x));
const models = await loadGLTFs(["assets/froggo.glb"]);

// Finished loading
// TODO: Maybe display a spinning cube or sth
document.querySelector("#text").classList.remove("invisible");
document.querySelector("#loading").classList.add("invisible");

const texture = textures["assets/frog.png"];
const frogMaterial = new THREE.MeshBasicMaterial({ map: texture });
frogMaterial.transparent = true;

const frog3d = models["assets/froggo.glb"];
frog3d.material = new THREE.MeshBasicMaterial({ map: textures["assets/froggo.png"] });
// To make it face the camera
frog3d.rotation.z = -3*Math.PI / 8;
frog3d.scale.set(2, 2, 2);
frog3d.position.set(3, -1, -2);

scene.add(frog3d);

const tetra = new THREE.Mesh(new THREE.TetrahedronGeometry(), new THREE.MeshBasicMaterial({ color: 0x45ff78 }));
tetra.position.set(4, 2, 0);
scene.add(tetra);

const skybox = makeSkybox(textures, "assets/envmap_miramar", "miramar", "png");
scene.add(skybox);

const ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(50, 50), new THREE.MeshBasicMaterial({ map: textures["assets/grass.png"] }));
ground.position.y = -2;
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const froggo = new THREE.Mesh(geometry, [frogMaterial, undefined, undefined, undefined, undefined, undefined]);
froggo.position.set(2, 1, 0);
froggo.rotation.set(0, -Math.PI/2, 0);
scene.add(froggo);

const froggo2 = new THREE.Mesh(geometry, [frogMaterial, undefined, undefined, undefined, undefined, undefined]);
froggo2.position.set(-7, 1, -4);
froggo2.scale.set(2, 2, 2);
froggo2.rotation.y = -Math.PI/4;
scene.add(froggo2);

let dir = new THREE.Vector2(0.01, 0.01);
let vel = 0.03;
// Main loop
function animate() {
    // Update
    if (froggo.position.x > 3 || froggo.position.x < -3) {
        dir.x = -dir.x;
    }
    if (froggo.position.y > 2.5 || froggo.position.y < -1.5) {
        dir.y = -dir.y;
    }
    froggo.position.x += dir.x;
    froggo.position.y += dir.y;

    froggo2.position.y += vel;
    if (froggo2.position.y > 3) {
        vel -= 0.1;
    }
    if (froggo2.position.y <= 1.0) {
        vel = 0.03;
    }

    cube.rotation.z += 0.01;
    
    tetra.rotation.y += 0.002;

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


// TODOs:
// - Use webpack to reduce distribution size
//   - Bonus points if the loading screen only shows the site on wednesdays