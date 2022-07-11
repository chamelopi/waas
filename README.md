# A nice 3D shitpost

## Local dev environment

```
npm run dev
```

## Building for production

```
npm run build
```

### Next TODOs

- fix compute shader prototype
- heightmap on GPU
- add shaders for heightmap editing, keep in sync with heightmap in RAM

- Use Water shader from this example: https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html
- Fix lighting (HemisphereLight cannot cast shadow, our terrain shader does respect light atm)
- Show FPS