import type { GeneratedComponent } from '../types';

export const STORAGE_KEY = 'rcg-components';

export function loadFromStorage(): GeneratedComponent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c) => ({ ...c, createdAt: new Date(c.createdAt) }));
  } catch {
    return [];
  }
}

export function saveToStorage(components: GeneratedComponent[]): void {
  try {
    const toSave = components.filter((c) => !c.isStreaming);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // 시크릿 모드 또는 용량 초과 시 무시
  }
}
