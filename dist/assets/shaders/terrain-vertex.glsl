varying float vHeight;
varying vec2 vUv;
varying vec2 terrainPos;

uniform vec2 meshDimensions;

void main() {
    vHeight = position.y;
    vUv = uv;
    terrainPos = position.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}