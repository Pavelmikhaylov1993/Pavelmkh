import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { gzipSync } from 'node:zlib';

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

/**
 * Обходит граф статических импортов от входных файлов.
 *
 * Считать по вхождению имени в HTML нельзя: браузер обязательно скачивает и те
 * чанки, которые импортируются из островов транзитивно и в разметке не упомянуты
 * вовсе. На момент написания это давало расхождение 71 против 86 KB, а главное —
 * любая зависимость, общая для двух островов, попадает как раз в такой чанк и для
 * проверки становится невидимой.
 */
function collectLoadedJs(): string[] {
  const allJs = walk('dist').filter((path) => path.endsWith('.js'));
  const byName = new Map(allJs.map((path) => [basename(path), path]));

  const html = walk('dist')
    .filter((path) => path.endsWith('.html'))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');

  const queue = allJs.filter((path) => html.includes(basename(path)));
  const loaded = new Set(queue);

  while (queue.length > 0) {
    const current = queue.pop()!;
    const source = readFileSync(current, 'utf8');

    for (const match of source.matchAll(/["']\.\/([\w.-]+\.js)["']/g)) {
      const dependency = byName.get(match[1]);
      if (dependency && !loaded.has(dependency)) {
        loaded.add(dependency);
        queue.push(dependency);
      }
    }
  }

  return [...loaded];
}

test('AC-26: подключённый страницами JS меньше 120 KB в gzip', () => {
  const loaded = collectLoadedJs();

  expect(loaded.length, 'ни один JS не подключён — тест бессмыслен').toBeGreaterThan(0);

  const sizes = loaded.map((path) => ({
    name: basename(path),
    gzip: gzipSync(readFileSync(path)).length,
  }));

  const total = sizes.reduce((sum, file) => sum + file.gzip, 0);
  const report = sizes
    .sort((a, b) => b.gzip - a.gzip)
    .map((file) => `${file.name} ${Math.round(file.gzip / 1024)} KB`)
    .join(', ');

  expect(total, `JS в gzip: ${Math.round(total / 1024)} KB (${report})`).toBeLessThan(120 * 1024);
});

/**
 * AC-27 требует base-префикс у ВСЕХ внутренних ссылок и ассетов, а точечно проверены
 * были две штуки. Здесь ловится сразу оба направления ошибки: забытый `withBase()`
 * (даст `href="/case/..."`, то есть 404 в проде) и лишний `withBase()` на внешнем
 * URL (даст `href="/Pavelmkh/https://..."`, потому что она не проверяет протокол).
 */
test('AC-27: во всём собранном HTML нет путей мимо base', () => {
  const offenders: string[] = [];

  for (const file of walk('dist').filter((path) => path.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');

    for (const match of html.matchAll(/(?:href|src|srcset)="([^"]*)"/g)) {
      for (const url of match[1].split(',').map((part) => part.trim().split(/\s+/)[0])) {
        if (url.startsWith('/Pavelmkh/https:') || url.startsWith('/Pavelmkh/http:')) {
          offenders.push(`${basename(file)}: внешний URL пропущен через withBase → ${url}`);
          continue;
        }
        // Внутренний абсолютный путь обязан начинаться с base. Протокольные,
        // якорные и относительные адреса — не наш случай.
        if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/Pavelmkh/')) {
          offenders.push(`${basename(file)}: путь мимо base → ${url}`);
        }
      }
    }
  }

  expect(offenders).toEqual([]);
});

test('AC-2: в dist не осталось ссылок на Yonote', () => {
  const offenders = walk('dist')
    .filter((path) => /\.(html|js|css|xml|txt)$/.test(path))
    .filter((path) => readFileSync(path, 'utf8').includes('pavelmikhaylov93.yonote.ru'));

  expect(offenders).toEqual([]);
});
