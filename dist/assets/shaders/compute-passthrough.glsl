void main() {
    vec2 uv = gl_FragCoord.xy / resolution;

    gl_FragColor.r = texture2D(inputTexture, uv).r;
}
