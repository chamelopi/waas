import * as THREE from "three";

export function computeShader(renderer: THREE.WebGLRenderer, data: Uint8Array, dims: THREE.Vector2, shaderName: string, assets: any): Uint8Array {
    const renderTarget = new THREE.WebGLArrayRenderTarget( dims.x, dims.y, 1 );
    renderTarget.texture.format = THREE.RedFormat;

    const texture = new THREE.DataTexture2DArray(data, dims.x, dims.y, 1);
    texture.format = THREE.RedFormat;
    texture.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            size: { value: new THREE.Vector2(dims.x, dims.y) },
            inputTexture: { value: texture },
        },
        vertexShader: assets.shaders["assets/shaders/compute-passthrough.glsl"],
        fragmentShader: assets.shaders["assets/shaders/compute-" + shaderName + ".glsl"],
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material as unknown as THREE.MeshBasicMaterial);

    const postProcessScene = new THREE.Scene();
    postProcessScene.add(mesh);
    const postProcessCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer.setRenderTarget(renderTarget);
    renderer.render(postProcessScene, postProcessCamera);
    renderer.setRenderTarget(null);

    // TODO: Is this really null?
    return renderTarget.texture.image.data as unknown as Uint8Array;
}