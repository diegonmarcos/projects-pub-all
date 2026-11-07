# projects-pub-all

Public front projects, deployed to GitHub Pages at `https://diegonmarcos.github.io/projects-pub-all/<name>/`.

## Convention: add a root folder, push, it auto-deploys

Every top-level folder is a deployable project. Nothing to configure:

1. Create `<name>/dist/` (committed build output), or a plain static site with `<name>/index.html`.
2. Commit and push to main.
3. `.github/workflows/ship.yml` runs `node .githooks/register-projects.js --list` on every push. The list is the `PROJECTS_JSON` block (declared entries, which are never overwritten) plus every root folder not yet in it, and each is copied to `_site/<name>/`.

Skipped roots: dot and underscore folders, `0_*`, `1_*`, `node_modules`, `scripts`, `docs`, and folders with neither `dist/` nor `index.html` (nothing to deploy yet).

The deploy target is the same Pages pipeline as the other front repos (configure-pages, upload-pages-artifact, deploy-pages), not an overlay onto diegonmarcos.github.io.

## Tools (Node only)

- `node .githooks/register-projects.js --dry-run`: print the folders that would be added, write nothing.
- `node .githooks/register-projects.js --list`: print the effective deploy list as JSON.
- `node .githooks/register-projects.js`: write the missing entries into the `PROJECTS_JSON` block (what the local hook does).
- `node .githooks/register-projects.test.js`: self-test on a temp repo; it also runs in CI before every deploy.
- Optional: `sh setup.sh` once per clone installs the `post-commit` hook that writes the block entry for you. CI does not need it.

Example: `hello-site/`.
