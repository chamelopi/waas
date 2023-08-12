varying vec2 vUv;

uniform sampler2D waterTexture;

void main() {
    vec3 color = texture2D(waterTexture, vUv).rgb;
    gl_FragColor = vec4(color, 0.65);
}