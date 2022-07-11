import * as THREE from "three";

export function computeShader(renderer: THREE.WebGLRenderer, data: Uint8Array, dims: THREE.Vector2, shaderName: string, assets: any, myscene: THREE.Scene): Uint8Array {
    // Maybe try this:
    //https://github.com/mrdoob/three.js/blob/master/examples/webgl_gpgpu_water.html


    // TODO: framebufferTexture2D: Bad `imageTarget`
    const renderTarget = new THREE.WebGLArrayRenderTarget(dims.x, dims.y, 1);
    // Output format: only red channel
    renderTarget.texture.format = THREE.RedFormat;

    const texture = new THREE.DataArrayTexture(data, dims.x, dims.y, 1);
    texture.format = THREE.RedFormat;
    texture.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            size: { value: new THREE.Vector2(dims.x, dims.y) },
            inputTexture: { value: texture },
        },
        vertexShader: assets.shaders["shaders/compute-passthrough.glsl"],
        fragmentShader: assets.shaders["shaders/compute-" + shaderName + ".glsl"],
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material as unknown as THREE.MeshBasicMaterial);

    const postProcessScene = new THREE.Scene();
    postProcessScene.add(mesh);
    const postProcessCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer.setRenderTarget(renderTarget);
    renderer.render(postProcessScene, postProcessCamera);
    renderer.setRenderTarget(null);

    // DEBUG:
    // TODO: This does not work because it is a TEXTURE_2D_ARRAY
    const debugMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: renderTarget.texture }));
    debugMesh.position.set(24, 2, 24);
    myscene.add(debugMesh);

    // Downloads data from GPU
    let resultBuffer = new Uint8Array(dims.x * dims.y);
    renderer.readRenderTargetPixels(renderTarget, 0, 0, dims.x, dims.y, resultBuffer);

    return resultBuffer;
}