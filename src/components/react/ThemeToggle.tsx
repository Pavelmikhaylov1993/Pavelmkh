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

  // size-11 перебивает size-9 из варианта icon: кнопка живёт в шапке, а AC-15
  // требует целевую область не меньше 44×44 на мобильном.
  return (
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
