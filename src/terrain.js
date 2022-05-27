import * as THREE from "three";

const HEIGHTMAP_TILE_SCALE = 0.1;
const HEIGHTMAP_HEIGHT_SCALE = 6.0;

const getImageData = (img) => {
    // Canvas is not added to DOM and therefore cleaned up on exit
    const cv = document.createElement("canvas");
    cv.width = img.width;
    cv.height = img.height;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
}

function getHeightValue(heightmapData, x, y) {
    const dataIdx = (y * heightmapData.width + x);
    // Greyscale, it does not matter
    return heightmapData.data.at(dataIdx * 4) / 255 * HEIGHTMAP_HEIGHT_SCALE;
}

function createTerrainMesh(heightmapData) {
    let geometry = new THREE.BufferGeometry();
    // Create vertices from height map
    const vertices = new Float32Array(heightmapData.width * heightmapData.height * 3);
    const uvs = new Float32Array(heightmapData.width * heightmapData.height * 2);
    for (let i = 0; i < heightmapData.height; ++i) {
        for (let j = 0; j < heightmapData.width; ++j) {
            const dataIdx = (i * heightmapData.width + j);

            const heightValue = getHeightValue(heightmapData, j, i);

            const idx = dataIdx * 3;
            // Vertices should be between 0 and 1
            vertices[idx] = j * HEIGHTMAP_TILE_SCALE;
            // Y is up!
            vertices[idx + 1] = heightValue;
            vertices[idx + 2] = i * HEIGHTMAP_TILE_SCALE;
            
            // Alternate uvs to have the texture on the second triangle face the right way
            uvs[dataIdx * 2] = j % 2 == 0 ? 0 : 1;
            uvs[dataIdx * 2 + 1] = i % 2 == 0 ? 0 : 1;
        }
    }

    // Create indices to connect vertices in the correct way (we have 2 triangles for each 'tile')
    const indices = [];
    for (let i = 0; i < heightmapData.height - 1; i++) {
        for (let j = 0; j < heightmapData.width - 1; j++) {
            // Top triangle
            indices.push(j + (i * heightmapData.width));
            indices.push(j + ((i + 1) * heightmapData.width));
            indices.push(j + 1 + (i * heightmapData.width));
            // Bottom triangle
            indices.push(j + 1 + (i * heightmapData.width));
            indices.push(j + ((i + 1) * heightmapData.width));
            indices.push(j + 1 + ((i + 1) * heightmapData.width));
        }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x42ff42, wireframe: false }));
    // Center around origin
    mesh.position.set(-(heightmapData.width * HEIGHTMAP_TILE_SCALE * 0.5), 0, -(heightmapData.height * HEIGHTMAP_TILE_SCALE * 0.5));
    return mesh;
}

function randomPositionOnTerrain(heightmapData) {
    const x = heightmapData.width * Math.random();
    const y = heightmapData.height * Math.random();
    return new THREE.Vector3(x * HEIGHTMAP_TILE_SCALE, getHeightValue(heightmapData, Math.floor(x), Math.floor(y)), y * HEIGHTMAP_TILE_SCALE);
}

async function loadTerrain(heightmap, assets) {
    const img = await new THREE.ImageLoader().loadAsync("assets/" + heightmap);
    const data = getImageData(img);

    const mesh = createTerrainMesh(data);

    // Initialize terrain shader (blends textures based on height)
    mesh.material = new THREE.ShaderMaterial({
        uniforms: {
            // TODO: Use a texture map instead of the height value? This would possibly allow for more flexible texturing, too
            dirt: { value: assets.textures["assets/dirt.png"]},
            sand: { value: assets.textures["assets/sand.jpg"]},
            rock: { value: assets.textures["assets/rock.jpg"]},
            grass: { value: assets.textures["assets/grass.png"]},
            heightScale: { value: HEIGHTMAP_HEIGHT_SCALE }
        },
        vertexShader: assets.shaders["assets/shaders/passthrough.glsl"],
        fragmentShader: assets.shaders["assets/shaders/splat.glsl"],
    });

    return [mesh, data];
}

export {
    loadTerrain,
    randomPositionOnTerrain,
    HEIGHTMAP_TILE_SCALE,
    HEIGHTMAP_HEIGHT_SCALE,
}