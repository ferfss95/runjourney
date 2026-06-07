import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const root = join(__dirname, "..");
const sourcePath = join(root, "public", "app-icon-source.png");
const source = readFileSync(sourcePath);

const outputs = [
  { file: join(root, "public", "icon-192.png"), size: 192 },
  { file: join(root, "public", "icon-512.png"), size: 512 },
  { file: join(root, "public", "apple-touch-icon.png"), size: 180 },
  { file: join(root, "src", "app", "icon.png"), size: 32 },
  { file: join(root, "src", "app", "apple-icon.png"), size: 180 },
] as const;

async function resizeIcon(size: number) {
  return sharp(source)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
}

async function generateMaskableIcon() {
  const size = 512;
  const iconSize = Math.round(size * 0.82);
  const offset = Math.round((size - iconSize) / 2);
  const iconBuffer = await resizeIcon(iconSize);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: iconBuffer, left: offset, top: offset }])
    .png()
    .toFile(join(root, "public", "icon-512-maskable.png"));
}

async function main() {
  for (const { file, size } of outputs) {
    await sharp(await resizeIcon(size)).toFile(file);
    console.log(`Gerado: ${file} (${size}x${size})`);
  }

  await generateMaskableIcon();
  console.log("Gerado: icon-512-maskable.png (512x512)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
