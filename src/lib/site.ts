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
