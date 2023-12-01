import {
  runUnitTestExpectFailure,
  runE2ETest,
} from "../../test-util/test-util";
import { enableUnitTest } from "../../../src/util/util";
import * as fs from "fs";
import { buildWebOn } from "../../../src/build-webon/build-webon"; // Replace with the actual path to your module
import tar from "tar";
import * as path from "path";

test("missing required file", async () => {
  const output = await runUnitTestExpectFailure(
    "build test_assets/out_incomplete/out"
  );
  expect(output).toMatch(
    /Error: The 'out' directory is missing the following required files: .* Use nomo-webon-cli init if you do not have a nomo_manifest.json yet.\n/
  );
});
