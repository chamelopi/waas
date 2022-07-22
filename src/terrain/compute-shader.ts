import * as THREE from "three";
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

class ComputeShaderRunner {
    private gpuCompute: GPUComputationRenderer;
    private inTexture: THREE.DataTexture;
    private renderTarget: THREE.WebGLRenderTarget;

    constructor(private renderer: THREE.WebGLRenderer, private dims: THREE.Vector2, private assets: any) {
        this.gpuCompute = new GPUComputationRenderer(dims.x, dims.y, renderer);
        this.gpuCompute.setDataType(THREE.ByteType);
    
        this.inTexture = this.gpuCompute.createTexture();
        this.inTexture.format = THREE.RedFormat;
        
        const error = this.gpuCompute.init();
        if (error !== null) {
            console.error(error);
        }

        this.renderTarget = new THREE.WebGLRenderTarget(this.dims.x, this.dims.y, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RedFormat,
            type: THREE.UnsignedByteType,
            depthBuffer: false
        });
    }

    public uploadData(data: Uint8Array) {
        if (data.length != this.dims.x * this.dims.y) {
            throw new Error(`Dimensions ${this.dims.x}/${this.dims.y} do not match data array length ${data.length}!`);
        }
        this.inTexture.image.data.set(data);
    }

    private compute(shaderName: string, uniforms: Record<any, any>) {
        const mergedUniforms = {
            ...uniforms,
            inputTexture: { value: this.inTexture },
            size: { value: this.dims },
        }
    
        const shader = this.assets.shaders["shaders/" + shaderName + ".glsl"];
        const shaderMaterial = this.gpuCompute.createShaderMaterial(shader, mergedUniforms);
    
        // Do the actual computation
        this.gpuCompute.doRenderTarget(shaderMaterial, this.renderTarget);
    }

    public computeTexture(shaderName: string, uniforms: Record<any, any>): THREE.Texture {
        this.compute(shaderName, uniforms);
        return this.renderTarget.texture;
    }

    public computeArray(shaderName: string, uniforms: Record<any, any>): Uint8Array {
        this.compute(shaderName, uniforms);
    
        const result = new Uint8Array(this.dims.x * this.dims.y);
        this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.dims.x, this.dims.y, result);
    
        return result;
    }
}

export {
    ComputeShaderRunner,
}