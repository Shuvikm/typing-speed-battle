import {
  calculateWPM,
  calculateAccuracy,
  getRankTitle,
  calculateCombo,
  checkChar,
} from './utils/gameLogic';

// ─── calculateWPM ────────────────────────────────────────────────────────────
describe('calculateWPM', () => {
  test('returns 0 when timeInSeconds is 0', () => {
    expect(calculateWPM(100, 0)).toBe(0);
  });

  test('calculates WPM correctly for known values', () => {
    // 100 correct chars / 5 = 20 words, over 1 minute → 20 WPM
    expect(calculateWPM(100, 60)).toBe(20);
  });

  test('returns 0 for 0 correct chars', () => {
    expect(calculateWPM(0, 60)).toBe(0);
  });

  test('rounds result to nearest integer', () => {
    // 55 chars / 5 = 11 words, over 60s = 11 WPM
    expect(typeof calculateWPM(55, 60)).toBe('number');
    expect(Number.isInteger(calculateWPM(55, 60))).toBe(true);
  });
});

// ─── calculateAccuracy ───────────────────────────────────────────────────────
describe('calculateAccuracy', () => {
  test('returns 100 when totalChars is 0', () => {
    expect(calculateAccuracy(0, 0)).toBe(100);
  });

  test('returns 100 for perfect accuracy', () => {
    expect(calculateAccuracy(50, 50)).toBe(100);
  });

  test('returns 0 for zero correct chars', () => {
    expect(calculateAccuracy(0, 50)).toBe(0);
  });

  test('calculates partial accuracy correctly', () => {
    expect(calculateAccuracy(75, 100)).toBe(75);
  });

  test('rounds to nearest integer', () => {
    expect(Number.isInteger(calculateAccuracy(1, 3))).toBe(true);
  });
});

// ─── getRankTitle ────────────────────────────────────────────────────────────
describe('getRankTitle', () => {
  test('returns Pirate King for WPM >= 100', () => {
    expect(getRankTitle(100).title).toBe('Pirate King');
    expect(getRankTitle(150).title).toBe('Pirate King');
  });

  test('returns Yonko for WPM 80-99', () => {
    expect(getRankTitle(80).title).toBe('Yonko');
    expect(getRankTitle(99).title).toBe('Yonko');
  });

  test('returns Super Rookie for WPM 60-79', () => {
    expect(getRankTitle(60).title).toBe('Super Rookie');
    expect(getRankTitle(79).title).toBe('Super Rookie');
  });

  test('returns Pirate Captain for WPM 40-59', () => {
    expect(getRankTitle(40).title).toBe('Pirate Captain');
    expect(getRankTitle(59).title).toBe('Pirate Captain');
  });

  test('returns Marine Captain for WPM 20-39', () => {
    expect(getRankTitle(20).title).toBe('Marine Captain');
    expect(getRankTitle(39).title).toBe('Marine Captain');
  });

  test('returns Cabin Boy for WPM below 20', () => {
    expect(getRankTitle(0).title).toBe('Cabin Boy');
    expect(getRankTitle(19).title).toBe('Cabin Boy');
  });
});

// ─── calculateCombo ──────────────────────────────────────────────────────────
describe('calculateCombo', () => {
  test('returns 0 for streaks below 10', () => {
    expect(calculateCombo(0)).toBe(0);
    expect(calculateCombo(9)).toBe(0);
  });

  test('returns 1 for exactly 10 correct chars', () => {
    expect(calculateCombo(10)).toBe(1);
  });

  test('increments every 10 chars', () => {
    expect(calculateCombo(20)).toBe(2);
    expect(calculateCombo(50)).toBe(5);
    expect(calculateCombo(100)).toBe(10);
  });
});

// ─── checkChar ───────────────────────────────────────────────────────────────
describe('checkChar', () => {
  test('returns true for matching characters', () => {
    expect(checkChar('a', 'a')).toBe(true);
  });

  test('returns false for non-matching characters', () => {
    expect(checkChar('a', 'b')).toBe(false);
  });

  test('is case-sensitive', () => {
    expect(checkChar('A', 'a')).toBe(false);
  });

  test('handles space characters', () => {
    expect(checkChar(' ', ' ')).toBe(true);
    expect(checkChar(' ', 'x')).toBe(false);
  });
});
