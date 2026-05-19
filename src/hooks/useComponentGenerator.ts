import { useState, useCallback, useEffect } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { stripCodeFences, ensureRenderCall } from '../utils/codeTransform';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

function parseSSELine(line: string): Record<string, unknown> | null {
  if (!line.startsWith('data: ')) return null;
  try {
    return JSON.parse(line.slice(6)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(components);
  }, [components]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    setComponents((prev) => [
      { id, prompt, code: '', createdAt: new Date(), isStreaming: true },
      ...prev,
    ]);

    let accumulatedCode = '';

    try {
      const res = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok) {
        const errData: unknown = await res.json();
        const message =
          errData !== null &&
          typeof errData === 'object' &&
          'error' in errData &&
          typeof (errData as Record<string, unknown>).error === 'string'
            ? (errData as Record<string, unknown>).error as string
            : 'Failed to start generation';
        throw new Error(message);
      }

      setIsLoading(false);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop()!;

        for (const line of lines) {
          const event = parseSSELine(line.trim());
          if (!event) continue;

          if (event.type === 'chunk' && typeof event.text === 'string') {
            accumulatedCode += event.text;
          } else if (event.type === 'done') {
            const finalCode = ensureRenderCall(stripCodeFences(accumulatedCode));
            setComponents((prev) =>
              prev.map((c) =>
                c.id === id ? { ...c, code: finalCode, isStreaming: false } : c
              )
            );
          } else if (event.type === 'error' && typeof event.message === 'string') {
            throw new Error(event.message);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setComponents((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setIsLoading(false);
      // done 이벤트 없이 스트림이 끊긴 경우 isStreaming 정리
      setComponents((prev) =>
        prev.map((c) => (c.id === id && c.isStreaming ? { ...c, isStreaming: false } : c))
      );
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
