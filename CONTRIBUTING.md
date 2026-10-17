# Contributing

```sh
bun install --frozen-lockfile
bun check
bun run lint
bun run test
bun test ./examples/gltf-model/tests/placement.node.ts
bunx playwright test -c examples/gltf-model --workers=1
```

- Import Shallot only through public package exports. The decoder acquires no device; scene loading and placement use the world's mesh, image and material registries. GPU integration must fit WebGPU default limits.
- Cheap tests use a 250 ms budget. `tests/decoder.test.ts` compares decoded data against three.js `GLTFLoader`; image pixels are outside that comparison.
- `tests/scene.gpu.test.ts` uses bun-webgpu and Shallot's GPU/startup budgets, requests the renderer's required feature without raised limits, and compares loaded output with directly authored pixels. Its worlds warm once before the tests.
- The example's plugin check asserts authored placement; its Node goal asserts derived placement in the composed app. The browser subject captures a stepped page through `captureFrame` and checks the model's texture. Keep the example's asset license beside the asset.
- Fixtures are vendored from the revision in `tests/fixtures/README.md`, with each model's license. Tests must not fetch the network.
- Decoder changes run the comparisons, and changes to their assertions are shown to fail with the corresponding decode deliberately broken. Record mutation evidence in the commit, not as generated files.
- `peerDependencies` states compatibility; the dev dependency and lockfile pin the published Shallot version used for checks. Publishing is a separate release decision.
