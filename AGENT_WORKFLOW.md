# Multi-Agent Git Workflow (Codex + Claude)

This is the standard workflow for running two coding agents in parallel with minimal conflicts.

## 1) Use separate worktrees

- Codex workspace: `/Users/akbar/Desktop/promptvault-codex`
- Claude workspace: `/Users/akbar/Desktop/promptvault-claude`
- Main/integration workspace: `/Users/akbar/Desktop/promptvault`

Never run both agents in the same directory.

## 2) Branch strategy (common pro setup)

- Keep `main` stable and always synced to `origin/main`.
- Each task gets a short-lived feature branch from `origin/main`.
- Naming convention:
  - Codex: `codex/<task-slug>`
  - Claude: `claude/<task-slug>`

Example:

```bash
cd /Users/akbar/Desktop/promptvault-codex
git fetch origin
git switch -c codex/fix-auth-redirect origin/main
```

```bash
cd /Users/akbar/Desktop/promptvault-claude
git fetch origin
git switch -c claude/improve-feed-cards origin/main
```

## 3) Before each push

Run this every time to reduce merge pain:

```bash
git fetch origin
git rebase origin/main
npm run lint
git push -u origin <branch-name>
```

## 4) Integration rule

- Do not have both agents push directly to `main`.
- Open PRs from each feature branch into `main`.
- Merge one PR at a time.
- After each merge, both agents run:

```bash
git fetch origin
git rebase origin/main
```

## 5) If both agents touch same file

- Prefer splitting ownership by area before starting:
  - Example: one agent handles `src/app/*`, the other `src/components/*`.
- If overlap happens:
  - Merge one branch first.
  - Rebase the other branch on updated `origin/main`.
  - Resolve conflict once, then continue.

## 6) Quick status commands

```bash
git -C /Users/akbar/Desktop/promptvault worktree list
git -C /Users/akbar/Desktop/promptvault-codex status --short --branch
git -C /Users/akbar/Desktop/promptvault-claude status --short --branch
```

## 7) Message to give Claude agent

Copy and send this:

```text
Use only /Users/akbar/Desktop/promptvault-claude for your work.
Never edit /Users/akbar/Desktop/promptvault or /Users/akbar/Desktop/promptvault-codex.
For each task, create a branch from origin/main named claude/<task-slug>.
Before pushing: git fetch origin && git rebase origin/main && npm run lint.
Push only your feature branch. Do not push directly to main.
```
