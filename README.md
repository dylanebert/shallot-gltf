# shallot-gltf

Experimental static glTF 2.0 loading and placement for Shallot. Not specification-complete or optimized.

```sh
bun add @dylanebert/shallot-gltf @dylanebert/shallot
```

```ts
import { MeshPlugin, type Plugin, runApp } from "@dylanebert/shallot";
import { loadGltfScene, spawnGltfScene } from "@dylanebert/shallot-gltf";

const Model: Plugin = {
    name: "Model",
    dependencies: [MeshPlugin],
    async initialize(world, onProgress) {
        const model = await loadGltfScene(world, new URL("/model.glb", location.href), onProgress);
        spawnGltfScene(world, model, { translation: [0, 0, 0] });
        console.log(model.unsupported);
    },
};
await runApp({ plugins: [Model] });
```

The game owns loading and placement; this package needs no plugin state. Call `loadGltfScene` from the game's async `initialize`, before image warm-up. Its handle belongs to that world. `spawnGltfScene` creates one entity per primitive instance, composing placement onto its node world transform. A composition with shear refuses with the node named, before spawning any entities. There is no core parent relation or model-root entity. Repeated placements share the load's meshes and materials, rather than registering copies. `model.primitives` exposes each `mesh`, `material` and model-space `matrix` for games that supply placements through `registerProducerTable` instead.

`loadGltf` and `parse` remain deviceless entry points. [examples/gltf-model](examples/gltf-model) loads the textured Khronos Cesium Milk Truck through the package name. Run it with `bunx vite examples/gltf-model`; check its presentation with `bunx playwright test -c examples/gltf-model --workers=1`.

## Supported subset

- `.gltf` and `.glb` v2, with external, data-URI or BIN buffers. `parse` accepts already-resolved buffers. External image URIs become absolute; embedded images expose their bytes. `loadGltfScene` registers these images in Shallot's shared sRGB image array; Shallot decodes them at warm.
- Triangle primitives: positions, normals, first UV set and unsigned indices, including interleaved accessors and accessor offsets. Missing normals deindex the triangles and compute flat normals as glTF requires (three.js's smooth fallback is deliberately not copied).
- Default scene hierarchy, matrix or TRS nodes, shared mesh primitives and column-major world matrices per primitive instance. Matrices retain shear; geometry remains mesh-local. No core parent relation is needed.
- Linear base color RGBA, base color image reference, metallic, roughness and emissive factors, OPAQUE/MASK/BLEND, cutoff (default 0.5), and `KHR_materials_unlit`. These target Shallot's existing `StandardMaterial` fields rather than extending core.

Unknown required extensions refuse with their names, including compression extensions. Unknown optional extensions and ignored features are named in `unsupported`. Non-triangle primitives and sparse-accessor primitives are skipped and reported. Vertex colors, tangents and extra UV sets are ignored and named. Base color textures requesting a UV set other than zero are omitted and reported. Base-color textures register their own wrap modes and texel filters, including glTF's default REPEAT wrapping. Unspecified filters follow GLTFLoader: linear magnification and linear-mipmap-linear minification. Shallot selects the nearest mip, so `unsupported` includes `sampler.minFilter.mipSelection` for linear mip blending or disabled mipmapping, including the unspecified minification default. Double-sided materials are reported, not mapped. Metallic-roughness, normal, occlusion and emissive maps are each named when ignored; their factors still decode.

## Scope cuts

- Skinning, VAT, morph targets and animation clips are outside the static mesh pipeline; static geometry remains, without deformation or playback.
- Lights and cameras are outside that pipeline.
- Draco, meshopt and KTX2/Basis decoders are excluded: Bevy's core glTF loader ships none of them; each needs a vendored WASM decoder without a consumer here. Required compressed features refuse; optional extensions are reported and fallback data is used when available.
- The archived worker pool, albedo buckets, palette union and scene routes depended on Shallot's removed renderer and are not recovered.

The accessor, packing and node-local transform code is adapted from Shallot's archived `src/transitional/gltf/` at `f1023acd28a0fe31f64bc61345d4605887495201`; Accessor and GLB container tests are recovered from `a4e87190^:src/extras/gltf/`. Loading registers images before warm-up; runtime streaming is outside the supported subset.

See [CONTRIBUTING.md](CONTRIBUTING.md) for verification and [fixture provenance](tests/fixtures/README.md) for licenses.
