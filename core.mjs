#!/usr/bin/env node
import fs from "fs";
import path from "path";
import minimist from "minimist";
import chalk from "chalk";
import cliProgress from "cli-progress";

// === auto discover ===
function autoDiscover(dir) {
  const discovered = [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));

  for (const f of files) {
    const code = fs.readFileSync(path.join(dir, f), "utf8");

    // function declaration
    const matches = code.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(/g);
    for (const m of matches) {
      discovered.push({
        name: `Auto: ${m[1]}() should not throw`,
        code: `if (typeof ${m[1]} === "function") { ${m[1]}(); expect(true).toBeTruthy(); }`,
      });
    }

    // const arrow function
    const arrowMatches = code.matchAll(/const\s+([a-zA-Z0-9_]+)\s*=\s*\(/g);
    for (const m of arrowMatches) {
      discovered.push({
        name: `Auto: ${m[1]}() should not throw`,
        code: `if (typeof ${m[1]} === "function") { ${m[1]}(); expect(true).toBeTruthy(); }`,
      });
    }
  }
  return discovered;
}

// === runner ===
export function runCore(argv, directTests = null) {
  const dev = argv.dev || false;
  const autoDir = argv.auto || null;
  const inputFile = argv._[0];
  const outputFile = argv.json || null;

  let tests;
  if (directTests) {
    tests = directTests;
  } else if (autoDir) {
    tests = autoDiscover(autoDir);
  } else if (inputFile) {
    tests = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  } else {
    console.error("Usage: selftest <tests.json> [--dev] [--auto ./src]");
    process.exit(1);
  }

  const results = [];
  const bar = new cliProgress.SingleBar(
    {
      format: `${chalk.yellow(
        "RUNNING"
      )} [{bar}] {percentage}% | {value}/{total} tests`,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  if (dev) bar.start(tests.length, 0);

  for (const t of tests) {
    const start = Date.now();
    try {
      const fn = new Function("expect", t.code);
      fn(expect);
      const dur = Date.now() - start;
      results.push({ name: t.name, status: "passed", duration_ms: dur });
      if (dev)
        console.log(
          `${chalk.green("✔")} ${t.name} ${chalk.gray(`(${dur}ms)`)}`
        );
    } catch (e) {
      const dur = Date.now() - start;
      results.push({
        name: t.name,
        status: "failed",
        error: e.message,
        duration_ms: dur,
      });
      if (dev)
        console.log(`${chalk.red("✖")} ${t.name}\n  ${chalk.red(e.message)}`);
    }
    if (dev) bar.increment();
  }
  if (dev) bar.stop();

  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === "passed").length,
    failed: results.filter((r) => r.status === "failed").length,
    duration_ms: results.reduce((s, r) => s + r.duration_ms, 0),
  };

  const out = {
    meta: {
      framework: "selftest-core",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
    },
    summary,
    tests: results,
  };

  if (outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(out, null, 2));
    if (dev) console.log(chalk.yellow(`Wrote results to ${outputFile}`));
  } else {
    console.log(JSON.stringify(out, null, 2));
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected)
        throw new Error(`Expected ${actual} toBe ${expected}`);
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Expected ${actual} toEqual ${expected}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error("Expected truthy");
    },
    toBeFalsy() {
      if (actual) throw new Error("Expected falsy");
    },
  };
}

// CLI entry (hanya jalan kalau dipanggil langsung)
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = minimist(process.argv.slice(2));
  runCore(argv);
}
