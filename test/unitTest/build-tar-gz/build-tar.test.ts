import { runE2ETestExpectFailure } from "../../test-util/test-util";
import { getDebugPath } from "../../../src/util/util";

test("assetDir not a dir", async () => {
  const output = await runE2ETestExpectFailure("build README.md");
  expect(output).toBe(
    `ERROR: ${getDebugPath("README.md")} is not a directory.\n`
  );
});
