import { afterAll, beforeAll, expect, setDefaultTimeout, test } from "bun:test";
import { type App, Transform } from "@dylanebert/shallot";
import { TIMEOUT } from "@dylanebert/shallot/testing";
import { openGpuApp as createApp } from "@dylanebert/shallot/testing/gpu";
import { Model, ModelPlugin } from "./index";

setDefaultTimeout(TIMEOUT.gpu);
let app: App;
beforeAll(async () => {
    app = await createApp({
        defaults: false,
        plugins: [
            ModelPlugin(
                new URL("../../public/CesiumMilkTruck/CesiumMilkTruck.gltf", import.meta.url),
            ),
        ],
    });
    console.log(app.world.gpu.adapter);
});
afterAll(() => app?.dispose());

test("the model plugin places every truck primitive on the platform", () => {
    const entities = app.world.resource(Model).entities;
    expect(entities).toHaveLength(5);
    const transform = app.world.storage(Transform);
    expect(entities.map((eid) => transform.translation.y.get(eid))).toEqual([
        expect.closeTo(-0.5),
        expect.closeTo(-0.5),
        expect.closeTo(-0.5),
        expect.closeTo(-0.2005946),
        expect.closeTo(-0.2005946),
    ]);
    for (const eid of entities) expect(transform.scale.x.get(eid)).toBeCloseTo(0.7);
});
