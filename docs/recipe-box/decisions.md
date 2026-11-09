# Decision log

Update whenever a decision changes; add a line to the change history. If an Open decision blocks you, use its default, record the assumption in your PR, and keep going.

| ID | Decision | Status | Default if still unanswered |
| --- | --- | --- | --- |
| D1 | Web app first, installable, no app-store apps in v1 | Decided | n/a |
| D2 | Front-on Box View in v1; perspective Fan later | Decided | n/a |
| D3 | Vite + React single-page app, edge-rendered share pages | Proposed | Use it |
| D4 | Supabase backend, Cloudflare Pages hosting | Proposed | Use them |
| D5 | Anonymous sign-in from first launch | Proposed | Use it |
| D6 | Sharing: link and save-to-my-box first; feeds only after moderation tools | Proposed | Build link and save; feeds behind a flag, off |
| D7 | Cloud fallbacks (LLM, cloud OCR, server transcription) | Open | Build the interfaces, leave the providers disabled |
| D8 | Monetization | Open | No payments; everything free |
| D9 | Full social features (follow, comment) vs shared collections | Open | Neither until feeds are scheduled |
| D10 | Tablet-specific layout | Open | None; desktop shows a centered box |
| D11 | Product name and branding | Open | Use “Recipe Box” as a placeholder string in one constants file |

## Change history
- 2026-10-14: initial log from the planning documents.
