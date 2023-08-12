# WaaS (World as a Service)

3D terrain sandbox, playground for my gamedev experiments.

## Local dev environment

```
# If assets have changed / new ones have been added
node build-asset-list.js
npm run dev
```

Note: If Firefox has "resistFingerprinting" enabled, rendering is broken :(

## Building for production

```
npm run build
```

### Features

- Water (no waves/animation yet)
- Skybox
- Doodad objects on the map (tree)
- Terrain texturing based on height
- Height editing (in progress)

### Next TODOs

- Water shader
- Make doodads react on height changes (adjust to correct height)
- Texture painting (needs a different terrain shader)
- Placing doodads
