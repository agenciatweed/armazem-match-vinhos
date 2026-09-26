// Converte os recortes de assets-src/bottles/*.png em public/bottles/*.webp
// (recorte justo, altura 900px, fundo transparente, abaixo de 120 KB).
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src/bottles';
const OUT = 'public/bottles';
const MAX_BYTES = 120 * 1024;

for (const file of (await readdir(SRC)).filter((f) => f.endsWith('.png'))) {
  const name = file.replace(/\.png$/, '');
  const out = join(OUT, `${name}.webp`);
  const trimmed = await sharp(join(SRC, file)).trim({ threshold: 1 }).toBuffer();
  let quality = 86;
  for (;;) {
    await sharp(trimmed)
      .resize({ height: 900, withoutEnlargement: false })
      .webp({ quality, alphaQuality: 90, effort: 6 })
      .toFile(out);
    const { size } = await stat(out);
    if (size <= MAX_BYTES || quality <= 40) {
      console.log(`${out}  ${(size / 1024).toFixed(1)} KB  q${quality}`);
      break;
    }
    quality -= 8;
  }
}
