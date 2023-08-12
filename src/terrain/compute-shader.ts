import * as THREE from "three";
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer';

class ComputeShaderRunner {
    private gpuCompute: GPUComputationRenderer;
    private renderTarget: THREE.WebGLRenderTarget;
    private otherRenderTarget: THREE.WebGLRenderTarget;
    private shader?: string;
    private shaderMaterial?: THREE.ShaderMaterial;
    private inTexture: THREE.Texture;

    constructor(private renderer: THREE.WebGLRenderer, public dims: THREE.Vector2, private assets: any) {
        this.gpuCompute = new GPUComputationRenderer(dims.x, dims.y, renderer);
        this.gpuCompute.setDataType(THREE.ByteType);
        
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
            depthBuffer: false,
        });
        this.otherRenderTarget = this.renderTarget.clone();

        this.inTexture = new THREE.Texture();
    }

    // TODO: We seem to require multiple render targets and swap them in between passes
    // - Maybe try like here: https://github.com/cabbibo/PhysicsRenderer
    public swapTextures() {
        const temp = this.renderTarget;
        this.renderTarget = this.otherRenderTarget;
        this.otherRenderTarget = temp;
    }

    public uploadData(data: Uint8Array) {
        if (data.length != this.dims.x * this.dims.y) {
            throw new Error(`Dimensions ${this.dims.x}/${this.dims.y} do not match data array length ${data.length}!`);
        }
        this.inTexture = new THREE.DataTexture(data, this.dims.x, this.dims.y);
        this.inTexture.needsUpdate = true;
    }

    public getInTexture(): THREE.Texture {
        return this.inTexture;
    }

    public downloadData(): Uint8Array {
        // TODO: Implement
        throw new Error("Not implemented!");
    }

    private compute(shaderName: string, uniforms: Record<any, any>) {
        const mergedUniforms = {
            ...uniforms,
            inputTexture: { value: this.inTexture },
            size: { value: this.dims },
        }

        // Use cached shader unless we want a different one
        if (!this.shader || !this.shaderMaterial || this.shader != shaderName) {
            console.log("compiling shader " + shaderName);
            const shaderCode = this.assets.shaders["shaders/" + shaderName + ".glsl"];
            this.shader = shaderName;
            this.shaderMaterial = this.gpuCompute.createShaderMaterial(shaderCode, mergedUniforms);
        } else {
            console.log("using shader " + shaderName + " from cache");
            this.shaderMaterial.uniforms = mergedUniforms;
            this.shaderMaterial.needsUpdate = true;
        }
    
        // Do the actual computation
        this.gpuCompute.doRenderTarget(this.shaderMaterial, this.renderTarget);
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