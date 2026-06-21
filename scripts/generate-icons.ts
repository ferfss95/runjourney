import { join } from "path";
import sharp from "sharp";

const root = join(__dirname, "..");
const sourcePath = join(root, "public", "app-icon-source.png");

/** Fundo do app — combina com sidebar e PWA */
const BG = "#0d0d0d";

/** Remove branco apenas nos cantos (fora do squircle), preservando o corredor */
async function loadPreparedSource(): Promise<Buffer> {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const marginX = width * 0.14;
  const marginY = height * 0.14;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inCorner =
        (x < marginX && y < marginY) ||
        (x >= width - marginX && y < marginY) ||
        (x < marginX && y >= height - marginY) ||
        (x >= width - marginX && y >= height - marginY);

      if (!inCorner) continue;

      const i = (y * width + x) * channels;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      if (r > 235 && g > 235 && b > 235) {
        data[i + 3] = 0;
      }
    }
  }

  return sharp(data, { raw: { width, height, channels } })
    .flatten({ background: BG })
    .png()
    .toBuffer();
}

/** Ícones normais: a arte já preenche o quadrado (squircle) */
async function resizeDirect(
  source: Buffer,
  size: number
): Promise<Buffer> {
  return sharp(source)
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
}

/**
 * Maskable (Android): ícone com cantos arredondados já embutidos —
 * ocupa ~92% do canvas para ficar dentro da safe zone.
 */
async function generateMaskableFile(
  source: Buffer,
  canvasSize: number,
  outFile: string
): Promise<void> {
  const contentSize = Math.round(canvasSize * 0.92);
  const content = await sharp(source)
    .resize(contentSize, contentSize, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const offset = Math.round((canvasSize - contentSize) / 2);

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 3,
      background: BG,
    },
  })
    .composite([{ input: content, top: offset, left: offset }])
    .png()
    .toFile(outFile);
}

async function main() {
  const source = await loadPreparedSource();
  const meta = await sharp(source).metadata();
  console.log(
    `Fonte: ${meta.width}x${meta.height} → gerando ícones a partir de app-icon-source.png`
  );

  const outputs = [
    { file: join(root, "public", "icon-192.png"), size: 192 },
    { file: join(root, "public", "icon-512.png"), size: 512 },
    { file: join(root, "public", "apple-touch-icon.png"), size: 180 },
    { file: join(root, "public", "logo-sidebar.png"), size: 64 },
    { file: join(root, "src", "app", "icon.png"), size: 32 },
    { file: join(root, "src", "app", "apple-icon.png"), size: 180 },
  ] as const;

  for (const { file, size } of outputs) {
    await sharp(await resizeDirect(source, size)).toFile(file);
    console.log(`Gerado: ${file} (${size}x${size})`);
  }

  await generateMaskableFile(
    source,
    512,
    join(root, "public", "icon-512-maskable.png")
  );
  console.log("Gerado: icon-512-maskable.png (512x512 maskable)");

  await generateMaskableFile(
    source,
    192,
    join(root, "public", "icon-192-maskable.png")
  );
  console.log("Gerado: icon-192-maskable.png (192x192 maskable)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
