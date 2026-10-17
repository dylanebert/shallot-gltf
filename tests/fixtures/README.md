# Fixtures

KhronosGroup/glTF-Sample-Assets, commit `2bac6f8c57bf471df0d2a1e8a8ec023c7801dddf`:
https://github.com/KhronosGroup/glTF-Sample-Assets/tree/2bac6f8c57bf471df0d2a1e8a8ec023c7801dddf/Models

Model directories contain unchanged variant files and the corresponding `LICENSE.md`:

- BoxInterleaved: byteStride and accessor offsets.
- BoxTextured: UVs and base color image, external, embedded data URI and GLB.
- AlphaBlendModeTest: opaque, mask cutoffs, blend and ignored material maps.
- SimpleMeshes: shared geometry and missing normals.
- CesiumMilkTruck: noncommuting parent/child transforms and material factors.
- UnlitTest: `KHR_materials_unlit` mapping against GLTFLoader's basic material.

`required-draco.gltf` and `required-meshopt.gltf` are authored refusal fixtures under this package's MIT license. The meshopt fixture has a URI-less fallback buffer and an external compressed buffer; refusal must precede resolving either one.
