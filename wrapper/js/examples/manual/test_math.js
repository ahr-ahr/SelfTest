const { selftest, run } = require("../../selftest");

selftest("math add", () => {
  expect(1 + 2).toBe(3);
});

selftest("truthy test", () => {
  expect(true).toBeTruthy();
});

// jalanin semua test
const result = run({ dev: true, keepCache: true });
console.log("Summary:", result.summary);
