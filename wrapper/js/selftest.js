// wrapper.js
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const minimist = require("minimist");

const tests = [];

// --- manual selftest
function selftest(name, fn) {
  tests.push({ name, code: fn.toString().replace(/^[^{]+{|}$/g, "") });
}

// --- auto discovery (scan file/folder JS)
function autoDiscover(dir) {
  const discovered = [];
  const stat = fs.statSync(dir);

  let files = [];
  if (stat.isFile()) {
    files.push(dir);
  } else if (stat.isDirectory()) {
    files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".js"))
      .map((f) => path.join(dir, f));
  }

  for (const f of files) {
    const code = fs.readFileSync(f, "utf8");

    // cari function declaration
    const matches = code.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(/g);
    for (const m of matches) {
      const fnName = m[1];
      discovered.push({
        name: `Auto: ${fnName}() should not throw`,
        code: `
          if (typeof ${fnName} === "function") {
            ${fnName}();
            expect(true).toBeTruthy();
          } else {
            throw new Error("${fnName} is not a function");
          }
        `,
      });
    }

    // cari export const xyz = () => {}
    const arrowMatches = code.matchAll(/const\s+([a-zA-Z0-9_]+)\s*=\s*\(/g);
    for (const m of arrowMatches) {
      const fnName = m[1];
      discovered.push({
        name: `Auto: ${fnName}() should not throw`,
        code: `
          if (typeof ${fnName} === "function") {
            ${fnName}();
            expect(true).toBeTruthy();
          } else {
            throw new Error("${fnName} is not a function");
          }
        `,
      });
    }
  }

  return discovered;
}

// --- run tests (manual + auto)
function run({ dev = true, keepCache = false, autoDir = null } = {}) {
  const cacheDir = path.join(process.cwd(), ".cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  let allTests = tests;
  if (autoDir) {
    const autoTests = autoDiscover(autoDir);
    allTests = allTests.concat(autoTests);
  }

  const tmpFile = path.join(cacheDir, `tests-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(allTests, null, 2));

  const resultFile = path.join(cacheDir, `result-${Date.now()}.json`);

  const args = [tmpFile];
  if (dev) args.push("--dev");
  args.push("--json", resultFile);

  spawnSync("node", ["core.cjs", ...args], { stdio: "inherit" });

  const result = JSON.parse(fs.readFileSync(resultFile, "utf8"));

  if (!keepCache) {
    fs.unlinkSync(tmpFile);
    fs.unlinkSync(resultFile);
  }

  return result;
}

module.exports = { selftest, run, autoDiscover };

// --- CLI entry
if (require.main === module) {
  const argv = minimist(process.argv.slice(2));
  const result = run({
    dev: argv.dev || false,
    autoDir: argv.autoDir || null,
    keepCache: argv.keepCache || false,
  });

  console.log(JSON.stringify(result, null, 2));
}
