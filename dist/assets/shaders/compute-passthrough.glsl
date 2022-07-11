uniform sampler2D inputTexture;
uniform vec2 size;

void main() {
    vec2 uv = gl_FragCoord.xy / size;
    gl_FragColor = texture2D(inputTexture, uv);
}
