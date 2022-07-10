# A nice 3D shitpost

## Local dev environment

```
npx snowpack dev
```

## Building for production

```
npx snowpack build
```

### Next TODOs
- Use Water shader from this example: https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_ocean.html
- Fix lighting (HemisphereLight cannot cast shadow, our terrain shader does respect light atm)
- Show FPS