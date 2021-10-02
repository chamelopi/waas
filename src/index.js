import * as THREE from "three";
import { loadSkybox, makeSkybox } from "./skybox";
import { loadTextures, loadGLTFs } from "./assetman";
import { loadTerrain } from "./terrain"

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(1, 4, 3);
camera.rotation.set(-Math.PI / 6, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



// TODO: Is specifying paths explicitly maintainable?
const textures = await loadTextures([
    "frog.png", "froggo.png", "grass.png", "rock.jpg", "water.png",
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

const frog3d = models["assets/froggo.glb"];
frog3d.material = new THREE.MeshBasicMaterial({ map: textures["assets/froggo.png"] });
// To make it face the camera
frog3d.rotation.z = -3 * Math.PI / 8;
frog3d.scale.set(0.5, 0.5, 0.5);
frog3d.position.set(2.5, 1, -0.5);

scene.add(frog3d);

const skybox = makeSkybox(textures, "assets/envmap_miramar", "miramar", "png");
scene.add(skybox);

// TODO: Replace with sth that textures better
const water = new THREE.Mesh(new THREE.PlaneBufferGeometry(20, 20),
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
// Main loop
function animate() {
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


// TODOs:
// - Camera controls (WASD movement, maybe zoom?)
// - 
// - Use webpack to reduce distribution size
//   - Bonus points if the loading screen only shows the site on wednesdays