varying float vHeight;
varying vec2 vUv;

void main() {
    vHeight = position.y;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}