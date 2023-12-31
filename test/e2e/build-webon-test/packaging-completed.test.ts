import * as fs from "fs";
import {
  runUnitTestExpectFailure,
  runE2ETest,
} from "../../test-util/test-util";

test("nextjs_sample tar.gz build", async () => {
  const output = await runE2ETest("build test_assets/nextjs_sample/out/");
  expect(output).toContain("WebOn build completed: ");
  const existsFile = fs.existsSync("nomo.tar.gz");
  expect(existsFile).toBe(true);
});

test("cra_sample tar.gz build", async () => {
  const output = await runE2ETest("build test_assets/cra_sample/out/");
  expect(output).toContain("WebOn build completed: ");
  const existsFile = fs.existsSync("nomo.tar.gz");
  expect(existsFile).toBe(true);
});

test("missing required file", async () => {
  const output = await runUnitTestExpectFailure(
    "build test_assets/out_incomplete/out"
  );
  expect(output).toMatch(
    /Error: The 'out' directory is missing the following required files: .* Use nomo-webon-cli init if you do not have a nomo_manifest.json yet.\n/
  );
});
