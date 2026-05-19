import { useState, useEffect, useRef } from 'react';

interface CodeViewProps {
  code: string;
  isStreaming?: boolean;
}

type CopyState = 'idle' | 'copied' | 'error';

export function CodeView({ code, isStreaming = false }: CodeViewProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (isStreaming && preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [code, isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  const copyLabel = copyState === 'copied' ? '복사됨!' : copyState === 'error' ? '복사 실패' : '복사';

  return (
    <div className="code-panel">
      <div className="panel-header">
        <h3>
          코드
          {isStreaming && <span className="streaming-badge">생성 중</span>}
        </h3>
        <button
          className="btn-copy"
          onClick={handleCopy}
          disabled={isStreaming}
          title={isStreaming ? '생성 완료 후 복사 가능합니다' : undefined}
        >
          {copyLabel}
        </button>
      </div>
      <pre ref={preRef} className="code-block">
        <code>{code}</code>
        {isStreaming && <span className="streaming-cursor" aria-hidden="true" />}
      </pre>
    </div>
  );
}
