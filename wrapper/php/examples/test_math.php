<?php
require __DIR__ . "/../SelfTest.php";

SelfTest::selftest("math add", "expect(1+2).toBe(3);");
SelfTest::selftest("truthy test", "expect(true).toBeTruthy();");

$result = SelfTest::run(true, true);