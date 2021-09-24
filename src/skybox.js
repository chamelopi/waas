import * as THREE from "three";

const loadSkybox = (path, name, ext) => {
    const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
    let materials = [];
    const loader = new THREE.TextureLoader();

    for (const side of sides) {
        const filename = path + "/" + name + "_" + side + "." + ext;
        console.log(filename);
        materials.push(new THREE.MeshBasicMaterial({
            // Log errors
            map: loader.load(filename, undefined, undefined, (e) => {console.error(e)}),
            side: THREE.BackSide,
        }));
    }
    
    return new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), materials);
}

const makeSkybox = (textures, path, name, ext) => {
    const sides = ["ft", "bk", "up", "dn", "rt", "lf"];
    let materials = [];

    for (const side of sides) {
        const filename = path + "/" + name + "_" + side + "." + ext;
        console.log(filename);
        materials.push(new THREE.MeshBasicMaterial({
            // Log errors
            map: textures[filename],
            side: THREE.BackSide,
        }));
    }
    
    return new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), materials);
}

export { loadSkybox, makeSkybox };