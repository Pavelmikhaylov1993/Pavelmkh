/**
 * Разовый импорт портфолио из Yonote в репозиторий.
 * Запускается один раз: node scripts/import-yonote.mjs
 * После импорта источником правды становится репозиторий, а не Yonote.
 *
 * API Yonote (documents.info) отдаёт плоский текст без заголовков и картинок,
 * поэтому читаем отрисованный DOM через Playwright.
 */
import { chromium } from '@playwright/test';
import TurndownService from 'turndown';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SHARE = 'https://pavelmikhaylov93.yonote.ru/share/a13f7265-7704-43a7-9af6-b001d1f9e30b';

const CASES = [
  { slug: 'cian-client-info', doc: 'informaciya-o-kliente-6p4gJXs4Yl', company: 'Циан', title: 'Информация о клиенте в чатах', order: 1 },
  { slug: 'netologiya-payment-ux', doc: 'netologiya-uluchshenie-ux-v-bloke-oplaty-3YUngFdGbp', company: 'Нетология', title: 'Улучшение UX в блоке оплаты', order: 2 },
  { slug: 'netologiya-coordinator-payouts', doc: 'netologiya-vyplaty-koordinatoram-D6poX5zIZc', company: 'Нетология', title: 'Выплаты координаторам', order: 3 },
  { slug: 'netologiya-b2b-research', doc: 'netologiya-issledovanie-b2b-polzovatelej-hr-kabinet-II2kmOWiFa', company: 'Нетология', title: 'Исследование B2B пользователей (HR-кабинет)', order: 4 },
  { slug: 'netologiya-ticket-messages', doc: 'netologiya-ishodyashie-soobsheniya-v-tiket-sisteme-vOcmUpKYh9', company: 'Нетология', title: 'Исходящие сообщения в тикет-системе', order: 5 },
  { slug: 'dellin-accounting-docs', doc: 'delovye-linii-zakaz-buhgalterskih-dokumentov-QlI6CR5oCZ', company: 'Деловые Линии', title: 'Заказ бухгалтерских документов', order: 6 },
];

const CV_URL = `https://pavelmikhaylov93.yonote.ru/api/attachments.redirect?id=3d3bc8ad-69aa-4415-a91b-33b705e26e7f&shareId=a13f7265-7704-43a7-9af6-b001d1f9e30b&documentId=178a1e64-d966-4ca9-bbb5-ed23906e881f`;

const EXT_BY_TYPE = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Чистит артефакты вики: неразрывные пробелы, эмодзи-маркеры, пустые абзацы.
 *
 * Turndown превращает вложенные жирные подзаголовки Yonote в обычный текст:
 * заголовки вида `## **Контекст**` остаются жирными внутри ATX-заголовка,
 * а подэтапы вида «Этап 1. Исследование» вообще не становятся заголовком —
 * turndown отдаёт их как жирный абзац `**Этап 1. Исследование**`. От уровня
 * заголовков зависит и типографика страницы кейса (Task 9 стилизует h2/h3),
 * и порядок заголовков для axe, поэтому нормализуем оба случая машинно:
 * снимаем `**` внутри ATX-заголовков и поднимаем жирные строки «Этап N. …»
 * до `###` (подраздел внутри `##`).
 */
function cleanMarkdown(md) {
  return md
    .replace(/ /g, ' ')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^(#{1,6})[ \t]*\*\*(.+?)\*\*[ \t]*$/gm, '$1 $2')
    .replace(/^\*\*(Этап[ \t]*\d+\.[^*\n]*)\*\*[ \t]*$/gm, '### $1')
    .trim();
}

async function download(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} на ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destPath, buffer);
  return response.headers.get('content-type') ?? '';
}

async function importCase(page, entry) {
  const assetsDir = join('content/cases', entry.slug);
  await mkdir(assetsDir, { recursive: true });

  await page.goto(`${SHARE}/doc/${entry.doc}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ProseMirror img, .ProseMirror p', { timeout: 30_000 });

  const { html, imageUrls } = await page.evaluate(() => {
    const root = document.querySelector('.ProseMirror');
    const urls = [...root.querySelectorAll('img')].map((img) => img.src);
    root.querySelectorAll('img').forEach((img, index) => {
      img.setAttribute('src', `__IMAGE_${index}__`);
      img.removeAttribute('srcset');
    });
    return { html: root.innerHTML, imageUrls: urls };
  });

  const localPaths = [];
  for (const [index, url] of imageUrls.entries()) {
    const number = String(index + 1).padStart(2, '0');
    const tempPath = join(assetsDir, `${number}.bin`);
    const contentType = await download(url, tempPath);
    const ext = EXT_BY_TYPE[contentType.split(';')[0].trim()] ?? 'png';
    const finalPath = join(assetsDir, `${number}.${ext}`);
    await (await import('node:fs/promises')).rename(tempPath, finalPath);
    localPaths.push(`./${number}.${ext}`);
    console.log(`  ↓ ${finalPath}`);
  }

  const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  let markdown = cleanMarkdown(turndown.turndown(html));

  localPaths.forEach((path, index) => {
    markdown = markdown.replaceAll(`__IMAGE_${index}__`, path);
  });

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(entry.title)}`,
    `company: ${JSON.stringify(entry.company)}`,
    `order: ${entry.order}`,
    'summary: "TODO — дописать вручную, до 200 символов"',
    'role:',
    '  - "TODO"',
    'outcome: "TODO — дописать вручную"',
    'metrics: []',
    `cover: ${JSON.stringify(localPaths[0] ?? '')}`,
    '---',
    '',
  ].join('\n');

  
  await writeFile(join(assetsDir, 'index.mdx'), `${frontmatter}${markdown}\n`, 'utf8');
  console.log(`✓ ${entry.slug} — ${localPaths.length} изображений`);
}

const browser = await chromium.launch();
const page = await browser.newPage();

for (const entry of CASES) {
  console.log(`\n→ ${entry.slug}`);
  await importCase(page, entry);
}

await mkdir('public', { recursive: true });
await download(CV_URL, 'public/Pavel_Mikhaylov_CV.pdf');
console.log('\n✓ CV скачан');

await browser.close();
console.log('\nГотово. Дальше вручную: summary, role, outcome, metrics и alt у изображений.');
