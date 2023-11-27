import { runE2ETestExpectFailure } from "../../test-util/test-util";
//import { buildWebOn } from "../../src/build-webon/build-webon";
//import { runCliTestExpectFailure } from "../test-util/test-util";
import { getDebugPath } from "../../../src/util/util";

test("assetDir not existing", async () => {
  const output = await runE2ETestExpectFailure("build some-non-existing-dir");
  expect(output).toBe(
    `error: ${getDebugPath("some-non-existing-dir")} does not exist.\n`
  );
});

test("assetDir not a dir", async () => {
  const output = await runE2ETestExpectFailure("build README.md");
  expect(output).toBe(
    `error: ${getDebugPath("README.md")} is not a directory.\n`
  );
});
