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
  return render(<Lightbox fallbackTitle="Изображение из кейса" closeLabel="Закрыть" />, {
    container: document.getElementById('island')!,
  });
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
