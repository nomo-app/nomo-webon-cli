import { runE2ETestExpectFailure } from "../../test-util/test-util";
import { getDebugPath } from "../../../src/util/util";

test("assetDir not existing", async () => {
  const output = await runE2ETestExpectFailure("build some-non-existing-dir");
  expect(output).toContain(
    `ERROR: ${getDebugPath("some-non-existing-dir")} does not exist.\n`
  );
});

test("assetDir not a dir", async () => {
  const output = await runE2ETestExpectFailure("build README.md");
  expect(output).toContain(
    `ERROR: ${getDebugPath("README.md")} is not a directory.\n`
  );
});
