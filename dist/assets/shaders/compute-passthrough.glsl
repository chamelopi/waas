uniform vec2 size;

out vec2 vUv;

void main() {
    vUv = position.xy / size;
    // Need this to be able to write output in frag shader (?)
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
