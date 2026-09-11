# partytype

A terminal typing game, typeracer-style: solo practice plus multiplayer
"party" races against friends, played entirely in the terminal.

## Repo layout

- `tui/` — the active client. Ink (React for terminals) + TypeScript, run on
  Bun. Ships as a single compiled binary and owns the only database in the
  system: a bundled SQLite file for local player stats, plus JSON word/quote
  content loaded straight from disk.
- `backend/` — FastAPI server. A stateless in-memory relay/coordinator for
  multiplayer room state — no database, no persistence. Race text is
  generated client-side by the host and relayed as-is.
- `frontend/` — a Vite web-React client. Deprecated, superseded by `tui/`.

See `ROADMAP.md` and `CLAUDE.md` for the implementation plan and locked
design decisions.

## Dev commands

**TUI** (`tui/`, run with Bun):
```
bun run dev        # bun --watch src/cli.tsx
bun run start      # bun run src/cli.tsx
bun run typecheck  # tsc --noEmit
```

**Backend** (`backend/`, run from `backend/` with a venv active):
```
uvicorn app.main:app --reload
pytest
```

## License

GPL-3.0. See `LICENSE`.

partytype is licensed GPL-3.0 specifically so it can incorporate word list
and quote content from [MonkeyType](https://github.com/monkeytypegame/monkeytype),
which is itself GPL-3.0.

## Attribution

Word lists and quotes (`tui/src/db/seed/languages/`, `tui/src/db/seed/quotes/`)
are sourced from [monkeytypegame/monkeytype](https://github.com/monkeytypegame/monkeytype),
licensed GPL-3.0. Quotes longer than ~300 characters have been filtered out
of the bundled copy.
