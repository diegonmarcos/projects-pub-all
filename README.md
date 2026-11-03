# projects-pub-all

Public front projects, deployed to GitHub Pages at `https://diegonmarcos.github.io/projects-pub-all/<name-site>/`.

- One project per folder: `{name-site}/dist/` (committed build output).
- CI: `.github/workflows/ship.yml` (same Pages pipeline as the other front repos). Its deploy list is the `PROJECTS_JSON` block at the end of the file.
- Run `sh setup.sh` once per clone: the `post-commit` hook appends new top-level project folders to that block and commits the change.
- Example: `hello-site/`.
