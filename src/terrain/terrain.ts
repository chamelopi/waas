import * as THREE from "three";

import { AssetManager } from "../assetman";

const HEIGHTMAP_TILE_SCALE = 0.1;
const HEIGHTMAP_HEIGHT_SCALE = 6.0;

function getImageData(img: HTMLImageElement): ImageData {
    // Canvas is not added to DOM and therefore cleaned up on exit
    const cv = document.createElement("canvas");
    cv.width = img.width;
    cv.height = img.height;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
}

function getCenterOfTerrain(heightmapData: ImageData) {
    return [
        heightmapData.width * HEIGHTMAP_TILE_SCALE * 0.5,
        heightmapData.height * HEIGHTMAP_TILE_SCALE * 0.5
    ];
}

function getHeightValue(heightmapData: ImageData, x: number, y: number): number {
    const dataIdx = (y * heightmapData.width + x);
    // Greyscale, it does not matter
    return heightmapData.data.at(dataIdx * 4) / 255 * HEIGHTMAP_HEIGHT_SCALE;
}

function getHeightFromPosition(heightmapData: ImageData, x: number, y: number) {
    x = Math.floor(x / HEIGHTMAP_TILE_SCALE);
    y = Math.floor(y / HEIGHTMAP_TILE_SCALE);
    if (x >= 0 && x < heightmapData.width && y >= 0 && y < heightmapData.height) {
        return getHeightValue(heightmapData, x, y);
    } else {
        return 0;
    }
}

function createTerrainMesh(heightmapData: ImageData, assets: AssetManager) {
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
    
    // Initialize mesh with terrain shader
    const mesh = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
        uniforms: {
            // TODO: Use a texture map instead of the height value? This would possibly allow for more flexible texturing, too
            dirt: { value: assets.textures["dirt.png"]},
            sand: { value: assets.textures["sand.jpg"]},
            rock: { value: assets.textures["rock.jpg"]},
            grass: { value: assets.textures["grass.png"]},
            heightScale: { value: HEIGHTMAP_HEIGHT_SCALE }
        },
        vertexShader: assets.shaders["shaders/passthrough.glsl"],
        fragmentShader: assets.shaders["shaders/splat.glsl"],
    }));
    mesh.receiveShadow = true;
    // Center around origin
    return mesh;
}

function randomPositionOnTerrain(heightmapData: ImageData) {
    const x = heightmapData.width * Math.random();
    const y = heightmapData.height * Math.random();
    return new THREE.Vector3(x * HEIGHTMAP_TILE_SCALE, getHeightValue(heightmapData, Math.floor(x), Math.floor(y)), y * HEIGHTMAP_TILE_SCALE);
}

async function loadTerrain(heightmap: ImageData, assets: AssetManager) {
    const img = await new THREE.ImageLoader().loadAsync("assets/" + heightmap);
    const data = getImageData(img);

    const mesh = createTerrainMesh(data, assets);

    return [mesh, data];
}

export {
    loadTerrain,
    getHeightFromPosition,
    randomPositionOnTerrain,
    getCenterOfTerrain,
    HEIGHTMAP_TILE_SCALE,
    HEIGHTMAP_HEIGHT_SCALE,
}