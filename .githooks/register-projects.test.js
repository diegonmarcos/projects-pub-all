#!/usr/bin/env node
// Test of register-projects.js on a temp repo: node .githooks/register-projects.test.js
const fs = require("fs"), os = require("os"), path = require("path"), cp = require("child_process"), assert = require("assert");
const gen = path.join(__dirname, "register-projects.js");
const src = fs.readFileSync(path.join(__dirname, "..", ".github/workflows/ship.yml"), "utf8");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rp-"));
const mk = (p, f) => { fs.mkdirSync(path.join(tmp, p), { recursive: true }); if (f) fs.writeFileSync(path.join(tmp, p, f), "x"); };
fs.mkdirSync(path.join(tmp, ".github/workflows"), { recursive: true });
fs.writeFileSync(path.join(tmp, ".github/workflows/ship.yml"), src.replace(/PROJECTS_JSON: \|\n[\s\S]*$/, 'PROJECTS_JSON: |\n    [\n      {"name": "old", "dist": "old/dist"}\n    ]\n'));
mk("old", "a"); mk("old/dist", "index.html");
mk("new-site/dist", "index.html"); mk("plain", "index.html"); mk("empty"); mk("0_infra", "x"); mk(".hidden/dist", "i"); mk("_x/dist", "i");
const run = (...a) => cp.execFileSync("node", [gen, tmp, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
assert.strictEqual(run("--dry-run"), "new-site plain");
assert.ok(fs.readFileSync(path.join(tmp, ".github/workflows/ship.yml"), "utf8").indexOf("new-site") < 0, "dry-run must not write");
assert.deepStrictEqual(JSON.parse(run("--list")).map(p => p.name), ["old", "new-site", "plain"]);
assert.strictEqual(run(), "new-site plain");
assert.strictEqual(run(), "", "second run is a no-op (idempotent)");
const wf = fs.readFileSync(path.join(tmp, ".github/workflows/ship.yml"), "utf8");
assert.ok(wf.includes('{"name": "plain", "dist": "plain"}') && wf.includes('"old", "dist": "old/dist"'));
fs.rmSync(tmp, { recursive: true });
console.log("register-projects: ok");
