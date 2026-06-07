import { join } from "path";
import sharp from "sharp";

const root = join(__dirname, "..");
const sourcePath = join(root, "public", "app-icon-source.png");

const BG = "#0d0d0d"; // fundo sólido que combina com o ícone

/**
 * Ícones normais (favicon, apple-touch, manifest "any"):
 * Faz zoom de 10% para cortar as bordas brancas da imagem fonte
 * e aplica fundo sólido para cobrir qualquer transparência.
 */
async function resizeDirect(size: number): Promise<Buffer> {
  // Redimensiona para 110% do tamanho alvo para cortar as bordas brancas
  const oversized = Math.round(size * 1.1);
  return sharp(sourcePath)
    .resize(oversized, oversized, { fit: "cover", position: "centre" })
    .flatten({ background: BG })
    .resize(size, size, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
}

/**
 * Ícone maskable (Android adaptive icon):
 * Cria um canvas totalmente sólido e centraliza o conteúdo dentro
 * da "safe zone" (80% central). O Android aplica sua própria máscara
 * de forma (círculo, quadrado arredondado) em cima.
 *
 * Desta forma as bordas são sempre a cor de fundo sólida, nunca branco.
 */
async function generateMaskableFile(
  canvasSize: number,
  outFile: string
): Promise<void> {
  // Conteúdo ocupa 78% do canvas = dentro da safe zone (80%)
  const contentSize = Math.round(canvasSize * 0.78);

  const content = await sharp(sourcePath)
    .resize(contentSize, contentSize, { fit: "cover", position: "centre" })
    .flatten({ background: BG })
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
  const outputs = [
    { file: join(root, "public", "icon-192.png"), size: 192 },
    { file: join(root, "public", "icon-512.png"), size: 512 },
    { file: join(root, "public", "apple-touch-icon.png"), size: 180 },
    { file: join(root, "src", "app", "icon.png"), size: 32 },
    { file: join(root, "src", "app", "apple-icon.png"), size: 180 },
  ] as const;

  for (const { file, size } of outputs) {
    await sharp(await resizeDirect(size)).toFile(file);
    console.log(`Gerado: ${file} (${size}x${size})`);
  }

  await generateMaskableFile(
    512,
    join(root, "public", "icon-512-maskable.png")
  );
  console.log("Gerado: icon-512-maskable.png (512x512 maskable)");

  await generateMaskableFile(
    192,
    join(root, "public", "icon-192-maskable.png")
  );
  console.log("Gerado: icon-192-maskable.png (192x192 maskable)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
