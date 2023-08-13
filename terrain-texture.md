Basically, we need sth like this:

```glsl

#define TERRAIN_TYPE_COUNT 4

// NOTE: This will use 8 (!) textures! Can we optimize here?
// 8 is the minimum guarantee - we can check the limit with `var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);`
uniform sampler2D terrainTypes[TERRAIN_TYPE_COUNT];
uniform sampler2D weights[TERRAIN_TYPE_COUNT];

uniform vec2 terrainPos;
uniform vec2 terrainSize;

float getWeight(int terrainType, vec2 terrainUv) {
    return texture2D(weights[i], terrainUv).r;
}

void main() {
    vec2 terrainUv = terrainPos / terrainSize;

    vec4 color = vec4(0.0);
    for (int i = 0; i < TERRAIN_TYPE_COUNT; i++) {
        // get weight for this terrain type at the position
        float weight = getWeight(i, terrainUv);
        // add weighted color for this terrain type
        color += texture2D(terrainTypes[i]) * weight;
    }

    gl_FragColor = color;
}
```


which terrain types do we need?
- sand
- grass
- earth
- rock
- snow?
- swamp?

We could use all channels of the weight textures, so that we only need n + (n/4) textures:

```
float getWeight(int terrainType, vec2 terrainUv) {
    vec4 textureValue = texture2D(weights[i / 4], terrainUv);
    int typeOffset = terrainType % 4;
    if (typeOffset == 0) {
        return textureValue.r;
    } else if (typeOffset == 1) {
        return textureValue.g;
    } else if (typeOFfset == 2) {
        return textureValue.b;
    } else {
        return textureValue.a;
    }
}
```

To edit terrain, we would have to use a compute shader to write to the weight textures.
(we could also do it on the CPU, but we would have to do blending ourselves & it might not be as efficient)

TODO/to check: do we need n/4 draw calls for setting the weights or can we do it in a single draw call?
