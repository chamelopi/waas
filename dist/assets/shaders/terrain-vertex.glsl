varying float vHeight;
varying vec2 vUv;
varying vec2 terrainPos;

uniform vec2 meshDimensions;
uniform sampler2D heightmapTexture;


// three.js specific code
#define PHONG

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

    varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
// three.js specific code END


void main() {
    vec2 cellSize = 1.0 / meshDimensions;
    vec3 offset = vec3(-cellSize.x, 0, cellSize.x);

    vHeight = position.y;
    vUv = uv;
    terrainPos = position.xz;
    vec2 terrainUv = terrainPos / meshDimensions;

    // three.js specific code
    {
        #include <uv_vertex>
        #include <color_vertex>

        // # include <beginnormal_vertex>
        // Compute normal from heightmap for lighting
        vec3 tangent = normalize(vec3(0.0, texture2D(heightmapTexture, terrainUv + vec2(cellSize.x, 0.0)).r - texture2D(heightmapTexture, terrainUv + vec2(-cellSize.x, 0.0)).r, 0.4));
        vec3 bitangent = normalize(vec3(0.4, texture2D(heightmapTexture, terrainUv + vec2(0.0, cellSize.y)).r - texture2D(heightmapTexture, terrainUv + vec2(0.0, -cellSize.y)).r, 0.0));
        
        vec3 objectNormal = cross(tangent, bitangent);
        //vec3 objectNormal = vec3(1.0, 1.0, 0.0);
        //<beginnormal_vertex>
        
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        

        #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

            vNormal = normalize( transformedNormal );

        #endif
    }
    // three.js specific code END

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}