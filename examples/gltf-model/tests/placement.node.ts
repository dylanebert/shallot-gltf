import { expect, setDefaultTimeout, test } from "bun:test";
import { createApp, GlobalTransform, MeshInstance, MeshMaterial } from "@dylanebert/shallot";
import { TIMEOUT } from "@dylanebert/shallot/testing";
import { Model, ModelPlugin } from "../src/model";

setDefaultTimeout(TIMEOUT.node);
const peer = "bun-webgpu";
const { setupGlobals } = (await import(peer)) as { setupGlobals(): Promise<void> };
await setupGlobals();

test("the composed app derives the truck's placed mesh and material instances", async () => {
    const app = await createApp({
        plugins: [
            ModelPlugin(new URL("../public/CesiumMilkTruck/CesiumMilkTruck.gltf", import.meta.url)),
        ],
    });
    try {
        console.log(app.world.gpu.adapter);
        app.world.tick();
        const entities = app.world.resource(Model).entities;
        expect(entities).toHaveLength(5);
        const global = app.world.storage(GlobalTransform);
        expect(entities.map((eid) => global.translation.y.get(eid))).toEqual([
            expect.closeTo(-0.5),
            expect.closeTo(-0.5),
            expect.closeTo(-0.5),
            expect.closeTo(-0.2005946),
            expect.closeTo(-0.2005946),
        ]);
        for (const eid of entities) {
            expect(app.world.has(eid, MeshInstance)).toBe(true);
            expect(app.world.has(eid, MeshMaterial)).toBe(true);
            expect(global.scale.x.get(eid)).toBeCloseTo(0.7);
        }
    } finally {
        app.dispose();
    }
});
