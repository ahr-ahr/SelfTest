import json
import subprocess
from pathlib import Path
import time

tests = []


def selftest(name, code: str):
    """
    Tambah test case.
    code: string kode JS yang akan dieksekusi di core.cjs
    """
    tests.append({"name": name, "code": code})


def run(dev=True, keep_cache=False):
    cache_dir = Path(".cache")
    cache_dir.mkdir(exist_ok=True)

    tmp_file = cache_dir / f"tests-{int(time.time()*1000)}.json"
    result_file = cache_dir / f"result-{int(time.time()*1000)}.json"

    with open(tmp_file, "w") as f:
        json.dump(tests, f, indent=2)

    args = ["node", "core.cjs", str(tmp_file)]
    if dev:
        args.append("--dev")
    args += ["--json", str(result_file)]

    subprocess.run(args, check=True)

    with open(result_file) as f:
        result = json.load(f)

    if not keep_cache:
        tmp_file.unlink(missing_ok=True)
        result_file.unlink(missing_ok=True)

    return result
