import * as THREE from "three";
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer';

/**
 * Wrapper class around THREE.GPUComputationRenderer
 * 
 * see here for docs: https://github.com/mrdoob/three.js/blob/master/examples/jsm/misc/GPUComputationRenderer.js#L15
 */
class ComputeShaderRunner {
    private gpuCompute: GPUComputationRenderer;
    private inputTexture: THREE.DataTexture;
    private inputVar: Variable;

    constructor(private renderer: THREE.WebGLRenderer, public dims: THREE.Vector2, private assets: any) {
        this.gpuCompute = new GPUComputationRenderer(dims.x, dims.y, renderer);
    }

    /**
     * Downloads computation result data from GPU to RAM
     */
    public downloadData(): Float32Array {
        const outputBuffer = new Float32Array(this.dims.x * this.dims.y * 4);
        console.log("downloading data from render target: ", this.gpuCompute.getCurrentRenderTarget(this.inputVar));
        this.renderer.readRenderTargetPixels(this.gpuCompute.getCurrentRenderTarget(this.inputVar), 0, 0, this.dims.x, this.dims.y, outputBuffer);
        return outputBuffer;
    }

    /**
     * Sets up input variable (=texture) for the computation
     */
    public initialize(buffer: Float32Array, shaderName: string) {
        this.inputTexture = this.gpuCompute.createTexture();
        this.inputTexture.image.data.set(buffer);

        // Implicitly defines a uniform 'inputTexture'
        this.inputVar = this.gpuCompute.addVariable("inputTexture", this.assets.shaders["shaders/" + shaderName + ".glsl"], this.inputTexture);

        // Declares self-dependency, i.e. texture is updated every frame
        this.gpuCompute.setVariableDependencies(this.inputVar, [this.inputVar]);

        // Check for errors
        const error = this.gpuCompute.init();
        if (error !== null) {
            console.error(error);
        }
    }

    /**
     * Performs one computation step & returns the resulting texture
     */
    public computeFrame(dt: number): THREE.Texture {
        this.inputVar.material.uniforms['time'] = { value: dt };
        this.gpuCompute.compute();

        return this.gpuCompute.getCurrentRenderTarget(this.inputVar).texture;
    }

}

export {
    ComputeShaderRunner,
}