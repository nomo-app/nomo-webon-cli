import { runE2ETestExpectFailure } from "../../test-util/test-util";
import { getDebugPath } from "../../../src/util/util";

test("archive not existing", async () => {
  const output = await runE2ETestExpectFailure(
    "deploy some-non-existing-archive production"
  );
  expect(output).toBe(
    `ERROR: ${getDebugPath("some-non-existing-archive")} does not exist.\n`
  );
});

test("archive not a file", async () => {
  const output = await runE2ETestExpectFailure("deploy src production");
  expect(output).toBe(`ERROR: ${getDebugPath("src")} is a directory.\n`);
});
