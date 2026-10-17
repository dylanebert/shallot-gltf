# Contributing

```sh
bun install --frozen-lockfile
bun check
bun run lint
bun run test
```

- `src/` is the deviceless static decoder. Import Shallot only through public package exports. GPU integration must fit WebGPU default limits; this decoder acquires no device.
- Tests run in Bun's cheap tier with a 250 ms budget. `tests/decoder.test.ts` compares the public load result against three.js `GLTFLoader`; image pixels are not part of that comparison.
- Fixtures are vendored from the revision in `tests/fixtures/README.md`, with each model's license. Tests must not fetch the network.
- Decoder changes run the comparisons, and changes to their assertions are shown to fail with the corresponding decode deliberately broken. Record mutation evidence in the commit, not as generated files.
- `peerDependencies` states compatibility; the dev dependency and lockfile pin the published Shallot version used for checks. Publishing is a separate release decision.
