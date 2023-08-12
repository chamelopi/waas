varying vec2 vUv;

uniform sampler2D waterTexture;
uniform sampler2D perlin;
uniform float time;

// How high should the waves be? (more is higher)
#define AMPLITUDE vec2(0.10, 0.05)
#define FREQUENCY vec2(3.5, 40.5)
// How much does the time affect the wave positions (how fast are the waves changing?)
#define TIME_SCALE vec2(2.0, 1.0)


float height(vec2 pos, float time) {
    // Use a noise value to make everything look less uniform
    float noiseValue = texture2D(perlin, vUv).r;
    // cos + sin for nice waves :)
    return (AMPLITUDE.x * sin(pos.x + FREQUENCY.x + time * TIME_SCALE.x + noiseValue)) + (AMPLITUDE.y * cos(pos.y + FREQUENCY.y + time * TIME_SCALE.y + noiseValue));
}

void main() {
    vUv = uv;

    // We want world coordinates
    vec4 transformedPosition = modelMatrix * vec4(position, 1.0);

    // Update height with waves
    float h = height(transformedPosition.xz, time);
    transformedPosition.y += h;

    vec4 finalPos = projectionMatrix * viewMatrix * transformedPosition;

    gl_Position = finalPos;
}