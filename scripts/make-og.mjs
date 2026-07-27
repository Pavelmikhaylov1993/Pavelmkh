/** Генерирует public/og-default.png 1200×630 из портрета и подписи. */
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const PORTRAIT_WIDTH = 420;

const portrait = await sharp('src/assets/pavel.jpg')
  .resize(PORTRAIT_WIDTH, HEIGHT, { fit: 'cover', position: 'top' })
  .toBuffer();

const caption = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { font: 600 68px Inter, Helvetica, sans-serif; fill: #111111; }
    .role { font: 400 34px Inter, Helvetica, sans-serif; fill: #666666; }
  </style>
  <text x="72" y="300" class="name">Павел Михайлов</text>
  <text x="72" y="360" class="role">Senior Product Designer</text>
</svg>`);

await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 4, background: '#ffffff' } })
  .composite([
    { input: portrait, left: WIDTH - PORTRAIT_WIDTH, top: 0 },
    { input: caption, left: 0, top: 0 },
  ])
  .png()
  .toFile('public/og-default.png');

console.log('✓ public/og-default.png');
