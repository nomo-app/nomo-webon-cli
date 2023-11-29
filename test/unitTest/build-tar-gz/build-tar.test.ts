import { runUnitTestExpectFailure } from "../../test-util/test-util";
import { enableUnitTest } from "../../../src/util/util";

enableUnitTest();

test("missing required file", async () => {
  const output = await runUnitTestExpectFailure(
    "build test_assets/out_incomplete/out"
  );
  expect(output).toMatch(
    /Error: The 'out' directory is missing the following required files: .* Use nomo-webon-cli init if you do not have a nomo_manifest.json yet.\n/
  );
});
