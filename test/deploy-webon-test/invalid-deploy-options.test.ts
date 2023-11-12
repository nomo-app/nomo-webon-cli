import { runCliTestExpectFailure } from "../test-util/test-util";
import { getDebugPath } from "../../src/util/util";

test("archive not existing", async () => {
  const output = await runCliTestExpectFailure("deploy some-non-existing-archive");
  expect(output).toBe(
    `error: ${getDebugPath("some-non-existing-archive")} does not exist.\n`
  );
});

test("archive not a file", async () => {
  const output = await runCliTestExpectFailure("deploy src");
  expect(output).toBe(
    `error: ${getDebugPath("src")} is a directory.\n`
  );
});
