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
