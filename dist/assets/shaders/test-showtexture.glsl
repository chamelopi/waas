uniform sampler2D myTexture;

varying float vHeight;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(myTexture, vUv);
    gl_FragColor = vec4(color.r, 0.0, 0.0, 1.0);
}