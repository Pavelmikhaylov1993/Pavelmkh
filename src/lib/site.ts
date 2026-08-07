import type { Locale } from '@/lib/i18n';

export const site = {
  contacts: [
    { href: 'https://t.me/Pavelmkh', label: { ru: 'Телеграм', en: 'Telegram' } },
    {
      href: 'https://www.linkedin.com/in/pavel-mikhaylov93/',
      label: { ru: 'LinkedIn', en: 'LinkedIn' },
    },
    { href: 'https://www.behance.net/pavelm1993e4f6', label: { ru: 'Behance', en: 'Behance' } },
  ],

  // Английского резюме пока нет. Пока здесь null, кнопка «Resume, PDF» на /en/ не
  // рендерится вовсе — это лучше, чем вести англоязычного человека на русский PDF.
  // Появится файл — достаточно вписать сюда его имя, вёрстку править не нужно.
  cvFile: {
    ru: 'Pavel_Mikhaylov_CV.pdf',
    en: null,
  },

  profile: {
    ru: {
      name: 'Павел Михайлов',
      role: 'Senior Product Designer',
      bio:
        'Senior Product Designer с 5+ годами опыта в B2B и B2C продуктах. Разрабатываю решения ' +
        'для монетизации, CRM, маркетплейсов и EdTech. Проектирую продукты на основе исследований, ' +
        'продуктовых метрик и экспериментов, тесно работая с PM, аналитиками и разработчиками. ' +
        'Работаю с Claude: анализирую исследования и интервью, прорабатываю тексты интерфейсов, ' +
        'собираю рабочие прототипы кодом.',
      // Отдельная короткая строка под meta description и og:description. Обрезать bio нельзя:
      // 261 символ не влезает в сниппет, а срез по символу рвёт фразу на середине слова.
      description:
        'Senior Product Designer. B2B и B2C продукты: монетизация, CRM, маркетплейсы, EdTech. ' +
        'Проектирую на основе исследований и продуктовых метрик.',
    },
    en: {
      name: 'Pavel Mikhaylov',
      role: 'Senior Product Designer',
      bio:
        'Senior Product Designer with 5+ years in B2B and B2C products. I build solutions for ' +
        'monetization, CRM, marketplaces and EdTech, designing from research, product metrics ' +
        'and experiments in close work with PMs, analysts and engineers. I work with Claude: ' +
        'analyzing research and interviews, shaping interface copy, building working prototypes ' +
        'in code.',
      description:
        'Senior Product Designer. B2B and B2C products: monetization, CRM, marketplaces, EdTech. ' +
        'I design from research and product metrics.',
    },
  },
} as const;

export function profile(lang: Locale) {
  return site.profile[lang];
}
