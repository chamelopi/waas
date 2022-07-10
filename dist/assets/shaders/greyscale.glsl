varying float height;

void main() {
    float h = height - 0.5;
    gl_FragColor = vec4(h, h, h, 1.0);
}