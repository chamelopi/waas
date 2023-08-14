varying float vHeight;
varying vec2 vUv;
varying vec2 terrainPos;

void main() {
    vHeight = position.y;
    vUv = uv;
    terrainPos = position.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}