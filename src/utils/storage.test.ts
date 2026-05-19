import { describe, test, expect, beforeEach } from 'bun:test';
import { loadFromStorage, saveToStorage, STORAGE_KEY } from './storage';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('loadFromStorage', () => {
  beforeEach(() => localStorageMock.clear());

  test('localStorage가 비어있을 때 빈 배열 반환', () => {
    expect(loadFromStorage()).toEqual([]);
  });

  test('저장된 컴포넌트의 createdAt을 Date 객체로 복원', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    localStorageMock.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: '1', prompt: 'test', code: 'render(<div/>)', createdAt: date.toISOString() }])
    );

    const result = loadFromStorage();
    expect(result).toHaveLength(1);
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].createdAt.toISOString()).toBe(date.toISOString());
  });

  test('잘못된 JSON이면 빈 배열 반환', () => {
    localStorageMock.setItem(STORAGE_KEY, 'invalid{{{json');
    expect(loadFromStorage()).toEqual([]);
  });

  test('null 항목이 있는 잘못된 데이터면 빈 배열 반환', () => {
    localStorageMock.setItem(STORAGE_KEY, 'null');
    expect(loadFromStorage()).toEqual([]);
  });
});

describe('saveToStorage', () => {
  beforeEach(() => localStorageMock.clear());

  test('컴포넌트 배열을 localStorage에 저장', () => {
    const components = [{ id: '1', prompt: 'test', code: 'render(<div/>)', createdAt: new Date() }];
    saveToStorage(components);

    const raw = localStorageMock.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('1');
    expect(parsed[0].prompt).toBe('test');
  });

  test('빈 배열 저장 후 loadFromStorage로 복원하면 빈 배열', () => {
    saveToStorage([]);
    expect(loadFromStorage()).toEqual([]);
  });

  test('여러 컴포넌트 순서 그대로 저장', () => {
    const components = [
      { id: 'a', prompt: 'first', code: 'render(<div/>)', createdAt: new Date() },
      { id: 'b', prompt: 'second', code: 'render(<span/>)', createdAt: new Date() },
    ];
    saveToStorage(components);

    const result = loadFromStorage();
    expect(result[0].id).toBe('a');
    expect(result[1].id).toBe('b');
  });
});
