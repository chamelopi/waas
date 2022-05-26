uniform sampler2D dirt;
uniform sampler2D sand;
uniform sampler2D rock;
uniform sampler2D grass;

varying float vHeight;
varying vec2 vUv;

float weight(float bottom, float top, float dist) {
    return dist / (top - bottom);
}

void main() {
    float h = vHeight - 0.5;
    
    const float border1 = 0.3;
    const float border2 = 1.0;
    const float border3 = 1.75;
    const float border4 = 5.0;
    const float THRESHOLD = 0.3;

    vec4 sandCol = texture2D(sand, vUv);
    vec4 grassCol = texture2D(grass, vUv);
    vec4 dirtCol = texture2D(dirt, vUv);
    vec4 rockCol = texture2D(rock, vUv);

    vec4 ground = vec4(0.0, 0.0, 0.0, 1.0);
    
    if (h > 0.0 && h < border1+0.1) {
        float w = weight(0.0, border1, h - border1);
        ground += mix(sandCol, grassCol, w);
    }
    if (h > border1-0.1 && h < border2+0.1) {
        float w = weight(border1, border2, h - border2);
        ground += mix(grassCol, dirtCol, w);
    }
    if (h > border2-0.1 && h < border3+0.1) {
        float w = weight(border2, border3, h - border3);
        ground += mix(dirtCol, rockCol, w);
    }
    if (h > border3-0.1 && h < border4) {
        float w = weight(border3, border4, h - border4);
        ground += mix(rockCol, vec4(0.0, 0.0, 0.0, 1.0), w);
    }

    gl_FragColor = ground;
}