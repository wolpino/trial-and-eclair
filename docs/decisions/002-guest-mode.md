# 002: Guest mode before sign-up

Date: 2026-10-15. Status: decided. The numbers below are starting values.

## Context

Today every API call needs a session from `register/` or `login/` (`accounts/views.py`). The Recipe Box spec wanted an anonymous account on first launch (D5, R17-AC1). People should be able to use the box and see that a developer tier exists before they make an account. Two rules limit how: no custom auth (`.cursor/rules/sesc-dev-ssdld-appsec.mdc`), and the walkthrough seed must never be loaded on a public URL (`README.md`).

## Options

1. Sign up before anything (today).
2. A guest account with a time limit.
3. A guest account with a card limit.

## Decision

**Option 3.** A time limit was rejected because a guest who loses their cookie loses their cards anyway, and a card limit gives a clear moment to ask them to sign up.

**Guest account**
- A guest is a normal Django `User` with a guest flag and no usable password, in the home-cook role. Signing up sets a username and password on the same user, so their cards stay.
- The guest is created on the first action that saves something (Add card, an import, Save to box), not on page load. That way crawlers and bots that only load pages don't create accounts.

**Card limit**
- 5 box cards per guest.
- At the limit, guests can still open, edit and delete their cards. Add card, URL import, scan import and Save to box show a sign-up card instead. Deleting a card frees a slot.
- The API enforces the limit on every path that creates a card, not only the UI.

**Developer preview**
- Guests see a locked, non-interactive preview of the notebook, cork board and cookbooks, with "Start a 14-day trial".
- The trial needs a real account (`POST /auth/start-trial/` stays sign-in only). Guests can't rework a recipe into the lab.

**Starter recipes**
- A new fixture of a few starter box cards (recipe content only: no users, no passwords) is copied into each new account. Because it creates no users, it's safe on a public URL. It's separate from the walkthrough seed and from `load_recipe_seed`.
- The owner picks the starter recipes and can change them later. The first version ships with placeholders.

**Cleanup**
- A management command deletes guest accounts with no activity for 30 days, along with their cards and uploaded files. It runs daily on a schedule.
- The app tells guests about this before their first save and in the sign-up prompt.

**Abuse prevention**
- DRF throttles (none exist today, `config/settings.py`): guest creation, register and login per IP; URL import and scan import per user, with tighter rates for guests.
- An upload size cap and allowed file types for scan import (today only extracted text is capped, `library/scan.py`).
- Guests can't start a trial, rework a recipe, or change profile settings.
- Session rotation on sign-up, which Django's `login()` already does.
- No CAPTCHA for now, because it would add a third-party dependency. Revisit if throttles aren't enough.

## Consequences

- `accounts/` gains a guest flag, a guest-create path and an upgrade path. The sign-up endpoint changes.
- The card-creating endpoints in `collection/`, `library/` and `development/public_views.py` share one limit check.
- A new starter-recipes fixture and a copy step on account creation.
- A scheduled cleanup job on Render.

## Open

- Do starter cards count toward the 5-card limit? Default: no. Only cards the guest adds count.
- Do guests get the starter cards, or only people who sign up? Default: guests too, so the box isn't empty on first use. Before the first save, the app shows them read-only from a public endpoint. They're copied into the account when the guest is created.

## Revisit when

- Throttle logs show abuse, or sign-up rates show the limit is too tight or too loose.
