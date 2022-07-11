import * as THREE from "three";
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

// TODO: Refactor into class
// - use dependency injection for renderer, assets
// - reuse renderer for sequential computations
// - allow passing of additional uniforms
export function computeOnGpu(renderer: THREE.WebGLRenderer, data: Uint32Array, dims: THREE.Vector2, shaderName: string, assets: any): Uint32Array {
    if (data.length != dims.x * dims.y) {
        throw new Error(`Dimensions ${dims.x}/${dims.y} do not match data array length ${data.length}!`);
    }

    let gpuCompute = new GPUComputationRenderer(dims.x, dims.y, renderer);

    const inTexture = gpuCompute.createTexture();
    inTexture.image.data.set(new Uint8Array(data.buffer));

    const error = gpuCompute.init();
    if (error !== null) {
        console.error(error);
    }

    // (use defaults)
    const renderTarget = new THREE.WebGLRenderTarget(dims.x, dims.y, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        depthBuffer: false
    });

    const uniforms = {
        inputTexture: { value: inTexture },
        size: { value: dims },
    }

    const shader = assets.shaders["shaders/" + shaderName + ".glsl"];
    console.log(assets);
    const shaderMaterial = gpuCompute.createShaderMaterial(shader, uniforms);

    // Do the actual computation
    gpuCompute.doRenderTarget(shaderMaterial, renderTarget);

    const result = new Uint8Array(dims.x * dims.y * 4);
    renderer.readRenderTargetPixels(renderTarget, 0, 0, dims.x, dims.y, result);

    return new Uint32Array(result.buffer);
}