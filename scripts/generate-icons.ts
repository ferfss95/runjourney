import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const root = join(__dirname, "..");
const sourcePath = join(root, "public", "app-icon-source.png");
const source = readFileSync(sourcePath);

/**
 * Para ícones normais (favicon, apple-touch, manifest):
 * Usa a imagem diretamente sem padding — ela já tem o design final.
 *
 * Para o ícone maskable (Android adaptive icons):
 * O Android aplica uma máscara circular/arredondada sobre a área "safe zone" (80% do centro).
 * Como a imagem já tem fundo sólido e bordas arredondadas embutidas,
 * adicionamos um mínimo de padding (10%) com o preenchimento das cores da borda da imagem.
 */

async function resizeDirect(size: number): Promise<Buffer> {
  return sharp(source)
    .resize(size, size, { fit: "cover", position: "centre" })
    .flatten({ background: "#000000" }) // preenche transparência com preto em vez de branco
    .png()
    .toBuffer();
}

async function generateMaskable(size: number): Promise<void> {
  // Maskable: a imagem ocupa 100% (sem padding extra) para não perder conteúdo
  // O Android já aplica a máscara em cima — usar a imagem cheia é o correto
  await sharp(await resizeDirect(size))
    .png()
    .toFile(join(root, "public", "icon-512-maskable.png"));
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

  await generateMaskable(512);
  console.log("Gerado: icon-512-maskable.png (512x512)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
