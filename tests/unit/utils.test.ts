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
