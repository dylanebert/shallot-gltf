import { expect, test } from "bun:test";
import { type GltfJson, parse } from "./gltf";

function model(samplers?: GltfJson["samplers"], sampler?: number): GltfJson {
    return {
        materials: [{ pbrMetallicRoughness: { baseColorTexture: { index: 0 } } }],
        textures: [{ source: 0, sampler }],
        images: [{ uri: "color.png" }],
        samplers,
    };
}

test("a mapped texture without a sampler reports glTF's implicit REPEAT mismatch", () => {
    expect(parse(model(), []).unsupported).toEqual(["sampler"]);
});

test("only effective sampler settings differing from Shallot's shared sampler are reported", () => {
    const compatible = { wrapS: 33071, wrapT: 33071, magFilter: 9729, minFilter: 9985 };
    expect(parse(model([compatible], 0), []).unsupported).toEqual([]);
    expect(parse(model([{ wrapS: 33071, wrapT: 33071 }], 0), []).unsupported).toEqual([]);
    for (const mismatch of [
        { wrapS: undefined },
        { wrapT: undefined },
        { wrapS: 10497 },
        { wrapT: 33648 },
        { magFilter: 9728 },
        ...[9728, 9729, 9984, 9986, 9987].map((minFilter) => ({ minFilter })),
    ]) {
        expect(parse(model([{ ...compatible, ...mismatch }], 0), []).unsupported).toEqual([
            "sampler",
        ]);
    }
});

test("samplers not used by a mapped base-color image are not reported", () => {
    const json = model([{}]);
    json.materials = [];
    expect(parse(json, []).unsupported).toEqual([]);
    const extraUv = model([{}], 0);
    extraUv.materials![0].pbrMetallicRoughness!.baseColorTexture!.texCoord = 1;
    expect(parse(extraUv, []).unsupported).toEqual(["baseColorTexture.texCoord"]);
});
