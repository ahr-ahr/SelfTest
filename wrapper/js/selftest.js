const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const tests = [];
function selftest(name, fn) {
  tests.push({ name, code: fn.toString().replace(/^[^{]+{|}$/g, "") });
}

function run({ dev = true, keepCache = false } = {}) {
  const cacheDir = path.join(process.cwd(), ".cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  const tmpFile = path.join(cacheDir, `tests-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify(tests, null, 2));

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

module.exports = { selftest, run };
