uniform sampler2D inputTexture;
uniform vec2 size;
uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / size;

    float red = texture2D(inputTexture, uv).r - time;
    gl_FragColor.r = max(0.0, red);
}
