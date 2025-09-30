# SelfTest

Universal self-test runner lintas bahasa (JavaScript, PHP, Python) dengan output konsisten ke **terminal** dan **JSON**.

[![Node.js CI](https://github.com/ahr-ahr/selftest/actions/workflows/node.yml/badge.svg)](https://github.com/ahr-ahr/selftest/actions/workflows/node.yml)
[![PHP CI](https://github.com/ahr-ahr/selftest/actions/workflows/php.yml/badge.svg)](https://github.com/ahr-ahr/selftest/actions/workflows/php.yml)
[![Python CI](https://github.com/ahr-ahr/selftest/actions/workflows/python.yml/badge.svg)](https://github.com/ahr-ahr/selftest/actions/workflows/python.yml)

---

## ✨ Fitur

- API sederhana: `selftest(name, fn)` + `run()`.
- Output CLI interaktif + JSON.
- Bisa dipanggil dari JS, PHP, atau Python.
- Mendukung **cache** hasil test di `.cache/`.

---

## 📦 Instalasi

### Node.js (wajib, core di sini)

```bash
npm install selftest
```

### PHP Wrapper

Pastikan `php` ada di PATH, lalu copy `wrapper/php/selftest.php` ke project.

### Python Wrapper

Pastikan `python` ada di PATH, lalu copy `wrapper/python/selftest.py` ke project.

---

## 🚀 Cara Pakai

### JavaScript

```js
const { selftest, run } = require("selftest");

selftest("math add", () => {
  expect(1 + 2).toBe(3);
});

selftest("truthy test", () => {
  expect(true).toBeTruthy();
});

const result = run({ dev: true, keepCache: false });
console.log("Summary:", result.summary);
```

### PHP

```php
<?php
require_once __DIR__ . "/../selftest.php";

SelfTest::selftest("math add", function () {
    return "expect(1 + 2).toBe(3);";
});

SelfTest::selftest("truthy test", function () {
    return "expect(true).toBeTruthy();";
});

$result = SelfTest::run(dev:true, keepCache:true);
print_r($result);
```

### Python

```python
from selftest import selftest, run

selftest("math add", "expect(1 + 2).toBe(3)")
selftest("truthy test", "expect(True).toBeTruthy()")

result = run(dev=True, keep_cache=True)
print("Summary:", result["summary"])
```

---

## ⚙️ Opsi Wrapper

- `dev: true` → tampilkan log progres + detail.
- `dev: false` → diam, hasil langsung JSON.
- `keepCache: true` → file JSON test & result tetap disimpan di `.cache/`.
- `keepCache: false` → file otomatis dihapus.

---

## 📂 Struktur Direktori

```
selftest/
 ├─ core.cjs        # Core runner CJS
 ├─ core.mjs        # Core runner ESM
 ├─ wrapper/
 │   ├─ js/selftest-wrapper.js
 │   ├─ php/selftest.php
 │   └─ python/selftest.py
 └─ examples/
     └─ tests.json
```

---

## 📊 Output

### Mode Dev

```
RUNNING [██████████] 100% | 2/2 tests
✔ math add (0ms)
✔ truthy test (0ms)

=== SUMMARY ===
Total: 2
Passed: 2
Failed: 0
Duration: 0 ms
```

### Mode JSON

```json
{
  "total": 2,
  "passed": 2,
  "failed": 0,
  "duration_ms": 0
}
```

---

## 📝 Tips

- Tambahkan `.cache/` ke `.gitignore`.
- Bisa dipanggil lintas bahasa via CLI:

  ```bash
  npx selftest examples/tests.json --json result.json
  ```

---

## ⚡ CI/CD dengan GitHub Actions

Tambahkan workflow berikut ke repo Anda:

### `.github/workflows/node.yml`

```yaml
name: Node.js CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm install
      - run: npm test
```

### `.github/workflows/php.yml`

```yaml
name: PHP CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: shivammathur/setup-php@v2
        with:
          php-version: "8.2"
      - run: php wrapper/php/examples/test_math.php
```

### `.github/workflows/python.yml`

```yaml
name: Python CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      - run: python wrapper/python/examples/test_math.py
```

---

## 📜 Lisensi

MIT
