uniform sampler2D myTexture;

varying float vHeight;
varying vec2 vUv;

void main() {
    float red = texture2D(myTexture, vUv).r;
    gl_FragColor = vec4(0, 0, red, 1);
}