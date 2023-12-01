import * as fs from "fs";
import {
  runUnitTestExpectFailure,
  runE2ETest,
} from "../../test-util/test-util";

jest.setTimeout(30000);
test("successful tar.gz build", async () => {
  const output = await runE2ETest("build test_assets/out/");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  expect(output).toContain("Build and packaging completed!");
  const existsFile = fs.existsSync("test_assets/out/nomo.tar.gz");
  expect(existsFile).toBe(true);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  fs.unlinkSync("test_assets/out/nomo.tar.gz");
});

test("missing required file", async () => {
  const output = await runUnitTestExpectFailure(
    "build test_assets/out_incomplete/out"
  );
  expect(output).toMatch(
    /Error: The 'out' directory is missing the following required files: .* Use nomo-webon-cli init if you do not have a nomo_manifest.json yet.\n/
  );
});
