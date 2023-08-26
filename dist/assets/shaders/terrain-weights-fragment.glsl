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

uniform sampler2D heightmapTexture;

// three.js specific uniforms for phong lighting
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

#define PHONG

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
// three.js specific END


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
            // Darken & tint blue
            color.rgb = color.rgb * 0.7;
            color.b += 0.1;
        }
    }


    // three.js specific
    
    {
        #include <clipping_planes_fragment>

        // Uses our color calculation from before
        vec4 diffuseColor = vec4( color.rgb, opacity );
        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;

        #include <logdepthbuf_fragment>
        #include <map_fragment>
        #include <color_fragment>
        #include <alphamap_fragment>
        #include <alphatest_fragment>
        #include <specularmap_fragment>
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        #include <emissivemap_fragment>

        // accumulation
        #include <lights_phong_fragment>
        #include <lights_fragment_begin>
        #include <lights_fragment_maps>
        #include <lights_fragment_end>

        // modulation
        #include <aomap_fragment>

        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

        #include <envmap_fragment>
        #include <output_fragment>
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
        #include <premultiplied_alpha_fragment>
        #include <dithering_fragment>
    }
    
    // three.js specific END

    gl_FragColor = color;
    //gl_FragColor = vec4(vNormal, 1.0);
    //gl_FragColor = vec4(vHeight / 6.0, 0.0, 0.0, 1.0);
}