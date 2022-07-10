uniform sampler2D inputTexture;
uniform vec2 size;

varying vec2 uv;

void main() {
    if (texture2D(inputTexture, uv).r > 0.5) {
        gl_FragColor = vec4(1, 0, 0, 1);
    } else {
        gl_FragColor = vec4(0, 1, 0, 1);
    }
}
