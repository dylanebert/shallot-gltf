# Contributing

```sh
bun install --frozen-lockfile
bun check
bun run lint
bun run test
bun test ./examples/gltf-model/tests/placement.node.ts
bunx playwright test -c examples/gltf-model --workers=1
```

- Shallot is imported only through its public exports, and everything fits WebGPU's default limits.
- `tests/decoder.test.ts` compares decoding with three.js `GLTFLoader`; `tests/scene.gpu.test.ts` compares loaded pixels with a directly authored scene on headless Dawn.
- A changed assertion is shown red with its behaviour broken, recorded in the commit.
- Fixtures are vendored with their licenses (`tests/fixtures/README.md`); tests never fetch the network.
- `peerDependencies` is the compatibility range; the dev dependency pins the published Shallot used for checks.
