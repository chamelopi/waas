precision highp sampler2DArray;

uniform sampler2DArray inputTexture;
uniform vec2 size;

in vec2 vUv;

void main() {
    if (texture(inputTexture, vec3(vUv, 1)).r > 0.5) {
        gl_FragColor.r = 1.0;
    } else {
        gl_FragColor.r = 0.0;
    }

    // debug
    gl_FragColor.r = texture(inputTexture, vec3(vUv, 1)).r;
}
