# TDD Rules — React Component Generator

**이 규칙은 Rigid — 상황에 맞게 변형하지 마라.**

## 프로젝트별 규칙 우선 조항

이 파일은 기본값(fallback)이다. `AGENTS.md` / `src/AGENTS.md` / `server/AGENTS.md`에 TDD 관련 규칙이 있으면 그것이 우선한다.

---

## 적용 기준

### TDD 반드시 적용

- `server/index.ts` — API 프록시 로직, provider 라우팅, 에러 분기
- `src/hooks/` — 훅 상태 전이, 비동기 처리, 사이드이펙트
- 유틸리티 함수 — `resolveApiKey()`, 컴포넌트 ID 생성, 에러 메시지 포맷
- **버그 수정** — 버그 재현 테스트 먼저, 수정 후 통과 확인

### TDD 불필요

- `src/types/` — TypeScript 컴파일러가 검증
- 설정 파일 — `vite.config.ts`, `.env.example`
- react-live 생성 코드 — 렌더링 자체가 기능 검증
- 순수 UI 레이아웃 — `ComponentCard`, `LivePreview` (시각적 확인만)

---

## RED-GREEN-REFACTOR 사이클

### RED

- **하나의 동작 = 하나의 테스트**
- 반드시 실행해서 **실패 확인** (`bun test`)
- 실패 이유가 "기능 미구현"이어야 함. PASS가 나오면 테스트를 더 구체적으로 재작성

```typescript
test('resolveApiKey: 사용자 입력 없을 때 .env 값 반환', () => {
  const key = resolveApiKey('anthropic', null); // 함수 미존재 → RED
  expect(key).toBe(process.env.ANTHROPIC_API_KEY);
});
```

### GREEN

- **테스트를 통과시키는 최소 코드만** 작성 (YAGNI)
- 신규 + 기존 테스트 **모두 통과** 확인
- 과도한 일반화 금지 — REFACTOR 단계에서 처리

```typescript
export function resolveApiKey(provider: string, userKey: string | null): string {
  if (userKey) return userKey;
  return process.env[`${provider.toUpperCase()}_API_KEY`] || '';
}
```

### REFACTOR

- 중복 제거, 이름 개선, 헬퍼 추출
- **Green 상태 유지** (모든 테스트 통과)
- **새 동작 추가 금지** — 필요하면 다음 RED로

### 반복

다음 동작 → RED로 돌아가기

---

## 삭제 강제 규칙

테스트 전에 프로덕션 코드를 먼저 작성했다면:

1. **전부 삭제**
2. RED부터 재시작

"참고용으로 남기겠다"는 **금지**. 기존 코드가 있으면 테스트가 의미 없어진다.

---

## 변명 차단표

| 변명 | 반론 |
|------|------|
| 너무 단순해서 테스트 불필요 | 단순한 코드에도 엣지 케이스 있음 (null, 빈 문자열, 잘못된 provider) |
| 나중에 추가하겠다 | 나중은 없다. 지금 RED부터 시작 |
| 시간이 없다 | 버그 디버깅 비용 > 테스트 작성 시간 |
| 삭제하면 기존 코드 낭비 | 테스트 없는 코드는 이미 신뢰 불가 |
| 프로토타입이다 | 이 프로젝트에 "프로토타입 모드" 없음 |

---

## 테스트 명령어

```bash
bun test           # 전체 실행
bun test --watch   # Watch 모드
bun run lint       # 타입 검사 + ESLint
```
