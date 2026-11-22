# Personal site: notes for agents

Read Popfold's `AGENTS.md` (`node_modules/popfold/AGENTS.md`) first. This file adds what is specific to this site.

**Popfold** is installed from npm (`npm:@popfold/engine@<version>` in `package.json`) into
`node_modules/popfold`: never edit it there. When this site needs a change in the engine, make it in a Popfold
checkout of its own (a worktree on a branch from `origin/main`) and link the site to it while you work
(`"popfold": "link:<that folder>"`, never committed). `node_modules/popfold/docs/releasing.md` has the steps:
branch, change, prove it here, pull request, release, then `pnpm exec popfold update` to pin the release.

- **What it is:** a resume as a tower: one floor per skill set. The floors, beats and pieces are data in
  `src/home.json`; `src/tower.ts` builds each kind of piece; the stories stay in `src/stories.ts` (with notes on
  what may be named, which a JSON file could not keep).
  Home `personal-tower`.
- **Never on the site:** figures about an employer's environment (estate sizes, record counts, match rates),
  internal instance names, URLs, hostnames or service accounts. The owner's own delivery figures are fine.
- **Naming an employer or a project** needs the owner's say-so each time. When unsure, keep it generic.
- **Do not invent** roles, dates, clients or results. Every claim comes from the owner.
- **Floors and sections match by id:** a floor `lab` needs `<section class="stage" id="lab">` in `index.html`.
- **Dev server:** port 5181.
