# shallot-gltf

experimental static glTF loading for [shallot](https://github.com/dylanebert/shallot).

```bash
bun add @dylanebert/shallot-gltf
```

```ts
// in your plugin's async initialize
const model = await loadGltfScene(world, url, onProgress);
spawnGltfScene(world, model, { translation: [0, 0, 0] });
```

See [`examples/gltf-model`](examples/gltf-model).

Meshes, base colour textures and `StandardMaterial` factors. Missing required extensions refuse by name; anything else ignored is listed in `model.unsupported`. No animation, skinning, lights, cameras, or Draco, meshopt and KTX2 compression.

| shallot-gltf | shallot |
| --- | --- |
| 0.1.0-next.1 | 0.10.0-next.5 and later 0.10 |

changing it: [`CONTRIBUTING.md`](CONTRIBUTING.md). mit.
