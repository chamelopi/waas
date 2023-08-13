# WaaS (World as a Service)

3D terrain sandbox, playground for my gamedev experiments.

![Example image](waas.png)

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

- Animated water
- Skybox
- Doodad objects on the map (tree)
- Terrain texturing based on height
- Height editing (in progress)
  - add/remove terrain
  - create plateau
  - TODO: smoothen

### Next TODOs

- Make doodads react on height changes (adjust to correct height)
- Texture painting (needs a different, more complex terrain shader)
- Placing doodads
