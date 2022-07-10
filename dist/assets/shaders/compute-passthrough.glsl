uniform sampler2D inputTexture;
uniform vec2 size;

varying vec2 uv;

void main() {
    uv = position.xy / size;
}
