import * as THREE from "three";

const HEIGHTMAP_TILE_SCALE = 0.1;

const getImageData = (img) => {
    // TODO: Is there a better way?
    const cv = document.createElement("canvas");
    cv.width = img.width;
    cv.height = img.height;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
}

// TODO: Provide height data for update logics?
async function loadTerrain(heightmap) {
    const img = await new THREE.ImageLoader().loadAsync("assets/" + heightmap);
    const data = getImageData(img);

    let geometry = new THREE.BufferGeometry();
    // Create vertices from height map
    const vertices = new Float32Array(data.width * data.height * 3);
    const uvs = new Float32Array(data.width * data.height * 2);
    for (let i = 0; i < data.height; ++i) {
        for (let j = 0; j < data.width; ++j) {
            const dataIdx = (i * data.width + j);

            // Scale height to be between 0 and 1
            const heightValue = (data.data.at(dataIdx * 4) + data.data.at(dataIdx * 4 + 1) + data.data.at(dataIdx * 4 + 2)) / 127;
            // if (data.data[dataIdx*4] > 0) {
            //     debugger;
            // }

            const idx = dataIdx * 3;
            // Vertices should be between 0 and 1
            vertices[idx] = j * HEIGHTMAP_TILE_SCALE;
            // Y is up!
            vertices[idx + 1] = heightValue;
            vertices[idx + 2] = i * HEIGHTMAP_TILE_SCALE;
            
            // Alternate uvs to 
            uvs[dataIdx * 2] = j % 2 == 0 ? 0 : 1;
            uvs[dataIdx * 2 + 1] = i % 2 == 0 ? 0 : 1;
        }
    }

    // Create indices to connect vertices in the correct way (we have 2 triangles for each 'tile')
    const indices = [];
    for (let i = 0; i < data.height - 1; i++) {
        for (let j = 0; j < data.width - 1; j++) {
            // Top triangle
            indices.push(j + (i * data.width));
            indices.push(j + ((i + 1) * data.width));
            indices.push(j + 1 + (i * data.width));
            // Bottom triangle
            indices.push(j + 1 + (i * data.width));
            indices.push(j + ((i + 1) * data.width));
            indices.push(j + 1 + ((i + 1) * data.width));
        }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x42ff42, wireframe: false }));
    // Center around origin
    mesh.position.set(-(data.width * HEIGHTMAP_TILE_SCALE * 0.5), 0, -(data.height * HEIGHTMAP_TILE_SCALE * 0.5));
    return mesh;
}

export {
    loadTerrain,
}