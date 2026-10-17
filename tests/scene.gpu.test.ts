import { afterAll, beforeAll, expect, setDefaultTimeout, spyOn, test } from "bun:test";
import {
    type App,
    Camera,
    createApp,
    Materials,
    Meshes,
    MeshInstance,
    MeshMaterial,
    type Plugin,
    StandardMaterial,
    StandardRenderer,
    Tonemapping,
    TonemappingMethod,
    Transform,
    type World,
} from "@dylanebert/shallot";
import { attachTexture, captureTexture } from "@dylanebert/shallot/rendering";
import { MeshRenderPlugin, StandardRenderingPlugin } from "@dylanebert/shallot/standard/rendering";
import { TIMEOUT } from "@dylanebert/shallot/testing";
import { type Gltf, loadGltfScene, spawnGltfScene } from "../src";

setDefaultTimeout(TIMEOUT.gpu);
const vertices = new Float32Array([
    -0.8, -0.6, 0, 0, 0, 0, 1, 0, 0.8, -0.6, 0, 1, 0, 0, 1, 0, 0, 0.8, 0, 0.5, 0, 0, 1, 1,
]);
const positions = new Float32Array([-0.8, -0.6, 0, 0.8, -0.6, 0, 0, 0.8, 0]);
const fixture = {
    asset: { version: "2.0" },
    extensionsUsed: ["KHR_materials_unlit"],
    buffers: [
        {
            uri: `data:application/octet-stream;base64,${Buffer.from(positions.buffer).toString("base64")}`,
            byteLength: positions.byteLength,
        },
    ],
    bufferViews: [{ buffer: 0, byteLength: positions.byteLength }],
    accessors: [
        {
            bufferView: 0,
            componentType: 5126,
            count: 3,
            type: "VEC3",
            min: [-0.8, -0.6, 0],
            max: [0.8, 0.8, 0],
        },
    ],
    materials: [
        {
            pbrMetallicRoughness: {
                baseColorFactor: [0.8, 0.2, 0.04, 1],
                metallicFactor: 0.3,
                roughnessFactor: 0.7,
            },
            extensions: { KHR_materials_unlit: {} },
        },
    ],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
    nodes: [
        {
            name: "Triangle",
            mesh: 0,
            translation: [0.25, 0.1, 0],
            rotation: [0, 0, Math.sin(0.15), Math.cos(0.15)],
        },
    ],
    scenes: [{ nodes: [0] }],
    scene: 0,
};
const url = `data:model/gltf+json;base64,${Buffer.from(JSON.stringify(fixture)).toString("base64")}`;
const apps: App[] = [];
const cameras: number[] = [];
let loaded: Gltf;
let device: GPUDevice;
function camera(world: World) {
    const eid = world.create();
    world.add(eid, Transform, { translation: [0, 0, 4] });
    world.add(eid, Camera);
    world.add(eid, StandardRenderer);
    world.add(eid, Tonemapping, { method: TonemappingMethod.None });
    attachTexture(world, eid, { width: 64, height: 64 });
    cameras.push(eid);
}
beforeAll(async () => {
    const peerModule = "bun-webgpu";
    const { setupGlobals } = (await import(peerModule)) as { setupGlobals(): Promise<void> };
    await setupGlobals();
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error("GPU test needs an adapter");
    device = await adapter.requestDevice({ requiredFeatures: ["indirect-first-instance"] });
    console.log(
        JSON.stringify({
            adapter: adapter.info,
            features: [...device.features],
            limits: device.limits,
        }),
    );
    for (const direct of [false, true]) {
        const subject: Plugin = {
            name: "Fixture",
            dependencies: [StandardRenderingPlugin, MeshRenderPlugin],
            async initialize(world) {
                camera(world);
                if (!direct) {
                    loaded = await loadGltfScene(world, url);
                    spawnGltfScene(world, loaded, {
                        translation: [-0.1, 0.2, 0],
                        scale: [1.2, 1.2, 1.2],
                    });
                } else {
                    const mesh = world.resource(Meshes).add({
                        name: "Authored triangle",
                        vertices,
                        indices: new Uint32Array([0, 1, 2]),
                    });
                    const material = world.resource(Materials).add(
                        StandardMaterial({
                            baseColor: [0.8, 0.2, 0.04, 1],
                            metallic: 0.3,
                            perceptualRoughness: 0.7,
                            unlit: true,
                        }),
                    );
                    const eid = world.create();
                    world.add(eid, Transform, {
                        translation: [0.2, 0.32, 0],
                        rotation: [0, 0, Math.sin(0.15), Math.cos(0.15)],
                        scale: [1.2, 1.2, 1.2],
                    });
                    world.add(eid, MeshInstance, { mesh });
                    world.add(eid, MeshMaterial, material);
                }
            },
        };
        const app = await createApp({
            defaults: false,
            plugins: [StandardRenderingPlugin, MeshRenderPlugin, subject],
            device,
            adapter,
        });
        apps.push(app);
        app.world.step(0);
        app.world.step(0);
        await captureTexture(app.world, cameras.at(-1)!);
    }
}, TIMEOUT.startup);
afterAll(() => {
    for (const app of apps) app.dispose();
    device?.destroy();
});
test("loaded primitive placement and material draw the same pixels as direct authoring", async () => {
    const pixels = await Promise.all(
        apps.map(async (app, i) => {
            app.world.step(0);
            return (await captureTexture(app.world, cameras[i])).rgba;
        }),
    );
    expect(pixels[0]).toEqual(pixels[1]);
    expect(pixels[0].some((value, i) => i % 4 === 0 && value > 150)).toBe(true);
});
test("two placements reuse the load's exposed primitive handles and model-space matrix", () => {
    const world = apps[0].world;
    const meshAdd = spyOn(world.resource(Meshes), "add");
    const materialAdd = spyOn(world.resource(Materials), "add");
    try {
        const first = spawnGltfScene(world, loaded, { translation: [3, 0, 0] });
        const second = spawnGltfScene(world, loaded, { translation: [-3, 0, 0] });
        expect(first).not.toEqual(second);
        expect(first.length).toBe(loaded.primitives.length);
        expect(second.length).toBe(loaded.primitives.length);
        for (const [i, primitive] of loaded.primitives.entries()) {
            expect(world.resource(Meshes).has(primitive.mesh)).toBe(true);
            expect(Array.from(primitive.matrix)).toEqual(
                Array.from(
                    new Float32Array([
                        Math.cos(0.3),
                        Math.sin(0.3),
                        0,
                        0,
                        -Math.sin(0.3),
                        Math.cos(0.3),
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0.25,
                        0.1,
                        0,
                        1,
                    ]),
                ),
            );
            for (const eid of [first[i], second[i]]) {
                expect(world.storage(MeshInstance).mesh.get(eid)).toBe(primitive.mesh);
                expect(world.storage(MeshMaterial).type.get(eid)).toBe(primitive.material.type);
                expect(world.storage(MeshMaterial).material.get(eid)).toBe(
                    primitive.material.material,
                );
            }
        }
        expect(meshAdd).not.toHaveBeenCalled();
        expect(materialAdd).not.toHaveBeenCalled();
    } finally {
        meshAdd.mockRestore();
        materialAdd.mockRestore();
    }
});
test("sheared placement refuses with its node named before spawning", () => {
    const world = apps[0].world;
    const before = [...world.query([MeshInstance])];
    expect(() => spawnGltfScene(world, loaded, { scale: [2, 1, 1] })).toThrow(/Triangle.*shear/);
    expect([...world.query([MeshInstance])]).toEqual(before);
});
test("a foreign world refuses the handle", () => {
    expect(() => spawnGltfScene(apps[1].world, loaded)).toThrow("another world");
});
