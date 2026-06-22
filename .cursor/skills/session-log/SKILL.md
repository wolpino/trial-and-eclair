---
name: session-log
description: >-
  Writes session summaries to .cursor/session_log.mdc and trivial Q&A to
  .cursor/qa_log.mdc (newest first, UTC timestamps). Reads recent session_log
  entries at session start. Use when wrapping up, on "log this", at task
  completion, after trivial one-off questions, or when a stop/sessionEnd hook fires.
---

# Session Log

Maintain two prepend-only logs. Newest entry first. Write for Ari (engineer) and the next agent (structured, scannable context).

| File | Purpose |
|------|---------|
| `.cursor/session_log.mdc` | Substantive sessions — continuity for future agents |
| `.cursor/qa_log.mdc` | Trivial one-off Q&A — reference archive, not loaded at session start |

Timestamps: **UTC ISO 8601** — `YYYY-MM-DDTHH:MM:SSZ` (e.g. `2026-06-19T17:15:00Z`).

## When to read

At **session start**, if the user has not given a fully self-contained task:

1. Read `.cursor/session_log.mdc` if it exists.
2. Scan only the **top 3 entries** unless the user asks for full history or the task clearly depends on older context.
3. Do **not** load `.cursor/qa_log.mdc` unless the user asks about past Q&A.
4. Briefly acknowledge relevant prior decisions or open threads — do not recite the whole log.

## When to write — session log

Write to `.cursor/session_log.mdc` when any of these are true:

- The user signals wrap-up ("thanks", "that's all", "log this", etc.)
- A meaningful task completed (code written, design decided, bug fixed, plan produced)
- The session lasted multiple turns with substantive work
- Open questions or blockers remain that a future session should inherit
- A `stop` or `sessionEnd` hook fires

## When to write — Q&A log

Write to `.cursor/qa_log.mdc` when the session is **trivial one-off Q&A** with no project impact:

- General programming questions ("what does `grep` do?")
- Quick conceptual answers with no repo changes
- Tooling or Cursor usage questions unrelated to this codebase
- Single-turn lookups that do not affect project decisions

If a session mixes both (e.g. quick question then real implementation), log substantive work to `session_log.mdc` only. Optionally cross-reference: `See also: qa_log entry 2026-06-19T17:15:00Z`.

When unsure which log applies, prefer `session_log.mdc` if anything touched the repo or changed a decision.

## Prepend workflow

1. Decide: `session_log.mdc` or `qa_log.mdc` (see criteria above)
2. Read the target file (create with header if missing)
3. Draft the entry from the appropriate template
4. Insert **immediately after** the header's closing `---`
5. Preserve all older entries below unchanged
6. Confirm in one line which file was updated

Do not ask permission to log unless the user has previously said they do not want session logging.

## Session log header (first-time setup)

```markdown
---
description: Chronological agent session history (newest first). Read top entries for continuity; do not treat as auto-applied rules.
---

# Session Log

Prepended entries from Cursor agent sessions. **Newest at top.**

For agents: read the top 1–3 entries at session start. Parse `AGENT_CONTEXT` HTML comments for structured fields.

---
```

## Session entry template

```markdown
---

## YYYY-MM-DD · {short-title}

| Field | Value |
|-------|-------|
| **Session** | `YYYY-MM-DDTHH:MM:SSZ` |
| **Project** | trial-and-eclair |
| **Mode** | Agent / Ask / Plan |
| **Outcome** | completed · partial · blocked · exploratory |

### Intent
{1–2 sentences: what the user wanted}

### Summary
{3–6 sentences for Ari: narrative of what happened, written in past tense}

### Decisions
- **{decision}** — {brief rationale}

### Changes
- `{path}` — {what changed}

### Open threads
- {unfinished work, blockers, or explicit next steps}

<!-- AGENT_CONTEXT_START -->
**Keywords:** {comma-separated terms for search/recall}
**Files:** {comma-separated paths touched or discussed}
**Do not redo:** {decisions already made; approaches already rejected}
**Resume with:** {single best next action for the next session}
<!-- AGENT_CONTEXT_END -->
```

**Title**: date of session end + kebab-case slug (max ~6 words).

## Q&A log header (first-time setup)

```markdown
---
description: Lightweight log of trivial one-off Q&A (newest first). Reference only — not for session continuity.
---

# Q&A Log

Short questions and answers with no project impact. **Newest at top.**

---
```

## Q&A entry template

```markdown
---

### `YYYY-MM-DDTHH:MM:SSZ` · {short-question-slug}

**Question:** {user's question, verbatim or paraphrased}
**Answer:** {1–3 sentence answer}
**Tags:** {optional comma-separated keywords}
```

Keep Q&A entries short — no `AGENT_CONTEXT` block.

## Quality bar

- **Summary** answers: What did we do? What changed? What's left?
- **Decisions** only includes choices that constrain future work
- **Open threads** is the handoff — be specific, not vague
- Keep each session entry under ~40 lines
