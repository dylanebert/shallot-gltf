# shallot-gltf

Experimental static glTF 2.0 decoding for Shallot. Not specification-complete or optimized. This first stage is deviceless; plugin registration and the `gltf-model` example are not implemented yet.

```sh
bun add @dylanebert/shallot-gltf @dylanebert/shallot
```

```ts
import { loadGltf } from "@dylanebert/shallot-gltf";

const scene = await loadGltf(new URL("./model.glb", import.meta.url));
console.log(scene.meshes, scene.instances, scene.unsupported);
```

## Supported subset

- `.gltf` and `.glb` v2, with external, data-URI or BIN buffers. `parse` accepts already-resolved buffers. External image URIs become absolute; embedded images expose their bytes. Image decoding is the consumer's responsibility.
- Triangle primitives: positions, normals, first UV set and unsigned indices, including interleaved accessors and accessor offsets. Missing normals deindex the triangles and compute flat normals as glTF requires (three.js's smooth fallback is deliberately not copied).
- Default scene hierarchy, matrix or TRS nodes, shared mesh primitives and column-major world matrices per primitive instance. Matrices retain shear; geometry remains mesh-local. No core parent relation is needed.
- Linear base color RGBA, base color image reference, metallic, roughness and emissive factors, OPAQUE/MASK/BLEND, cutoff (default 0.5), and `KHR_materials_unlit`. These target Shallot's existing `StandardMaterial` fields rather than extending core.

Unknown required extensions refuse with their names, including compression extensions. Unknown optional extensions and ignored features are named in `unsupported`. Non-triangle primitives and sparse-accessor primitives are skipped and reported. Vertex colors, tangents and extra UV sets are ignored and named. Base color textures requesting a UV set other than zero are omitted and reported. Texture sampler settings and double-sided materials are reported, not mapped. Metallic-roughness, normal, occlusion and emissive maps are each named when ignored; their factors still decode.

## Scope cuts

- Skinning, VAT, morph targets and animation clips are outside the static mesh pipeline; static geometry remains, without deformation or playback.
- Lights and cameras are outside that pipeline.
- Draco, meshopt and KTX2/Basis decoders are excluded: Bevy's core glTF loader ships none of them; each needs a vendored WASM decoder without a consumer here. Required compressed features refuse; optional extensions are reported and fallback data is used when available.
- The archived worker pool, albedo buckets, palette union and scene routes depended on Shallot's removed renderer and are not recovered.

The accessor, packing and node-local transform code is adapted from Shallot's archived `src/transitional/gltf/` at `f1023acd28a0fe31f64bc61345d4605887495201`; Accessor and GLB container tests are recovered from `a4e87190^:src/extras/gltf/`. Static placement is intended for startup loading, before image registration and warm-up, not runtime streaming.

See [CONTRIBUTING.md](CONTRIBUTING.md) for verification and [fixture provenance](tests/fixtures/README.md) for licenses.
