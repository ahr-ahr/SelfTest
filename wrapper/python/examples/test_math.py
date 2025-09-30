import sys
from pathlib import Path

# Biar bisa import selftest.py
sys.path.append(str(Path(__file__).resolve().parent.parent))

from selftest import selftest, run

# Tambahin test langsung pake string JS
selftest("math add", "expect(1 + 2).toBe(3);")
selftest("truthy test", "expect(true).toBeTruthy();")

# Jalanin
result = run(dev=True, keep_cache=True)
