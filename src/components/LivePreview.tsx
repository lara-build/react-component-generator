import { useState } from 'react';
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORTS: { id: Viewport; label: string; width: string }[] = [
  { id: 'mobile', label: '모바일', width: '375px' },
  { id: 'tablet', label: '태블릿', width: '768px' },
  { id: 'desktop', label: '데스크탑', width: '100%' },
];

interface LivePreviewProps {
  code: string;
}

export function LivePreview({ code }: LivePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const currentWidth = VIEWPORTS.find((v) => v.id === viewport)!.width;

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
        <div className="viewport-controls">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              className={`viewport-btn ${viewport === v.id ? 'viewport-btn--active' : ''}`}
              onClick={() => setViewport(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-viewport-wrapper">
            <div
              className="preview-render"
              style={{ width: currentWidth, maxWidth: '100%' }}
            >
              <ReactLivePreview />
            </div>
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
