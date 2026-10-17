import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("the package loads and presents the textured Khronos model", async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.waitForFunction(
        () => "captureModel" in window && document.querySelector("canvas")?.width === 1280,
    );
    const png = await page.evaluate(async () => {
        const capture = (window as unknown as { captureModel(): Promise<string> }).captureModel;
        return capture();
    });
    const bytes = Buffer.from(png.split(",")[1], "base64");
    await writeFile(info.outputPath("gltf-model.png"), bytes);
    const visible = await page.evaluate(async (data) => {
        const image = await createImageBitmap(await (await fetch(data)).blob());
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        const rgba = context.getImageData(580, 230, 180, 65).data;
        image.close();
        let textured = 0;
        for (let i = 0; i < rgba.length; i += 4)
            if (rgba[i + 1] > rgba[i] * 1.3 && rgba[i + 1] > rgba[i + 2] * 1.3) textured++;
        return textured;
    }, png);
    expect(errors).toEqual([]);
    expect(visible).toBeGreaterThan(100);
});
