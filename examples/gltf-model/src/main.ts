import {
    Camera,
    DirectionalLight,
    GlobalAmbientLight,
    lookAtRotation,
    Materials,
    MeshInstance,
    MeshMaterial,
    type Plugin,
    runApp,
    StandardMaterial,
    StandardRenderer,
    Transform,
} from "@dylanebert/shallot";
import { Orbit, OrbitPlugin } from "@dylanebert/shallot/extras";
import { captureFrame } from "@dylanebert/shallot/rendering";
import { loadGltfScene, spawnGltfScene } from "@dylanebert/shallot-gltf";

const Model: Plugin = {
    name: "Model",
    dependencies: [OrbitPlugin],
    async initialize(world, onProgress) {
        const ambient = world.resource(GlobalAmbientLight);
        ambient.color = 0xd8e4ff;
        ambient.brightness = 380;
        const sun = world.create();
        world.add(sun, Transform, { rotation: lookAtRotation(0, 0, 0, 1, -2, -0.35) });
        world.add(sun, DirectionalLight, { color: 0xffe8cc, illuminance: 6000 });
        world.storage(DirectionalLight).shadowMapsEnabled.set(sun, 1);
        const camera = world.create();
        world.add(camera, Camera, { clearColor: 0x191816 });
        world.add(camera, StandardRenderer);
        world.add(camera, Transform);
        world.add(camera, Orbit, { distance: 8, yaw: 0.7, pitch: 0.4 });
        const ground = world.create();
        world.add(ground, MeshInstance);
        world.add(
            ground,
            MeshMaterial,
            world.resource(Materials).add(
                StandardMaterial({
                    baseColor: [0.085, 0.08, 0.072, 1],
                    perceptualRoughness: 0.82,
                }),
            ),
        );
        world.add(ground, Transform, { translation: [0, -0.6, 0], scale: [4, 0.2, 4] });
        const model = await loadGltfScene(
            world,
            new URL("/CesiumMilkTruck/CesiumMilkTruck.gltf", location.href),
            onProgress,
        );
        spawnGltfScene(world, model, { translation: [0, -0.5, 0], scale: [0.7, 0.7, 0.7] });
        Object.assign(window, {
            captureModel: async () => {
                const capture = await captureFrame(
                    document.querySelector<HTMLCanvasElement>("#canvas")!,
                );
                const canvas = document.createElement("canvas");
                canvas.width = capture.width;
                canvas.height = capture.height;
                canvas
                    .getContext("2d")!
                    .putImageData(new ImageData(capture.rgba, capture.width, capture.height), 0, 0);
                return canvas.toDataURL("image/png");
            },
        });
    },
};
await runApp({ plugins: [OrbitPlugin, Model] });
