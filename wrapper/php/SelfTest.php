<?php
class SelfTest
{
    private static $tests = [];

    // $fn diisi string JS, bukan PHP closure
    public static function selftest(string $name, string $jsCode): void
    {
        self::$tests[] = ["name" => $name, "code" => $jsCode];
    }

    public static function run(bool $dev = true, bool $keepCache = false): array
    {
        $cacheDir = getcwd() . DIRECTORY_SEPARATOR . ".cache";
        if (!is_dir($cacheDir))
            mkdir($cacheDir);

        $tmpFile = $cacheDir . "/tests-" . round(microtime(true) * 1000) . ".json";
        $resultFile = $cacheDir . "/result-" . round(microtime(true) * 1000) . ".json";

        file_put_contents($tmpFile, json_encode(self::$tests, JSON_PRETTY_PRINT));

        $cmd = ["node", "core.cjs", $tmpFile];
        if ($dev)
            $cmd[] = "--dev";
        $cmd[] = "--json";
        $cmd[] = $resultFile;

        // jalankan core
        $cmdline = implode(" ", array_map("escapeshellarg", $cmd));
        passthru($cmdline);

        $result = json_decode(file_get_contents($resultFile), true);

        if (!$keepCache) {
            unlink($tmpFile);
            unlink($resultFile);
        }

        return $result;
    }
}
