import * as THREE from "three";

import { AssetManager } from "../assetman";

const HEIGHTMAP_TILE_SCALE = 0.1;
const HEIGHTMAP_HEIGHT_SCALE = 6.0;

/**
 * Holds our terrain
 * 
 */
class Terrain {
    public data: Uint8Array;
    public width: number;
    public height: number;
    public mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;

    constructor(imageData: ImageData, assets: AssetManager) {
        this.data = new Uint8Array(imageData.width * imageData.height);
        
        let buffer = []
        for (let i = 0; i < imageData.width * imageData.height; i++) {
            // we can use just the red pixel here, since our source image is greyscale
            buffer.push(imageData.data.at(i * 4));
        }
        this.data.set(buffer);

        this.width = imageData.width;
        this.height = imageData.height;
        this.mesh = createTerrainMesh(this.data, this.width, this.height, assets);
    }

    /**
     * Updates map-editor related uniforms
     */
    updateUniforms(showBrush: boolean, brushRadius: number, mousePos: THREE.Vector2) {
        this.mesh.material.uniforms.showBrush = { value: showBrush };
        this.mesh.material.uniforms.brushRadius = { value: brushRadius, };
        this.mesh.material.uniforms.mousePos = { value: mousePos };
    }

    getHeightValue(x: number, y: number): number {
        const dataIdx = (y * this.width + x);
        // Transform the [0, 255] interval into a float & scale it with the correct factor
        return this.data.at(dataIdx) / 255 * HEIGHTMAP_HEIGHT_SCALE;
    }

    getHeightFromPosition(x: number, y: number) {
        x = Math.floor(x / HEIGHTMAP_TILE_SCALE);
        y = Math.floor(y / HEIGHTMAP_TILE_SCALE);
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.getHeightValue(x, y);
        } else {
            return 0;
        }
    }

    getCenterOfTerrain() {
        return [
            this.width * HEIGHTMAP_TILE_SCALE * 0.5,
            this.height * HEIGHTMAP_TILE_SCALE * 0.5
        ];
    }

    randomPositionOnTerrain() {
        const x = this.width * Math.random();
        const y = this.height * Math.random();
        return new THREE.Vector3(x * HEIGHTMAP_TILE_SCALE, this.getHeightValue(Math.floor(x), Math.floor(y)), y * HEIGHTMAP_TILE_SCALE);
    }

    /**
     * Returns 3D world vector for 2D terrain position (includes height)
     */
    toWorldPos(terrainPos: THREE.Vector2) {
        return new THREE.Vector3(terrainPos.x, this.getHeightFromPosition(terrainPos.x, terrainPos.y), terrainPos.y);
    }

    /**
     * h should be in between 0 and HEIGHTMAP_HEIGHT_SCALE.
     */
    setHeight(x: number, y: number, h: number) {
        const dataIdx = y * this.width + x;
        if (dataIdx >= 0 && dataIdx <= (this.width * this.height) && (h >= 0 && h <= HEIGHTMAP_HEIGHT_SCALE)) {
            this.data[dataIdx] = h * 255 / HEIGHTMAP_HEIGHT_SCALE;
            const positions = this.mesh.geometry.getAttribute("position");
            positions.setY(dataIdx, h);
        }
    }

    flush() {
        this.mesh.geometry.getAttribute("position").needsUpdate = true;
    }
}

function getImageData(img: HTMLImageElement): ImageData {
    // Canvas is not added to DOM and therefore cleaned up on exit
    const cv = document.createElement("canvas");
    cv.width = img.width;
    cv.height = img.height;
    const ctx = cv.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
}


function createTerrainMesh(heightmapData: Uint8Array, width: number, height: number, assets: AssetManager) {
    let geometry = new THREE.BufferGeometry();

    // Create vertices from height map
    const vertices = new Float32Array(width * height * 3);
    const uvs = new Float32Array(width * height * 2);
    for (let i = 0; i < height; ++i) {
        for (let j = 0; j < width; ++j) {
            const dataIdx = (i * width + j);
            const heightValue = heightmapData.at(dataIdx) / 255 * HEIGHTMAP_HEIGHT_SCALE;

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
    for (let i = 0; i < height - 1; i++) {
        for (let j = 0; j < width - 1; j++) {
            // Top triangle
            indices.push(j + (i * width));
            indices.push(j + ((i + 1) * width));
            indices.push(j + 1 + (i * width));
            // Bottom triangle
            indices.push(j + 1 + (i * width));
            indices.push(j + ((i + 1) * width));
            indices.push(j + 1 + ((i + 1) * width));
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
            heightScale: { value: HEIGHTMAP_HEIGHT_SCALE },

            // Parameters for map editor
            showBrush: { value: true },
            brushRadius: { value: 15, },
            mousePos: { value: new THREE.Vector2(0, 0), },
            meshDimensions: { value: new THREE.Vector2(width, height), },
        },
        vertexShader: assets.shaders["shaders/terrain-vertex.glsl"],
        fragmentShader: assets.shaders["shaders/splat.glsl"],
    }));
    mesh.receiveShadow = true;
    // Center around origin
    return mesh;
}

async function loadTerrain(heightmapFilename: string, assets: AssetManager) {
    const img = await new THREE.ImageLoader().loadAsync("assets/" + heightmapFilename);
    const imageData = getImageData(img);

    return new Terrain(imageData, assets);
}

export {
    Terrain,
    loadTerrain,
    HEIGHTMAP_TILE_SCALE,
    HEIGHTMAP_HEIGHT_SCALE,
}