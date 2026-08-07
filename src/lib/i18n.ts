/**
 * Два языка сайта. Русский живёт в корне, английский — под /en/.
 *
 * Локаль всюду передаётся пропсом, а не берётся из Astro.currentLocale: маршруты
 * заданы руками (src/pages/en/*), встроенный роутинг Astro не включён, и
 * currentLocale в такой схеме пуст.
 *
 * defaultLocale — значение по умолчанию у пропа lang во всех компонентах. Это
 * сознательный компромисс: русские страницы рендерятся ровно как раньше, ни одна
 * из них не обязана ничего передавать. Обратная сторона — английская страница,
 * забывшая передать lang, молча отрендерится по-русски. Ловится тестами
 * tests/e2e/en.spec.ts, которые проверяют английские строки на /en/.
 */
export const locales = ['ru', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ru';

export const ui = {
  ru: {
    htmlLang: 'ru',
    casesNav: 'Кейсы',
    casesHeading: 'Кейсы',
    backToCases: '← Все кейсы',
    myRole: 'Моя роль',
    outcome: 'Результат',
    prevCase: '← Предыдущий кейс',
    nextCase: 'Следующий кейс →',
    cvLong: 'Резюме, PDF',
    cvShort: 'Резюме',
    themeToggle: 'Переключить тему',
    lightboxFallback: 'Изображение из кейса',
    lightboxClose: 'Закрыть',
    switchTo: 'Switch to English',
    notFoundTitle: 'Страница не найдена',
    notFoundDescription: 'Такой страницы на сайте нет. Возможно, ссылка устарела.',
    notFoundText: 'Такой страницы нет. Возможно, ссылка устарела.',
    notFoundHome: 'На главную',
  },
  en: {
    htmlLang: 'en',
    casesNav: 'Case studies',
    casesHeading: 'Case studies',
    backToCases: '← All case studies',
    myRole: 'My role',
    outcome: 'Outcome',
    prevCase: '← Previous case',
    nextCase: 'Next case →',
    cvLong: 'Resume, PDF',
    cvShort: 'Resume',
    themeToggle: 'Toggle theme',
    lightboxFallback: 'Image from the case study',
    lightboxClose: 'Close',
    switchTo: 'Смотреть на русском',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'There is no such page. The link may be out of date.',
    notFoundText: 'There is no such page. The link may be out of date.',
    notFoundHome: 'Go to homepage',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export function t(lang: Locale) {
  return ui[lang];
}

/**
 * Единственное место, знающее про префикс /en/. Путь передаётся от корня сайта
 * («/», «/case/foo/»), base добавляет withBase() поверх — разделение то же, что и
 * у остальных внутренних ссылок.
 */
export function localePath(lang: Locale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return lang === defaultLocale ? normalized : `/${lang}${normalized}`;
}

/** Тот же путь на другом языке — для переключателя и для hreflang. */
export function otherLocale(lang: Locale): Locale {
  return lang === 'ru' ? 'en' : 'ru';
}
