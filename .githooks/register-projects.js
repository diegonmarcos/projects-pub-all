#!/usr/bin/env node
// Appends every top-level folder with a dist/ that is missing from the PROJECTS_JSON block
// (the last block of .github/workflows/ship.yml). Prints the added names; exit 0 always.
const fs = require("fs"), path = require("path");
const root = process.argv[2] || process.cwd();
const wf = path.join(root, ".github/workflows/ship.yml");
const lines = fs.readFileSync(wf, "utf8").split("\n");
const at = lines.findIndex(l => /^\s*PROJECTS_JSON:\s*\|\s*$/.test(l));
if (at < 0) { console.error("PROJECTS_JSON block not found"); process.exit(1); }
const ind = (lines[at].match(/^\s*/)[0]) + "  ";
const list = JSON.parse(lines.slice(at + 1).join("\n"));
const known = new Set(list.map(p => p.name));
const added = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory() && !/^[._]/.test(d.name) && !known.has(d.name)
    && fs.existsSync(path.join(root, d.name, "dist")))
  .map(d => d.name).sort();
if (!added.length) process.exit(0);
for (const n of added) list.push({ name: n, dist: `${n}/dist` });
const body = ["[", list.map(p => `${ind}  ${JSON.stringify(p).replace(/","/g, '", "').replace(/":"/g, '": "')}`).join(",\n"), `${ind}]`];
body[0] = ind + "[";
fs.writeFileSync(wf, lines.slice(0, at + 1).concat(body).join("\n") + "\n");
console.log(added.join(" "));
