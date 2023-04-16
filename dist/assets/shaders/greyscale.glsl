varying float vHeight;

void main() {
    float h = vHeight - 0.5;
    gl_FragColor = vec4(h, h, h, 1.0);
}