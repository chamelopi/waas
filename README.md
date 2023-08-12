# A nice 3D sandbox

## Local dev environment

```
# If assets have changed
node build-asset-list.js
npm run dev
```

Note: If Firefox has "resistFingerprinting" enabled, rendering is broken :(

## Building for production

```
npm run build
```

### Next TODOs

- heightmap on GPU?
- implement heightmap editing

- Implement Water shader (example: https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html)
- Fix lighting (HemisphereLight cannot cast shadow, our terrain shader does not respect light atm)

- Show FPS