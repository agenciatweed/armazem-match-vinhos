// Gera public/og-image.jpg (1200x630) a partir do logo e do título da campanha.
import sharp from 'sharp';

const W = 1200, H = 630;
const logo = await sharp('public/logo.svg', { density: 300 }).resize({ height: 150 }).png().toBuffer();
const card = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#00273c"/>
  <rect x="120" y="215" width="960" height="340" fill="#ffffff"/>
  <rect x="128" y="223" width="944" height="324" fill="none" stroke="#c7d3dc" stroke-width="1.5"/>
  <text x="170" y="275" font-family="Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="3" fill="#4a6273">MATCH DO VINHO</text>
  <line x1="170" y1="295" x2="1030" y2="295" stroke="#00273c" stroke-width="2"/>
  <text x="170" y="380" font-family="Georgia, serif" font-size="64" fill="#00273c">Descubra seu match</text>
  <text x="170" y="455" font-family="Georgia, serif" font-size="64" fill="#00273c">em 60 segundos</text>
  <text x="170" y="510" font-family="Georgia, serif" font-style="italic" font-size="26" fill="#4a6273">Cinco perguntas sobre você. Três vinhos para o seu paladar.</text>
</svg>`);
await sharp(card).composite([{ input: logo, top: 38, left: Math.round((W - 254) / 2) }]).jpeg({ quality: 86 }).toFile('public/og-image.jpg');
console.log('public/og-image.jpg');
