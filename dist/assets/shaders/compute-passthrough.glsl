uniform sampler2D inputTexture;
uniform vec2 size;

void main() {
    vec2 uv = gl_FragCoord.xy / size;

    gl_FragColor.r = texture2D(inputTexture, uv).r;
}
