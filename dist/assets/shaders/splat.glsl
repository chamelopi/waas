uniform sampler2D dirt;
uniform sampler2D sand;
uniform sampler2D rock;
uniform sampler2D grass;

uniform float heightScale;

varying float vHeight;
varying vec2 vUv;

float weight(float bottom, float top, float dist) {
    return dist / (top - bottom);
}

void main() {
    float normalizedHeight = vHeight / heightScale;

    vec4 sandCol = texture2D(sand, vUv);
    vec4 grassCol = texture2D(grass, vUv);
    vec4 dirtCol = texture2D(dirt, vUv);
    vec4 rockCol = texture2D(rock, vUv);

    // Base color is just black
    vec4 ground = vec4(0.0, 0.0, 0.0, 1.0)
        // Positive smoothstep fades texture *in* (between an interval)
        // Negative smoothstep fades it *out*. This means that the negative interval of the previous texture
        // and the positive interval of the next one must overlap for a smooth transition.
        + sandCol * (1.0 - smoothstep(0.15, 0.25, normalizedHeight))
        + grassCol * (smoothstep(0.15, 0.25, normalizedHeight) - smoothstep(0.3, 0.4, normalizedHeight))
        + dirtCol * (smoothstep(0.3, 0.4, normalizedHeight) - smoothstep(0.55,0.65, normalizedHeight))
        + rockCol * smoothstep(0.55,0.65, normalizedHeight);

    gl_FragColor = ground;
}