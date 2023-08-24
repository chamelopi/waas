precision highp sampler2DArray;
uniform sampler2DArray terrainTypes;
uniform sampler2DArray weights;
uniform int terrainTypeCount;

uniform vec2 meshDimensions;

varying float vHeight;
varying vec2 vUv;
varying vec2 terrainPos;

// Map editor visualization
uniform bool showBrush;
uniform float brushRadius;
uniform vec2 mousePos;


float getWeight(int terrainType, vec2 terrainUv) {
    vec4 textureValue = texture(weights, vec3(terrainUv, terrainType));

    // TODO: Is this still correct for weights edited via our editor functionality? Or just for manual painting?
    return textureValue.a;
}

/**
 * Texturizes terrain by applying a weighted sum of the colors of multiple textures and weight textures to each vertex.
 * Is more flexible than a splat shader, since it allows every terrain type for every elevation, and can support
 * arbitrary amounts of terrain types in theory (in practice limited by GPU texture array size limits).
 */
void main() {
    // Calculate normalized [0, 1] position on terrain to index the weight map
    vec2 terrainUv = terrainPos / meshDimensions;

    vec4 color = vec4(0.0);
    
    // Weighted sum of colors
    float sum = 0.0;
    for (int i = 0; i < terrainTypeCount; ++i) {
        // get weight for this terrain type at the position (i.e. which type is it, but blended)
        float weight = getWeight(i, terrainUv);
        sum += weight;
        // add weighted color for this terrain type
        color += texture(terrainTypes, vec3(vUv, i)) * weight;
    }
    // Divide by the sum of the weights, otherwise we would get color values > 1
    color = color / sum;


    if (showBrush) {
        if (distance(mousePos, terrainPos) <= brushRadius) {
            // Darken
            color.rgb = color.rgb * 0.7;
        }
    }

    gl_FragColor = color;
}