import * as THREE from "three";

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

export { makeSkybox };