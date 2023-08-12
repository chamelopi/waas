uniform float time;

// 'resolution' is an implicit #define (vec2) containing the input texture's size

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    
    float value = texture2D(inputTexture, uv).r;
    // Halves the value every computation step to show propagation
    gl_FragColor.r = value / 2.0;
}
