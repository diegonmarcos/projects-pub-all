#!/usr/bin/env node
// Every top-level folder is a deployable project. The deploy list is the PROJECTS_JSON block (the last block of
// .github/workflows/ship.yml); this script finds root folders missing from it and scaffolds their entry.
//   node .githooks/register-projects.js [root]             append missing folders to PROJECTS_JSON, print the added names
//   node .githooks/register-projects.js [root] --dry-run   print what would be added, write nothing
//   node .githooks/register-projects.js [root] --list      print the effective deploy list (declared + discovered) as JSON
// Idempotent: a folder already in the block is never touched; declared entries keep their dist. Exit 0 always (1: no block).
// Entry for a new folder: {name, dist: "<name>/dist"} when it has dist/, else {name, dist: "<name>"} when it has an index.html at
// its root (a plain static site), else nothing to deploy yet (skipped, reported with --dry-run on stderr).
// Skipped roots: dot/underscore folders, 0_*/1_* (repo infrastructure), node_modules, scripts, docs.
const fs = require("fs"), path = require("path");
const args = process.argv.slice(2), flags = new Set(args.filter(a => a.startsWith("--")));
const root = args.find(a => !a.startsWith("--")) || process.cwd();
const wf = path.join(root, ".github/workflows/ship.yml");
const SKIP = /^([._]|[01]_)|^(node_modules|scripts|docs)$/;

function scan() {
  const lines = fs.readFileSync(wf, "utf8").split("\n");
  const at = lines.findIndex(l => /^\s*PROJECTS_JSON:\s*\|\s*$/.test(l));
  if (at < 0) { console.error("PROJECTS_JSON block not found"); process.exit(1); }
  const ind = (lines[at].match(/^\s*/)[0]) + "  ";
  const list = JSON.parse(lines.slice(at + 1).join("\n"));
  const known = new Set(list.map(p => p.name));
  const found = [], skipped = [];
  for (const d of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!d.isDirectory() || SKIP.test(d.name) || known.has(d.name)) continue;
    const dir = path.join(root, d.name);
    if (fs.existsSync(path.join(dir, "dist"))) found.push({ name: d.name, dist: `${d.name}/dist` });
    else if (fs.existsSync(path.join(dir, "index.html"))) found.push({ name: d.name, dist: d.name });
    else skipped.push(d.name);
  }
  return { lines, at, ind, list, found, skipped };
}

const s = scan();
if (flags.has("--list")) { console.log(JSON.stringify([...s.list, ...s.found])); process.exit(0); }
if (flags.has("--dry-run")) {
  if (s.skipped.length) console.error(`nothing to deploy yet (no dist/ or index.html): ${s.skipped.join(" ")}`);
  console.log(s.found.map(p => p.name).join(" "));
  process.exit(0);
}
if (!s.found.length) process.exit(0);
const all = [...s.list, ...s.found];
const body = [s.ind + "[", all.map(p => `${s.ind}  ${JSON.stringify(p).replace(/","/g, '", "').replace(/":"/g, '": "')}`).join(",\n"), `${s.ind}]`];
fs.writeFileSync(wf, s.lines.slice(0, s.at + 1).concat(body).join("\n") + "\n");
console.log(s.found.map(p => p.name).join(" "));
