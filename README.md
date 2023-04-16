# A nice 3D shitpost

## Local dev environment

```
# If assets have changed
node build-asset-list.js
npm run dev
```

Note: If Firefox has "resistFingerprinting" enabled, our rendering is broken :(

## Building for production

```
npm run build
```

### Next TODOs

- heightmap on GPU
- add shaders for heightmap editing, keep in sync with heightmap in RAM

- Use Water shader from this example: https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html
- Fix lighting (HemisphereLight cannot cast shadow, our terrain shader does respect light atm)
- Show FPS