---
name: create-pr
description: Git 변경사항을 분석하여 리뷰어 친화적인 PR 설명을 생성하고 GitHub PR을 생성한다. "PR 만들어줘", "PR 생성해줘", "풀리퀘 올려줘", "/create-pr" 호출 시 반드시 실행하라.
allowed-tools: Read Glob Grep Bash
---

# Goal

Generate concise, high-quality PR descriptions from repository changes.

Use `references/` for optional context files to reduce token usage.
Only read reference files when necessary.

# Workflow

## 1. Inspect changes with lightweight commands first

```bash
git diff --stat HEAD~1
git diff --name-only HEAD~1
git log --oneline -5
```

Read only required files:
- changed files (when content context is needed)
- nearby docs if needed
- skill-relative `references/pr-template.md` for the output structure

Do NOT preload the entire repository or all reference files.

## 2. Analyze

- what changed
- why it changed (from commit messages and code)
- user-facing impact
- risks
- testing scope

## 3. Generate PR body

Use the exact structure from `references/pr-template.md` (relative to this skill file).

## 4. Create PR

Run:
```bash
gh pr create --title "<concise title>" --body "$(cat <<'EOF'
<generated PR body>
EOF
)"
```

# Rules

- Optimize for reviewer readability
- Prefer concise bullet points
- Group related changes together
- Explicitly mention:
  - breaking changes
  - API/schema/env changes
  - migrations
  - dependency updates
  - auth/permission logic

If refactor-only:
- state that no intended behavior change exists

Do NOT:
- invent intent
- speculate
- dump raw commit logs
- include unnecessary implementation detail

Only infer information supported by:
- code changes
- comments
- commit messages
- documentation
