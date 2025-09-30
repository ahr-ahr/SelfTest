#!/usr/bin/env node
import fs from "fs";
import minimist from "minimist";
import chalk from "chalk";
import cliProgress from "cli-progress";

export function runCore(argv) {
  const dev = argv.dev || false;
  const inputFile = argv._[0];
  const outputFile = argv.json || null;

  const tests = JSON.parse(fs.readFileSync(inputFile, "utf8"));
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
      results.push({
        name: t.name,
        status: "passed",
        error: null,
        duration_ms: dur,
      });
      if (dev) {
        console.log(
          `${chalk.green("✔")} ${t.name} ${chalk.gray(`(${dur}ms)`)}`
        );
        bar.increment();
      }
    } catch (e) {
      const dur = Date.now() - start;
      results.push({
        name: t.name,
        status: "failed",
        error: e.message,
        duration_ms: dur,
      });
      if (dev) {
        console.log(
          `${chalk.red("✖")} ${t.name} ${chalk.gray(
            `(${dur}ms)`
          )}\n  ${chalk.red(e.message)}`
        );
        bar.increment();
      }
    }
  }

  if (dev) bar.stop();

  const summary = {
    total: results.length,
    passed: results.filter((r) => r.status === "passed").length,
    failed: results.filter((r) => r.status === "failed").length,
    duration_ms: results.reduce((sum, r) => sum + r.duration_ms, 0),
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

  if (dev) {
    console.log(`\n=== ${chalk.bold("SUMMARY")} ===`);
    console.log(`Total: ${summary.total}`);
    console.log(`${chalk.green("Passed")}: ${summary.passed}`);
    console.log(`${chalk.red("Failed")}: ${summary.failed}`);
    console.log(`Duration: ${summary.duration_ms} ms`);
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
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = minimist(process.argv.slice(2));
  runCore(argv);
}
