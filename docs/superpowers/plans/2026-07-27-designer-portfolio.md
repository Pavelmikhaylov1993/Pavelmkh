# Сайт-портфолио Павла Михайлова — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Статический сайт-портфолио на GitHub Pages: лендинг + 6 страниц кейсов, контент импортирован из Yonote в репозиторий, тёмная тема, адаптив, SEO-превью.

**Architecture:** Astro 5 генерирует статику; React-острова только для переключателя темы и лайтбокса. Кейсы — MDX-файлы в Content Layer с Zod-схемой, изображения проходят через `astro:assets`. Единственная точка знания о base path — `withBase()`. Тесты: Vitest для логики и компонентов, Playwright + axe против собранного сайта с настоящим base.

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4, shadcn/ui, MDX, Vitest, Playwright, @axe-core/playwright, GitHub Actions.

**Спека:** `docs/superpowers/specs/2026-07-27-designer-portfolio-design.md`. Номера AC ниже ссылаются на неё.

## Global Constraints

- Node 24, npm 11. Репозиторий `https://github.com/nkonovalov1990/Pavelmkh.git`, ветка `main`.
- Стек прибит к линейке Astro 5: `astro@5.18.2`, `@astrojs/react@5.0.7`, `@astrojs/mdx@4.3.14`, `@astrojs/sitemap@3.7.3`, `tailwindcss@4.3.3`. Свежие мажоры интеграций собраны под Astro 6/7 и сломают сборку. **`@astrojs/react` не объявляет peer-зависимость от astro ни в одной версии** — npm такой конфликт не поймает, совместимость проверять руками при каждом обновлении.
- `site: 'https://nkonovalov1990.github.io'`, `base: '/Pavelmkh'`, `trailingSlash: 'always'`. Живой URL: `https://nkonovalov1990.github.io/Pavelmkh/`.
- Язык интерфейса и контента — только русский. Никаких английских строк в UI.
- Шрифт Inter подключается self-hosted через `@fontsource-variable/inter`. Обращений к Google Fonts или любому CDN быть не должно.
- Любая внутренняя ссылка и любой путь к файлу из `public/` строится через `withBase()`. Прямые строки вида `href="/case/..."` запрещены.
- Суммарный вес JS, реально подключённого страницами, — меньше 120 KB в gzip (AC-26). Считается только то, на что ссылается собранный HTML: Astro кладёт клиентский рантайм React в `dist/` даже без островов.
- **`npx shadcn@latest` использовать нельзя.** Текущий CLI (4.15) ставит пресет `base-nova` на Base UI вместо Radix, переписывает `src/styles/global.css` целиком — меняет Inter на Geist и добавляет ~20 чужих токенов — и удаляет `withBase()` из `src/lib/utils.ts`. Примитивы shadcn положены руками из реестра `new-york` на классическом Radix (пакет `radix-ui`). Новые примитивы добавлять так же — копированием, а не CLI.
- Корневой `zod` прибит к `^3.25.76`. Astro 5 тянет свою копию zod v3, и хелпер `image()` отдаёт схему именно v3 — корневой zod v4 несовместим с ней в `.extend()`, сборка падает на первом же реальном кейсе.
- В `dist/` не должно остаться ни одного упоминания `pavelmikhaylov93.yonote.ru` (AC-2).
- Каждый тест начинается с номера AC: `test('AC-7: карточка ведёт на страницу кейса', ...)`.
- Строго red → green → refactor. Сначала падающий тест, потом минимальная реализация.
- **Внимание:** в этом окружении хук `prevent-destructive-commands` блокирует `git add`. Шаги «Commit» выполняет человек вручную, либо хук нужно настроить. Агент, выполняющий план, должен на шаге коммита остановиться и сообщить, а не пытаться обойти хук.

## Структура файлов

| Файл | Ответственность |
|---|---|
| `astro.config.mjs` | site, base, интеграции, Tailwind-плагин |
| `vitest.config.ts` | окружение jsdom, setup-файл |
| `playwright.config.ts` | webServer на preview-сборке, baseURL с base |
| `src/lib/utils.ts` | `cn()`, `withBase()` — единственное знание о base path |
| `src/lib/site.ts` | профиль, био, метрики, контакты — единственный источник |
| `src/lib/case-schema.ts` | Zod-схема frontmatter, чистая, без `astro:content` |
| `src/lib/cases.ts` | `getSortedCases()` — единственное место, задающее порядок кейсов |
| `src/content.config.ts` | коллекция кейсов, расширяет схему полем `cover: image()` |
| `src/content/cases/*.mdx` | 6 кейсов |
| `src/assets/cases/<slug>/*` | изображения кейсов |
| `src/assets/pavel.jpg` | портрет |
| `src/styles/global.css` | Tailwind 4, токены shadcn, вариант `dark` |
| `src/components/BaseHead.astro` | title, description, OG, canonical, инлайн-скрипт темы |
| `src/components/Header.astro` | шапка: имя, «Кейсы», переключатель темы |
| `src/components/Hero.astro` | портрет, имя, роль, био, метрики |
| `src/components/Contacts.astro` | 3 внешние ссылки + CV |
| `src/components/CaseCard.astro` | карточка кейса |
| `src/components/CaseGrid.astro` | сетка карточек |
| `src/components/Footer.astro` | подвал |
| `src/components/react/ThemeToggle.tsx` | переключатель темы, `client:load` |
| `src/components/react/Lightbox.tsx` | лайтбокс изображений, `client:visible` |
| `src/components/ui/*` | примитивы shadcn |
| `src/layouts/BaseLayout.astro` | html-каркас |
| `src/layouts/CaseLayout.astro` | каркас страницы кейса |
| `src/pages/index.astro` | главная |
| `src/pages/case/[...slug].astro` | страница кейса |
| `src/pages/404.astro` | 404 |
| `scripts/import-yonote.mjs` | разовый импорт контента |
| `tests/unit/*.test.ts` | Vitest |
| `tests/e2e/*.spec.ts` | Playwright |
| `.github/workflows/ci.yml` | тесты на PR |
| `.github/workflows/deploy.yml` | деплой на Pages |

---

### Task 1: Каркас проекта и `withBase()`

Закрывает AC-27. Ставит скелет, на котором держится всё остальное.

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- Create: `src/lib/utils.ts`
- Create: `src/styles/global.css`
- Test: `tests/unit/utils.test.ts`

**Interfaces:**
- Consumes: ничего.
- Produces: `withBase(path: string): string` и `cn(...inputs: ClassValue[]): string` из `src/lib/utils.ts`. Все дальнейшие задачи строят ссылки только через `withBase`.

- [ ] **Step 1: Инициализировать проект и поставить зависимости**

```bash
cd /Users/nikita/Documents/GitHub/Pavelmkh
npm init -y
npm install astro@^5 react@^19 react-dom@^19 @astrojs/react@^5 @astrojs/mdx@^4 @astrojs/sitemap@^3
npm install tailwindcss@^4 @tailwindcss/vite @fontsource-variable/inter
npm install clsx tailwind-merge class-variance-authority lucide-react
npm install -D typescript @types/react @types/react-dom vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom gray-matter zod
```

- [ ] **Step 2: Написать конфиги**

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://nkonovalov1990.github.io',
  base: '/Pavelmkh',
  trailingSlash: 'always',
  integrations: [react(), mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

`vitest.config.ts`:

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
});
```

`tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

`.gitignore`:

```
node_modules/
dist/
.astro/
test-results/
playwright-report/
```

В `package.json` добавить:

```json
"type": "module",
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Написать падающий тест**

`tests/unit/utils.test.ts`:

```ts
import { describe, expect, test, vi, afterEach } from 'vitest';
import { withBase } from '@/lib/utils';

describe('withBase', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('AC-27: добавляет base к абсолютному пути', () => {
    vi.stubEnv('BASE_URL', '/Pavelmkh/');
    expect(withBase('/case/cian-client-info/')).toBe('/Pavelmkh/case/cian-client-info/');
  });

  test('AC-27: добавляет base к пути без ведущего слеша', () => {
    vi.stubEnv('BASE_URL', '/Pavelmkh/');
    expect(withBase('Pavel_Mikhaylov_CV.pdf')).toBe('/Pavelmkh/Pavel_Mikhaylov_CV.pdf');
  });

  test('AC-27: не удваивает слеш на корневом пути', () => {
    vi.stubEnv('BASE_URL', '/Pavelmkh/');
    expect(withBase('/')).toBe('/Pavelmkh/');
  });

  test('AC-27: работает при base равном корню', () => {
    vi.stubEnv('BASE_URL', '/');
    expect(withBase('/case/x/')).toBe('/case/x/');
  });
});
```

- [ ] **Step 4: Запустить тест и убедиться, что он падает**

Run: `npm test -- tests/unit/utils.test.ts`
Expected: FAIL, `Failed to resolve import "@/lib/utils"`.

- [ ] **Step 5: Написать минимальную реализацию**

`src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const trimmedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
}
```

- [ ] **Step 6: Запустить тест и убедиться, что он проходит**

Run: `npm test -- tests/unit/utils.test.ts`
Expected: PASS, 4 passed.

- [ ] **Step 7: Написать `src/styles/global.css`**

```css
@import "tailwindcss";
@import "@fontsource-variable/inter";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.97 0 0);
  /* 0.53, а не 0.556: на фоне --muted / --accent / --secondary светлой темы значение
     0.556 даёт 4.34:1 — ниже порога AA в 4.5:1 для обычного текста. 0.53 даёт ~4.7:1
     и на подложке, и на белом фоне. */
  --muted-foreground: oklch(0.53 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@theme inline {
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * { border-color: var(--color-border); }
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
}
```

- [ ] **Step 8: Коммит** (см. примечание про хук в Global Constraints)

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts .gitignore src/lib/utils.ts src/styles/global.css tests/
git commit -m "feat: каркас Astro 5 + Tailwind 4, withBase() под project page"
```

---

### Task 2: Playwright-каркас, smoke-тест и CI

Закрывает AC-28, AC-29. Даёт петлю обратной связи для всех последующих задач.

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/smoke.spec.ts`
- Create: `src/layouts/BaseLayout.astro`, `src/pages/index.astro`
- Create: `.github/workflows/ci.yml`
- Modify: `package.json` (скрипты)

**Interfaces:**
- Consumes: `withBase` из Task 1.
- Produces: `BaseLayout.astro` с пропсами `{ title: string; description: string }` и слотом. Все страницы дальше используют его.

- [ ] **Step 1: Поставить Playwright**

```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install chromium
```

- [ ] **Step 2: Написать `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/Pavelmkh/`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    // browserName обязателен: дескриптор iPhone 13 требует WebKit, а ставится только chromium.
    // viewport задаём явно: у дескриптора он 390×664, а 390×844 из спеки — это поле screen,
    // которое на вёрстку не влияет. Без этой строки тесты адаптива шли бы не на том размере.
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}/Pavelmkh/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Добавить в `package.json`: `"test:e2e": "playwright test"`.

- [ ] **Step 3: Написать падающий smoke-тест**

`tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('AC-28: главная собирается и отдаётся по base path', async ({ page }) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});
```

- [ ] **Step 4: Запустить и убедиться, что падает**

Run: `npm run test:e2e -- --project=desktop`
Expected: FAIL — сборка падает, страниц нет.

- [ ] **Step 5: Создать минимальный layout и главную**

`src/layouts/BaseLayout.astro`:

```astro
---
import '@/styles/global.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

`src/pages/index.astro`:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
---

<BaseLayout title="Павел Михайлов — Senior Product Designer" description="Портфолио продуктового дизайнера">
  <h1>Павел Михайлов</h1>
</BaseLayout>
```

- [ ] **Step 6: Запустить и убедиться, что проходит**

Run: `npm run test:e2e -- --project=desktop`
Expected: PASS, 1 passed.

- [ ] **Step 7: Написать CI**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Step 8: Коммит**

```bash
git add playwright.config.ts tests/e2e src/layouts src/pages .github/workflows/ci.yml package.json package-lock.json
git commit -m "test: каркас Playwright, smoke-тест и CI"
```

---

### Task 3: Схема кейса и её валидация

Закрывает AC-1, AC-3. Схема пишется до контента, чтобы импорт сразу проверялся.

**Files:**
- Create: `src/lib/case-schema.ts`, `src/content.config.ts`
- Test: `tests/unit/case-schema.test.ts`

**Interfaces:**
- Consumes: ничего.
- Produces: `caseMetaSchema` — Zod-объект с полями `title: string`, `company: string`, `order: number`, `summary: string`, `role: string[]`, `outcome: string`, `metrics: { value: string; label: string }[]`, `cover: string`, `year?: number`, `draft: boolean`. Тип `CaseMeta = z.infer<typeof caseMetaSchema>`. Task 4 пишет MDX под эту схему, Task 8 и 9 читают эти поля.

- [ ] **Step 1: Написать падающий тест**

`tests/unit/case-schema.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { caseMetaSchema } from '@/lib/case-schema';

const valid = {
  title: 'Улучшение UX в блоке оплаты',
  company: 'Нетология',
  order: 2,
  summary: 'Переработал блок оплаты в админке продаж.',
  role: ['Исследование', 'Интервью'],
  outcome: '−50% времени на оформление заказа',
  cover: '../../assets/cases/netologiya-payment-ux/01.png',
};

describe('caseMetaSchema', () => {
  test('AC-1: принимает корректный frontmatter', () => {
    expect(() => caseMetaSchema.parse(valid)).not.toThrow();
  });

  test('AC-1: metrics по умолчанию пустой массив', () => {
    expect(caseMetaSchema.parse(valid).metrics).toEqual([]);
  });

  test('AC-1: draft по умолчанию false', () => {
    expect(caseMetaSchema.parse(valid).draft).toBe(false);
  });

  test('AC-3: пустой title отвергается', () => {
    expect(() => caseMetaSchema.parse({ ...valid, title: '' })).toThrow();
  });

  test('AC-3: пустой role отвергается', () => {
    expect(() => caseMetaSchema.parse({ ...valid, role: [] })).toThrow();
  });

  test('AC-3: отсутствующий cover отвергается', () => {
    const { cover, ...withoutCover } = valid;
    expect(() => caseMetaSchema.parse(withoutCover)).toThrow();
  });

  test('AC-1: summary длиннее 200 символов отвергается', () => {
    expect(() => caseMetaSchema.parse({ ...valid, summary: 'я'.repeat(201) })).toThrow();
  });

  test('AC-1: metrics требует value и label', () => {
    expect(() => caseMetaSchema.parse({ ...valid, metrics: [{ value: '+5,3%' }] })).toThrow();
  });
});
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npm test -- tests/unit/case-schema.test.ts`
Expected: FAIL, `Failed to resolve import "@/lib/case-schema"`.

- [ ] **Step 3: Написать схему**

`src/lib/case-schema.ts`:

```ts
import { z } from 'zod';

export const caseMetaSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  order: z.number().int().positive(),
  summary: z.string().min(1).max(200),
  role: z.array(z.string().min(1)).min(1),
  outcome: z.string().min(1),
  metrics: z
    .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
    .default([]),
  cover: z.string().min(1),
  year: z.number().int().optional(),
  draft: z.boolean().default(false),
});

export type CaseMeta = z.infer<typeof caseMetaSchema>;
```

- [ ] **Step 4: Запустить и убедиться, что проходит**

Run: `npm test -- tests/unit/case-schema.test.ts`
Expected: PASS, 8 passed.

- [ ] **Step 5: Подключить коллекцию**

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { caseMetaSchema } from './lib/case-schema';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/cases' }),
  schema: ({ image }) => caseMetaSchema.extend({ cover: image() }),
});

export const collections = { cases };
```

- [ ] **Step 6: Коммит**

```bash
git add src/lib/case-schema.ts src/content.config.ts tests/unit/case-schema.test.ts
git commit -m "feat: Zod-схема кейса и коллекция контента"
```

---

### Task 4: Импорт контента из Yonote

Закрывает AC-2, AC-3 на реальных данных. Самая объёмная задача — после неё в репозитории лежит весь контент.

**Files:**
- Create: `scripts/import-yonote.mjs`
- Create: `src/content/cases/*.mdx` (6 файлов, результат работы скрипта)
- Create: `src/assets/cases/<slug>/*` (изображения)
- Create: `public/Pavel_Mikhaylov_CV.pdf`
- Create: `src/assets/pavel.jpg`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: `caseMetaSchema` из Task 3.
- Produces: 6 MDX-файлов со slug'ами `cian-client-info`, `netologiya-payment-ux`, `netologiya-coordinator-payouts`, `netologiya-b2b-research`, `netologiya-ticket-messages`, `dellin-accounting-docs`. Task 8 и 9 читают их через `getCollection('cases')`.

- [ ] **Step 1: Написать падающий тест на импортированный контент**

`tests/unit/content.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import matter from 'gray-matter';
import { caseMetaSchema } from '@/lib/case-schema';

const CASES_DIR = 'src/content/cases';

const EXPECTED_SLUGS = [
  'cian-client-info',
  'netologiya-payment-ux',
  'netologiya-coordinator-payouts',
  'netologiya-b2b-research',
  'netologiya-ticket-messages',
  'dellin-accounting-docs',
];

const files = existsSync(CASES_DIR)
  ? readdirSync(CASES_DIR).filter((f) => f.endsWith('.mdx'))
  : [];

describe('контент кейсов', () => {
  test('AC-1: импортировано ровно 6 кейсов с ожидаемыми slug', () => {
    expect(files.map((f) => f.replace('.mdx', '')).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  test('AC-2: дубликат «Заказ бухгалтерских документов» не импортирован', () => {
    expect(files).not.toContain('zakaz-buhgalterskih-dokumentov.mdx');
  });

  test.each(EXPECTED_SLUGS)('AC-3: %s проходит валидацию схемы', (slug) => {
    const raw = readFileSync(join(CASES_DIR, `${slug}.mdx`), 'utf8');
    expect(() => caseMetaSchema.parse(matter(raw).data)).not.toThrow();
  });

  test.each(EXPECTED_SLUGS)('AC-3: у %s существует файл обложки', (slug) => {
    const raw = readFileSync(join(CASES_DIR, `${slug}.mdx`), 'utf8');
    const { cover } = caseMetaSchema.parse(matter(raw).data);
    const absolute = resolve(dirname(join(CASES_DIR, `${slug}.mdx`)), cover);
    expect(existsSync(absolute)).toBe(true);
  });

  test.each(EXPECTED_SLUGS)('AC-2: в теле %s нет ссылок на yonote', (slug) => {
    const raw = readFileSync(join(CASES_DIR, `${slug}.mdx`), 'utf8');
    expect(raw).not.toContain('yonote.ru');
  });

  test.each(EXPECTED_SLUGS)('AC-4: у всех изображений в %s непустой alt', (slug) => {
    const body = matter(readFileSync(join(CASES_DIR, `${slug}.mdx`), 'utf8')).content;
    const images = [...body.matchAll(/!\[(.*?)\]\((.*?)\)/g)];
    for (const [, alt] of images) {
      expect(alt.trim().length).toBeGreaterThan(0);
    }
  });

  test('AC-9: CV лежит в public', () => {
    expect(existsSync('public/Pavel_Mikhaylov_CV.pdf')).toBe(true);
  });

  test('AC-5a: портрет лежит в assets', () => {
    expect(existsSync('src/assets/pavel.jpg')).toBe(true);
  });
});
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npm test -- tests/unit/content.test.ts`
Expected: FAIL — «импортировано ровно 6 кейсов» падает, массив пуст.

- [ ] **Step 3: Написать скрипт импорта**

```bash
npm install -D turndown
```

`scripts/import-yonote.mjs`:

```js
/**
 * Разовый импорт портфолио из Yonote в репозиторий.
 * Запускается один раз: node scripts/import-yonote.mjs
 * После импорта источником правды становится репозиторий, а не Yonote.
 *
 * API Yonote (documents.info) отдаёт плоский текст без заголовков и картинок,
 * поэтому читаем отрисованный DOM через Playwright.
 */
import { chromium } from 'playwright';
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

/** Чистит артефакты вики: неразрывные пробелы, эмодзи-маркеры, пустые абзацы. */
function cleanMarkdown(md) {
  return md
    .replace(/ /g, ' ')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+$/gm, '')
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
  const assetsDir = join('src/assets/cases', entry.slug);
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
    localPaths.push(`../../assets/cases/${entry.slug}/${number}.${ext}`);
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

  await mkdir('src/content/cases', { recursive: true });
  await writeFile(join('src/content/cases', `${entry.slug}.mdx`), `${frontmatter}${markdown}\n`, 'utf8');
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
```

- [ ] **Step 4: Запустить импорт**

```bash
node scripts/import-yonote.mjs
```

Expected: 6 строк `✓ <slug> — N изображений`, затем `✓ CV скачан`. В `src/content/cases/` появятся 6 MDX, в `src/assets/cases/` — папки с картинками.

- [ ] **Step 5: Положить портрет**

```bash
cp /Users/nikita/Downloads/image.jpg src/assets/pavel.jpg
```

- [ ] **Step 6: Дописать frontmatter вручную**

Скрипт оставил `TODO` в `summary`, `role`, `outcome` — их нельзя извлечь машинно. Ниже готовые значения, снятые с текстов кейсов в источнике. Подставить как есть.

| slug | role | outcome | metrics |
|---|---|---|---|
| `cian-client-info` | Исследование, Интервью, Проектирование, Работа со смежной командой | Фича вошла в максимальную подписку и окупилась в первый месяц | `[{value: "+5,3%", label: "перехода на дорогую подписку"}, {value: ">5 млн ₽", label: "выручки в месяц"}]` |
| `netologiya-payment-ux` | Исследование, Интервью, Подготовка макетов, UX-тестирование, Презентация | Время работы менеджера с одним заказом сократилось вдвое | `[{value: "−50%", label: "времени на один заказ"}, {value: "10 → 5 мин", label: "оформление заказа"}]` |
| `netologiya-coordinator-payouts` | Исследование, Интервью, Подготовка макетов, UX-тестирование, Презентация | Процесс согласования выплат создан с нуля и перенесён из трёх программ в одну админку | `[{value: "3 → 1", label: "программы свели в одну админку"}, {value: "3", label: "категории пользователей в процессе"}]` |
| `netologiya-b2b-research` | Исследование, Интервью, Презентация | Систематизировал знания о B2B-пользователях и наполнил бэклог задачами по найденным барьерам | `[{value: "6", label: "CJM по двум продуктам"}, {value: "24", label: "глубинных интервью"}]` |
| `netologiya-ticket-messages` | Исследование, Интервью, Подготовка макетов, UX-тестирование, Презентация | Вся коммуникация со студентами переехала в один внутренний канал | `[]` |
| `dellin-accounting-docs` | Исследование, Анализ, Работа над макетами, Презентация | Новая фича разгрузила персональных менеджеров и повысила лояльность B2B-клиентов | `[]` |

Значения `summary` — текст на карточке, до 200 символов:

| slug | summary |
|---|---|
| `cian-client-info` | Спроектировал карточку клиента в чатах Циана, чтобы риелторы видели портрет собеседника и быстрее отвечали горячим клиентам. |
| `netologiya-payment-ux` | Разобрал флоу оформления заказа в админке продаж и переработал блок оплаты под рассрочку, промокоды и досрочное погашение. |
| `netologiya-coordinator-payouts` | Собрал процесс двойного согласования выплат координаторам с нуля и перенёс его из трёх разных программ в единую админку. |
| `netologiya-b2b-research` | Провёл серию глубинных интервью с HR-пользователями, построил CJM и собрал бэклог задач по найденным барьерам. |
| `netologiya-ticket-messages` | Добавил исходящие сообщения в тикет-систему, чтобы вся переписка со студентами жила в одном канале и не теряла контекст. |
| `dellin-accounting-docs` | Вынес заказ бухгалтерских документов в личный кабинет B2B-клиентов и снял рутину с персональных менеджеров. |

Одновременно проставить `alt` у всех изображений: скрипт оставляет `![](path)`. Подписи брать из соседнего текста — в кейсах они есть: «Старый интерфейс», «Стикеры в Миро», «Lo-Fi макеты», «Мобилка», «Все кейсы», «❌ Старый вид экрана риелтора», «✅ Новый вид». Эмодзи из alt убрать, смысл оставить.

- [ ] **Step 7: Запустить тест и убедиться, что проходит**

Run: `npm test -- tests/unit/content.test.ts`
Expected: PASS. Если падает валидация — в MDX остался `TODO` длиннее 200 символов или пустой `role`.

- [ ] **Step 8: Проверить, что сборка видит контент**

Run: `npm run build`
Expected: сборка проходит; в логе видно обработку изображений.

- [ ] **Step 9: Коммит**

```bash
git add scripts/import-yonote.mjs src/content src/assets public/Pavel_Mikhaylov_CV.pdf tests/unit/content.test.ts package.json package-lock.json
git commit -m "feat: импорт 6 кейсов и ассетов из Yonote в репозиторий"
```

---

### Task 5: Тёмная тема

Закрывает AC-16, AC-17, AC-18.

**Files:**
- Create: `src/components/react/ThemeToggle.tsx`
- Create: `src/components/ThemeScript.astro`
- Create: `src/components/ui/button.tsx`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/unit/theme-toggle.test.tsx`, `tests/e2e/theme.spec.ts`

**Interfaces:**
- Consumes: `cn` из Task 1, `BaseLayout` из Task 2.
- Produces: `<ThemeToggle client:load />` — React-компонент без пропсов. `ThemeScript.astro` — без пропсов, вставляется в `<head>` первым.

- [ ] **Step 1: Положить примитивы shadcn руками**

CLI не использовать — см. Global Constraints. `npx shadcn@latest init` версии 4.15 ставит пресет `base-nova` на Base UI, переписывает `global.css` (меняет Inter на Geist) и удаляет `withBase()` из `utils.ts`.

Взять исходники со страниц реестра `new-york` (`https://ui.shadcn.com/docs/components/button` и далее по компонентам) и положить в `src/components/ui/`: `button.tsx`, `dialog.tsx`, `card.tsx`, `badge.tsx`, `separator.tsx`. Radix поставить одним пакетом:

```bash
npm install radix-ui tw-animate-css
```

`components.json` написать руками:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "css": "src/styles/global.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui" }
}
```

Примитивам нужны токены, которых нет в базовом наборе Задачи 1 — дописать в `:root` и `.dark` в `global.css`: `--secondary`, `--secondary-foreground`, `--destructive`, и промаппить их в `@theme inline` как `--color-secondary`, `--color-secondary-foreground`, `--color-destructive`.

- [ ] **Step 2: Написать падающий unit-тест**

`tests/unit/theme-toggle.test.tsx`:

```tsx
import { describe, expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/react/ThemeToggle';

// Разрешение системной темы и приоритет сохранённого выбора — работа инлайн-скрипта
// в <head>, а не компонента. Они проверяются в tests/e2e/theme.spec.ts, где есть
// настоящий документ и настоящая перезагрузка.
beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

describe('ThemeToggle', () => {
  test('AC-16: клик включает тёмную тему и пишет её в localStorage', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('AC-16: повторный клик возвращает светлую тему', async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    await userEvent.click(button);
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('AC-16: клик при уже включённой тёмной теме выключает её', async () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button'));
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('AC-24: у кнопки есть доступное имя', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toHaveAccessibleName(/тему/i);
  });

  test('AC-18: разметка не зависит от состояния — обе иконки в DOM', () => {
    const { container } = render(<ThemeToggle />);
    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });
});
```

- [ ] **Step 3: Запустить и убедиться, что падает**

Run: `npm test -- tests/unit/theme-toggle.test.tsx`
Expected: FAIL, `Failed to resolve import "@/components/react/ThemeToggle"`.

- [ ] **Step 4: Написать реализацию**

`src/components/react/ThemeToggle.tsx`:

```tsx
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Состояния здесь намеренно нет. Текущая тема живёт в классе на <html>, который
 * ставит инлайн-скрипт до первой отрисовки. Если продублировать её в React-стейте,
 * Astro при client:load отрендерит остров на сборке со стартовым значением — и в
 * статическом HTML у пользователя с тёмной темой окажется иконка и подпись от
 * светлой, пока не отработает гидратация. Обе иконки в разметке, видимость через
 * dark: — первый кадр всегда верный, гидратации нечего переписывать.
 */
export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  return (
    {/* size-11 перебивает size-9 из варианта icon: кнопка живёт в шапке, а AC-15
        требует целевую область не меньше 44×44 на мобильном. */}
    <Button
      variant="ghost"
      size="icon"
      className="size-11"
      onClick={toggle}
      aria-label="Переключить тему"
    >
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
    </Button>
  );
}
```

`src/components/ThemeScript.astro`:

```astro
<script is:inline>
  (() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored
      ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
  })();
</script>
```

Подключить в `BaseLayout.astro` первой строкой внутри `<head>`, до стилей:

```astro
---
import ThemeScript from '@/components/ThemeScript.astro';
import '@/styles/global.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <ThemeScript />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 5: Запустить unit-тесты**

Run: `npm test -- tests/unit/theme-toggle.test.tsx`
Expected: PASS, 5 passed.

- [ ] **Step 6: Написать e2e на отсутствие вспышки**

`tests/e2e/theme.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('AC-18: тема применяется инлайн-скриптом до стилей и до body', async ({ request }) => {
  const html = await (await request.get('./')).text();

  const scriptIndex = html.indexOf('prefers-color-scheme: dark');
  const stylesheetIndex = html.indexOf('<link rel="stylesheet"');
  const bodyIndex = html.indexOf('<body');

  expect(scriptIndex, 'инлайн-скрипт темы отсутствует в HTML').toBeGreaterThan(-1);
  expect(scriptIndex).toBeLessThan(stylesheetIndex);
  expect(scriptIndex).toBeLessThan(bodyIndex);
});

test('AC-18: класс dark стоит на html без ожидания гидратации', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./', { waitUntil: 'commit' });
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('AC-17: при первом визите тема берётся из системной', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('AC-16: выбор темы переживает перезагрузку', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');
  await page.getByRole('button', { name: /Переключить тему/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('AC-16: сохранённый выбор важнее системной темы', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('theme', 'light'));
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('AC-18: гидратация острова не сбрасывает тёмную тему', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('html')).toHaveClass(/dark/);
});
```

Тест кликает по кнопке в шапке — её добавляет Task 6. До этого он падает; так и должно быть.

- [ ] **Step 7: Коммит**

```bash
git add src/components src/layouts/BaseLayout.astro components.json tests/unit/theme-toggle.test.tsx tests/e2e/theme.spec.ts package.json package-lock.json
git commit -m "feat: тёмная тема без вспышки при загрузке"
```

---

### Task 6: Шапка, подвал и SEO-голова

Закрывает AC-19, AC-20. После этой задачи проходят e2e темы из Task 5.

**Files:**
- Create: `src/lib/site.ts`, `src/components/BaseHead.astro`, `src/components/Header.astro`, `src/components/Footer.astro`
- Create: `public/og-default.png`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `withBase` (Task 1), `ThemeToggle` и `ThemeScript` (Task 5).
- Produces: `site` — объект `{ name, role, bio, metrics: {value,label}[], contacts: {label,href,external}[], cvFile }`. `BaseHead.astro` с пропсами `{ title: string; description: string; ogImage?: string }`. Task 7 и 9 читают `site`, все страницы используют `BaseHead` через `BaseLayout`.

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/seo.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('AC-19: у главной осмысленные title и description', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle(/Павел Михайлов/);
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.length ?? 0).toBeGreaterThan(50);
});

test('AC-20: у главной есть OG-теги и canonical с абсолютным URL', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);

  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(ogImage).toMatch(/^https:\/\/nkonovalov1990\.github\.io\/Pavelmkh\//);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toBe('https://nkonovalov1990.github.io/Pavelmkh/');
});

test('AC-15: шапка помещается на мобильном без горизонтального скролла', async ({ page }) => {
  await page.goto('./');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npm run test:e2e -- --project=desktop seo.spec.ts`
Expected: FAIL — нет og:title.

- [ ] **Step 3: Написать `src/lib/site.ts`**

```ts
export const site = {
  name: 'Павел Михайлов',
  role: 'Senior Product Designer',
  bio:
    'Senior Product Designer с 5+ годами опыта в B2B и B2C продуктах. Разрабатываю решения ' +
    'для монетизации, CRM, маркетплейсов и EdTech. Проектирую продукты на основе исследований, ' +
    'продуктовых метрик и экспериментов, тесно работая с PM, аналитиками и разработчиками.',
  // Отдельная короткая строка под meta description и og:description. Обрезать bio нельзя:
  // 261 символ не влезает в сниппет, а срез по символу рвёт фразу на середине слова.
  description:
    'Senior Product Designer. B2B и B2C продукты: монетизация, CRM, маркетплейсы, EdTech. ' +
    'Проектирую на основе исследований и продуктовых метрик.',
  metrics: [
    { value: '+10%', label: 'ARPPU' },
    { value: '+7%', label: 'просмотров объявлений' },
    { value: '+50%', label: 'скорость внутренних процессов' },
  ],
  contacts: [
    { label: 'Телеграм', href: 'https://t.me/Pavelmkh' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/pavel-mikhaylov93/' },
    { label: 'Behance', href: 'https://www.behance.net/pavelm1993e4f6' },
  ],
  cvFile: 'Pavel_Mikhaylov_CV.pdf',
} as const;
```

- [ ] **Step 4: Написать `BaseHead.astro`**

```astro
---
import ThemeScript from '@/components/ThemeScript.astro';
import { withBase } from '@/lib/utils';
import '@/styles/global.css';

interface Props {
  title: string;
  description: string;
  ogImage?: string;
}

const { title, description, ogImage = '/og-default.png' } = Astro.props;

const canonical = new URL(Astro.url.pathname, Astro.site).href;

// ogImage — путь от корня public БЕЗ base (например '/og-default.png') либо полный
// внешний URL. Base добавляется здесь через withBase(), поэтому передавать сюда уже
// обработанный withBase() путь нельзя — base задвоится.
const ogImageUrl = /^https?:\/\//.test(ogImage)
  ? ogImage
  : new URL(withBase(ogImage), Astro.site).href;
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<ThemeScript />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImageUrl} />
<meta property="og:url" content={canonical} />
<meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 5: Написать шапку и подвал**

`src/components/Header.astro`:

```astro
---
import { ThemeToggle } from '@/components/react/ThemeToggle';
import { withBase } from '@/lib/utils';
import { site } from '@/lib/site';
---

<header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
  <nav class="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
    <a href={withBase('/')} class="flex min-h-11 items-center font-medium">{site.name}</a>
    <div class="flex items-center gap-1">
      <a
        href={withBase('/#cases')}
        class="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground"
      >
        Кейсы
      </a>
      <ThemeToggle client:load />
    </div>
  </nav>
</header>
```

`src/components/Footer.astro`:

```astro
---
import { site } from '@/lib/site';
---

<footer class="border-t py-8">
  <div class="mx-auto max-w-5xl px-4 text-sm text-muted-foreground">
    {site.name} — {site.role}
  </div>
</footer>
```

- [ ] **Step 6: Перевести `BaseLayout` на `BaseHead`**

```astro
---
import BaseHead from '@/components/BaseHead.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';

interface Props {
  title: string;
  description: string;
  ogImage?: string;
}

const { title, description, ogImage } = Astro.props;
---

<!doctype html>
<html lang="ru">
  <head>
    <BaseHead title={title} description={description} ogImage={ogImage} />
  </head>
  <body class="min-h-dvh">
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 7: Сгенерировать OG-картинку по умолчанию**

`scripts/make-og.mjs` — `sharp` уже стоит как зависимость Astro:

```js
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
```

Run: `node scripts/make-og.mjs`
Expected: `✓ public/og-default.png`.

Проверить размер: `sips -g pixelWidth -g pixelHeight public/og-default.png` → 1200 и 630. Если Inter не установлен в системе, SVG отрисуется системным гротеском — для OG-картинки это допустимо.

- [ ] **Step 8: Запустить тесты**

Run: `npm run test:e2e -- seo.spec.ts theme.spec.ts`
Expected: PASS во всех проектах.

- [ ] **Step 9: Коммит**

```bash
git add src/lib/site.ts src/components src/layouts public/og-default.png tests/e2e/seo.spec.ts
git commit -m "feat: шапка, подвал, SEO-мета и OG-превью"
```

---

### Task 7: Герой и контакты на главной

Закрывает AC-5, AC-5a, AC-8, AC-9.

**Files:**
- Create: `src/components/Hero.astro`, `src/components/Contacts.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `site` (Task 6), `withBase` (Task 1), `src/assets/pavel.jpg` (Task 4).
- Produces: секции `#hero` и `#contacts` на главной.

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('AC-5: в герое есть имя, роль и био', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Павел Михайлов');
  await expect(page.getByText('Senior Product Designer').first()).toBeVisible();
  await expect(page.getByText(/5\+ годами опыта/)).toBeVisible();
});

test('AC-5a: портрет отдаётся с alt и в современном формате', async ({ page }) => {
  await page.goto('./');
  const portrait = page.locator('#hero img').first();
  await expect(portrait).toBeVisible();

  const alt = await portrait.getAttribute('alt');
  expect(alt?.trim().length ?? 0).toBeGreaterThan(0);

  const src = await portrait.getAttribute('src');
  expect(src).toMatch(/\.(avif|webp)$/);
  expect(await portrait.getAttribute('srcset')).toBeTruthy();
});

test('AC-8: три контакта ведут наружу безопасно', async ({ page }) => {
  await page.goto('./');
  const expected = [
    { name: 'Телеграм', href: 'https://t.me/Pavelmkh' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/pavel-mikhaylov93/' },
    { name: 'Behance', href: 'https://www.behance.net/pavelm1993e4f6' },
  ];

  for (const contact of expected) {
    const link = page.locator('#contacts').getByRole('link', { name: contact.name });
    await expect(link).toHaveAttribute('href', contact.href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});

test('AC-9: ссылка на резюме отдаёт PDF', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('#contacts').getByRole('link', { name: /Резюме/ }).getAttribute('href');
  expect(href).toBe('/Pavelmkh/Pavel_Mikhaylov_CV.pdf');

  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
});
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npm run test:e2e -- home.spec.ts`
Expected: FAIL — на главной только `<h1>`.

- [ ] **Step 3: Написать `Hero.astro`**

```astro
---
import { Image } from 'astro:assets';
import portrait from '@/assets/pavel.jpg';
import { site } from '@/lib/site';
---

<section id="hero" class="mx-auto max-w-5xl px-4 py-16 md:py-24">
  <div class="grid items-center gap-10 md:grid-cols-[1fr_auto]">
    <div>
      <h1 class="text-4xl font-semibold tracking-tight md:text-6xl">{site.name}</h1>
      <p class="mt-3 text-lg text-muted-foreground md:text-xl">{site.role}</p>
      <p class="mt-6 max-w-2xl text-base leading-relaxed md:text-lg">{site.bio}</p>

      <dl class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {site.metrics.map((metric) => (
          <div>
            <dt class="text-3xl font-semibold tabular-nums md:text-4xl">{metric.value}</dt>
            <dd class="mt-1 text-sm text-muted-foreground">{metric.label}</dd>
          </div>
        ))}
      </dl>
    </div>

    <Image
      src={portrait}
      alt={`${site.name}, ${site.role}`}
      widths={[280, 420, 560]}
      sizes="(min-width: 768px) 280px, 60vw"
      format="avif"
      class="order-first w-40 justify-self-start rounded-2xl border bg-muted object-cover md:order-none md:w-70"
    />
  </div>
</section>
```

- [ ] **Step 4: Написать `Contacts.astro`**

```astro
---
import { site } from '@/lib/site';
import { withBase } from '@/lib/utils';
---

<section id="contacts" class="mx-auto max-w-5xl px-4 py-16">
  <h2 class="text-2xl font-semibold tracking-tight md:text-3xl">Контакты</h2>

  <ul class="mt-6 flex flex-wrap gap-3">
    {site.contacts.map((contact) => (
      <li>
        <a
          href={contact.href}
          target="_blank"
          rel="noopener noreferrer"
          class="flex min-h-11 items-center rounded-md border px-4 hover:bg-accent"
        >
          {contact.label}
        </a>
      </li>
    ))}
    <li>
      <a
        href={withBase(site.cvFile)}
        class="flex min-h-11 items-center rounded-md border px-4 hover:bg-accent"
      >
        Резюме, PDF
      </a>
    </li>
  </ul>
</section>
```

- [ ] **Step 5: Собрать главную**

`src/pages/index.astro`:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Hero from '@/components/Hero.astro';
import Contacts from '@/components/Contacts.astro';
import { site } from '@/lib/site';
---

{/* В мета-теги идёт site.description, а не срез bio: срез рвёт фразу посреди слова. */}
<BaseLayout title={`${site.name} — ${site.role}`} description={site.description}>
  <Hero />
  <Contacts />
</BaseLayout>
```

- [ ] **Step 6: Запустить тесты**

Run: `npm run test:e2e -- home.spec.ts`
Expected: PASS во всех проектах.

- [ ] **Step 7: Коммит**

```bash
git add src/components/Hero.astro src/components/Contacts.astro src/pages/index.astro tests/e2e/home.spec.ts
git commit -m "feat: герой с портретом и метриками, блок контактов"
```

---

### Task 8: Сетка кейсов

Закрывает AC-6, AC-7, AC-14.

**Files:**
- Create: `src/components/CaseCard.astro`, `src/components/CaseGrid.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/unit/case-card.test.ts`, `tests/e2e/cases-grid.spec.ts`

**Interfaces:**
- Consumes: коллекция `cases` (Task 3, Task 4), `withBase` (Task 1).
- Produces: `CaseCard.astro` с пропсами `{ entry: CollectionEntry<'cases'> }`. `CaseGrid.astro` без пропсов — сам читает коллекцию и сортирует по `order`.

- [ ] **Step 1: Написать падающий unit-тест на карточку**

`tests/unit/case-card.test.ts`:

```ts
// @vitest-environment node
// Глобальный jsdom ломает esbuild внутри AstroContainer: «instanceof Uint8Array is
// incorrectly false». Это единственный юнит-тест, рендерящий .astro-компонент,
// поэтому окружение переопределяется точечно, а не в конфиге.
import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import CaseCard from '@/components/CaseCard.astro';

beforeEach(() => {
  vi.stubEnv('BASE_URL', '/Pavelmkh/');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const entry = {
  id: 'netologiya-payment-ux',
  data: {
    title: 'Улучшение UX в блоке оплаты',
    company: 'Нетология',
    order: 2,
    summary: 'Переработал блок оплаты в админке продаж.',
    role: ['Исследование'],
    outcome: '−50% времени на оформление заказа',
    metrics: [],
    draft: false,
    cover: { src: '/cover.png', width: 1200, height: 800, format: 'png' },
  },
} as never;

describe('CaseCard', () => {
  test('AC-6: показывает компанию, название и результат', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CaseCard, { props: { entry } });

    expect(html).toContain('Нетология');
    expect(html).toContain('Улучшение UX в блоке оплаты');
    expect(html).toContain('−50% времени на оформление заказа');
  });

  test('AC-7: ссылка ведёт на страницу кейса с учётом base', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CaseCard, { props: { entry } });

    expect(html).toContain('href="/Pavelmkh/case/netologiya-payment-ux/"');
  });
});
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npm test -- tests/unit/case-card.test.ts`
Expected: FAIL, `Failed to resolve import "@/components/CaseCard.astro"`.

- [ ] **Step 3: Написать `CaseCard.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { withBase } from '@/lib/utils';

interface Props {
  entry: CollectionEntry<'cases'>;
}

const { entry } = Astro.props;
const { title, company, summary, outcome, cover } = entry.data;
const href = withBase(`/case/${entry.id}/`);
---

<article class="h-full">
  <a href={href} class="flex h-full flex-col overflow-hidden rounded-xl border transition hover:bg-accent">
    {/* alt пустой намеренно: картинка лежит внутри ссылки, где компания и заголовок
        уже есть текстом. Непустой alt заставил бы скринридер озвучить их дважды.
        Ширины считаны от реальной карточки: контейнер max-w-5xl с gap-6 даёт ~484px
        на десктопе, поэтому 1000w нужен для retina. */}
    <Image
      src={cover}
      alt=""
      widths={[400, 800, 1000]}
      sizes="(min-width: 1024px) 484px, (min-width: 768px) 45vw, 100vw"
      format="avif"
      class="aspect-16/10 w-full border-b bg-muted object-cover"
    />
    <div class="flex flex-1 flex-col p-5">
      <p class="text-sm text-muted-foreground">{company}</p>
      <h3 class="mt-1 text-lg font-medium">{title}</h3>
      <p class="mt-2 text-sm text-muted-foreground">{summary}</p>
      <p class="mt-4 pt-4 text-sm font-medium border-t">{outcome}</p>
    </div>
  </a>
</article>
```

- [ ] **Step 4: Запустить unit-тест**

Run: `npm test -- tests/unit/case-card.test.ts`
Expected: PASS, 2 passed.

- [ ] **Step 5: Написать e2e на сетку**

`tests/e2e/cases-grid.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('AC-6: на главной ровно 6 карточек кейсов', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#cases article')).toHaveCount(6);
});

test('AC-6: первым идёт кейс Циана', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#cases article').first()).toContainText('Циан');
});

// Проверяем именно текст заголовка, а не факт его наличия: пока страниц кейсов нет,
// клик уводит на стандартную 404 Astro, у которой тоже есть h1 — на `toBeVisible()`
// тест был бы зелёным по неверной причине. До Задачи 9 он обязан быть красным.
test('AC-7: клик по карточке ведёт на страницу кейса', async ({ page }) => {
  await page.goto('./');
  await page.locator('#cases article a').first().click();
  await expect(page).toHaveURL(/\/Pavelmkh\/case\/cian-client-info\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Информация о клиенте в чатах',
  );
});

test('AC-14: на десктопе сетка минимум в две колонки', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'только десктоп');
  await page.goto('./');
  const cards = page.locator('#cases article');
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(first!.y).toBeCloseTo(second!.y, 0);
});

test('AC-14: на мобильном сетка в одну колонку', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'только мобильный');
  await page.goto('./');
  const cards = page.locator('#cases article');
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(second!.y).toBeGreaterThan(first!.y + first!.height - 1);
});
```

- [ ] **Step 6: Написать `CaseGrid.astro` и подключить на главную**

```astro
---
import { getCollection } from 'astro:content';
import CaseCard from '@/components/CaseCard.astro';

const cases = (await getCollection('cases', ({ data }) => !data.draft)).sort(
  (a, b) => a.data.order - b.data.order,
);
---

<section id="cases" class="mx-auto max-w-5xl px-4 py-16">
  <h2 class="text-2xl font-semibold tracking-tight md:text-3xl">Кейсы</h2>
  <div class="mt-8 grid gap-6 md:grid-cols-2">
    {cases.map((entry) => <CaseCard entry={entry} />)}
  </div>
</section>
```

В `src/pages/index.astro` вставить `<CaseGrid />` между `<Hero />` и `<Contacts />`, добавив импорт `import CaseGrid from '@/components/CaseGrid.astro';`.

- [ ] **Step 7: Запустить тесты**

Run: `npm run test:e2e -- cases-grid.spec.ts`
Expected: PASS в обоих проектах.

- [ ] **Step 8: Коммит**

```bash
git add src/components/CaseCard.astro src/components/CaseGrid.astro src/pages/index.astro tests/unit/case-card.test.ts tests/e2e/cases-grid.spec.ts
git commit -m "feat: сетка кейсов на главной"
```

---

### Task 9: Страницы кейсов

Закрывает AC-10, AC-12.

**Files:**
- Create: `src/layouts/CaseLayout.astro`, `src/pages/case/[...slug].astro`
- Test: `tests/e2e/case-page.spec.ts`

**Interfaces:**
- Consumes: коллекция `cases`, `BaseLayout`, `withBase`.
- Produces: маршрут `/case/<slug>/` для всех 6 кейсов. Task 10 добавляет в этот layout лайтбокс.

- [ ] **Step 1: Написать падающий тест**

`tests/e2e/case-page.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const SLUGS = [
  'cian-client-info',
  'netologiya-payment-ux',
  'netologiya-coordinator-payouts',
  'netologiya-b2b-research',
  'netologiya-ticket-messages',
  'dellin-accounting-docs',
];

for (const slug of SLUGS) {
  test(`AC-10: страница ${slug} содержит заголовок, компанию, роль и результат`, async ({ page }) => {
    const response = await page.goto(`./case/${slug}/`);
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByTestId('case-company')).not.toBeEmpty();
    await expect(page.getByTestId('case-role')).not.toBeEmpty();
    await expect(page.getByTestId('case-outcome')).not.toBeEmpty();
  });

  test(`AC-19: у страницы ${slug} свой уникальный title`, async ({ page }) => {
    await page.goto(`./case/${slug}/`);
    const title = await page.title();
    expect(title).not.toBe('Павел Михайлов — Senior Product Designer');
    expect(title).toContain('Павел Михайлов');
  });
}

// Возврат ведёт именно к сетке кейсов, а не на верх главной: человек пришёл оттуда,
// и терять его позицию незачем. Поэтому в URL ожидается якорь.
test('AC-12: со страницы кейса есть возврат к сетке кейсов', async ({ page }) => {
  await page.goto('./case/netologiya-payment-ux/');
  await page.getByRole('link', { name: /Все кейсы/ }).click();
  await expect(page).toHaveURL(/\/Pavelmkh\/#cases$/);

  // toBeInViewport() считает элемент видимым, даже когда его полностью накрыла липкая
  // шапка — оно меряет только пересечение с вьюпортом. Поэтому сверяем координаты:
  // заголовок секции обязан оказаться ниже нижней границы шапки.
  const header = (await page.locator('header').boundingBox())!;
  const heading = (await page.locator('#cases h2').boundingBox())!;
  expect(heading.y).toBeGreaterThanOrEqual(header.y + header.height);
});

test('AC-12: есть переход к следующему кейсу', async ({ page }) => {
  await page.goto('./case/cian-client-info/');
  await page.getByRole('link', { name: /Следующий кейс/ }).click();
  await expect(page).toHaveURL(/\/case\/netologiya-payment-ux\/$/);
});

test('AC-12: у последнего кейса нет ссылки «Следующий кейс»', async ({ page }) => {
  await page.goto('./case/dellin-accounting-docs/');
  await expect(page.getByRole('link', { name: /Следующий кейс/ })).toHaveCount(0);
});
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npm run test:e2e -- case-page.spec.ts`
Expected: FAIL — 404 на всех маршрутах.

- [ ] **Step 3: Написать `CaseLayout.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import BaseLayout from '@/layouts/BaseLayout.astro';
import { withBase } from '@/lib/utils';
import { site } from '@/lib/site';

interface Props {
  entry: CollectionEntry<'cases'>;
  prev?: CollectionEntry<'cases'>;
  next?: CollectionEntry<'cases'>;
}

const { entry, prev, next } = Astro.props;
const { title, company, role, outcome, metrics, summary } = entry.data;
---

<BaseLayout
  title={`${company} — ${title} · ${site.name}`}
  description={summary}
>
  <article class="mx-auto max-w-3xl px-4 py-12 md:py-16">
    <a href={withBase('/#cases')} class="text-sm text-muted-foreground hover:text-foreground">
      ← Все кейсы
    </a>

    <p data-testid="case-company" class="mt-8 text-sm text-muted-foreground">{company}</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">{title}</h1>

    <dl class="mt-8 grid gap-4 border-y py-6 sm:grid-cols-2">
      <div>
        <dt class="text-sm text-muted-foreground">Моя роль</dt>
        <dd data-testid="case-role" class="mt-1">{role.join(', ')}</dd>
      </div>
      <div>
        <dt class="text-sm text-muted-foreground">Результат</dt>
        <dd data-testid="case-outcome" class="mt-1">{outcome}</dd>
      </div>
    </dl>

    {metrics.length > 0 && (
      <dl class="mt-8 grid gap-6 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div>
            <dt class="text-3xl font-semibold tabular-nums">{metric.value}</dt>
            <dd class="mt-1 text-sm text-muted-foreground">{metric.label}</dd>
          </div>
        ))}
      </dl>
    )}

    <div class="prose-case mt-12">
      <slot />
    </div>

    <nav class="mt-16 flex justify-between gap-4 border-t pt-8 text-sm">
      {prev ? (
        <a href={withBase(`/case/${prev.id}/`)} class="hover:underline">
          ← Предыдущий кейс
        </a>
      ) : (
        <span></span>
      )}
      {next && (
        <a href={withBase(`/case/${next.id}/`)} class="text-right hover:underline">
          Следующий кейс →
        </a>
      )}
    </nav>
  </article>
</BaseLayout>
```

Добавить в `src/styles/global.css` типографику тела кейса:

```css
@layer components {
  .prose-case :is(h2) {
    margin-top: 2.5rem;
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .prose-case :is(h3) {
    margin-top: 2rem;
    font-size: 1.125rem;
    font-weight: 600;
  }
  .prose-case p {
    margin-top: 1rem;
    line-height: 1.75;
  }
  .prose-case ul {
    margin-top: 1rem;
    list-style: disc;
    padding-left: 1.25rem;
  }
  .prose-case li { margin-top: 0.5rem; }
  .prose-case img {
    margin-top: 2rem;
    border-radius: var(--radius);
    border: 1px solid var(--color-border);
    background-color: var(--color-muted);
    width: 100%;
    height: auto;
  }
}
```

- [ ] **Step 4: Написать маршрут**

`src/pages/case/[...slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import CaseLayout from '@/layouts/CaseLayout.astro';

export async function getStaticPaths() {
  const cases = (await getCollection('cases', ({ data }) => !data.draft)).sort(
    (a, b) => a.data.order - b.data.order,
  );

  return cases.map((entry, index) => ({
    params: { slug: entry.id },
    props: { entry, prev: cases[index - 1], next: cases[index + 1] },
  }));
}

const { entry, prev, next } = Astro.props;
const { Content } = await render(entry);
---

<CaseLayout entry={entry} prev={prev} next={next}>
  <Content />
</CaseLayout>
```

- [ ] **Step 5: Запустить тесты**

Run: `npm run test:e2e -- case-page.spec.ts`
Expected: PASS, 15 тестов на проект.

- [ ] **Step 6: Коммит**

```bash
git add src/layouts/CaseLayout.astro src/pages/case src/styles/global.css tests/e2e/case-page.spec.ts
git commit -m "feat: страницы кейсов с навигацией между ними"
```

---

### Task 10: Лайтбокс изображений

Закрывает AC-11.

**Files:**
- Create: `src/components/react/Lightbox.tsx`
- Modify: `src/layouts/CaseLayout.astro`
- Test: `tests/unit/lightbox.test.tsx`, `tests/e2e/lightbox.spec.ts`

**Interfaces:**
- Consumes: примитив `Dialog` из shadcn (Task 5).
- Produces: `<Lightbox client:visible />` — остров без пропсов; сам находит `img` внутри `.prose-case` и вешает обработчики.

- [ ] **Step 1: Написать падающий unit-тест**

`tests/unit/lightbox.test.tsx`:

```tsx
import { describe, expect, test, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lightbox } from '@/components/react/Lightbox';

function renderWithImage() {
  document.body.innerHTML = `
    <div class="prose-case">
      <img src="/one.png" alt="Старый интерфейс" />
    </div>
    <div id="island"></div>
  `;
  return render(<Lightbox />, { container: document.getElementById('island')! });
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Lightbox', () => {
  test('AC-11: клик по изображению открывает лайтбокс', async () => {
    renderWithImage();
    await userEvent.click(document.querySelector('.prose-case img')!);
    // Ищем внутри диалога через within(), а не опцией selector: она есть в типах
    // @testing-library/dom, но в закреплённой версии не поддерживается, и запрос
    // падает на двух совпадениях — картинке-триггере и картинке в диалоге.
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByAltText('Старый интерфейс')).toBeVisible();
  });

  test('AC-11: Esc закрывает лайтбокс', async () => {
    renderWithImage();
    await userEvent.click(document.querySelector('.prose-case img')!);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('AC-11: после закрытия фокус возвращается на изображение-триггер', async () => {
    renderWithImage();
    const trigger = document.querySelector('.prose-case img') as HTMLElement;
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(document.activeElement).toBe(trigger);
  });

  test('AC-24: изображения-триггеры доступны с клавиатуры', () => {
    renderWithImage();
    const trigger = document.querySelector('.prose-case img')!;
    expect(trigger.getAttribute('tabindex')).toBe('0');
    expect(trigger.getAttribute('role')).toBe('button');
  });
});
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npm test -- tests/unit/lightbox.test.tsx`
Expected: FAIL, `Failed to resolve import "@/components/react/Lightbox"`.

- [ ] **Step 3: Написать реализацию**

`src/components/react/Lightbox.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface OpenImage {
  src: string;
  alt: string;
}

export function Lightbox() {
  const [image, setImage] = useState<OpenImage | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const images = document.querySelectorAll<HTMLImageElement>('.prose-case img');

    function open(this: HTMLImageElement) {
      triggerRef.current = this;
      setImage({ src: this.currentSrc || this.src, alt: this.alt });
    }

    function onKeyDown(this: HTMLImageElement, event: KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open.call(this);
      }
    }

    images.forEach((img) => {
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', open);
      img.addEventListener('keydown', onKeyDown);
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('click', open);
        img.removeEventListener('keydown', onKeyDown);
      });
    };
  }, []);

  function onOpenChange(next: boolean) {
    if (!next) {
      setImage(null);
      triggerRef.current?.focus();
    }
  }

  return (
    <Dialog open={image !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] p-2 sm:max-w-5xl">
        <DialogTitle className="sr-only">{image?.alt ?? 'Изображение из кейса'}</DialogTitle>
        {image && (
          <img src={image.src} alt={image.alt} className="max-h-[85vh] w-full rounded object-contain" />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

Подключить в `CaseLayout.astro`: добавить импорт `import { Lightbox } from '@/components/react/Lightbox';` и вставить `<Lightbox client:visible />` **первым элементом внутри `.prose-case`**, там где начинаются картинки.

Место важно, и «после `</article>`» не подходит. `client:visible` гидратирует остров, когда тот попадает во вьюпорт, а наблюдать не за чем: в закрытом состоянии компонент не рендерит ни одного узла. Поэтому компонент обязан всегда отрисовывать host-контейнер, а сам остров стоять рядом с картинками — иначе он гидратируется только когда читатель домотает до самого низа страницы, уже пролистав все изображения.

- [ ] **Step 4: Запустить unit-тесты**

Run: `npm test -- tests/unit/lightbox.test.tsx`
Expected: PASS, 4 passed.

- [ ] **Step 5: Написать e2e**

`tests/e2e/lightbox.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('AC-11: изображение кейса открывается и закрывается по Esc', async ({ page }) => {
  await page.goto('./case/netologiya-payment-ux/');

  const firstImage = page.locator('.prose-case img').first();
  await firstImage.scrollIntoViewIfNeeded();
  await firstImage.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
```

- [ ] **Step 6: Запустить e2e**

Run: `npm run test:e2e -- lightbox.spec.ts`
Expected: PASS.

- [ ] **Step 7: Коммит**

```bash
git add src/components/react/Lightbox.tsx src/layouts/CaseLayout.astro tests/unit/lightbox.test.tsx tests/e2e/lightbox.spec.ts
git commit -m "feat: лайтбокс для изображений кейсов"
```

---

### Task 11: Адаптив, 404, sitemap и robots

Закрывает AC-13, AC-21, AC-22.

**Files:**
- Create: `src/pages/404.astro`, `public/robots.txt`
- Test: `tests/e2e/responsive.spec.ts`, дополнение `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `BaseLayout`, `withBase`, интеграция `sitemap` (подключена в Task 1).
- Produces: страница 404 и `sitemap-index.xml`.

- [ ] **Step 1: Написать падающие тесты**

`tests/e2e/responsive.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const PATHS = ['./', './case/cian-client-info/', './case/netologiya-payment-ux/'];

for (const path of PATHS) {
  test(`AC-13: на ${path} нет горизонтального скролла`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('AC-15: целевые области в шапке не меньше 44 px по высоте', async ({ page }) => {
  await page.goto('./');
  const targets = page.locator('header a, header button');

  for (let index = 0; index < (await targets.count()); index += 1) {
    const box = await targets.nth(index).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});
```

Дописать в `tests/e2e/seo.spec.ts`:

```ts
test('AC-21: sitemap содержит главную и все 6 кейсов', async ({ request }) => {
  const index = await request.get('/Pavelmkh/sitemap-index.xml');
  expect(index.status()).toBe(200);

  const sitemapUrl = (await index.text()).match(/<loc>(.*?)<\/loc>/)![1];
  const sitemap = await (await request.get(sitemapUrl)).text();

  expect(sitemap).toContain('https://nkonovalov1990.github.io/Pavelmkh/');
  for (const slug of [
    'cian-client-info',
    'netologiya-payment-ux',
    'netologiya-coordinator-payouts',
    'netologiya-b2b-research',
    'netologiya-ticket-messages',
    'dellin-accounting-docs',
  ]) {
    expect(sitemap).toContain(`/Pavelmkh/case/${slug}/`);
  }
});

test('AC-21: robots.txt указывает на sitemap', async ({ request }) => {
  const response = await request.get('/Pavelmkh/robots.txt');
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('sitemap-index.xml');
});

test('AC-22: неизвестный адрес отдаёт страницу 404 со ссылкой на главную', async ({ page }) => {
  await page.goto('./case/nesushchestvuyushchiy-keys/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('404');
  await expect(page.getByRole('link', { name: /На главную/ })).toBeVisible();
});
```

- [ ] **Step 2: Запустить и убедиться, что падает**

Run: `npm run test:e2e -- seo.spec.ts responsive.spec.ts`
Expected: FAIL на robots.txt и на 404.

- [ ] **Step 3: Написать 404 и robots**

`src/pages/404.astro`:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import { withBase } from '@/lib/utils';
---

<BaseLayout title="Страница не найдена — Павел Михайлов" description="Такой страницы нет">
  <section class="mx-auto max-w-3xl px-4 py-24 text-center">
    <h1 class="text-5xl font-semibold tracking-tight">404</h1>
    <p class="mt-4 text-muted-foreground">Такой страницы нет. Возможно, ссылка устарела.</p>
    <a
      href={withBase('/')}
      class="mt-8 inline-flex min-h-11 items-center rounded-md border px-5 hover:bg-accent"
    >
      На главную
    </a>
  </section>
</BaseLayout>
```

`public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://nkonovalov1990.github.io/Pavelmkh/sitemap-index.xml
```

- [ ] **Step 4: Запустить тесты**

Run: `npm run test:e2e -- seo.spec.ts responsive.spec.ts`
Expected: PASS. Если «нет горизонтального скролла» падает — виноват широкий элемент в теле кейса; добавить `overflow-x: auto` на таблицы в `.prose-case`.

- [ ] **Step 5: Коммит**

```bash
git add src/pages/404.astro public/robots.txt tests/e2e/responsive.spec.ts tests/e2e/seo.spec.ts
git commit -m "feat: страница 404, robots.txt, тесты адаптива"
```

---

### Task 12: Доступность и бюджеты

Закрывает AC-2, AC-4, AC-23, AC-24, AC-25, AC-26.

**Files:**
- Test: `tests/e2e/a11y.spec.ts`, `tests/e2e/budget.spec.ts`

**Interfaces:**
- Consumes: всё собранное. Ничего не производит — это гейт качества.

- [ ] **Step 1: Написать тесты доступности**

`tests/e2e/a11y.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PATHS = [
  './',
  './case/cian-client-info/',
  './case/netologiya-payment-ux/',
  './case/netologiya-coordinator-payouts/',
  './case/netologiya-b2b-research/',
  './case/netologiya-ticket-messages/',
  './case/dellin-accounting-docs/',
];

for (const path of PATHS) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`AC-23, AC-25: ${path} без нарушений axe в теме ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const blocking = results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact ?? ''),
      );

      expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
    });
  }
}

test('AC-4: alt непустой у содержательных картинок, пустой у декоративных', async ({ page }) => {
  for (const path of PATHS) {
    await page.goto(path);

    // Пустой alt допустим только у картинки внутри ссылки, где тот же смысл уже
    // передан текстом — иначе скринридер озвучит одно и то же дважды.
    const offenders = await page.locator('img').evaluateAll((nodes) =>
      nodes
        .filter((node) => {
          const image = node as HTMLImageElement;
          if (image.alt.trim().length > 0) return false;
          const link = image.closest('a');
          return !(link && (link.textContent ?? '').trim().length > 0);
        })
        .map((node) => (node as HTMLImageElement).currentSrc),
    );

    expect(offenders, `картинки с пустым alt вне ссылки с текстом на ${path}`).toEqual([]);
  }
});

test('AC-24: фокус доходит до переключателя темы', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(['A', 'BUTTON']).toContain(focused);
});
```

- [ ] **Step 2: Написать тесты бюджетов**

`tests/e2e/budget.spec.ts`:

```ts
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

test('AC-26: подключённый страницами JS меньше 120 KB в gzip', () => {
  // Считаем только то, на что реально ссылается собранный HTML: Astro кладёт
  // клиентский рантайм React в dist даже когда островов на странице нет,
  // а неподключённый файл трафика не создаёт.
  const html = walk('dist')
    .filter((path) => path.endsWith('.html'))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');

  const referenced = walk('dist')
    .filter((path) => path.endsWith('.js'))
    .filter((path) => html.includes(basename(path)));

  expect(referenced.length, 'ни один JS не подключён — тест бессмыслен').toBeGreaterThan(0);

  const total = referenced.reduce(
    (sum, path) => sum + gzipSync(readFileSync(path)).length,
    0,
  );

  const report = referenced
    .map((path) => `${basename(path)} ${Math.round(gzipSync(readFileSync(path)).length / 1024)} KB`)
    .join(', ');

  expect(total, `JS в gzip: ${Math.round(total / 1024)} KB (${report})`).toBeLessThan(120 * 1024);
});

test('AC-2: в dist не осталось ссылок на Yonote', () => {
  const offenders = walk('dist')
    .filter((path) => /\.(html|js|css|xml|txt)$/.test(path))
    .filter((path) => readFileSync(path, 'utf8').includes('pavelmikhaylov93.yonote.ru'));

  expect(offenders).toEqual([]);
});
```

- [ ] **Step 3: Запустить и разобрать нарушения**

Run: `npm run test:e2e -- a11y.spec.ts budget.spec.ts`
Expected: сначала возможны падения. Типичные причины и что делать:

- `color-contrast` — поднять контраст `--muted-foreground` в соответствующей теме;
- `image-alt` — незаполненный `alt` в MDX, вернуться к Task 4 Step 6;
- `heading-order` — в теле кейса `h3` идёт до `h2`, поправить уровни в MDX;
- `landmark-unique` / `region` — обернуть содержимое в `<main>` (уже сделано в `BaseLayout`);
- превышен бюджет JS — проверить, что `Lightbox` стоит `client:visible`, а не `client:load`.

- [ ] **Step 4: Прогнать весь набор**

Run: `npm test && npm run test:e2e`
Expected: всё зелёное в обоих проектах.

- [ ] **Step 5: Коммит**

```bash
git add tests/e2e/a11y.spec.ts tests/e2e/budget.spec.ts src/styles/global.css src/content
git commit -m "test: гейты доступности и бюджета JS"
```

---

### Task 13: Деплой на GitHub Pages

Закрывает AC-29 на живом URL.

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: всё. Ничего не производит для кода.

- [ ] **Step 1: Написать workflow**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Сборка идёт только после зелёных unit и e2e — это и есть вторая половина AC-29.

- [ ] **Step 2: Включить Pages в настройках репозитория**

В `https://github.com/nkonovalov1990/Pavelmkh/settings/pages` выбрать Source → GitHub Actions. Это делает человек, у агента нет доступа к настройкам.

- [ ] **Step 3: Коммит и пуш**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: деплой на GitHub Pages после зелёных тестов"
git push origin main
```

- [ ] **Step 4: Дождаться деплоя и проверить живой сайт**

```bash
gh run watch
curl -sI https://nkonovalov1990.github.io/Pavelmkh/ | head -1
```

Expected: `HTTP/2 200`.

- [ ] **Step 5: Прогнать e2e против живого URL**

```bash
PLAYWRIGHT_BASE_URL=https://nkonovalov1990.github.io/Pavelmkh/ npx playwright test --config=playwright.config.ts
```

Для этого добавить в `playwright.config.ts` поддержку внешнего baseURL:

```ts
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  // ...
  use: {
    baseURL: externalBaseURL ?? `http://localhost:${PORT}/Pavelmkh/`,
    trace: 'on-first-retry',
  },
  webServer: externalBaseURL
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT}`,
        url: `http://localhost:${PORT}/Pavelmkh/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
```

Тесты из `budget.spec.ts` читают локальный `dist/` — при внешнем прогоне они всё равно валидны, если `dist/` собран той же ревизией.

- [ ] **Step 6: Проверить превью ссылки вручную**

Отправить `https://nkonovalov1990.github.io/Pavelmkh/` и ссылку на любой кейс в Телеграм, убедиться, что карточка превью отрисовалась с картинкой и правильным заголовком. Это единственная проверка, которую нельзя автоматизировать.

---

## Сверка с критериями приёмки

| AC | Задача |
|---|---|
| AC-1, AC-3 | Task 3, Task 4 |
| AC-2 | Task 4, Task 12 |
| AC-4 | Task 4, Task 12 |
| AC-5, AC-5a | Task 7 |
| AC-6, AC-7 | Task 8 |
| AC-8, AC-9 | Task 7 |
| AC-10, AC-12 | Task 9 |
| AC-11 | Task 10 |
| AC-13 | Task 11 |
| AC-14 | Task 8 |
| AC-15 | Task 6, Task 11 |
| AC-16, AC-17, AC-18 | Task 5 |
| AC-19 | Task 6, Task 9 |
| AC-20 | Task 6 |
| AC-21, AC-22 | Task 11 |
| AC-23, AC-24, AC-25 | Task 5, Task 10, Task 12 |
| AC-26 | Task 12 |
| AC-27 | Task 1 |
| AC-28 | Task 2 |
| AC-29 | Task 2, Task 13 |

Незакрытых AC нет.
